import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";

export const HowItWorks = () => {
  const { t } = useLang();
  return (
    <section id="how" className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="how-section">
      <SectionHead id="how" label={t.how.label} title={t.how.title} />
      <ol className="border-t border-[#1F2126]">
        {t.how.steps.map((s, i) => (
          <li key={s.k} className="group grid md:grid-cols-12 gap-3 md:gap-6 border-b border-[#1F2126] py-8 md:py-10 transition-colors duration-200 hover:bg-[#121317]" data-testid={`how-step-${i + 1}`}>
            <Reveal from="left" className="md:col-span-3 flex items-baseline gap-4">
              <span className="font-mono text-[40px] md:text-[56px] leading-none tabular-nums text-[#1F2126] group-hover:text-[#E8B33A]/40 transition-colors duration-300">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono text-[12px] uppercase tracking-wider text-[#8A9099]">{s.k}</span>
            </Reveal>
            <Reveal from="left" delay={0.06} className="md:col-span-9">
              <h3 className="text-[20px] md:text-[22px] font-semibold text-[#E7E9EE] mb-2">{s.t}</h3>
              <p className="text-[15px] leading-relaxed text-[#A9AEB7] max-w-[62ch]">{s.d}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
};
