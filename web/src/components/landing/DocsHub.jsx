import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";
import { CONTRACT_ID, LINKS, isValidContractId } from "../../lib/config";

const hrefs = () => [
  `${LINKS.github}#readme`,
  "/docs",
  `${LINKS.github}/blob/main/TRD.md`,
  LINKS.sep56,
  isValidContractId(CONTRACT_ID) ? LINKS.explorer(CONTRACT_ID) : "#contract-placeholder",
  `${LINKS.github}/tree/main/contracts/lumbung-vault`,
];

export const DocsHub = () => {
  const { t } = useLang();
  const h = hrefs();
  return (
    <section id="docs" className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="docs-section">
      <SectionHead id="docs" label={t.docs.label} title={t.docs.title} />
      <Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-[#1F2126] rounded-[10px] overflow-hidden">
          {t.docs.items.map((d, i) => (
            <a key={d.t} href={h[i]} target={h[i].startsWith("http") ? "_blank" : undefined} rel="noreferrer" data-testid={`docs-link-${i + 1}`}
              className="group relative border-r border-b border-[#1F2126] p-6 md:p-7 min-h-[150px] flex flex-col justify-between transition-colors duration-200 hover:bg-[#121317]">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[12px] text-[#8A9099] tabular-nums">/{String(i + 1).padStart(2, "0")}</span>
                <ArrowUpRight size={18} className="text-[#8A9099] transition-[color,transform] duration-200 group-hover:text-[#E8B33A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[#E7E9EE] mb-1">{d.t}</h3>
                <p className="text-[14px] text-[#A9AEB7]">{d.d}</p>
              </div>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
};
