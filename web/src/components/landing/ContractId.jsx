import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { CONTRACT_ID, LINKS, isValidContractId } from "../../lib/config";
import { useLang } from "../../lib/i18n";

export const ContractId = ({ compact = false, testid = "contract-id" }) => {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const valid = isValidContractId(CONTRACT_ID);
  const copy = async () => {
    if (!valid) return;
    await navigator.clipboard.writeText(CONTRACT_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className={`flex flex-wrap items-center gap-2 font-mono text-[12px] ${compact ? "" : "rounded-[8px] border border-[#1F2126] bg-[#121317] px-3 py-2"}`} data-testid={testid}>
      <span className="text-[#8A9099] uppercase tracking-wider">{t.hero.contract}</span>
      {valid ? (
        <a href={LINKS.explorer(CONTRACT_ID)} target="_blank" rel="noreferrer" className="text-[#E7E9EE] break-all hover:text-[#E8B33A] transition-colors duration-150 tabular-nums" data-testid={`${testid}-link`}>
          {CONTRACT_ID}
        </a>
      ) : (
        <span className="text-[#E7E9EE]" data-testid={`${testid}-pending`}>C… [CONTRACT_ID] · {t.hero.pending}</span>
      )}
      <button
        onClick={copy}
        disabled={!valid}
        aria-label={t.hero.copy}
        data-testid={`${testid}-copy-btn`}
        className="inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[#8A9099] hover:text-[#E7E9EE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {copied ? <Check size={13} className="text-[#4ADE80]" /> : <Copy size={13} />}
        {copied ? t.hero.copied : t.hero.copy}
      </button>
      {valid && <ExternalLink size={13} className="text-[#8A9099]" />}
    </div>
  );
};
