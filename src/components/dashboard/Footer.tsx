import { PROJECT } from "@/lib/config";

export function Footer() {
  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 bg-[#0b2a5b] px-6 py-2.5 text-white">
      <div className="flex items-center gap-3.5">
        <div className="flex h-7 items-center rounded-md bg-white px-1.5 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/matrix-iot-logo.png"
            alt="MATRIX IOT"
            width={116}
            height={25}
            className="block h-[25px] w-auto"
          />
        </div>
        <span className="text-[13.5px] font-medium">{PROJECT.company}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 text-[12.5px] text-white/90">
        {PROJECT.footerTagline.map((t, i) => (
          <span key={t} className="flex items-center gap-3">
            {i > 0 && <span className="text-white/40">|</span>}
            {t}
          </span>
        ))}
      </div>
    </footer>
  );
}
