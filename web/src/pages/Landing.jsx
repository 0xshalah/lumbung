import { Nav } from "../components/landing/Nav";
import { Hero } from "../components/landing/Hero";
import { Marquee } from "../components/landing/Marquee";
import { HowItWorks } from "../components/landing/HowItWorks";
import { ShareMath } from "../components/landing/ShareMath";
import { WhyVault } from "../components/landing/WhyVault";
import { Mechanics } from "../components/landing/Mechanics";
import { Security } from "../components/landing/Security";
import { Roadmap } from "../components/landing/Roadmap";
import { DocsHub } from "../components/landing/DocsHub";
import { Faq } from "../components/landing/Faq";
import { Footer } from "../components/landing/Footer";
import { useLenis } from "../hooks/useLenis";

export default function Landing() {
  useLenis();
  return (
    <div className="grain min-h-screen bg-[#0A0B0D] text-[#E7E9EE]" data-testid="landing-page">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <ShareMath />
        <WhyVault />
        <Mechanics />
        <Security />
        <Roadmap />
        <DocsHub />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
