import { AnimatePresence, motion } from "framer-motion";

const Value = ({ v, testid, title, compact }) => (
  <AnimatePresence initial={false}>
    <motion.span
      key={v}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      title={title}
      className={`block font-mono ${compact ? "text-[18px] md:text-[20px]" : "text-[22px] md:text-[26px]"} tabular-nums text-[#E7E9EE] truncate`}
      data-testid={testid}
    >
      {v}
    </motion.span>
  </AnimatePresence>
);

export const StatGrid = ({ cells, compact }) => (
  <div className="grid grid-cols-2">
    {cells.map((c, i) => (
      <div key={c.id} className={`px-4 md:px-5 py-5 ${i % 2 === 0 ? "border-r" : ""} ${i < cells.length - 2 ? "border-b" : ""} border-[#1F2126] min-w-0`}>
        <p className="text-[12px] uppercase tracking-wider text-[#8A9099] mb-2">{c.k}</p>
        <Value v={c.v} testid={c.id} title={c.raw} compact={compact} />
      </div>
    ))}
  </div>
);
