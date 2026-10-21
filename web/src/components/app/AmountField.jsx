import { formatUnits } from "../../lib/format";
import { toInput } from "../../lib/parse";

export const AmountField = ({ c, id, value, onChange, unit, decimals = 7, available, invalid }) => (
  <div>
    <div className="flex justify-between text-[12px] text-[#8A9099] mb-2">
      <label htmlFor={id}>{c.amount}</label>
      {available !== undefined && (
        <span className="font-mono tabular-nums">
          {c.available}: <span data-testid={`${id}-available`}>{formatUnits(available, decimals)}</span> {unit}
        </span>
      )}
    </div>
    <div className={`flex items-center rounded-[8px] border bg-[#0A0B0D] focus-within:border-[#E8B33A] transition-colors duration-150 ${invalid ? "border-[#F87171]" : "border-[#1F2126]"}`}>
      <input
        id={id}
        data-testid={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.0"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        className="flex-1 min-w-0 bg-transparent px-4 py-3 font-mono text-[20px] tabular-nums outline-none placeholder:text-[#3A3D44]"
      />
      <span className="font-mono text-[13px] text-[#8A9099] px-2">{unit}</span>
      {available !== undefined && (
        <button type="button" onClick={() => onChange(toInput(available, decimals))} data-testid={`${id}-max-btn`} className="mr-2 rounded-[6px] border border-[#1F2126] px-2 py-1 font-mono text-[11px] uppercase text-[#E8B33A] hover:border-[#E8B33A] transition-colors duration-150">
          {c.max}
        </button>
      )}
    </div>
  </div>
);

export const PreviewRow = ({ label, value, unit, testid }) => (
  <div className="flex items-center justify-between rounded-[8px] border border-dashed border-[#1F2126] px-4 py-3">
    <span className="text-[13px] text-[#8A9099]">{label}</span>
    <span className="font-mono tabular-nums text-[15px] text-[#E7E9EE]" data-testid={testid}>{value} <span className="text-[#8A9099] text-[12px]">{unit}</span></span>
  </div>
);
