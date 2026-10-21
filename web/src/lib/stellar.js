import {
  Address,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import {
  getAddress,
  getNetwork,
  isAllowed,
  isConnected,
  requestAccess,
  signTransaction as freighterSign,
} from "@stellar/freighter-api";
import {
  ASSET_DECIMALS,
  CONTRACT_ID,
  HORIZON_URL,
  NETWORK_PASSPHRASE,
  READ_SOURCE,
  RPC_URL,
} from "./config";
import { parseUnits } from "./parse";

export class VaultError extends Error {
  constructor(code, detail) {
    super(code);
    this.name = "VaultError";
    this.code = code;
    this.detail = detail;
  }
}

const server = new rpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const i128 = (v) => nativeToScVal(BigInt(v), { type: "i128" });
const addr = (a) => new Address(a).toScVal();

const isTestnet = (network) => network === "TESTNET";

const mapFreighterError = (error) => {
  const msg = error?.message || String(error);
  if (/declin|denied|reject|cancel/i.test(msg)) return new VaultError("USER_REJECTED", msg);
  if (/not.*(install|connected|allowed)|no.*wallet/i.test(msg)) return new VaultError("NO_WALLET", msg);
  if (/network/i.test(msg)) return new VaultError("WRONG_NETWORK", msg);
  return new VaultError("UNKNOWN", msg);
};

const mapRpcError = (error) => {
  if (error instanceof VaultError) return error;
  const msg = error?.message || String(error);
  if (/insufficient|balance|underfunded|trustline/i.test(msg))
    return new VaultError("INSUFFICIENT_BALANCE", msg);
  if (/timeout|timed out|fetch|network|50[234]|429/i.test(msg))
    return new VaultError("RPC_TIMEOUT", msg);
  return new VaultError("SIMULATION_FAILED", msg);
};

// A single funded account is enough for read-only simulations; cache it briefly
// so a dashboard refresh does not hit the RPC three times for the same sequence.
let readAccount = { at: 0, key: "", value: null };
const getReadAccount = async () => {
  const key = READ_SOURCE;
  if (!key) throw new VaultError("SIMULATION_FAILED", "REACT_APP_READ_SOURCE is not set");
  if (readAccount.key === key && Date.now() - readAccount.at < 10_000) return readAccount.value;
  const account = await server.getAccount(key);
  readAccount = { at: Date.now(), key, value: account };
  return account;
};

const readContract = async (fn, args = []) => {
  const account = await getReadAccount();
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(fn, ...args))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new VaultError("SIMULATION_FAILED", sim.error);
  }
  return sim.result?.retval ? scValToNative(sim.result.retval) : null;
};

export const readVault = async (address) => {
  try {
    const [totalAssets, totalSupply, shares] = await Promise.all([
      readContract("total_assets"),
      readContract("total_supply"),
      address ? readContract("balance", [addr(address)]) : Promise.resolve(0n),
    ]);
    const xlm = address ? await nativeBalance(address).catch(() => 0n) : 0n;
    return {
      totalAssets: BigInt(totalAssets ?? 0),
      totalSupply: BigInt(totalSupply ?? 0),
      shares: BigInt(shares ?? 0),
      xlm: BigInt(xlm),
    };
  } catch (error) {
    throw mapRpcError(error);
  }
};

export const nativeBalance = async (address) => {
  const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
  if (!res.ok) return 0n;
  const data = await res.json();
  const native = (data.balances || []).find((b) => b.asset_type === "native");
  return parseUnits(native?.balance || "0", ASSET_DECIMALS);
};

export const detectWallet = async () => {
  try {
    const res = await isConnected();
    return Boolean(res?.isConnected) && !res.error;
  } catch {
    return false;
  }
};

export const connectWallet = async () => {
  const conn = await isConnected();
  if (conn.error) throw mapFreighterError(conn.error);
  if (!conn.isConnected) throw new VaultError("NO_WALLET");

  const allowed = await isAllowed();
  const access = allowed.isAllowed ? await getAddress() : await requestAccess();
  if (access.error) throw mapFreighterError(access.error);
  if (!access.address) throw new VaultError("NO_WALLET");

  const net = await getNetwork();
  if (net.error) throw mapFreighterError(net.error);
  return {
    address: access.address,
    network: net.network,
    passphrase: net.networkPassphrase,
  };
};

export const currentWallet = async () => {
  const conn = await isConnected();
  if (!conn.isConnected || conn.error) return null;
  const allowed = await isAllowed();
  if (!allowed.isAllowed) return null;
  const access = await getAddress();
  if (access.error || !access.address) return null;
  const net = await getNetwork();
  return {
    address: access.address,
    network: net.network,
    passphrase: net.networkPassphrase,
  };
};

const buildOperation = (kind, amount, address) => {
  if (kind === "deposit") {
    return contract.call("deposit", i128(amount), addr(address), addr(address), addr(address));
  }
  if (kind === "withdraw") {
    return contract.call("withdraw", i128(amount), addr(address), addr(address), addr(address));
  }
  if (kind === "redeem") {
    return contract.call("redeem", i128(amount), addr(address), addr(address), addr(address));
  }
  throw new VaultError("SIMULATION_FAILED", `unknown action: ${kind}`);
};

export const execute = async ({ kind, amount, address, onStep }) => {
  if (!address) throw new VaultError("NO_WALLET");

  const net = await getNetwork();
  if (net.error) throw mapFreighterError(net.error);
  if (!isTestnet(net.network) || net.networkPassphrase !== NETWORK_PASSPHRASE) {
    throw new VaultError("WRONG_NETWORK");
  }

  onStep?.("simulating");
  let prepared;
  try {
    const account = await server.getAccount(address);
    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(buildOperation(kind, amount, address))
      .setTimeout(60)
      .build();
    prepared = await server.prepareTransaction(tx);
  } catch (error) {
    throw mapRpcError(error);
  }

  onStep?.("signing");
  const signed = await freighterSign(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  if (signed.error) throw mapFreighterError(signed.error);
  if (!signed.signedTxXdr) throw new VaultError("UNKNOWN", "Freighter returned no signed XDR");

  onStep?.("pending");
  let sent;
  try {
    const tx = TransactionBuilder.fromXDR(signed.signedTxXdr, NETWORK_PASSPHRASE);
    sent = await server.sendTransaction(tx);
  } catch (error) {
    throw mapRpcError(error);
  }
  if (sent.status === "ERROR") {
    throw new VaultError("SIMULATION_FAILED", sent.errorResult?.toXDR?.("base64") || "send failed");
  }

  const started = Date.now();
  while (Date.now() - started < 60_000) {
    let res;
    try {
      res = await server.getTransaction(sent.hash);
    } catch {
      await sleep(1500);
      continue;
    }
    if (res.status === "SUCCESS") return { hash: sent.hash };
    if (res.status === "FAILED") throw new VaultError("SIMULATION_FAILED", "transaction failed on ledger");
    await sleep(1200);
  }
  throw new VaultError("RPC_TIMEOUT");
};
