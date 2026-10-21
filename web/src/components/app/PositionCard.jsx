import { ArrowRight, Sprout } from "lucide-react";
import { formatShares, formatXlm } from "../../lib/format";
import { ownershipPct } from "../../lib/parse";
import { previewRedeem } from "../../lib/vault-math";

const Row = ({ k, v, testid }) => (
  <div className="flex items-baseline justify-between gap-4 py-3 border-b border-[#1F2126] last:border-0">
    <span className="text-[12px] uppercase tracking-wider text-[#8A9099]">{k}</span>
    <span className="font-mono tabular-nums text-[18px] text-[#E7E9EE] truncate" data-testid={testid}>{v}</span>
  </div>
);

export const PositionCard = ({ c, vault, connected, onGoDeposit }) => {
  const p = c.position;
  const has = connected && vault && vault.shares > 0n;
  return (
    <section className="rounded-[10px] border border-[#1F2126] bg-[#121317] p-5" data-testid="position-card">
      <h2 className="text-[14px] font-medium mb-2">{p.title}</h2>
      {has ? (
        <div>
          <Row k={p.value} v={`${formatXlm(previewRedeem(vault.shares, vault.totalAssets, vault.totalSupply))} XLM`} testid="position-value" />
          <Row k={p.own} v={`${ownershipPct(vault.shares, vault.totalSupply).toFixed(4)}%`} testid="position-ownership" />
          <Row k={p.shares} v={formatShares(vault.shares)} testid="position-shares" />
        </div>
      ) : (
        <div className="py-6 flex flex-col items-start gap-3" data-testid="position-empty">
          <span className="rounded-[8px] border border-[#1F2126] p-2 text-[#E8B33A]"><Sprout size={18} /></span>
          {connected && <p className="text-[15px] font-semibold">{p.emptyT}</p>}
          <p className="text-[13px] text-[#8A9099] max-w-[40ch]">{connected ? p.emptyD : p.connectD}</p>
          {connected && (
            <button onClick={onGoDeposit} data-testid="position-go-deposit-btn" className="group inline-flex items-center gap-1.5 text-[14px] text-[#E8B33A] hover:text-[#f2c55a] transition-colors duration-150">
              {p.emptyCta}<ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          )}
        </div>
      )}
    </section>
  );
};
