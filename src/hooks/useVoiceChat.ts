"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useVoiceChat — browser-native voice mode for Allora.
 *
 * Why this instead of OpenAI Realtime / Vapi / ElevenLabs:
 * - OpenAI Realtime is ~$0.30/min out-of-pocket. At even modest usage that's
 *   $1k+/month before Available Law has the revenue to absorb it.
 * - We already have a working Allora text chat backend. Voice is "just" a new
 *   input/output modality — the LLM call doesn't change.
 * - The browser ships `SpeechRecognition` (STT) and `speechSynthesis` (TTS)
 *   for free, runs locally, no API keys, no network tax on top of chat.
 *
 * Trade-offs we accept:
 * - TTS voice is more robotic than ElevenLabs. Fine for an MVP; we can swap
 *   the speak() implementation to a paid provider later without changing the
 *   widget UI.
 * - Safari <16.4 doesn't support SpeechRecognition. We feature-detect and
 *   the widget hides the mic button when unsupported.
 * - STT is US-English only here (lang="en-US"). Adequate for Colorado
 *   small-business Q&A.
 *
 * Contract:
 *   const { supported, status, transcript, error, start, stop, speak, cancelSpeak }
 *     = useVoiceChat({ onFinalTranscript, lang });
 *
 * Lifecycle:
 *   idle → listening (mic open) → idle (on stop / silence timeout / final)
 *   idle → speaking (TTS playback) → idle (on end / cancelSpeak)
 *
 * The hook deliberately does NOT call the Allora chat endpoint itself —
 * that's the widget's job. We just hand the final transcript to
 * `onFinalTranscript` and let the caller decide how to route it.
 */

export type VoiceStatus = "idle" | "listening" | "speaking";

interface UseVoiceChatOptions {
  /** Called once per recording turn with the final transcript. */
  onFinalTranscript?: (text: string) => void;
  /** BCP-47 language code. Defaults to US English. */
  lang?: string;
}

interface UseVoiceChatResult {
  /** True when the browser has SpeechRecognition + speechSynthesis. */
  supported: boolean;
  /** Current state machine position. */
  status: VoiceStatus;
  /** Live interim transcript while listening, final while idle. */
  transcript: string;
  /** Human-readable error message from the last failure, or null. */
  error: string | null;
  /** Begin a listening turn. No-op if already listening. */
  start: () => void;
  /** End the current listening turn. Triggers onFinalTranscript. */
  stop: () => void;
  /** Speak arbitrary text through the browser's TTS. */
  speak: (text: string) => void;
  /** Interrupt any TTS playback in progress. */
  cancelSpeak: () => void;
}

export function useVoiceChat(
  options: UseVoiceChatOptions = {},
): UseVoiceChatResult {
  const { onFinalTranscript, lang = "en-US" } = options;

  // Lazy state initializer — feature-detect once on first client render. We
  // can't do this at module scope because that would run during SSR where
  // `window` is undefined; doing it inside the initializer defers it until
  // React actually mounts the hook in the browser. Calling setState from an
  // effect here would trigger a cascading re-render and lint complains.
  const [supported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const RecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const hasTts =
      typeof window.speechSynthesis !== "undefined" &&
      typeof window.SpeechSynthesisUtterance !== "undefined";
    return Boolean(RecognitionCtor && hasTts);
  });
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Hold the live SpeechRecognition instance so start/stop calls hit the
  // same one. We recreate on each start() to avoid Safari quirks where a
  // reused instance silently refuses to fire `onresult` a second time.
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Capture the running transcript across the async onresult events — React
  // state lags behind the stream, so we keep a ref in parallel for the
  // `onend` handler to read the "final" value when it commits.
  const transcriptRef = useRef("");
  // Latest onFinalTranscript callback, held in a ref so the recognition
  // object built during start() always calls the current one even if the
  // parent re-renders with a new callback identity.
  const onFinalRef = useRef<UseVoiceChatOptions["onFinalTranscript"]>(undefined);
  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  /* -------------------------------------------------------------- */
  /* Cleanup on unmount                                              */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  /* -------------------------------------------------------------- */
  /* start() — begin a listening turn                                */
  /* -------------------------------------------------------------- */
  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const RecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setError("This browser doesn't support voice input.");
      return;
    }

    // If TTS is mid-sentence, stop it — user wants to talk over Allora.
    window.speechSynthesis?.cancel();

    // Always rebuild the instance. Safari is flaky about reuse, and Chrome
    // treats an abort() as a terminal state where the same object won't
    // accept a new start() call. Cheap enough to recreate each turn.
    recognitionRef.current?.abort();
    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    transcriptRef.current = "";
    setTranscript("");
    setError(null);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Walk every result since this session began and concatenate, because
      // the API hands us a growing list of finalized + in-progress chunks.
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0]?.transcript ?? "";
      }
      transcriptRef.current = combined;
      setTranscript(combined);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are normal user actions — swallow them.
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      if (event.error === "not-allowed") {
        setError(
          "Mic permission denied. Enable it in your browser's site settings to use voice mode.",
        );
      } else {
        setError(`Voice input error: ${event.error}`);
      }
      setStatus("idle");
    };

    recognition.onend = () => {
      setStatus("idle");
      const finalText = transcriptRef.current.trim();
      if (finalText.length > 0) {
        onFinalRef.current?.(finalText);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setStatus("listening");
    } catch (err) {
      // start() throws "InvalidStateError" if you call it while another
      // session is still winding down. Translate to a user-friendly error.
      console.error("SpeechRecognition.start failed", err);
      setError("Couldn't start voice input. Try again in a second.");
      setStatus("idle");
    }
  }, [lang]);

  /* -------------------------------------------------------------- */
  /* stop() — commit the current turn                                */
  /* -------------------------------------------------------------- */
  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  /* -------------------------------------------------------------- */
  /* speak() — TTS playback                                          */
  /* -------------------------------------------------------------- */
  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;
      if (!text || !text.trim()) return;
      const synth = window.speechSynthesis;
      if (!synth) return;

      // Interrupt any in-flight utterance first — users rarely want two
      // Alloras overlapping.
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      // Slightly slower than default — legal content benefits from clarity.
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => setStatus("idle");
      utterance.onerror = () => setStatus("idle");
      synth.speak(utterance);
    },
    [lang],
  );

  /* -------------------------------------------------------------- */
  /* cancelSpeak() — interrupt TTS                                   */
  /* -------------------------------------------------------------- */
  const cancelSpeak = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setStatus((prev) => (prev === "speaking" ? "idle" : prev));
  }, []);

  return {
    supported,
    status,
    transcript,
    error,
    start,
    stop,
    speak,
    cancelSpeak,
  };
}
