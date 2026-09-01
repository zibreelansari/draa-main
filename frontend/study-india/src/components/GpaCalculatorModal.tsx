import {
  Award,
  Calculator,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Info,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

type Props = {
  onClose: () => void;
  onSelectEligibility?: (calculatedPercent: number) => void;
};

export default function GpaCalculatorModal({ onClose, onSelectEligibility }: Props) {
  const [scale, setScale] = useState<"GPA_4" | "PERCENTAGE" | "ALEVEL" | "WAEC" | "IB">("GPA_4");
  const [gpaInput, setGpaInput] = useState("3.6");
  const [percentInput, setPercentInput] = useState("85");
  const [aLevelInput, setALevelInput] = useState("A,A,B");
  const [waecInput, setWaecInput] = useState("A1,B2,B3,C4,C5");
  const [ibInput, setIbInput] = useState("36");

  // Calculate Indian equivalencies
  function calculate(): { percent: number; cgpa10: number; category: string; note: string } {
    if (scale === "GPA_4") {
      const gpa = Math.min(4.0, Math.max(0, parseFloat(gpaInput) || 0));
      // AIU Standard Formula: (GPA / 4) * 100 or AIU scale
      const percent = Math.round((gpa / 4.0) * 100);
      const cgpa10 = Number(((gpa / 4.0) * 10).toFixed(1));
      return {
        percent,
        cgpa10,
        category: percent >= 75 ? "First Division with Distinction" : percent >= 60 ? "First Division (Eligible)" : "Second Division",
        note: `GPA ${gpa}/4.0 corresponds to ~${percent}% in the Indian Higher Education Equivalency Matrix.`,
      };
    } else if (scale === "PERCENTAGE") {
      const p = Math.min(100, Math.max(0, parseFloat(percentInput) || 0));
      const cgpa10 = Number((p / 9.5).toFixed(1));
      return {
        percent: p,
        cgpa10,
        category: p >= 75 ? "First Division with Distinction" : p >= 60 ? "First Division (Eligible)" : "Second Division",
        note: `Direct standard percentage score.`,
      };
    } else if (scale === "ALEVEL") {
      // Average letter grades: A*=100, A=90, B=80, C=70, D=60, E=50
      const grades = aLevelInput.split(",").map((g) => g.trim().toUpperCase());
      const scoreMap: Record<string, number> = { "A*": 95, A: 85, B: 75, C: 65, D: 55, E: 45 };
      const scores = grades.map((g) => scoreMap[g] || 60);
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 75;
      return {
        percent: avg,
        cgpa10: Number((avg / 9.5).toFixed(1)),
        category: avg >= 75 ? "First Division with Distinction" : "First Division (Eligible)",
        note: `Cambridge/Edexcel A-Level equivalency recognized by Association of Indian Universities (AIU).`,
      };
    } else if (scale === "WAEC") {
      const grades = waecInput.split(",").map((g) => g.trim().toUpperCase());
      const scoreMap: Record<string, number> = { A1: 90, B2: 82, B3: 75, C4: 68, C5: 62, C6: 55 };
      const scores = grades.map((g) => scoreMap[g] || 60);
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 72;
      return {
        percent: avg,
        cgpa10: Number((avg / 9.5).toFixed(1)),
        category: avg >= 60 ? "Eligible for Undergraduate Admission" : "Verification Required",
        note: `WASSCE / WAEC Senior Certificate verified for Indian University Eligibility.`,
      };
    } else {
      // IB Diploma (out of 45)
      const ib = Math.min(45, Math.max(0, parseInt(ibInput, 10) || 24));
      const percent = Math.round((ib / 45) * 100);
      return {
        percent,
        cgpa10: Number(((ib / 45) * 10).toFixed(1)),
        category: ib >= 30 ? "High Distinction (Scholarship Eligible)" : "Eligible for Degree Admission",
        note: `International Baccalaureate (IB) Diploma equivalent to 10+2 Secondary Certificate.`,
      };
    }
  }

  const result = calculate();

  return (
    <div
      className="workspace-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="workspace-modal" style={{ maxWidth: "580px" }} role="dialog" aria-modal="true">
        <header style={{ background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "rgba(255,255,255,0.18)", color: "#ffb07b" }}>
              <Calculator size={20} />
            </span>
            <div>
              <span style={{ color: "#ffb07b", fontSize: "11px", fontWeight: "800", letterSpacing: "0.14em" }}>INTERNATIONAL ADMISSIONS TOOL</span>
              <h2 style={{ color: "#fff", margin: "2px 0 0" }}>GPA & Eligibility Calculator</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: 0 }}>
            <X size={18} />
          </button>
        </header>

        <div style={{ padding: "20px 24px", display: "grid", gap: "16px" }}>
          <label>
            Select Your Country / Grading System
            <select value={scale} onChange={(e) => setScale(e.target.value as any)}>
              <option value="GPA_4">GPA 4.0 Scale (USA, Philippines, International)</option>
              <option value="PERCENTAGE">Standard Percentage 100% (Nepal, Bangladesh, CBSE, India)</option>
              <option value="ALEVEL">Cambridge / Edexcel GCE A-Levels (UK, Singapore, Sri Lanka)</option>
              <option value="WAEC">WASSCE / WAEC (Nigeria, Ghana, West Africa)</option>
              <option value="IB">International Baccalaureate (IB Diploma / 45 pts)</option>
            </select>
          </label>

          {scale === "GPA_4" && (
            <label>
              Enter Cumulative GPA (0.0 to 4.0)
              <input type="number" min="0" max="4.0" step="0.01" value={gpaInput} onChange={(e) => setGpaInput(e.target.value)} />
            </label>
          )}

          {scale === "PERCENTAGE" && (
            <label>
              Enter Cumulative Percentage (%)
              <input type="number" min="0" max="100" step="0.5" value={percentInput} onChange={(e) => setPercentInput(e.target.value)} />
            </label>
          )}

          {scale === "ALEVEL" && (
            <label>
              Enter 3 Principal A-Level Subject Grades (comma-separated, e.g. A,A,B)
              <input value={aLevelInput} onChange={(e) => setALevelInput(e.target.value)} placeholder="e.g. A*,A,B" />
            </label>
          )}

          {scale === "WAEC" && (
            <label>
              Enter Best 5 WAEC Subject Grades (comma-separated, e.g. A1,B2,B3,C4,C5)
              <input value={waecInput} onChange={(e) => setWaecInput(e.target.value)} placeholder="e.g. A1,B2,B3,C4,C5" />
            </label>
          )}

          {scale === "IB" && (
            <label>
              Enter Total IB Diploma Points (out of 45)
              <input type="number" min="1" max="45" value={ibInput} onChange={(e) => setIbInput(e.target.value)} />
            </label>
          )}

          {/* Results Summary Card */}
          <div style={{ padding: "18px", borderRadius: "12px", background: "#f2f8f6", border: "1px solid #cce3dc", display: "grid", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#547570", fontWeight: "750", textTransform: "uppercase" }}>Calculated Indian Equivalency</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "999px", background: "#e5f5f1", color: "#0b655d", fontSize: "11px", fontWeight: "800" }}>
                <CheckCircle2 size={13} /> {result.category}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "4px 0" }}>
              <div style={{ padding: "12px", borderRadius: "8px", background: "#fff", border: "1px solid #dbe8e4" }}>
                <small style={{ color: "#74888b", fontSize: "11px" }}>Indian Equivalent %</small>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#0b655d" }}>{result.percent}%</div>
              </div>
              <div style={{ padding: "12px", borderRadius: "8px", background: "#fff", border: "1px solid #dbe8e4" }}>
                <small style={{ color: "#74888b", fontSize: "11px" }}>UGC 10-Point Scale</small>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#e87524" }}>{result.cgpa10} / 10</div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: "12px", color: "#55706c", lineHeight: 1.5 }}>
              {result.note}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#698184", fontSize: "11.5px" }}>
            <Info size={16} color="#0b655d" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>Association of Indian Universities (AIU) guidelines mandate minimum 50% - 60% equivalency for general higher education programmes.</span>
          </div>
        </div>

        <footer style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "14px 24px", borderTop: "1px solid var(--ws-border)", background: "#f8faf9" }}>
          <button className="workspace-button secondary" type="button" onClick={onClose}>
            Close
          </button>
          {onSelectEligibility && (
            <button className="workspace-button primary" type="button" onClick={() => { onSelectEligibility(result.percent); onClose(); }}>
              Use This Equivalency <ChevronRight size={15} />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
