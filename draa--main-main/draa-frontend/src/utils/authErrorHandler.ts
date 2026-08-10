import toast from "./toast";
import { getUserRole, getLoginPath } from "./global_auth";

/**
 * Call this ONLY for intentional session expiry (e.g. explicit logout,
 * or a critical auth failure on a protected action like payment).
 *
 * Do NOT call this from general API error handlers or interceptors —
 * that causes false logouts when unrelated endpoints return 401.
 */
export const handleUnauthorizedError = (errorMsg?: string) => {
  const raw = localStorage.getItem("edudocs");
  if (!raw) return; // Already logged out

  const role = getUserRole();
  const loginPath = getLoginPath(role);

  localStorage.removeItem("edudocs");

  const finalMsg = errorMsg || "Your session has expired. Please log in again.";
  toast.error(finalMsg);

  setTimeout(() => {
    window.location.href = loginPath;
  }, 1500);
};

export const resetUnauthorizedHandler = () => {
  // No-op — kept for compatibility with existing call sites
};
