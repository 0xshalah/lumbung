const env = process.env;

// Deployed on Stellar Testnet on 2026-10-21. See deployments/testnet.json in the repo root.
export const CONTRACT_ID =
  env.REACT_APP_VAULT_CONTRACT_ID || "CDHICU2WIUHKLYPQCXD7ZD2VABMEGBR2G3TYEVC4Q5PMTCR6JHST55GI";

export const RPC_URL = env.REACT_APP_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
export const HORIZON_URL = env.REACT_APP_HORIZON_URL || "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE =
  env.REACT_APP_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

// A funded public account used only as the simulation source for read-only calls.
// It never signs anything: simulations do not consume a sequence number or a fee.
export const READ_SOURCE =
  env.REACT_APP_READ_SOURCE || "GAJH4JIFD46BTDFIGLFS427YNDNCCRN3BYBMU6LMARYBR2GRJGB423BI";

export const ASSET_DECIMALS = 7; // XLM (SAC decimals)
export const SHARE_DECIMALS = 10; // vault decimals = asset decimals + offset
export const DECIMALS_OFFSET = 3;

export const isValidContractId = (id) => /^C[A-Z2-7]{55}$/.test(id || "");

export const LINKS = {
  github: env.REACT_APP_GITHUB_URL || "https://github.com/0xshalah",
  x: env.REACT_APP_X_URL || "https://x.com",
  issues: env.REACT_APP_ISSUES_URL || "https://github.com/0xshalah",
  contact: env.REACT_APP_CONTACT_EMAIL || "hello@lumbung.finance",
  sep56: "https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0056.md",
  oz: "https://github.com/OpenZeppelin/stellar-contracts",
  explorer: (id) => `https://stellar.expert/explorer/testnet/contract/${id}`,
  tx: (hash) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
};
