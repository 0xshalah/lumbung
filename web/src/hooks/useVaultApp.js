import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectWallet,
  currentWallet,
  detectWallet,
  readVault,
  VaultError,
} from "../lib/stellar";

const WALLET_KEY = "lumbung-wallet";

export const useVaultApp = () => {
  const [wallet, setWallet] = useState({
    status: "idle",
    address: null,
    network: null,
    installed: false,
  });
  const [vault, setVault] = useState(null);
  const [error, setError] = useState(null);
  const addressRef = useRef(null);

  useEffect(() => {
    addressRef.current = wallet.address;
  }, [wallet.address]);

  const refresh = useCallback(async () => {
    try {
      const state = await readVault(addressRef.current);
      setVault(state);
      setError((e) => (e === "RPC_TIMEOUT" || e === "SIMULATION_FAILED" ? null : e));
    } catch (e) {
      setVault(null);
      setError(e instanceof VaultError ? e.code : "RPC_TIMEOUT");
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    const installed = await detectWallet();
    setWallet((w) => ({ ...w, status: "connecting", installed }));
    try {
      const r = await connectWallet();
      localStorage.setItem(WALLET_KEY, "1");
      setWallet({ status: "connected", installed: true, address: r.address, network: r.network });
    } catch (e) {
      setWallet({ status: "idle", address: null, network: null, installed });
      setError(e instanceof VaultError ? e.code : "NO_WALLET");
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(WALLET_KEY);
    setWallet((w) => ({ status: "idle", address: null, network: null, installed: w.installed }));
  }, []);

  // Detect Freighter and silently restore a previously approved session.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const installed = await detectWallet();
      if (cancelled) return;
      setWallet((w) => ({ ...w, installed }));
      if (!localStorage.getItem(WALLET_KEY)) return;
      const r = await currentWallet().catch(() => null);
      if (cancelled || !r) return;
      setWallet({ status: "connected", installed: true, address: r.address, network: r.network });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, wallet.address]);

  const blocked = wallet.status !== "connected" || wallet.network !== "TESTNET";
  return { wallet, vault, error, setError, connect, disconnect, refresh, blocked };
};
