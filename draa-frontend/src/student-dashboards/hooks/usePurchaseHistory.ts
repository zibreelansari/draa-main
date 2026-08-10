import { useState, useEffect, useCallback } from'react';
import toast from '../../utils/toast';
import uri from'../../url';

export interface Purchase {
  _id: string;
  purchase_type: string;
  item_details: { 
    name: string; 
    category?: string; 
    image?: string 
  };
  pricing: { 
    final_amount: number; 
    currency: string 
  };
  payment_status: string;
  status: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const usePurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchPurchases = useCallback(async (pageNo: number, currentFilter: string) => {
    try {
      const token = (() => {
        try {
          const edudocsData = localStorage.getItem("edudocs");
          return edudocsData ? JSON.parse(edudocsData)?.token : null;
        } catch { return null; }
      })();

      if (!token) return;

      setLoading(true);
      const query = currentFilter ==="all" ? `?page=${pageNo}` : `?page=${pageNo}&purchase_type=${currentFilter}`;
      const res = await fetch(`${uri}/student/purchases${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setPurchases(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.message ||"Failed to load purchases");
      }
    } catch (err: any) {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = () => fetchPurchases(page, filter);

  useEffect(() => {
    fetchPurchases(page, filter);
  }, [page, filter, fetchPurchases]);

  return { 
    purchases, 
    pagination, 
    loading, 
    filter, 
    setFilter: (f: string) => { setFilter(f); setPage(1); }, 
    page, 
    setPage, 
    refresh 
  };
};
