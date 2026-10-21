import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Reveal } from "./Reveal";

export const PageShell = ({ label, title, sub, testid, children }) => (
  <div className="grain min-h-screen bg-[#0A0B0D] text-[#E7E9EE]" data-testid={testid}>
    <Nav />
    <main className="max-w-[1100px] mx-auto px-5 md:px-6 pt-20 md:pt-28 pb-16">
      <Reveal>
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#E8B33A] mb-5">{label}</p>
        <h1 className="text-[36px] md:text-[56px] leading-[1.02] font-semibold tracking-tight max-w-[20ch]" data-testid={`${testid}-title`}>{title}</h1>
        <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-[#A9AEB7]">{sub}</p>
      </Reveal>
      <div className="mt-16 md:mt-20">{children}</div>
    </main>
    <Footer />
  </div>
);
