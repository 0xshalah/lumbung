import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AmountField, PreviewRow } from "./AmountField";
import { formatShares, formatXlm } from "../../lib/format";
import { parseUnits } from "../../lib/parse";
import { previewDeposit, previewRedeem, previewWithdraw } from "../../lib/vault-math";
import { ASSET_DECIMALS, SHARE_DECIMALS } from "../../lib/config";

const SubmitBtn = ({ children, disabled, onClick, testid }) => (
  <button onClick={onClick} disabled={disabled} data-testid={testid} className="w-full rounded-[8px] bg-[#E8B33A] py-3 text-[15px] font-semibold text-[#0A0B0D] hover:bg-[#f2c55a] active:scale-[0.99] disabled:bg-[#1F2126] disabled:text-[#5B606A] disabled:cursor-not-allowed transition-[background-color,transform] duration-150">
    {children}
  </button>
);

const Hint = ({ children, tone, testid }) => (
  <p data-testid={testid} className={`text-[12px] ${tone === "danger" ? "text-[#F87171]" : "text-[#8A9099]"}`}>{children}</p>
);

const DepositForm = ({ c, vault, blocked, connected, onSubmit, value, setValue }) => {
  const amt = parseUnits(value, ASSET_DECIMALS);
  const shares = amt !== null && vault ? previewDeposit(amt, vault.totalAssets, vault.totalSupply) : 0n;
  const over = connected && amt !== null && vault && amt > vault.xlm;
  const zero = amt !== null && amt > 0n && shares === 0n;
  return (
    <div className="space-y-4">
      <AmountField c={c} id="deposit-amount-input" value={value} onChange={setValue} unit="XLM" decimals={ASSET_DECIMALS} available={connected && vault ? vault.xlm : undefined} invalid={over} />
      <PreviewRow label={c.youGet} value={formatShares(shares)} unit="shares" testid="deposit-preview-shares" />
      {over && <Hint tone="danger" testid="deposit-insufficient">{c.errors.INSUFFICIENT_BALANCE.d}</Hint>}
      {zero && <Hint tone="danger" testid="deposit-zero-shares">{c.zeroShares}</Hint>}
      {!connected && <Hint testid="deposit-connect-hint">{c.connectFirst}</Hint>}
      <SubmitBtn testid="deposit-submit-btn" disabled={blocked || !amt || shares === 0n || over} onClick={() => onSubmit("deposit", amt)}>{c.depositBtn}</SubmitBtn>
    </div>
  );
};

const WithdrawForm = ({ c, vault, blocked, connected, onSubmit, value, setValue, mode, setMode }) => {
  const byAssets = mode === "assets";
  const decimals = byAssets ? ASSET_DECIMALS : SHARE_DECIMALS;
  const amt = parseUnits(value, decimals);
  const maxAssets = vault ? previewRedeem(vault.shares, vault.totalAssets, vault.totalSupply) : 0n;
  const out =
    amt !== null && vault
      ? byAssets
        ? previewWithdraw(amt, vault.totalAssets, vault.totalSupply)
        : previewRedeem(amt, vault.totalAssets, vault.totalSupply)
      : 0n;
  const over = connected && amt !== null && vault && (byAssets ? out > vault.shares : amt > vault.shares);
  const hasShares = connected && vault && vault.shares > 0n;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 rounded-[8px] border border-[#1F2126] p-0.5 text-[13px]" role="group">
        {[["assets", c.modeAssets], ["shares", c.modeShares]].map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setValue(""); }} aria-pressed={mode === m} data-testid={`withdraw-mode-${m}`} className={`rounded-[6px] py-2 transition-colors duration-150 ${mode === m ? "bg-[#1F2126] text-[#E7E9EE]" : "text-[#8A9099] hover:text-[#E7E9EE]"}`}>{l}</button>
        ))}
      </div>
      <AmountField c={c} id="withdraw-amount-input" value={value} onChange={setValue} unit={byAssets ? "XLM" : "shares"} decimals={decimals} available={connected && vault ? (byAssets ? maxAssets : vault.shares) : undefined} invalid={over} />
      <PreviewRow label={byAssets ? c.youBurn : c.youGet} value={byAssets ? formatShares(out) : formatXlm(out)} unit={byAssets ? "shares" : "XLM"} testid="withdraw-preview" />
      {over && <Hint tone="danger" testid="withdraw-insufficient">{c.errors.INSUFFICIENT_BALANCE.d}</Hint>}
      {!connected && <Hint testid="withdraw-connect-hint">{c.connectFirst}</Hint>}
      <SubmitBtn testid="withdraw-submit-btn" disabled={blocked || !amt || out === 0n || over} onClick={() => onSubmit(byAssets ? "withdraw" : "redeem", amt)}>{byAssets ? c.withdrawBtn : c.redeemBtn}</SubmitBtn>
      <button onClick={() => onSubmit("redeem", vault.shares)} disabled={blocked || !hasShares} data-testid="redeem-all-btn" className="w-full rounded-[8px] border border-[#1F2126] py-2.5 text-[14px] text-[#E7E9EE] hover:border-[#E8B33A] hover:text-[#E8B33A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150">
        {c.redeemAll}{hasShares && <span className="font-mono text-[12px] text-[#8A9099]"> · {formatShares(vault.shares)}</span>}
      </button>
    </div>
  );
};

export const ActionPanel = ({ c, tab, setTab, depositValue, setDepositValue, ...rest }) => {
  const [wValue, setWValue] = useState("");
  const [mode, setMode] = useState("assets");
  return (
    <section className="rounded-[10px] border border-[#1F2126] bg-[#121317] p-5" data-testid="action-panel" id="action-panel">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full bg-[#0A0B0D] border border-[#1F2126] rounded-[8px] h-11 p-1">
          <TabsTrigger value="deposit" data-testid="tab-deposit" className="rounded-[6px] data-[state=active]:bg-[#E8B33A] data-[state=active]:text-[#0A0B0D] text-[#8A9099]">{c.tabs.deposit}</TabsTrigger>
          <TabsTrigger value="withdraw" data-testid="tab-withdraw" className="rounded-[6px] data-[state=active]:bg-[#E8B33A] data-[state=active]:text-[#0A0B0D] text-[#8A9099]">{c.tabs.withdraw}</TabsTrigger>
        </TabsList>
        <TabsContent value="deposit" className="mt-5"><DepositForm c={c} value={depositValue} setValue={setDepositValue} {...rest} /></TabsContent>
        <TabsContent value="withdraw" className="mt-5"><WithdrawForm c={c} value={wValue} setValue={setWValue} mode={mode} setMode={setMode} {...rest} /></TabsContent>
      </Tabs>
      <p className="mt-4 text-[11px] text-[#5B606A]">{c.rounding}</p>
    </section>
  );
};
