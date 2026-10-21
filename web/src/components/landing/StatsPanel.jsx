import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { RotateCw } from "lucide-react";
import { readVault } from "../../lib/vault-read";
import { formatShares, formatXlm, sharePrice } from "../../lib/format";
import { useLang } from "../../lib/i18n";
import { StatGrid } from "./StatGrid";

const useTilt = () => {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return { style: { rotateX: rx, rotateY: ry, transformPerspective: 1100 }, onMouseMove: onMove, onMouseLeave: onLeave };
};

export const StatsPanel = () => {
  const { t } = useLang();
  const [state, setState] = useState({ status: "loading", data: null });
  const tilt = useTilt();

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: s.data ? s.status : "loading" }));
    try {
      const d = await readVault();
      setState({ status: "ok", data: { ...d, at: new Date() } });
    } catch {
      setState({ status: "error", data: null });
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const d = state.data;
  const dash = state.status === "loading" ? "…" : "—";
  const cells = [
    { k: t.stats.assets, v: d ? `${formatXlm(d.totalAssets, 2)} XLM` : dash, id: "stat-total-assets" },
    { k: t.stats.price, v: d ? `${sharePrice(d.totalAssets, d.totalSupply)} XLM` : dash, id: "stat-share-price" },
    { k: t.stats.supply, v: d ? formatShares(d.totalSupply, 2) : dash, id: "stat-shares-issued" },
    { k: t.stats.updated, v: d ? d.at.toLocaleTimeString() : dash, id: "stat-last-update" },
  ];

  return (
    <motion.div {...tilt} className="relative rounded-[10px] border border-[#1F2126] bg-[#121317]/90 backdrop-blur-sm will-change-transform" data-testid="stats-panel">
      <div className="flex items-center justify-between gap-3 border-b border-[#1F2126] px-4 md:px-5 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${state.status === "ok" ? "bg-[#4ADE80]" : state.status === "error" ? "bg-[#F87171]" : "bg-[#E8B33A] animate-pulse"}`} />
          <span className="text-[14px] font-medium text-[#E7E9EE]">{t.stats.title}</span>
        </div>
        <span className="font-mono text-[12px] text-[#8A9099] hidden sm:inline">{t.stats.source}</span>
      </div>
      <StatGrid cells={cells} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1F2126] px-4 md:px-5 py-3">
        {state.status === "error" ? (
          <p className="text-[12px] text-[#F87171] max-w-[44ch]" role="status" data-testid="stats-error">{t.stats.error}</p>
        ) : (
          <p className="font-mono text-[12px] text-[#8A9099]">{state.status === "loading" ? t.stats.loading : t.stats.refresh}</p>
        )}
        <button onClick={load} data-testid="stats-retry-btn" className="group inline-flex items-center gap-1.5 rounded-[8px] border border-[#1F2126] px-3 py-1.5 text-[12px] text-[#E7E9EE] hover:border-[#E8B33A] hover:text-[#E8B33A] transition-colors duration-150">
          <RotateCw size={13} className="transition-transform duration-300 group-hover:rotate-180" />{t.stats.retry}
        </button>
      </div>
    </motion.div>
  );
};
