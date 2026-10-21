import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";

const PoolBar = () => {
  const reduce = useReducedMotion();
  return (
    <div className="mt-8" aria-hidden="true">
      <div className="flex justify-between font-mono text-[12px] text-[#8A9099] mb-2 tabular-nums"><span>100 XLM</span><span>120 XLM</span></div>
      <div className="h-2 rounded-full bg-[#1F2126] overflow-hidden">
        <motion.div
          className="h-full bg-[#E8B33A] origin-left"
          initial={reduce ? false : { scaleX: 100 / 120 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
};

export const ShareMath = () => {
  const { t } = useLang();
  return (
    <section className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="share-section">
      <SectionHead id="share" label={t.share.label} title={t.share.title} />
      <div className="grid lg:grid-cols-12 gap-6">
        <Reveal className="lg:col-span-8">
          <div className="rounded-[10px] border border-[#1F2126] bg-[#121317] p-6 md:p-8 font-mono" data-testid="share-math-box">
            <div className="flex gap-1.5 mb-6" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1F2126]" /><span className="h-2.5 w-2.5 rounded-full bg-[#1F2126]" /><span className="h-2.5 w-2.5 rounded-full bg-[#1F2126]" />
            </div>
            <ul className="space-y-4">
              {t.share.rows.map((r, i) => (
                <li key={r.a} className="grid sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 text-[14px] md:text-[16px] tabular-nums border-b border-dashed border-[#1F2126] pb-4 last:border-0 last:pb-0" data-testid={`share-row-${i + 1}`}>
                  <span className="text-[#E7E9EE]">{r.a}</span>
                  <ArrowRight size={16} className="text-[#E8B33A] hidden sm:block" />
                  <span className={i === 2 ? "text-[#E8B33A]" : "text-[#A9AEB7]"}><span className="sm:hidden text-[#E8B33A]">→ </span>{r.b}</span>
                </li>
              ))}
            </ul>
            <PoolBar />
            <p className="mt-6 text-[12px] text-[#8A9099] font-sans">{t.share.note}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-4 flex">
          <div className="rounded-[10px] border border-[#E8B33A]/30 bg-[#E8B33A]/[0.06] p-6 md:p-8 flex flex-col justify-between gap-8">
            <span className="font-mono text-[56px] leading-none text-[#E8B33A] tabular-nums">1.20</span>
            <p className="text-[16px] leading-relaxed text-[#E7E9EE]" data-testid="share-closing">{t.share.close}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
