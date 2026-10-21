import { RotateCw } from "lucide-react";
import { StatGrid } from "../landing/StatGrid";
import { formatShares, formatXlm, sharePrice } from "../../lib/format";

export const VaultStats = ({ c, vault, connected, refresh }) => {
  const d = vault;
  const dash = "…";
  const cells = [
    { k: c.stats.assets, v: d ? `${formatXlm(d.totalAssets)} XLM` : dash, raw: d && `${d.totalAssets} (i128)`, id: "vault-total-assets" },
    { k: c.stats.price, v: d ? `${sharePrice(d.totalAssets, d.totalSupply)} XLM` : dash, id: "vault-share-price" },
    { k: c.stats.supply, v: d ? formatShares(d.totalSupply) : dash, raw: d && `${d.totalSupply} (i128)`, id: "vault-shares-issued" },
    { k: c.stats.mine, v: d && connected ? formatShares(d.shares) : "—", raw: d && connected ? `${d.shares} (i128)` : undefined, id: "vault-user-shares" },
  ];
  return (
    <section className="rounded-[10px] border border-[#1F2126] bg-[#121317]" data-testid="vault-stats-card">
      <div className="flex items-center justify-between border-b border-[#1F2126] px-4 md:px-5 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${d ? "bg-[#4ADE80]" : "bg-[#E8B33A] animate-pulse"}`} />
          <span className="text-[14px] font-medium">{c.stats.title}</span>
        </div>
        <button onClick={refresh} data-testid="vault-refresh-btn" aria-label="refresh" className="group rounded-[6px] p-1.5 text-[#8A9099] hover:text-[#E8B33A] transition-colors duration-150">
          <RotateCw size={14} className="transition-transform duration-300 group-hover:rotate-180" />
        </button>
      </div>
      <StatGrid cells={cells} compact />
      {connected && d && (
        <div className="border-t border-[#1F2126] px-4 md:px-5 py-3 flex justify-between font-mono text-[12px] text-[#8A9099]">
          <span>{c.stats.wallet}</span>
          <span className="tabular-nums text-[#E7E9EE]" data-testid="vault-user-xlm">{formatXlm(d.xlm)} XLM</span>
        </div>
      )}
    </section>
  );
};
