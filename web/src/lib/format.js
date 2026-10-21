import { ASSET_DECIMALS, SHARE_DECIMALS } from "./config";

const pow10 = (n) => 10n ** BigInt(n);

/**
 * Format an integer with `decimals` implied decimals.
 * `places` caps how many fractional digits are shown (trailing zeros trimmed).
 */
export const formatUnits = (raw, decimals = ASSET_DECIMALS, places = decimals) => {
  const v = BigInt(raw ?? 0);
  const neg = v < 0n;
  const abs = neg ? -v : v;
  const base = pow10(decimals);
  const whole = (abs / base).toLocaleString("en-US");
  const cut = Math.min(places, decimals);
  const frac =
    cut > 0
      ? (abs % base)
          .toString()
          .padStart(decimals, "0")
          .slice(0, cut)
          .replace(/0+$/, "")
      : "";
  return `${neg ? "-" : ""}${whole}${frac ? "." + frac : ""}`;
};

export const formatXlm = (raw, places = 2) => formatUnits(raw, ASSET_DECIMALS, places);
export const formatShares = (raw, places = 2) => formatUnits(raw, SHARE_DECIMALS, places);

/** Assets (in XLM units) per one whole share. */
export const sharePrice = (totalAssets, totalSupply) => {
  const a = BigInt(totalAssets ?? 0);
  const s = BigInt(totalSupply ?? 0);
  if (s === 0n) return "1.0000";
  // (assets / 10^7) / (shares / 10^10) = assets * 10^3 / shares
  const scaled = (a * pow10(SHARE_DECIMALS)) / s;
  const [whole, frac = ""] = formatUnits(scaled, ASSET_DECIMALS, 4).split(".");
  return `${whole}.${(frac + "0000").slice(0, 4)}`;
};

export const shortId = (id) => (id ? `${id.slice(0, 6)}…${id.slice(-6)}` : "");
