import { Check, Minus } from "lucide-react";
import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";

const List = ({ title, items, ok, testid }) => (
  <div className="h-full rounded-[10px] border border-[#1F2126] bg-[#121317] p-6 md:p-8" data-testid={testid}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-[20px] font-semibold text-[#E7E9EE]">{title}</h3>
      <span className={`font-mono text-[12px] tabular-nums ${ok ? "text-[#4ADE80]" : "text-[#F87171]"}`}>{String(items.length).padStart(2, "0")}</span>
    </div>
    <ul className="space-y-4">
      {items.map((it) => (
        <li key={it} className="flex gap-3 text-[15px] leading-relaxed text-[#C9CDD4]">
          <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full ${ok ? "bg-[#4ADE80]/15 text-[#4ADE80]" : "bg-[#F87171]/15 text-[#F87171]"}`}>
            {ok ? <Check size={12} /> : <Minus size={12} />}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const Security = () => {
  const { t } = useLang();
  return (
    <section className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="security-section">
      <SectionHead id="sec" label={t.sec.label} title={t.sec.title} />
      <div className="grid md:grid-cols-2 gap-4">
        <Reveal from="left" className="h-full"><List title={t.sec.didT} items={t.sec.did} ok testid="security-did-list" /></Reveal>
        <Reveal from="right" delay={0.08} className="h-full"><List title={t.sec.notT} items={t.sec.not} testid="security-not-list" /></Reveal>
      </div>
      <p className="mt-6 text-[14px] text-[#A9AEB7] max-w-[68ch]">{t.sec.foot}</p>
    </section>
  );
};
