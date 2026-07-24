/**
 * AvaMark — Ava's avatar: the "{ai}" monogram in a warm orange circle.
 *
 * Ava deliberately has no human face. Available Law sells AI-disclosure
 * compliance (FAIIR, Colorado AI Act counsel), so its own assistant must
 * never read as a person. Her identity is the brand device itself — she is
 * literally the "ai" inside Av{ai}lable. The braces render slightly lighter
 * than the letters so the mark stays legible at avatar sizes.
 *
 * `size` is the circle diameter in px (default 32 — chat-header scale).
 * `presence` adds the green online dot used in chat surfaces.
 */
interface AvaMarkProps {
  size?: number;
  presence?: boolean;
  className?: string;
}

export default function AvaMark({
  size = 32,
  presence = false,
  className,
}: AvaMarkProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#D4893F] to-[#C17832] select-none ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="font-heading font-bold text-white leading-none"
        style={{ fontSize: size * 0.38 }}
      >
        <span className="opacity-70">{"{"}</span>
        ai
        <span className="opacity-70">{"}"}</span>
      </span>
      {presence && (
        <span
          className="absolute rounded-full bg-[#7A8B6F] border-2 border-white"
          style={{
            width: size * 0.34,
            height: size * 0.34,
            bottom: -1,
            right: -1,
          }}
        />
      )}
    </span>
  );
}
