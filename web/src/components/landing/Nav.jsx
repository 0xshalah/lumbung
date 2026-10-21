import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useLang } from "../../lib/i18n";
import { LINKS } from "../../lib/config";

export const LangToggle = () => {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-[8px] border border-[#1F2126] p-0.5 font-mono text-[12px]" role="group" aria-label="Language">
      {["en", "id"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          data-testid={`lang-toggle-${l}`}
          className={`px-3 py-2 min-h-[44px] rounded-[6px] uppercase transition-colors duration-150 ${lang === l ? "bg-[#E8B33A] text-[#0A0B0D]" : "text-[#8A9099] hover:text-[#E7E9EE]"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
};

export const Nav = () => {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      data-testid="site-nav"
      className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 border-b ${scrolled ? "bg-[#0A0B0D]/85 border-[#1F2126]" : "bg-[#0A0B0D]/40 border-transparent"}`}
    >
      <div className="max-w-[1100px] mx-auto px-5 md:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:inline-flex items-center rounded-[4px] border border-[#F87171]/30 bg-[#F87171]/[0.07] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#F87171]" data-testid="nav-testnet-badge">{t.nav.testnet}</span>
        </div>
        <nav className="flex items-center gap-2 md:gap-6">
          <Link to="/docs" className="hidden md:inline text-[14px] text-[#8A9099] hover:text-[#E7E9EE] transition-colors duration-150" data-testid="nav-docs-link">{t.nav.docs}</Link>
          <a href={LINKS.github} className="hidden md:inline text-[14px] text-[#8A9099] hover:text-[#E7E9EE] transition-colors duration-150" data-testid="nav-github-link">{t.nav.github}</a>
          <LangToggle />
          <Link to="/app" data-testid="nav-open-app-btn" className="group inline-flex items-center gap-1 rounded-[8px] bg-[#E8B33A] px-3 md:px-4 min-h-[44px] text-[14px] font-semibold text-[#0A0B0D] transition-colors duration-150 hover:bg-[#f2c55a]">
            {t.nav.cta}
          </Link>
        </nav>
      </div>
    </header>
  );
};
