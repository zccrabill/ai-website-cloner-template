/**
 * AvailableWordmark — renders the "Av{ai}lable" brand device, where the "ai"
 * inside "Available" is wrapped in orange braces to nod to the AI underneath
 * everything Available Law builds. This is the same treatment hand-inlined in
 * the Header and Footer; this component exists so sub-brands (e.g. Available
 * Webdev) can reuse the exact device instead of re-typing the spans.
 *
 * Pass a `suffix` (e.g. "Webdev", "Law") to append a plain-text descriptor
 * after the wordmark. `braceClassName` overrides the brace color when the
 * default orange doesn't read on a given background.
 */
interface AvailableWordmarkProps {
  suffix?: string;
  className?: string;
  braceClassName?: string;
}

export default function AvailableWordmark({
  suffix,
  className,
  braceClassName = "text-[#C17832]",
}: AvailableWordmarkProps) {
  return (
    <span className={className}>
      Av<span className={braceClassName}>{"{"}</span>ai
      <span className={braceClassName}>{"}"}</span>lable
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}
