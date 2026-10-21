import { motion, useReducedMotion } from "framer-motion";

export const Reveal = ({ children, delay = 0, className = "", y = 18, from = "up" }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  const offset = from === "left" ? { x: -24, y: 0 } : from === "right" ? { x: 24, y: 0 } : { x: 0, y };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.001, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const SectionHead = ({ label, title, id }) => (
  <Reveal className="mb-12 md:mb-16 grid md:grid-cols-12 gap-4">
    <p className="md:col-span-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[#E8B33A]" data-testid={`${id}-label`}>{label}</p>
    <h2 className="md:col-span-8 text-[28px] md:text-[40px] leading-[1.08] font-semibold tracking-tight text-[#E7E9EE]" data-testid={`${id}-title`}>{title}</h2>
  </Reveal>
);
