import { LogoMark } from "./Logo";
import { ContractId } from "./ContractId";
import { useLang } from "../../lib/i18n";
import { LINKS } from "../../lib/config";

export const Footer = () => {
  const { t } = useLang();
  const links = [
    { l: "GitHub", h: LINKS.github, id: "footer-github" },
    { l: "X", h: LINKS.x, id: "footer-x" },
    { l: t.nav.docs, h: "/docs", id: "footer-docs" },
    { l: t.footer.changelog, h: "/changelog", id: "footer-changelog" },
    { l: t.footer.status, h: "/status", id: "footer-status" },
    { l: "Aegis report", h: "/aegis-report.md", id: "footer-aegis" },
    { l: t.footer.contact, h: LINKS.issues, id: "footer-issues" },
  ];
  return (
    <footer className="border-t border-[#1F2126] mt-12" data-testid="site-footer">
      <div className="max-w-[1100px] mx-auto px-5 md:px-6 py-14">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5"><LogoMark /><span className="text-[16px] font-semibold text-[#E7E9EE]">{t.footer.brand}</span></div>
            <p className="text-[14px] text-[#F87171]" data-testid="footer-testnet-notice">{t.footer.notice}</p>
            <ContractId compact testid="footer-contract-id" />
          </div>
          <ul className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
            {links.map((k) => (
              <li key={k.id}><a href={k.h} data-testid={k.id} className="inline-flex items-center min-h-[44px] text-[14px] text-[#A9AEB7] hover:text-[#E8B33A] transition-colors duration-150">{k.l}</a></li>
            ))}
          </ul>
        </div>
        <div className="mt-14 pt-6 border-t border-[#1F2126] flex flex-wrap justify-between gap-3 font-mono text-[12px] text-[#8A9099]">
          <span>{t.footer.license}</span>
          <span data-testid="footer-contact">{LINKS.contact}</span>
        </div>
      </div>
      <div className="overflow-hidden select-none" aria-hidden="true">
        <p className="text-center font-semibold tracking-[-0.06em] leading-[0.8] text-[22vw] text-[#121317] translate-y-[12%]">lumbung</p>
      </div>
    </footer>
  );
};
