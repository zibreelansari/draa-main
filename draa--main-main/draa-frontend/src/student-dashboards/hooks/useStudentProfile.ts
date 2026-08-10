import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import url from '../../url';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phn: string;
  deliveryAddress?: {
    fullName?: string;
    phone?: string;
    house?: string;
    area?: string;
    landmark?: string;
    pincode?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  };
  id: string;
  token?: string;
  Status: string;
  createdAt: string;
  updatedAt: string;
  authProvider: string;
  coins: number;
  isEmailVerified: boolean;
  avatar?: string;
  googleId?: string;
  verifiedAt?: string;
  role?: string;
  settings?: {
    darkMode: boolean;
    language: string;
    privacy: {
      showProfile: boolean;
      showRanking: boolean;
    };
  };
}

/**
 * STRATEGY: Read profile from localStorage only.
 * Do NOT auto-fetch on mount — that was causing 401s which triggered
 * the axios interceptor and logged the user out immediately.
 *
 * Profile is refreshed explicitly (e.g. on profile settings page)
 * or after a successful login.
 */
export const useStudentProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem("edudocs");
      if (!raw) return null;
      const user = JSON.parse(raw);
      // Normalize _id → id
      if (user && !user.id && user._id) user.id = user._id;
      return user;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  /**
   * Explicitly refresh profile from server.
   * Only call this when the user is on their profile page or after an update.
   * Never call this automatically on mount.
   */
  const fetchProfile = useCallback(async (token: string, showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await axios.get(`${url}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const existing = (() => {
          try { return JSON.parse(localStorage.getItem("edudocs") || "{}"); } catch { return {}; }
        })();
        const fullProfile = { ...existing, ...res.data.user, token };
        if (fullProfile._id && !fullProfile.id) fullProfile.id = fullProfile._id;
        setProfile(fullProfile);
        localStorage.setItem("edudocs", JSON.stringify(fullProfile));
      }
    } catch (err: any) {
      // Silently fail — don't log out on profile fetch errors
      console.error("Profile refresh failed:", err?.response?.status);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Auto-sync profile if critical fields (like createdAt) are missing from localStorage
  useEffect(() => {
    if (profile?.token && !profile?.createdAt) {
      fetchProfile(profile.token, false);
    }
  }, [profile?.token, profile?.createdAt, fetchProfile]);

  const updateProfile = async (data: any, isFormData: boolean = false) => {
    if (!profile?.token) return { success: false, message: "No authentication token found" };
    setLoading(true);
    try {
      const res = await axios.put(`${url}/student/profile`, data, {
        headers: {
          Authorization: `Bearer ${profile.token}`,
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
        }
      });
      if (res.data.success) {
        const updated = { ...profile, ...res.data.user };
        localStorage.setItem("edudocs", JSON.stringify(updated));
        setProfile(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message || "Update failed" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    if (!profile?.id) return { success: false, message: "You are not logged in. Please log in again." };
    if (!profile?.token) return { success: false, message: "Your session has expired. Please log in again." };
    setLoading(true);
    try {
      const res = await axios.put(`${url}/users/profile/${profile.id}`, data, {
        headers: { Authorization: `Bearer ${profile.token}` }
      });
      if (res.data.success) {
        if (res.data.logoutAllDevices) return { success: true, logout: true };
        return { success: true };
      }
      return { success: false, message: res.data.message || "Failed to change password" };
    } catch (err: any) {
      const status = err.response?.status;
      // Server explicitly said this is a Google-SSO account — surface the friendly message
      if (status === 403) {
        return {
          success: false,
          message: err.response?.data?.message || "You are signed in with Google, so your password cannot be changed here.",
        };
      }
      return { success: false, message: err.response?.data?.message || err.message || "Failed to change password" };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    changePassword,
    refreshProfile: (showLoader = false) => profile?.token && fetchProfile(profile.token, showLoader),
  };
};
