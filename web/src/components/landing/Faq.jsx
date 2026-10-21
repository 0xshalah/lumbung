import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Reveal, SectionHead } from "./Reveal";
import { useLang } from "../../lib/i18n";

export const Faq = () => {
  const { t } = useLang();
  return (
    <section className="max-w-[1100px] mx-auto px-5 md:px-6 py-24 md:py-32" data-testid="faq-section">
      <SectionHead id="faq" label={t.faq.label} title={t.faq.title} />
      <Reveal>
        <Accordion type="single" collapsible className="border-t border-[#1F2126]">
          {t.faq.items.map((f, i) => (
            <AccordionItem key={f.q} value={`q${i}`} className="border-b border-[#1F2126]">
              <AccordionTrigger data-testid={`faq-trigger-${i + 1}`} className="py-6 text-left text-[16px] md:text-[18px] font-medium text-[#E7E9EE] hover:no-underline hover:text-[#E8B33A] transition-colors duration-150">
                <span className="flex gap-5"><span className="font-mono text-[12px] text-[#8A9099] pt-1.5 tabular-nums">{String(i + 1).padStart(2, "0")}</span>{f.q}</span>
              </AccordionTrigger>
              <AccordionContent className="pl-10 pb-6 text-[15px] leading-relaxed text-[#A9AEB7] max-w-[68ch]" data-testid={`faq-answer-${i + 1}`}>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
};
