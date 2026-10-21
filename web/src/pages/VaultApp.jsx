import { useState } from "react";
import { WalletBar } from "../components/app/WalletBar";
import { Notice, WalletAlerts } from "../components/app/Notice";
import { VaultStats } from "../components/app/VaultStats";
import { ActionPanel } from "../components/app/ActionPanel";
import { PositionCard } from "../components/app/PositionCard";
import { TxDialog } from "../components/app/TxDialog";
import { useVaultApp } from "../hooks/useVaultApp";
import { useLang } from "../lib/i18n";
import { appCopy } from "../lib/app-copy";
import { execute } from "../lib/stellar";

const STEP_IDX = { simulating: 0, signing: 1, pending: 2 };

export default function VaultApp() {
  const { lang } = useLang();
  const c = appCopy[lang];
  const app = useVaultApp();
  const { wallet, vault, refresh, blocked } = app;
  const connected = wallet.status === "connected";
  const [tab, setTab] = useState("deposit");
  const [depositValue, setDepositValue] = useState("");
  const [tx, setTx] = useState(null);

  const run = async (kind, amount) => {
    if (wallet.status !== "connected") return app.setError("NO_WALLET");
    if (wallet.network !== "TESTNET") return app.setError("WRONG_NETWORK");
    let at = 0;
    setTx({ kind, amount, step: "simulating" });
    try {
      const r = await execute({
        kind,
        amount,
        address: wallet.address,
        onStep: (s) => {
          at = STEP_IDX[s];
          setTx((t) => ({ ...t, step: s }));
        },
      });
      setTx((t) => ({ ...t, step: "success", hash: r.hash }));
      if (kind === "deposit") setDepositValue("");
      refresh();
    } catch (e) {
      setTx((t) => ({ ...t, step: "failed", failedAt: at, error: e.code || "SIMULATION_FAILED" }));
    }
  };

  const goDeposit = () => {
    setTab("deposit");
    document.getElementById("action-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("deposit-amount-input")?.focus(), 300);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E7E9EE]" data-testid="vault-app-page">
      <WalletBar c={c} wallet={wallet} connect={app.connect} disconnect={app.disconnect} />
      <main className="max-w-[1100px] mx-auto px-5 md:px-6 py-10 md:py-14 space-y-6">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#E8B33A] mb-3">/app · {c.testnetNote}</p>
          <h1 className="text-[32px] md:text-[44px] leading-[1.05] font-semibold tracking-tight" data-testid="vault-app-title">{c.title}</h1>
          <p className="mt-3 max-w-[56ch] text-[15px] text-[#A9AEB7]">{c.sub}</p>
        </div>
        <WalletAlerts c={c} wallet={wallet} error={app.error} setError={app.setError} />
        {connected && vault && vault.xlm === 0n && (
          <Notice
            testid="fund-hint"
            title={c.fund.t}
            desc={c.fund.d}
            action={
              <a href={`https://friendbot.stellar.org/?addr=${wallet.address}`} target="_blank" rel="noreferrer" data-testid="fund-link" className="shrink-0 inline-flex items-center gap-1.5 rounded-[8px] border border-[#E8B33A]/50 px-3 py-1.5 text-[13px] hover:bg-[#E8B33A] hover:text-[#0A0B0D] transition-colors duration-150">
                {c.fund.cta}
              </a>
            }
          />
        )}
        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            <VaultStats c={c} vault={vault} connected={connected} refresh={refresh} />
            <PositionCard c={c} vault={vault} connected={connected} onGoDeposit={goDeposit} />
          </div>
          <div className="space-y-6">
            <ActionPanel c={c} tab={tab} setTab={setTab} depositValue={depositValue} setDepositValue={setDepositValue} vault={vault} blocked={blocked} connected={connected} onSubmit={run} />
          </div>
        </div>
      </main>
      <TxDialog c={c} tx={tx} onClose={() => setTx(null)} onRetry={() => run(tx.kind, tx.amount)} />
    </div>
  );
}
