import { Blocks, Ruler, Unlock } from "lucide-react";
import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";

const icons = [Blocks, Ruler, Unlock];
const tags = ["SEP-41", "SEP-56 · OpenZeppelin", "admin = none"];

export const WhyVault = () => {
  const { t } = useLang();
  return (
    <section className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="why-section">
      <SectionHead id="why" label={t.why.label} title={t.why.title} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {t.why.cards.map((c, i) => {
          const Icon = icons[i];
          const lead = i === 0;
          return (
            <Reveal key={c.t} delay={i * 0.08} from={lead ? "left" : "up"} className={lead ? "sm:col-span-2" : ""}>
              <article className="group flex h-full flex-col rounded-[10px] border border-[#1F2126] bg-[#121317] p-7 md:p-8 transition-[border-color,transform] duration-200 hover:border-[#E8B33A]/50 hover:-translate-y-1" data-testid={`why-card-${i + 1}`}>
                <div className="mb-12">
                  <span className="grid h-10 w-10 place-items-center rounded-[8px] border border-[#1F2126] text-[#E8B33A] transition-colors duration-200 group-hover:bg-[#E8B33A] group-hover:text-[#0A0B0D]"><Icon size={18} /></span>
                </div>
                <h3 className={`font-semibold text-[#E7E9EE] mb-3 ${lead ? "text-[26px] md:text-[30px]" : "text-[20px]"}`}>{c.t}</h3>
                <p className={`leading-relaxed text-[#A9AEB7] ${lead ? "text-[16px] max-w-[46ch]" : "text-[15px]"}`}>{c.d}</p>
                <span className="mt-auto pt-7 font-mono text-[12px] text-[#8A9099]">{tags[i]}</span>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
