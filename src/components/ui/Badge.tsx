export type BadgeTone = "normal" | "warning" | "orange" | "danger" | "unknown" | "info";

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  normal: { bg: "#22a559", fg: "#ffffff" },
  warning: { bg: "#f7b500", fg: "#4a3200" },
  orange: { bg: "#f28c1b", fg: "#ffffff" },
  danger: { bg: "#e11d1d", fg: "#ffffff" },
  unknown: { bg: "#8a9bb0", fg: "#ffffff" },
  info: { bg: "#1d5fd6", fg: "#ffffff" },
};

export function Badge({ tone, label, size = "md" }: { tone: BadgeTone; label: string; size?: "md" | "lg" }) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold uppercase tracking-[0.04em] ${size === "lg" ? "text-[13px]" : "text-[11.5px]"}`}
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {label}
    </span>
  );
}
