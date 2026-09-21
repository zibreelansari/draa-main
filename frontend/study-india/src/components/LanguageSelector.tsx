import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { LANGUAGES, useLanguage } from "../context/LanguageContext";

interface LanguageSelectorProps {
  compact?: boolean;
}

export default function LanguageSelector({ compact }: LanguageSelectorProps) {
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
    <div ref={dropdownRef} className={`language-selector-wrapper ${compact ? "compact" : ""}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="language-selector-trigger"
        aria-label={`Select language. Current: ${currentOption.name}`}
        aria-expanded={open}
      >
        <img
          src={`https://flagcdn.com/w40/${currentOption.flagIso}.png`}
          alt={currentOption.name}
          className="lang-flag-img"
        />
        <span className="lang-label-text">{currentOption.nativeName}</span>
        <ChevronDown
          size={13}
          className={`lang-chevron ${open ? "open" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="language-dropdown-menu animate-dropdown">
          <div className="language-dropdown-header">
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
                className={`language-option-btn ${isSelected ? "selected" : ""}`}
              >
                <div className="language-option-inner">
                  <img
                    src={`https://flagcdn.com/w40/${lang.flagIso}.png`}
                    alt={lang.name}
                    className="lang-flag-img"
                  />
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && <Check size={14} className="lang-check-icon" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
