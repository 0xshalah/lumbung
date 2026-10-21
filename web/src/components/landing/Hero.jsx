import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, AlertTriangle, BookOpen } from "lucide-react";
import { HeroTitle } from "./HeroTitle";
import { StatsPanel } from "./StatsPanel";
import { ContractId } from "./ContractId";
import { useLang } from "../../lib/i18n";
import { LINKS } from "../../lib/config";

const Fade = ({ children, delay, className }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0.001, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
};

export const Hero = () => {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden" data-testid="hero-section">
      <div className="hero-glow absolute -top-40 right-[-10%] h-[520px] w-[520px] pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-[1100px] mx-auto px-5 md:px-6 pt-8 md:pt-12 pb-20 md:pb-28">
        <Fade delay={0} className="mb-8 md:mb-10">
          <div className="flex items-start gap-2.5 rounded-[8px] border border-[#F87171]/35 bg-[#F87171]/[0.07] px-3.5 py-2.5 text-[13px] text-[#F87171]" role="note" data-testid="hero-testnet-notice">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" /><span className="font-medium">{t.hero.notice}</span>
          </div>
        </Fade>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-end">
          <div className="lg:col-span-7">
            <Fade delay={0.05}>
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#E8B33A] mb-6" data-testid="hero-eyebrow">{t.hero.eyebrow}</p>
            </Fade>
            <HeroTitle key={t.hero.title.join()} lines={t.hero.title} />
            <Fade delay={0.55}>
              <p className="mt-7 max-w-[52ch] text-[16px] md:text-[18px] leading-relaxed text-[#A9AEB7]" data-testid="hero-sub">{t.hero.sub}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/app" data-testid="hero-open-app-btn" className="group inline-flex items-center gap-2 rounded-[8px] bg-[#E8B33A] px-5 py-3 text-[15px] font-semibold text-[#0A0B0D] transition-colors duration-150 hover:bg-[#f2c55a]">
                  {t.hero.cta}<ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <a href={LINKS.sep56} target="_blank" rel="noreferrer" data-testid="hero-spec-btn" className="inline-flex items-center gap-2 rounded-[8px] border border-[#1F2126] px-5 py-3 text-[15px] text-[#E7E9EE] transition-colors duration-150 hover:border-[#8A9099] hover:bg-[#121317]">
                  <BookOpen size={16} />{t.hero.cta2}
                </a>
              </div>
            </Fade>
          </div>
          <Fade delay={0.4} className="lg:col-span-5">
            <StatsPanel />
          </Fade>
        </div>
        <Fade delay={0.75} className="mt-10">
          <ContractId testid="hero-contract-id" />
        </Fade>
      </div>
    </section>
  );
};
