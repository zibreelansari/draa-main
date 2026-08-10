import { useState, useEffect, useCallback } from'react';
import toast from '../../utils/toast';
import { fetchWishlist, removeFromWishlist, clearWishlist } from'../../utils/wishlistApi';

export interface WishlistItem {
  _id: string;
  item_type:"course" |"book" |"test_series";
  item_id: string;
  snapshot: any;
  createdAt: string;
}

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const items = await fetchWishlist();
      setWishlist(items || []);
    } catch (err: any) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = async (item: WishlistItem) => {
    setRemoving(item._id);
    try {
      await removeFromWishlist({ item_type: item.item_type, item_id: item.item_id });
      setWishlist(prev => prev.filter(i => i._id !== item._id));
      toast.success("Removed from wishlist");
      return { success: true };
    } catch (err: any) {
      toast.error("Failed to remove item");
      return { success: false };
    } finally {
      setRemoving(null);
    }
  };

  const clearAll = async () => {
    try {
      setLoading(true);
      await clearWishlist();
      setWishlist([]);
      toast.success("Wishlist cleared successfully");
      return { success: true };
    } catch (err: any) {
      toast.error("Failed to clear wishlist");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  return { wishlist, loading, removing, removeItem, clearAll, refresh: loadWishlist };
};
