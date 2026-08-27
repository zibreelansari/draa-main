import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ChatbotWidget({
  onOpenRegister,
}: {
  onOpenRegister: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: "bot" | "user"; text: string }[]>([
    {
      sender: "bot",
      text: "Namaste! Welcome to Study in India Helpdesk. How can I assist your educational journey today?",
    },
  ]);

  const handlePromptClick = (question: string, answer: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: question },
      { sender: "bot", text: answer },
    ]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "85px",
          right: "25px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          backgroundColor: "#023B45",
          color: "#ffffff",
          border: "2px solid #ff671f",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          zIndex: 998,
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        aria-label="Open Study in India Assistant"
      >
        <i className={`bi ${isOpen ? "bi-x-lg" : "bi-chat-dots-fill"}`}></i>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "145px",
            right: "25px",
            width: "350px",
            maxHeight: "480px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
            border: "1px solid #dee2e6",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#023B45",
              color: "#ffffff",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bi bi-robot fs-5 text-warning"></i>
              <div>
                <strong style={{ fontSize: "13px", display: "block" }}>Study in India Assistant</strong>
                <small style={{ fontSize: "10px", color: "#a5d6a7" }}>● Online Helpdesk</small>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}
            >
              <i className="bi bi-x fs-5"></i>
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              padding: "14px",
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "12px",
              maxHeight: "260px",
              backgroundColor: "#f8fafc",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor: m.sender === "user" ? "#ff671f" : "#ffffff",
                  color: m.sender === "user" ? "#ffffff" : "#212529",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  border: m.sender === "bot" ? "1px solid #e2e8f0" : "none",
                  maxWidth: "85%",
                  lineHeight: "1.4",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Quick FAQ Prompts */}
          <div style={{ padding: "10px", borderTop: "1px solid #e9ecef", backgroundColor: "#ffffff" }}>
            <span style={{ fontSize: "10.5px", fontWeight: "bold", color: "#6c757d", display: "block", marginBottom: "6px" }}>
              Frequently Asked Questions:
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <button
                onClick={() =>
                  handlePromptClick(
                    "How to get SII ID?",
                    "Click 'Student Registration' or 'Apply Now'. Fill out your passport & academic details to receive your unique SII ID immediately."
                  )
                }
                style={{
                  fontSize: "11px",
                  textAlign: "left",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  cursor: "pointer",
                  color: "#023B45",
                }}
              >
                ❓ How do I get my SII Student ID?
              </button>

              <button
                onClick={() =>
                  handlePromptClick(
                    "What scholarships are available?",
                    "Partner institutions offer merit fee waivers of 25%, 50%, and up to 100% based on your academic transcripts."
                  )
                }
                style={{
                  fontSize: "11px",
                  textAlign: "left",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  cursor: "pointer",
                  color: "#023B45",
                }}
              >
                🎓 Are there scholarship fee waivers?
              </button>

              <button
                onClick={() =>
                  handlePromptClick(
                    "How does the Student Visa work?",
                    "Once you accept your university offer letter, apply for the Student Visa (S-Visa) at the Indian Embassy in your home country."
                  )
                }
                style={{
                  fontSize: "11px",
                  textAlign: "left",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  cursor: "pointer",
                  color: "#023B45",
                }}
              >
                ✈️ Student Visa (S-Visa) guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
