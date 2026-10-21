import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, LogOut, Wallet, ArrowLeft } from "lucide-react";
import { Logo } from "../landing/Logo";
import { LangToggle } from "../landing/Nav";
import { shortAddr } from "../../lib/parse";

const Address = ({ address, c, onDisconnect }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-1 rounded-[8px] border border-[#1F2126] bg-[#121317] pl-3 pr-1 py-1" data-testid="wallet-connected">
      <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
      <span className="font-mono text-[13px] tabular-nums text-[#E7E9EE] ml-1" title={address} data-testid="wallet-address">{shortAddr(address)}</span>
      <button onClick={copy} aria-label={c.copy} data-testid="wallet-copy-btn" className="ml-1 rounded-[6px] p-1.5 text-[#8A9099] hover:text-[#E7E9EE] hover:bg-[#1F2126] transition-colors duration-150">
        {copied ? <Check size={14} className="text-[#4ADE80]" /> : <Copy size={14} />}
      </button>
      <button onClick={onDisconnect} aria-label={c.disconnect} data-testid="wallet-disconnect-btn" className="rounded-[6px] p-1.5 text-[#8A9099] hover:text-[#F87171] hover:bg-[#1F2126] transition-colors duration-150">
        <LogOut size={14} />
      </button>
    </div>
  );
};

export const WalletBar = ({ c, wallet, connect, disconnect }) => (
  <header className="sticky top-0 z-40 bg-[#0A0B0D]/90 backdrop-blur-md border-b border-[#1F2126]" data-testid="app-header">
    <div className="max-w-[1100px] mx-auto px-5 md:px-6 h-16 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#F87171]/40 bg-[#F87171]/10 px-2.5 py-0.5 font-mono text-[12px] text-[#F87171]" data-testid="app-testnet-badge">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F87171] animate-pulse" />TESTNET
        </span>
        <Link to="/" data-testid="app-back-link" className="hidden md:inline-flex items-center gap-1 text-[13px] text-[#8A9099] hover:text-[#E7E9EE] transition-colors duration-150">
          <ArrowLeft size={14} />{c.back}
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <LangToggle />
        {wallet.status === "connected" ? (
          <Address address={wallet.address} c={c} onDisconnect={disconnect} />
        ) : (
          <button onClick={connect} disabled={wallet.status === "connecting"} data-testid="wallet-connect-btn" className="inline-flex items-center gap-2 rounded-[8px] bg-[#E8B33A] px-3 md:px-4 py-2 text-[14px] font-semibold text-[#0A0B0D] hover:bg-[#f2c55a] disabled:opacity-60 transition-colors duration-150">
            <Wallet size={16} />{wallet.status === "connecting" ? c.connecting : c.connect}
          </button>
        )}
      </div>
    </div>
  </header>
);
