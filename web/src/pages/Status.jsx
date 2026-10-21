import { PageShell } from "../components/landing/PageShell";
import { Reveal } from "../components/landing/Reveal";
import { ContractId } from "../components/landing/ContractId";
import { useLang } from "../lib/i18n";
import { pagesCopy, STATUS_UPDATED } from "../lib/pages-copy";

const TONE = { ok: "#4ADE80", warn: "#E8B33A", info: "#7DB7F5", idle: "#8A9099" };

export default function Status() {
  const { lang } = useLang();
  const s = pagesCopy[lang].status;
  return (
    <PageShell label={s.label} title={s.title} sub={s.sub} testid="status-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <ContractId testid="status-contract-id" />
        <span className="font-mono text-[12px] text-[#8A9099]" data-testid="status-updated">{s.updated}: {STATUS_UPDATED}</span>
      </div>
      <Reveal>
        <ul className="rounded-[10px] border border-[#1F2126] bg-[#121317]" data-testid="status-list">
          {s.items.map((it, i) => (
            <li key={it.k} className="grid md:grid-cols-12 gap-2 md:gap-6 px-5 py-5 border-b border-[#1F2126] last:border-0" data-testid={`status-item-${i}`}>
              <span className="md:col-span-4 text-[15px] font-medium">{it.k}</span>
              <span className="md:col-span-3 inline-flex items-center gap-2 font-mono text-[13px]" style={{ color: TONE[it.tone] }}>
                <span className="h-2 w-2 rounded-full" style={{ background: TONE[it.tone] }} />{it.v}
              </span>
              <span className="md:col-span-5 text-[13px] text-[#8A9099]">{it.d}</span>
            </li>
          ))}
        </ul>
      </Reveal>
      <h2 className="mt-14 text-[20px] font-semibold">{s.incidents}</h2>
      <p className="mt-3 text-[14px] text-[#8A9099]" data-testid="status-incidents">{s.none}</p>
    </PageShell>
  );
}
