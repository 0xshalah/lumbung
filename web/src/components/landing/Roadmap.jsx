import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";

const tone = ["text-[#4ADE80] border-[#4ADE80]/40", "text-[#E8B33A] border-[#E8B33A]/40", "text-[#E7E9EE] border-[#8A9099]/40", "text-[#8A9099] border-[#1F2126]"];

export const Roadmap = () => {
  const { t } = useLang();
  return (
    <section className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="roadmap-section">
      <SectionHead id="road" label={t.road.label} title={t.road.title} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {t.road.cols.map((c, i) => (
          <Reveal key={c.k} delay={i * 0.06} className="h-full">
            <div className={`h-full rounded-[10px] border border-[#1F2126] p-6 ${i === 3 ? "bg-transparent border-dashed" : "bg-[#121317]"}`} data-testid={`roadmap-col-${i + 1}`}>
              <span className={`inline-block rounded-[4px] border px-2.5 py-1 font-mono text-[12px] mb-6 ${tone[i]}`}>{c.k}</span>
              <ul className="space-y-3">
                {c.items.map((it) => (
                  <li key={it} className={`text-[14px] leading-relaxed ${i === 3 ? "text-[#8A9099] line-through decoration-[#1F2126]" : "text-[#C9CDD4]"}`}>{it}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
