import { DECIMALS_OFFSET } from "./config";

// Mirrors the OpenZeppelin vault math:
//   shares = assets * (totalSupply + 10^offset) / (totalAssets + 1)
//   assets = shares * (totalAssets + 1) / (totalSupply + 10^offset)
// Deposit and redeem round down; withdraw (assets in) rounds up.
const OFFSET = 10n ** BigInt(DECIMALS_OFFSET);

const ceilDiv = (a, b) => (a + b - 1n) / b;
const big = (v) => BigInt(v ?? 0);

export const previewDeposit = (assets, totalAssets, totalSupply) => {
  const x = big(assets);
  if (x <= 0n) return 0n;
  return (x * (big(totalSupply) + OFFSET)) / (big(totalAssets) + 1n);
};

/** Shares that must be burned to withdraw `assets` (rounds up). */
export const previewWithdraw = (assets, totalAssets, totalSupply) => {
  const x = big(assets);
  if (x <= 0n) return 0n;
  return ceilDiv(x * (big(totalSupply) + OFFSET), big(totalAssets) + 1n);
};

/** Assets returned for redeeming `shares` (rounds down). */
export const previewRedeem = (shares, totalAssets, totalSupply) => {
  const x = big(shares);
  if (x <= 0n) return 0n;
  return (x * (big(totalAssets) + 1n)) / (big(totalSupply) + OFFSET);
};
