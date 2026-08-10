import axios from "axios";
import { handleUnauthorizedError } from "./authErrorHandler";

let isBrave = false;
if (typeof navigator !== 'undefined' && (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function') {
  (navigator as any).brave.isBrave().then((val: boolean) => {
    isBrave = val;
  }).catch(() => {});
}

// Global fetch patch to ensure all hooks using native fetch also send the custom header
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    if (isBrave) {
      init = init || {};
      let headers: HeadersInit = init.headers || {};
      if (headers instanceof Headers) {
        headers.set('x-device-browser', 'Brave');
      } else if (Array.isArray(headers)) {
        (headers as string[][]).push(['x-device-browser', 'Brave']);
      } else {
        (headers as Record<string, string>)['x-device-browser'] = 'Brave';
      }
      init.headers = headers;
    }
    return originalFetch.call(this, input, init);
  };
}

/**
 * STRATEGY: The interceptor ONLY injects the auth token into requests.
 * It also intercepts actual security-forced 401s (expired session / forced logout).
 */
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      if (isBrave) {
        config.headers["x-device-browser"] = "Brave";
      }
      const raw = localStorage.getItem("edudocs");
      if (raw) {
        try {
          const user = JSON.parse(raw);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (e) {
          // ignore malformed JSON
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: check for security-forced 401s
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const data = error.response.data;
        const message = data?.message || "";
        const isForceLogout = data?.forceLogout === true;
        const isTokenExpired = data?.code === "TOKEN_EXPIRED";
        const isExpiredMessage = 
          message.toLowerCase().includes("expired") || 
          message.toLowerCase().includes("session expired") ||
          message.toLowerCase().includes("token expired");

        if (isForceLogout || isTokenExpired || isExpiredMessage) {
          handleUnauthorizedError(message || "Your session has expired. Please log in again.");
        }
      }
      return Promise.reject(error);
    }
  );
};

