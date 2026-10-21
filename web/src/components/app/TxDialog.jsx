import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ExternalLink, Loader2, X } from "lucide-react";

const ORDER = ["simulating", "signing", "pending", "done"];

const StepIcon = ({ state }) => {
  if (state === "done") return <Check size={14} className="text-[#0A0B0D]" />;
  if (state === "active") return <Loader2 size={14} className="animate-spin text-[#E8B33A]" />;
  if (state === "error") return <X size={14} className="text-[#0A0B0D]" />;
  return <span className="h-1.5 w-1.5 rounded-full bg-[#3A3D44]" />;
};

const ring = { done: "bg-[#4ADE80] border-[#4ADE80]", active: "border-[#E8B33A]", error: "bg-[#F87171] border-[#F87171]", idle: "border-[#1F2126]" };

export const TxDialog = ({ c, tx, onClose, onRetry }) => {
  const final = tx && (tx.step === "success" || tx.step === "failed");
  useEffect(() => {
    if (!tx) return;
    const block = (e) => e.key === "Escape" && !final && e.preventDefault();
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
  }, [tx, final]);

  const idx = tx ? (final ? 3 : ORDER.indexOf(tx.step)) : 0;
  const stateOf = (i) => {
    if (tx.step === "failed" && i === tx.failedAt) return "error";
    if (i < idx || (tx.step === "success" && i === 3)) return "done";
    if (i === idx && !final) return "active";
    return tx.step === "failed" && i > tx.failedAt ? "idle" : i === idx ? "done" : "idle";
  };
  const err = tx?.error ? c.errors[tx.error] || c.errors.UNKNOWN : null;

  return (
    <AnimatePresence>
      {tx && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0D]/80 backdrop-blur-sm p-4" data-testid="tx-dialog-overlay">
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} role="dialog" aria-modal="true" className="w-full max-w-[440px] rounded-[10px] border border-[#1F2126] bg-[#121317] p-6" data-testid="tx-dialog">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#E8B33A]">{c.tx.title[tx.kind]}</p>
            <ol className="mt-5 space-y-4">
              {ORDER.map((s, i) => {
                const st = stateOf(i);
                return (
                  <li key={s} className="flex items-center gap-3" data-testid={`tx-step-${s}`} data-state={st}>
                    <span className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors duration-200 ${ring[st]}`}><StepIcon state={st} /></span>
                    <span className={`text-[14px] ${st === "idle" ? "text-[#5B606A]" : "text-[#E7E9EE]"}`}>
                      {s === "done" && final ? (tx.step === "success" ? c.tx.success : c.tx.failed) : c.tx.steps[s]}
                    </span>
                  </li>
                );
              })}
            </ol>
            {tx.step === "failed" && err && (
              <div className="mt-5 rounded-[8px] border border-[#F87171]/40 bg-[#F87171]/10 px-4 py-3" data-testid="tx-error" data-code={tx.error}>
                <p className="text-[14px] font-semibold text-[#F87171]">{err.t}</p>
                <p className="text-[13px] text-[#C9CDD4] mt-0.5">{err.d}</p>
              </div>
            )}
            {tx.hash && (
              <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noreferrer" data-testid="tx-explorer-link" className="mt-5 inline-flex items-center gap-1.5 font-mono text-[12px] text-[#E8B33A] hover:underline break-all">
                {c.tx.explorer} · {tx.hash.slice(0, 10)}…<ExternalLink size={12} />
              </a>
            )}
            <div className="mt-6 flex gap-2">
              {final ? (
                <>
                  {tx.step === "failed" && <button onClick={onRetry} data-testid="tx-retry-btn" className="flex-1 rounded-[8px] bg-[#E8B33A] py-2.5 text-[14px] font-semibold text-[#0A0B0D] hover:bg-[#f2c55a] transition-colors duration-150">{c.tx.retry}</button>}
                  <button onClick={onClose} data-testid="tx-close-btn" className="flex-1 rounded-[8px] border border-[#1F2126] py-2.5 text-[14px] hover:border-[#E7E9EE] transition-colors duration-150">{c.tx.close}</button>
                </>
              ) : (
                <p className="text-[12px] text-[#8A9099]" data-testid="tx-locked-note">{c.tx.locked}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
