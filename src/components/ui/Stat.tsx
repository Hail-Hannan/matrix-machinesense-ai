export function Stat({ label, value, unit, title, size = "md" }: { label: string; value: string; unit?: string; title?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  const na = value === "N/A";
  return (
    <div title={title} className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-[#e6edf6] bg-[#f6f9fd] px-2 py-1 text-center">
      <span className={`${lg ? "text-[14px]" : "text-[11.5px]"} text-[#5d7088]`}>{label}</span>
      <span className={`${lg ? "text-[23px]" : "text-[19px]"} font-bold leading-tight ${na ? "text-[#8a9bb0]" : "text-[#0b2a5b]"}`}>
        {value}
        {unit && !na && <span className={`ml-1 ${lg ? "text-[13px]" : "text-[11px]"} font-normal text-[#5d7088]`}>{unit}</span>}
      </span>
    </div>
  );
}
