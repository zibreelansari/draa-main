import { useEffect, useRef } from "react";
import socket from "./socket";
import { getStoredUser } from "./global_auth";
import toast from "./toast";

/**
 * Connects the socket and registers the user's presence.
 * Call this once at the app level (e.g. in DashboardLayout or App).
 * Safe to call multiple times — idempotent.
 */
export const useSocketConnection = () => {
  const connected = useRef(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.token || connected.current) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      connected.current = true;
      // Register presence
      socket.emit("user_online", {
        userId: user.id || user._id,
        role: user.role || "student",
      });
    };

    const handleDisconnect = () => {
      connected.current = false;
    };

    const handleForceLogout = (data: { reason: string; message: string }) => {
      localStorage.removeItem("edudocs");
      toast.error(data.message || "Your session has expired. Please log in again.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("force_logout", handleForceLogout);

    // If already connected, fire immediately
    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("force_logout", handleForceLogout);
    };
  }, []);
};
