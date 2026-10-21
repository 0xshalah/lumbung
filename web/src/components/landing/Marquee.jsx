import { useLang } from "../../lib/i18n";

export const Marquee = () => {
  const { t } = useLang();
  const row = t.marquee.map((m) => (
    <span key={m} className="flex items-center gap-10 pr-10">
      <span>{m}</span>
      <span className="text-[#E8B33A]" aria-hidden="true">·</span>
    </span>
  ));
  return (
    <div className="border-y border-[#1F2126] bg-[#0D0E11] py-6 md:py-8 overflow-hidden" data-testid="editorial-marquee" aria-label={t.marquee.join(", ")}>
      <div className="marquee-track flex w-max text-[28px] md:text-[44px] font-semibold tracking-tight text-[#E7E9EE]/85 whitespace-nowrap" aria-hidden="true">
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
};
