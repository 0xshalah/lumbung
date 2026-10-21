import { ASSET_DECIMALS } from "./config";

const pow10 = (n) => 10n ** BigInt(n);

/** Parse a human decimal string into integer units, or null when invalid. */
export const parseUnits = (str, decimals = ASSET_DECIMALS) => {
  const v = (str || "").trim().replace(/,/g, "");
  const re = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`);
  if (!re.test(v) || v === "" || v === ".") return null;
  const [w, f = ""] = v.split(".");
  return BigInt(w || "0") * pow10(decimals) + BigInt(f.padEnd(decimals, "0") || "0");
};

/** Render integer units as an input-friendly decimal string. */
export const toInput = (raw, decimals = ASSET_DECIMALS) => {
  const v = BigInt(raw ?? 0);
  const base = pow10(decimals);
  const whole = v / base;
  const frac = (v % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : `${whole}`;
};

export const shortAddr = (a) => (a ? `${a.slice(0, 4)}…${a.slice(-3)}` : "");

export const ownershipPct = (shares, supply) => {
  const s = BigInt(supply ?? 0);
  if (s === 0n) return 0;
  return Number((BigInt(shares ?? 0) * 1_000_000n) / s) / 10_000;
};
