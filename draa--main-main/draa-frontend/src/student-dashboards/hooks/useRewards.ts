import { useState, useEffect, useCallback } from'react';
import url from'../../url';

export interface Transaction {
  _id: string;
  amount: number;
  type: string;
  source: string;
  description: string;
  createdAt: string;
}

export interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export const useRewards = () => {
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      const token = (() => {
        try {
          const edudocsData = localStorage.getItem("edudocs");
          return edudocsData ? JSON.parse(edudocsData)?.token : null;
        } catch { return null; }
      })();

      if (!token) return;

      setLoading(true);
      const res = await fetch(`${url}/student/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWallet({ 
          balance: data.wallet.balance, 
          transactions: data.wallet.transactions || [] 
        });
      } else {
        setError(data.message ||"Failed to load wallet");
      }
    } catch (err: any) {
      setError(err.message ||"Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return { wallet, loading, error, refresh: fetchWallet };
};
