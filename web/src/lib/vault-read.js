import { readVault as readOnChain } from "./stellar";

/** Read the public vault totals straight from Soroban RPC. */
export const readVault = async () => {
  const { totalAssets, totalSupply } = await readOnChain();
  return { totalAssets, totalSupply };
};
