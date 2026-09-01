import {
  AlertCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Send,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { apiRequest } from "../lib/api";
import { formatDate } from "../dashboard/DashboardBits";
import type { ApplicationMessageItem } from "../dashboard/types";

type Props = {
  applicationId: string | number;
  programmeTitle: string;
  recipientName: string;
  userRole: "STUDENT" | "INSTITUTE" | "ADMIN";
  onClose: () => void;
};

export default function ApplicationChatDrawer({ applicationId, programmeTitle, recipientName, userRole, onClose }: Props) {
  const [messages, setMessages] = useState<ApplicationMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const endpoint = userRole === "STUDENT"
    ? `/api/student/applications/${applicationId}/messages`
    : `/api/institute/applications/${applicationId}/messages`;

  async function loadMessages() {
    try {
      setError("");
      const res = await apiRequest<{ messages: ApplicationMessageItem[] }>(endpoint);
      setMessages(res.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [applicationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText("");
    setSending(true);
    setError("");

    try {
      const res = await apiRequest<{ message: ApplicationMessageItem }>(endpoint, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="workspace-modal-backdrop"
      style={{ justifyContent: "flex-end", padding: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(460px, 100vw)",
          height: "100dvh",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 40px rgba(10,34,37,0.2)",
          animation: "workspaceModal .22s ease both",
        }}
        role="dialog"
        aria-modal="true"
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--ws-border)",
            background: "#f8faf9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#e8f4f2", color: "#0b655d" }}>
              <MessageSquare size={19} />
            </span>
            <div>
              <strong style={{ fontSize: "14px", color: "#163438", display: "block" }}>{recipientName}</strong>
              <small style={{ color: "#74888b", fontSize: "11px" }}>{programmeTitle}</small>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="workspace-icon-button" type="button" onClick={loadMessages} title="Refresh chat">
              <RefreshCw size={14} />
            </button>
            <button className="workspace-icon-button" type="button" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </header>

        {error && (
          <div style={{ margin: "10px 16px 0", padding: "8px 12px", borderRadius: "7px", background: "#fde8e8", color: "#9c1c1c", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px", background: "#fafcfb" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#768c90", padding: "30px 0", fontSize: "13px" }}>
              Loading messages…
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#768c90", padding: "40px 20px", fontSize: "13px" }}>
              <MessageSquare size={32} color="#94acad" style={{ margin: "0 auto 10px" }} />
              <p style={{ margin: 0, fontWeight: "700" }}>No messages yet</p>
              <small style={{ color: "#93a5a8" }}>Ask a question regarding documents, visa processing, or admission terms.</small>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = (userRole === "STUDENT" && msg.senderRole === "STUDENT") || (userRole !== "STUDENT" && msg.senderRole !== "STUDENT");
              return (
                <div
                  key={msg._id}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    maxWidth: "82%",
                    display: "grid",
                    gap: "3px",
                  }}
                >
                  <span style={{ fontSize: "10.5px", color: "#798f93", alignSelf: isMine ? "flex-end" : "flex-start" }}>
                    {msg.senderName} · {formatDate(msg.createdAt)}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: isMine ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: isMine ? "linear-gradient(135deg, #0b655d 0%, #154c47 100%)" : "#fff",
                      color: isMine ? "#fff" : "#1f3a3e",
                      border: isMine ? "0" : "1px solid var(--ws-border)",
                      boxShadow: "0 2px 8px rgba(22,48,51,0.04)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            display: "flex",
            gap: "8px",
            padding: "14px 18px",
            borderTop: "1px solid var(--ws-border)",
            background: "#fff",
          }}
        >
          <input
            placeholder={`Message ${recipientName}…`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            style={{
              flex: 1,
              minHeight: "42px",
              padding: "0 14px",
              border: "1px solid var(--ws-border)",
              borderRadius: "8px",
              outline: 0,
              fontSize: "13px",
            }}
          />
          <button
            className="workspace-button primary"
            type="submit"
            disabled={sending || !inputText.trim()}
            style={{ minHeight: "42px", padding: "0 16px" }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
