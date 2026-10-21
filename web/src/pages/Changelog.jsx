import { PageShell } from "../components/landing/PageShell";
import { Reveal } from "../components/landing/Reveal";
import { useLang } from "../lib/i18n";
import { pagesCopy } from "../lib/pages-copy";

export default function Changelog() {
  const { lang } = useLang();
  const c = pagesCopy[lang].changelog;
  return (
    <PageShell label={c.label} title={c.title} sub={c.sub} testid="changelog-page">
      <ol className="relative border-l border-[#1F2126] ml-1.5">
        {c.entries.map((e, i) => (
          <Reveal key={e.v} delay={i * 0.05}>
            <li className="pl-8 pb-12 relative" data-testid={`changelog-entry-${e.v}`}>
              <span className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-[#E8B33A]" : "bg-[#1F2126]"}`} />
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="font-mono text-[22px] md:text-[26px] tabular-nums">v{e.v}</h2>
                <span className="font-mono text-[12px] text-[#8A9099]">{e.d}</span>
                <span className="rounded-full border border-[#1F2126] px-2 py-0.5 font-mono text-[11px] uppercase text-[#E8B33A]">{e.tag}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {e.items.map((t) => <li key={t} className="flex gap-3 text-[15px] text-[#A9AEB7]"><span className="text-[#5B606A]">·</span>{t}</li>)}
              </ul>
            </li>
          </Reveal>
        ))}
      </ol>
    </PageShell>
  );
}
