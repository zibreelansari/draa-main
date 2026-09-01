import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { LANGUAGES, LanguageCode, useLanguage } from "../context/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage, currentOption } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="language-selector-wrapper" style={{ position: "relative" }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="language-selector-trigger"
        aria-label="Select language"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          minHeight: "38px",
          padding: "0 10px",
          borderRadius: "8px",
          border: "1px solid var(--border-subtle, #e2e8f0)",
          background: "#ffffff",
          color: "#1e293b",
          fontSize: "13px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          transition: "all 0.18s ease",
        }}
      >
        <img
          src={`https://flagcdn.com/w40/${currentOption.flagIso}.png`}
          alt={currentOption.name}
          style={{
            width: "18px",
            height: "13px",
            objectFit: "cover",
            borderRadius: "2px",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
        />
        <span>{currentOption.nativeName}</span>
        <ChevronDown
          size={14}
          color="#64748b"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="language-dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: "210px",
            zIndex: 1100,
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12), 0 4px 6px rgba(15, 23, 42, 0.04)",
            padding: "5px",
            display: "grid",
            gap: "2px",
            animation: "draaDropdownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <div style={{ padding: "6px 8px 4px", fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Select Language
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 10px",
                  border: 0,
                  borderRadius: "6px",
                  background: isSelected ? "#f0fdfa" : "transparent",
                  color: isSelected ? "#0b655d" : "#1e293b",
                  fontSize: "13px",
                  fontWeight: isSelected ? "750" : "550",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <img
                    src={`https://flagcdn.com/w40/${lang.flagIso}.png`}
                    alt={lang.name}
                    style={{
                      width: "18px",
                      height: "13px",
                      objectFit: "cover",
                      borderRadius: "2px",
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  />
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && <Check size={14} color="#0b655d" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
