import { motion, useReducedMotion } from "framer-motion";

export const HeroTitle = ({ lines }) => {
  const reduce = useReducedMotion();
  return (
    <h1 className="text-[44px] sm:text-[56px] lg:text-[84px] leading-[0.98] font-semibold tracking-[-0.035em] text-[#E7E9EE]" data-testid="hero-title">
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${i === lines.length - 1 ? "text-[#E8B33A]" : ""}`}
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
};
