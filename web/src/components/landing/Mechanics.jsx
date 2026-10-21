import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";

export const Mechanics = () => {
  const { t } = useLang();
  return (
    <section className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="mechanics-section">
      <SectionHead id="mech" label={t.mech.label} title={t.mech.title} />
      <Reveal>
        <dl className="rounded-[10px] border border-[#1F2126] overflow-hidden" data-testid="mechanics-table">
          <div className="hidden md:grid grid-cols-12 bg-[#121317] px-6 py-3 font-mono text-[12px] uppercase tracking-wider text-[#8A9099] border-b border-[#1F2126]">
            <span className="col-span-4">{t.mech.head[0]}</span><span className="col-span-8">{t.mech.head[1]}</span>
          </div>
          {t.mech.rows.map(([k, v], i) => (
            <div key={k} className="grid md:grid-cols-12 gap-1 md:gap-4 px-6 py-5 border-b border-[#1F2126] last:border-0 transition-colors duration-150 hover:bg-[#121317]" data-testid={`mechanics-row-${i + 1}`}>
              <dt className="md:col-span-4 text-[14px] text-[#8A9099]">{k}</dt>
              <dd className={`md:col-span-8 font-mono text-[14px] tabular-nums ${i === 5 ? "text-[#4ADE80]" : "text-[#E7E9EE]"}`}>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-[68ch] text-[14px] leading-relaxed text-[#A9AEB7]">{t.mech.note}</p>
      </Reveal>
    </section>
  );
};
