import { PageShell } from "../components/landing/PageShell";
import { Reveal } from "../components/landing/Reveal";
import { useLang } from "../lib/i18n";
import { pagesCopy } from "../lib/pages-copy";

const Example = ({ ex }) => (
  <div className="rounded-[10px] border border-[#1F2126] bg-[#121317]">
    <p className="border-b border-[#1F2126] px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-[#8A9099]">{ex.k}</p>
    {ex.rows.map(([k, v]) => (
      <div key={k} className="flex justify-between gap-4 px-4 py-2.5 border-b border-[#1F2126] last:border-0 text-[13px]">
        <span className="text-[#A9AEB7]">{k}</span><span className="font-mono tabular-nums text-[#E7E9EE] text-right">{v}</span>
      </div>
    ))}
  </div>
);

const Section = ({ s, i }) => (
  <Reveal>
    <section id={s.id} className="scroll-mt-24 grid md:grid-cols-12 gap-6 py-10 border-t border-[#1F2126]" data-testid={`docs-section-${s.id}`}>
      <div className="md:col-span-7">
        <p className="font-mono text-[12px] text-[#E8B33A] mb-2">{String(i + 1).padStart(2, "0")}</p>
        <h2 className="text-[22px] md:text-[28px] font-semibold tracking-tight">{s.t}</h2>
        {s.p?.map((p) => <p key={p} className="mt-4 text-[15px] leading-relaxed text-[#A9AEB7] max-w-[60ch]">{p}</p>)}
        {s.list && (
          <ul className="mt-4 space-y-3">
            {s.list.map((l) => <li key={l} className="flex gap-3 text-[15px] text-[#A9AEB7]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F87171]" />{l}</li>)}
          </ul>
        )}
      </div>
      {s.ex && <div className="md:col-span-5"><Example ex={s.ex} /></div>}
    </section>
  </Reveal>
);

export default function Docs() {
  const { lang } = useLang();
  const d = pagesCopy[lang].docs;
  return (
    <PageShell label={d.label} title={d.title} sub={d.sub} testid="docs-page">
      <nav className="mb-10 flex flex-wrap gap-2" aria-label={d.toc} data-testid="docs-toc">
        {d.sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} data-testid={`docs-toc-${s.id}`} className="rounded-full border border-[#1F2126] px-3 py-1 text-[13px] text-[#A9AEB7] hover:border-[#E8B33A] hover:text-[#E8B33A] transition-colors duration-150">{s.t}</a>
        ))}
      </nav>
      {d.sections.map((s, i) => <Section key={s.id} s={s} i={i} />)}
    </PageShell>
  );
}
