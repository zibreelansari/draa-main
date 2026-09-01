import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Search } from "lucide-react";

export interface CountryItem {
  name: string;
  code: string;
  iso: string;
}

export const COUNTRIES_DATA: CountryItem[] = [
  { name: "Nepal", code: "+977", iso: "np" },
  { name: "Bangladesh", code: "+880", iso: "bd" },
  { name: "Nigeria", code: "+234", iso: "ng" },
  { name: "United States", code: "+1", iso: "us" },
  { name: "United Arab Emirates", code: "+971", iso: "ae" },
  { name: "Kenya", code: "+254", iso: "ke" },
  { name: "Sri Lanka", code: "+94", iso: "lk" },
  { name: "Bhutan", code: "+975", iso: "bt" },
  { name: "Tanzania", code: "+255", iso: "tz" },
  { name: "Indonesia", code: "+62", iso: "id" },
  { name: "United Kingdom", code: "+44", iso: "gb" },
  { name: "Canada", code: "+1", iso: "ca" },
  { name: "Australia", code: "+61", iso: "au" },
  { name: "Ghana", code: "+233", iso: "gh" },
  { name: "Malaysia", code: "+60", iso: "my" },
  { name: "Zimbabwe", code: "+263", iso: "zw" },
  { name: "India", code: "+91", iso: "in" },
  { name: "Afghanistan", code: "+93", iso: "af" },
  { name: "Germany", code: "+49", iso: "de" },
  { name: "France", code: "+33", iso: "fr" },
  { name: "South Africa", code: "+27", iso: "za" },
  { name: "Uganda", code: "+256", iso: "ug" },
  { name: "Rwanda", code: "+250", iso: "rw" },
  { name: "Myanmar", code: "+95", iso: "mm" },
  { name: "Vietnam", code: "+84", iso: "vn" },
  { name: "Other / International", code: "+1", iso: "un" },
];

interface CountrySelectorProps {
  value: string;
  onChange: (countryName: string, phoneCode: string) => void;
}

export default function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES_DATA.find((c) => c.name === value) || COUNTRIES_DATA[0];

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

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const filtered = COUNTRIES_DATA.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search) ||
    c.iso.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="premium-input"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          cursor: "pointer",
          textAlign: "left",
          background: "#ffffff",
          borderColor: open ? "var(--teal-700)" : undefined,
          boxShadow: open ? "0 0 0 3px rgba(11, 101, 93, 0.14)" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
          {selected.iso === "un" ? (
            <Globe2 size={18} color="#0b655d" style={{ flexShrink: 0 }} />
          ) : (
            <img
              src={`https://flagcdn.com/w40/${selected.iso}.png`}
              alt={selected.name}
              style={{
                width: "20px",
                height: "14px",
                objectFit: "cover",
                borderRadius: "2px",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selected.name} <span style={{ color: "#64748b", fontWeight: "500" }}>({selected.code})</span>
          </span>
        </div>
        <ChevronDown
          size={16}
          color="#64748b"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        />
      </button>

      {/* Floating Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 1200,
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.15), 0 4px 6px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
            animation: "draaDropdownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {/* Search Box */}
          <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} color="#94a3b8" style={{ position: "absolute", left: "10px" }} />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or dial code..."
                style={{
                  width: "100%",
                  minHeight: "34px",
                  padding: "0 10px 0 32px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  outline: 0,
                  background: "#ffffff",
                }}
              />
            </div>
          </div>

          {/* List of Countries */}
          <div style={{ maxHeight: "230px", overflowY: "auto", padding: "4px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: "12.5px" }}>
                No country found
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = item.name === value;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      onChange(item.name, item.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      border: 0,
                      borderRadius: "6px",
                      background: isSelected ? "#f0fdfa" : "transparent",
                      color: isSelected ? "#0b655d" : "#1e293b",
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget.style.background = "#f8fafc");
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget.style.background = "transparent");
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {item.iso === "un" ? (
                        <Globe2 size={16} color="#0b655d" style={{ flexShrink: 0 }} />
                      ) : (
                        <img
                          src={`https://flagcdn.com/w40/${item.iso}.png`}
                          alt={item.name}
                          style={{
                            width: "20px",
                            height: "14px",
                            objectFit: "cover",
                            borderRadius: "2px",
                            border: "1px solid rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span style={{ fontWeight: isSelected ? "700" : "500" }}>{item.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{item.code}</span>
                      {isSelected && <Check size={14} color="#0b655d" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
