import { AlertTriangle, Download, XCircle } from "lucide-react";

const tones = {
  warn: "border-[#E8B33A]/40 bg-[#E8B33A]/10 text-[#E8B33A]",
  danger: "border-[#F87171]/40 bg-[#F87171]/10 text-[#F87171]",
};

export const Notice = ({ tone = "warn", title, desc, action, testid }) => {
  const Icon = tone === "danger" ? XCircle : AlertTriangle;
  return (
    <div role="alert" data-testid={testid} className={`flex items-start gap-3 rounded-[10px] border px-4 py-3 ${tones[tone]}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="text-[13px] text-[#C9CDD4] mt-0.5 max-w-[68ch]">{desc}</p>
      </div>
      {action}
    </div>
  );
};

export const WalletAlerts = ({ c, wallet, error, setError }) => (
  <div className="space-y-3">
    {!wallet.installed && (
      <Notice testid="wallet-install-hint" title={c.install.t} desc={c.install.d} action={
        <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" data-testid="wallet-install-link" className="shrink-0 inline-flex items-center gap-1.5 rounded-[8px] border border-[#E8B33A]/50 px-3 py-1.5 text-[13px] hover:bg-[#E8B33A] hover:text-[#0A0B0D] transition-colors duration-150">
          <Download size={14} />{c.install.cta}
        </a>
      } />
    )}
    {wallet.status === "connected" && wallet.network !== "TESTNET" && (
      <Notice tone="danger" testid="wrong-network-warning" title={c.wrongNet.t} desc={c.wrongNet.d.replace("{net}", wallet.network)} />
    )}
    {error && error !== "NO_WALLET" && (
      <Notice tone="danger" testid="wallet-error" title={(c.errors[error] || c.errors.UNKNOWN).t} desc={(c.errors[error] || c.errors.UNKNOWN).d} action={
        <button onClick={() => setError(null)} data-testid="wallet-error-dismiss" className="shrink-0 text-[12px] underline">OK</button>
      } />
    )}
  </div>
);
