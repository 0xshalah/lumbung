import { Wallet, Calculator, Repeat } from "lucide-react";
import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";

const icons = [Wallet, Calculator, Repeat];

export const HowItWorks = () => {
  const { t } = useLang();
  return (
    <section id="how" className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="how-section">
      <SectionHead id="how" label={t.how.label} title={t.how.title} />
      <ol className="grid md:grid-cols-3 border border-[#1F2126] rounded-[10px] overflow-hidden">
        {t.how.steps.map((s, i) => {
          const Icon = icons[i];
          return (
            <li key={s.k} className={`group relative bg-[#121317] p-7 md:p-8 transition-colors duration-200 hover:bg-[#16171c] ${i > 0 ? "border-t md:border-t-0 md:border-l border-[#1F2126]" : ""}`} data-testid={`how-step-${i + 1}`}>
              <Reveal delay={i * 0.08}>
                <div className="flex items-center justify-between mb-14">
                  <span className="font-mono text-[56px] leading-none tabular-nums text-[#1F2126] group-hover:text-[#E8B33A]/30 transition-colors duration-300">0{i + 1}</span>
                  <Icon size={20} className="text-[#E8B33A]" />
                </div>
                <p className="font-mono text-[12px] uppercase tracking-wider text-[#8A9099] mb-2">{s.k}</p>
                <h3 className="text-[20px] font-semibold text-[#E7E9EE] mb-3">{s.t}</h3>
                <p className="text-[15px] leading-relaxed text-[#A9AEB7]">{s.d}</p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
