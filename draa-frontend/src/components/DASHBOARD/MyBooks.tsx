import React, { useState, useEffect, useRef } from"react";
import toast from '../../utils/toast';
import { useNavigate, Link } from"react-router-dom";
import uri from"../../url";
import EbookReaderModal from"../../utils/ebook.reader";
import StudentHeader from"./StudentTopbr";
import StudentSidebar from"./StudentSidebar";

//  TYPES 
interface LoginUser { name?: string; email?: string; id?: string; token?: string;[key: string]: any; }

interface Book {
  purchaseId: string; bookId: string;
  book: {
    title: string; description: string; category: string; coverImage: string;
    author: string; publisher: string; pages: number; language: string;
    isbn: string; publishedDate: string; rating: number; reviews: number;
    pdfFile: string; format: string;
  };
  purchaseType:"book" |"ebook"; purchaseDate: string; amountPaid: number;
  currency: string; status: string; paymentStatus: string; deliveryStatus?: string;
  downloadCount: number; lastDownloaded: string; readingProgress: number;
  bookmarks: any[]; notes: any[]; isFavorite: boolean;
}

interface BookStats {
  totalBooks: number; physicalBooks: number; ebooks: number; completedBooks: number;
  inProgressBooks: number; notStartedBooks: number; totalSpent: number;
  totalReadingTime: number; averageProgress: number; favoriteBooks: number;
}

interface Review {
  _id: string; rating: number; title: string; review: string; studentName: string;
  studentEmail: string; verified: boolean; helpful: number; notHelpful: number;
  helpfulBy: string[]; notHelpfulBy: string[]; isEdited: boolean; createdAt: string;
  editedAt?: string; student: string;
}

interface ReviewStats {
  averageRating: number; totalReviews: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

//  ICONS 
const Icons: Record<string, (s?: number, c?: string) => React.ReactNode> = {
  grid: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  book: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  video: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
  chart: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  flash: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  trophy: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="18" width="12" height="4" /></svg>,
  file: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  calendar: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  user: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  logout: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  bell: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  search: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  download: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  read: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  heart: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  heartFill: (s = 18, c ="#ef4444") => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  star: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  starFill: (s = 18, c ="#f59e0b") => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  check: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  menu: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  chevron: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  home: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  x: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  clock: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  like: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>,
  dislike: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" /><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></svg>,
  edit: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  filter: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  shopping: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  pdf: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  shield: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
};

//  HELPERS 
const LinearBar = ({ pct, color, h = 4, bg ="rgba(0,0,0,0.07)" }: any) => (
  <div style={{ height: h, background: bg, borderRadius: 99, overflow:"hidden" }}>
    <div style={{ height:"100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition:"width 1.1s cubic-bezier(.4,0,.2,1)" }} />
  </div>
);

const StarRating = ({ value, max = 5, size = 13, interactive = false, onChange }: any) => (
  <div style={{ display:"flex", gap: 2 }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} onClick={() => interactive && onChange?.(i + 1)} style={{ cursor: interactive ?"pointer" :"default", lineHeight: 1 }}>
        {i < Math.round(value) ? Icons.starFill?.(size,"#f59e0b") : Icons.star?.(size,"#d1d5db")}
      </span>
    ))}
  </div>
);

const RingMini = ({ pct, size = 52, stroke = 5, color ="#10b981" }: any) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c - (Math.min(pct, 100) / 100) * c}
          strokeLinecap="round" style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position:"absolute", inset: 0, display:"flex", alignItems:"center", justifyContent:"center", fontSize: size * 0.22, fontWeight: 800, color, fontFamily:"var(--font)" }}>{pct}%</div>
    </div>
  );
};

//  SCREEN PROTECTION 

const useScreenProtection = () => {
  useEffect(() => {
    const BLOCKED = new Set(["PrintScreen","F12","F11"]);

    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const k = e.key.toLowerCase();
      if (
        BLOCKED.has(e.key) ||
        (ctrl && ["p","s","u","a"].includes(k)) ||
        (ctrl && shift && ["i","j","c","k","s"].includes(k))
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key ==="PrintScreen") {
        e.preventDefault();
        try { navigator.clipboard.writeText(""); } catch (_) {}
      }
    };

    const onContext = (e: MouseEvent) => e.preventDefault();
    const onDrag    = (e: DragEvent)  => e.preventDefault();
    const onSelect  = (e: Event)      => e.preventDefault();

    document.addEventListener("keydown",     onKeyDown,  { capture: true });
    document.addEventListener("keyup",       onKeyUp,    { capture: true });
    document.addEventListener("contextmenu", onContext,  { capture: true });
    document.addEventListener("dragstart",   onDrag,     { capture: true });
    document.addEventListener("selectstart", onSelect,   { capture: true });

    const devTimer = setInterval(() => {
      const threshold = 160;
      if (
        window.outerWidth  - window.innerWidth  > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        document.body.style.filter ="blur(24px)";
      } else {
        document.body.style.filter ="none";
      }
    }, 1000);

    return () => {
      document.removeEventListener("keydown",     onKeyDown,  { capture: true });
      document.removeEventListener("keyup",       onKeyUp,    { capture: true });
      document.removeEventListener("contextmenu", onContext,  { capture: true });
      document.removeEventListener("dragstart",   onDrag,     { capture: true });
      document.removeEventListener("selectstart", onSelect,   { capture: true });
      clearInterval(devTimer);
      document.body.style.filter ="none";
    };
  }, []);
};

const useFocusBlur = (): boolean => {
  const [blurred, setBlurred] = useState(false);
  useEffect(() => {
    const onBlur      = () => setBlurred(true);
    const onFocus     = () => setBlurred(false);
    const onVis       = () => setBlurred(document.visibilityState ==="hidden");
    window.addEventListener("blur",              onBlur);
    window.addEventListener("focus",             onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur",              onBlur);
      window.removeEventListener("focus",             onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return blurred;
};

const ScreenWatermark: React.FC<{ email?: string; name?: string }> = ({ email, name }) => {
  const [pos, setPos] = useState({ x: 12, y: 18 });
  const label = ((email || name ||"EduDocs User")).toUpperCase();
  const ts    = new Date().toLocaleString("en-IN", { dateStyle:"short", timeStyle:"short" });

  useEffect(() => {
    const iv = setInterval(() => {
      setPos({ x: 6 + Math.random() * 60, y: 6 + Math.random() * 60 });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const svgTile = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='140'>` +
    `<text x='50%' y='44%' font-family='monospace' font-size='11.5'` +
    ` fill='rgba(0,0,0,0.052)' text-anchor='middle' dominant-baseline='middle'` +
    ` transform='rotate(-22 210 70)'>${label} · EduDocs LMS</text>` +
    `<text x='50%' y='68%' font-family='monospace' font-size='9'` +
    ` fill='rgba(0,0,0,0.038)' text-anchor='middle' dominant-baseline='middle'` +
    ` transform='rotate(-22 210 70)'>${ts} · PROTECTED CONTENT</text>` +
    `</svg>`
  );

  return (
    <div aria-hidden="true" style={{ position:"fixed", inset: 0, pointerEvents:"none", zIndex: 8999, overflow:"hidden" }}>
      <div style={{ position:"absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,${svgTile}")`, backgroundRepeat:"repeat" }} />
      <div style={{
        position:"absolute", left: `${pos.x}%`, top: `${pos.y}%`,
        transition:"left 4.5s cubic-bezier(.4,0,.2,1), top 4.5s cubic-bezier(.4,0,.2,1)",
        transform:"rotate(-18deg)", opacity: 0.07, whiteSpace:"nowrap",
        fontSize: 13, fontWeight: 800, color:"#0f0c3a", fontFamily:"monospace",
        letterSpacing:"0.07em", userSelect:"none", pointerEvents:"none",
      }}>
        {label} · EduDocs · {ts}
      </div>
    </div>
  );
};

const FocusLockOverlay: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div
      onClick={() => window.focus()}
      style={{
        position:"fixed", inset: 0, background:"rgba(8,6,20,0.97)", zIndex: 9800,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        gap: 18, backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
      }}
    >
      <div style={{
        width: 96, height: 96, borderRadius:"50%",
        background:"#5E6BFF",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 0 60px rgba(94,107,255,.6), 0 0 120px rgba(94,107,255,.25)",
        animation:"pulseLock 2s ease-in-out infinite",
      }}>
        <span style={{ fontSize: 46 }}></span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 28, color:"white", letterSpacing:"-0.02em", textAlign:"center", fontFamily:"var(--font)" }}>
        Content Protected
      </div>
      <div style={{ color:"rgba(255,255,255,.5)", fontSize: 15, maxWidth: 380, textAlign:"center", lineHeight: 1.65 }}>
        This library is protected by EduDocs DRM.<br />
        <strong style={{ color:"rgba(255,255,255,.75)" }}>Click anywhere to resume.</strong>
      </div>
      <div style={{
        display:"flex", alignItems:"center", gap: 8, marginTop: 4,
        background:"rgba(16,185,129,.12)", border:"1px solid rgba(16,185,129,.3)",
        padding:"9px 22px", borderRadius: 99,
      }}>
        <span style={{ fontSize: 13 }}></span>
        <span style={{ color:"#6ee7b7", fontSize: 12.5, fontWeight: 700 }}>EduDocs Content Protection Active</span>
      </div>
      <div style={{ color:"rgba(255,255,255,.2)", fontSize: 11, marginTop: 6 }}>
        Unauthorized recording or distribution is a violation of our Terms of Service
      </div>
    </div>
  );
};

//  MAIN COMPONENT 
export default function StudentMyPurchasedBooks() {
  const navigate = useNavigate();

  //  Screen protection 
  useScreenProtection();
  const isWindowBlurred = useFocusBlur();

  //  Original state 
  const [loginUser, setLoginUser]           = useState<LoginUser>({});
  const [notifications]                     = useState<number>(3);
  const [books, setBooks]                   = useState<Book[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [searchTerm, setSearchTerm]         = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [categories, setCategories]         = useState<string[]>([]);
  const [stats, setStats]                   = useState<BookStats>({ totalBooks: 0, physicalBooks: 0, ebooks: 0, completedBooks: 0, inProgressBooks: 0, notStartedBooks: 0, totalSpent: 0, totalReadingTime: 0, averageProgress: 0, favoriteBooks: 0 });
  const [readingModalVisible, setReadingModalVisible] = useState(false);
  const [selectedBook, setSelectedBook]     = useState<Book | null>(null);
  const [reviewModalVisible, setReviewModalVisible]   = useState(false);
  const [reviewDrawerVisible, setReviewDrawerVisible] = useState(false);
  const [selectedBookForReview, setSelectedBookForReview] = useState<Book | null>(null);
  const [reviews, setReviews]               = useState<Review[]>([]);
  const [reviewStats, setReviewStats]       = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [myReview, setMyReview]             = useState<Review | null>(null);
  const [canReview, setCanReview]           = useState(false);
  const [editingReview, setEditingReview]   = useState(false);
  const [reviewSort, setReviewSort]         = useState("recent");
  const [openReader, setOpenReader]         = useState(false);
  const [reviewRating, setReviewRating]     = useState(5);
  const [reviewTitle, setReviewTitle]       = useState("");
  const [reviewText, setReviewText]         = useState("");
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [profileOpen, setProfileOpen]       = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("edudocs");
    if (!userStr) { toast.warning("Please log in first"); navigate("/student-login"); return; }
    try { const user: LoginUser = JSON.parse(userStr); setLoginUser(user); }
    catch { navigate("/student-login"); }
  }, [navigate]);

  useEffect(() => {
    if (loginUser.id && loginUser.token) loadMyBooks(loginUser.id);
  }, [loginUser.id, loginUser.token, searchTerm, selectedCategory, selectedFormat]);

  const loadMyBooks = async (studentId: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit:"50", ...(selectedCategory !=="all" && { category: selectedCategory }), ...(selectedFormat !=="all" && { format: selectedFormat }), ...(searchTerm && { search: searchTerm }) });
      const response = await fetch(`${uri}/student/books/purchase/my-books/${studentId}?${params}`, { headers: { Authorization: `Bearer ${loginUser.token}` } });
      const data = await response.json();
      if (data.success) {
        setBooks(data.books || []);
        setCategories(data.categories || []);
        setStats(data.stats || { totalBooks: 0, physicalBooks: 0, ebooks: 0, completedBooks: 0, inProgressBooks: 0, notStartedBooks: 0, totalSpent: 0, totalReadingTime: 0, averageProgress: 0, favoriteBooks: 0 });
      } else { setError(data.message ||"Failed to load books"); }
    } catch { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  };

  const logoutHandler = () => { localStorage.removeItem("edudocs"); toast.success("Logged out successfully"); navigate("/"); };

  const handleBookAccess = (book: Book) => {
    if (book.purchaseType ==="ebook") { setSelectedBook(book); setReadingModalVisible(true); }
    else { book.deliveryStatus ==="delivered" ? toast.success("Your physical book has been delivered!") : toast.info(`Book delivery status: ${book.deliveryStatus ||"Processing"}`); }
  };

  const handleDownload = async (book: Book) => {
    try {
      const res = await fetch(`${uri}/student/books/purchase/book/${loginUser.id}/${book.bookId}/download`, { headers: { Authorization: `Bearer ${loginUser.token}` } });
      const data = await res.json();
      if (data.success) {
        toast.success(`Download started! Total downloads: ${data.downloadCount}`);
        setBooks(prev => prev.map(b => b.bookId === book.bookId ? { ...b, downloadCount: data.downloadCount, lastDownloaded: new Date().toISOString() } : b));
      } else { toast.error(data.message ||"Download failed"); }
    } catch { toast.error("Failed to download book"); }
  };

  const toggleFavorite = async (book: Book) => {
    try {
      const newFav = !book.isFavorite;
      const res = await fetch(`${uri}/student/books/purchase/book/${loginUser.id}/${book.bookId}/favorite`, { method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` }, body: JSON.stringify({ isFavorite: newFav }) });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setBooks(prev => prev.map(b => b.bookId === book.bookId ? { ...b, isFavorite: newFav } : b));
        setStats(prev => ({ ...prev, favoriteBooks: newFav ? prev.favoriteBooks + 1 : prev.favoriteBooks - 1 }));
      } else { toast.error(data.message ||"Failed to update favorite status"); }
    } catch { toast.error("Failed to update favorite status"); }
  };

  const fetchBookReviews = async (bookId: string, sort: string ="recent") => {
    try {
      setLoadingReviews(true);
      const res = await fetch(`${uri}/books/review/book/${bookId}/reviews?limit=20&sort=${sort}`);
      const data = await res.json();
      if (data.success) { setReviews(data.reviews || []); setReviewStats(data.stats || null); }
    } catch { console.error("Error fetching reviews"); }
    finally { setLoadingReviews(false); }
  };

  const checkReviewEligibility = async (bookId: string) => {
    try {
      const res = await fetch(`${uri}/books/review/book/${bookId}/can-review`, { headers: { Authorization: `Bearer ${loginUser.token}` } });
      const data = await res.json();
      if (data.success) {
        setCanReview(data.canReview);
        if (data.hasReviewed && data.existingReview) {
          setMyReview(data.existingReview);
          setReviewRating(data.existingReview.rating);
          setReviewTitle(data.existingReview.title);
          setReviewText(data.existingReview.review);
          setEditingReview(true);
        } else { setMyReview(null); setReviewRating(5); setReviewTitle(""); setReviewText(""); setEditingReview(false); }
      }
      return data;
    } catch { return null; }
  };

  const openReviewModal = async (book: Book) => {
    setSelectedBookForReview(book); setReviewModalVisible(true);
    await fetchBookReviews(book.bookId, reviewSort);
    await checkReviewEligibility(book.bookId);
  };

  const handleSubmitReview = async () => {
    if (!selectedBookForReview || !reviewTitle.trim() || !reviewText.trim()) { toast.error("Please fill all fields"); return; }
    try {
      const url = editingReview && myReview ? `${uri}/books/review/review/${myReview._id}` : `${uri}/books/review/book/${selectedBookForReview.bookId}/review`;
      const res = await fetch(url, { method: editingReview ?"PUT" :"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` }, body: JSON.stringify({ rating: reviewRating, title: reviewTitle, review: reviewText }) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingReview ?"Review updated!" :"Review submitted!");
        setReviewDrawerVisible(false);
        await fetchBookReviews(selectedBookForReview.bookId, reviewSort);
        await checkReviewEligibility(selectedBookForReview.bookId);
        if (data.stats) setBooks(prev => prev.map(b => b.bookId === selectedBookForReview.bookId ? { ...b, book: { ...b.book, rating: data.stats.averageRating, reviews: data.stats.totalReviews } } : b));
      } else { toast.error(data.message ||"Failed to submit review"); }
    } catch { toast.error("Failed to submit review"); }
  };

  const handleDeleteReview = async () => {
    if (!myReview || !selectedBookForReview) return;
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      const res = await fetch(`${uri}/reviews/review/${myReview._id}`, { method:"DELETE", headers: { Authorization: `Bearer ${loginUser.token}` } });
      const data = await res.json();
      if (data.success) {
        toast.success("Review deleted"); setReviewDrawerVisible(false);
        await fetchBookReviews(selectedBookForReview.bookId, reviewSort);
        await checkReviewEligibility(selectedBookForReview.bookId);
        if (data.stats) setBooks(prev => prev.map(b => b.bookId === selectedBookForReview.bookId ? { ...b, book: { ...b.book, rating: data.stats.averageRating, reviews: data.stats.totalReviews } } : b));
      } else { toast.error(data.message ||"Failed to delete review"); }
    } catch { toast.error("Failed to delete review"); }
  };

  const handleMarkHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      const res = await fetch(`${uri}/reviews/review/${reviewId}/helpful`, { method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` }, body: JSON.stringify({ isHelpful }) });
      const data = await res.json();
      if (data.success) setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpful: data.helpful, notHelpful: data.notHelpful } : r));
    } catch { console.error("Error marking review"); }
  };

  const getProgressColor = (p: number) => p === 0 ?"#e5e7eb" : p < 30 ?"#ef4444" : p < 70 ?"#f59e0b" :"#10b981";

  //  RENDER 
  return (
    <>
      {/*  SCREEN PROTECTION LAYERS  */}
      <ScreenWatermark email={loginUser.email} name={loginUser.name} />
      <FocusLockOverlay visible={isWindowBlurred} />

      <style>{`
      
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink:       #0d0c1d;
          --ink2:      #4b4966;
          --ink3:      #9896b8;
          --surface:   #ffffff;
          --surface2:  #f5f4ff;
          --edge:      rgba(94,107,255,0.1);
          --edge2:     #e8e7f8;
          --accent:    #6366f1;
          --accent2:   #5E6BFF;
          --accent-bg: rgba(94,107,255,0.07);
          --green:     #10b981;
          --amber:     #f59e0b;
          --red:       #ef4444;
          --pink:      #ec4899;
          --sky:       #0ea5e9;
          --sh:  0 1px 3px rgba(13,12,29,.05), 0 4px 16px rgba(94,107,255,.07);
          --sh2: 0 4px 24px rgba(94,107,255,.13), 0 1px 4px rgba(13,12,29,.07);
          --sh3: 0 8px 40px rgba(94,107,255,.18);
          --r:   7px;
          --rs:  7px;
          --tr:  0.2s cubic-bezier(.4,0,.2,1);
          --sidebar: 252px;
          --header:  60px;
          --font:'Inter', system-ui, -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto, sans-serif;
        }
        html,body { height:100%; font-family:var(--font); background:var(--surface2); color:var(--ink); -webkit-font-smoothing:antialiased; }
        * { font-family: var(--font); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--edge2); border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:var(--accent2); }

        /* Layout */
        .app-shell { display:flex; min-height:100vh; }
        .sidebar {
          width:var(--sidebar); min-width:var(--sidebar); height:100vh;
          position:sticky; top:0; background:var(--surface);
          border-right:1px solid var(--edge2);
          display:flex; flex-direction:column; overflow:hidden;
          transition:width var(--tr), min-width var(--tr), transform var(--tr);
          z-index:200;
        }
        .sidebar.closed { width:0; min-width:0; }
        .main { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
        .topbar {
          height:var(--header); position:sticky; top:0; z-index:150;
          background:rgba(245,244,255,0.88); backdrop-filter:blur(18px);
          border-bottom:1px solid var(--edge2);
          display:flex; align-items:center; gap:12px; padding:0 24px;
        }
        .content { flex:1; overflow-y:auto; padding:28px 28px 48px; }

        /* Nav */
        .nav-label { font-size:10px; font-weight:700; color:var(--ink3); text-transform:uppercase; letter-spacing:.1em; padding:6px 14px 3px; }
        .nav-item {
          display:flex; align-items:center; gap:10px;
          padding:9px 14px; border-radius:7px; cursor:pointer;
          font-size:13.5px; font-weight:500; color:var(--ink2);
          transition:all var(--tr); margin:1px 8px; white-space:nowrap; overflow:hidden;
        }
        .nav-item:hover  { background:var(--accent-bg); color:var(--accent); }
        .nav-item.active { background:linear-gradient(135deg,rgba(94,107,255,.14),rgba(94,107,255,.08)); color:var(--accent); font-weight:700; }
        .nav-item .nav-icon { flex-shrink:0; }

        /* Cards */
        .card { background:var(--surface); border-radius:var(--r); border:1px solid var(--edge2); box-shadow:var(--sh); }
        .card-sm { background:var(--surface); border-radius:var(--rs); border:1px solid var(--edge2); box-shadow:var(--sh); }

        /* Buttons */
        .btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:7px; border:none; cursor:pointer; font-size:13px; font-weight:600; transition:all var(--tr); font-family:var(--font); white-space:nowrap; }
        .btn-primary { background:#5E6BFF; color:#fff; box-shadow:0 4px 14px rgba(94,107,255,.35); }
        .btn-primary:hover { box-shadow:0 4px 14px rgba(94,107,255,.35); }
        .btn-ghost  { background:var(--surface); color:var(--ink2); border:1px solid var(--edge2); }
        .btn-ghost:hover { background:var(--accent-bg); color:var(--accent); border-color:rgba(94,107,255,.3); }
        .btn-icon { padding:8px; border-radius:7px; }

        /* Typography */
        .display { font-family:var(--font); }
        .stat-val { font-family:var(--font); font-weight:800; line-height:1; color:var(--ink); }

        /* Animations */
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.6} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-up { opacity:0; animation:fadeUp .45s cubic-bezier(.4,0,.2,1) forwards; }
        .pulse-ring { animation:pulseRing 2s ease-in-out infinite; }
        .spinner { animation:spin 1s linear infinite; }

        /* Grid helpers */
        .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .grid-4-tiles { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }

        /* Hover lift */
        .lift { transition:transform var(--tr), box-shadow var(--tr); }
        .lift:hover { transform:translateY(-2px); box-shadow:var(--sh2); }

        /* Badge / pill */
        .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:99px; font-size:11px; font-weight:700; }
        .tag { display:inline-block; padding:2px 8px; border-radius:7px; font-size:10.5px; font-weight:700; }

        /* Divider */
        .div { height:1px; background:var(--edge2); margin:12px 0; }

        /* Alert banner */
        .alert-success {
          display:flex; align-items:center; gap:12px;
          background:#ecfdf5; border:1px solid rgba(16,185,129,.25);
          border-radius:7px; padding:14px 18px; margin-top:20px;
          font-size:13.5px; color:#065f46; font-weight:500;
        }

        /* Overlay */
        .overlay { position:fixed; inset:0; background:rgba(13,12,29,.45); z-index:190; }

        /* Responsive */
        @media(max-width:900px) {
          .grid-4,.grid-3 { grid-template-columns:repeat(2,1fr) !important; }
          .grid-4-tiles { grid-template-columns:repeat(2,1fr) !important; }
          .hero-cols { grid-template-columns:1fr !important; }
          .bottom-grid { grid-template-columns:1fr !important; }
        }
        @media(max-width:600px) {
          .grid-4,.grid-3,.grid-2 { grid-template-columns:1fr !important; }
          .grid-4-tiles { grid-template-columns:repeat(2,1fr); }
          .content { padding:16px 12px 40px; }
          .topbar { padding:0 14px; }
        }
        @media(max-width:900px) {
          .sidebar { position:fixed!important; top:0; left:0; height:100vh; z-index:300; }
          .sidebar.closed { transform:translateX(-100%); width:var(--sidebar)!important; min-width:var(--sidebar)!important; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink:#0d0c1d; --ink2:#4b4966; --ink3:#9896b8;
          --bg:#f5f4ff; --surface:#fff; --edge:#e8e7f8; --edge2:rgba(94,107,255,.1);
          --accent:#6366f1; --accent2:#5E6BFF; --accent-bg:rgba(94,107,255,.07);
          --green:#10b981; --amber:#f59e0b; --red:#ef4444; --sky:#0ea5e9;
          --sh:0 1px 3px rgba(13,12,29,.05),0 4px 16px rgba(94,107,255,.07);
          --sh2:0 4px 24px rgba(94,107,255,.13),0 1px 4px rgba(13,12,29,.07);
          --r:7px; --rs:7px; --tr:.2s cubic-bezier(.4,0,.2,1);
          --sidebar:250px; --header:60px;
          --font:'Inter', system-ui, -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto, sans-serif;
        }
        html,body{height:100%;font-family:var(--font);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
        *{font-family:var(--font);}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:var(--edge);border-radius:99px;}

        /* Layout */
        .app{display:flex;min-height:100vh;}
        .main{flex:1;display:flex;flex-direction:column;min-width:0;}
        .topbar{height:var(--header);position:sticky;top:0;z-index:150;background:rgba(245,244,255,.88);backdrop-filter:blur(18px);border-bottom:1px solid var(--edge);display:flex;align-items:center;gap:12px;padding:0 24px;}
        .content{flex:1;overflow-y:auto;padding:28px;}

        /* Cards */
        .card{background:var(--surface);border-radius:var(--r);border:1px solid var(--edge);box-shadow:var(--sh);}

        /* Buttons */
        .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:7px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all var(--tr);font-family:var(--font);}
        .btn-primary{background:#5E6BFF;color:#fff;box-shadow:0 4px 14px rgba(94,107,255,.35);}
        .btn-primary:hover{box-shadow:0 4px 14px rgba(94,107,255,.35);}
        .btn-ghost{background:var(--surface);color:var(--ink2);border:1px solid var(--edge);}
        .btn-ghost:hover{background:var(--accent-bg);color:var(--accent);border-color:rgba(94,107,255,.3);}
        .btn-sm{padding:6px 12px;font-size:12px;border-radius:7px;}
        .btn-danger{background:#fff1f0;color:#ef4444;border:1px solid rgba(239,68,68,.2);}
        .btn-danger:hover{background:#ef4444;color:white;}
        .btn-icon{padding:8px;border-radius:7px;}

        /* Book grid */
        .books-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px;}
        @media(max-width:1200px){.layout-cols{grid-template-columns:1fr!important;}}
        @media(max-width:700px){.books-grid{grid-template-columns:repeat(2,1fr);gap:12px;} .topbar{padding:0 14px;} .content{padding:16px 12px;}}

        /* Book card */
        .book-card{background:var(--surface);border-radius:var(--r);border:1px solid var(--edge);overflow:hidden;transition:all var(--tr);cursor:pointer;position:relative;}
        .book-card:hover{transform:translateY(-3px);box-shadow:var(--sh2);border-color:rgba(94,107,255,.3);}
        .book-card.completed{border-color:#10b981;}

        /* Animations */
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseLock{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.8}}
        .fade-up{opacity:0;animation:fadeUp .4s cubic-bezier(.4,0,.2,1) forwards;}
        .spinner{animation:spin 1s linear infinite;}

        /* Modal / Drawer */
        .modal-bg{position:fixed;inset:0;background:rgba(13,12,29,.55);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;}
        .modal-box{background:var(--surface);border-radius:7px;overflow:hidden;width:100%;box-shadow:0 20px 60px rgba(13,12,29,.25);max-height:90vh;display:flex;flex-direction:column;}
        .modal-scroll{overflow-y:auto;flex:1;}
        .drawer-bg{position:fixed;inset:0;background:rgba(13,12,29,.45);z-index:600;display:flex;justify-content:flex-end;}
        .drawer-box{background:var(--surface);width:100%;max-width:480px;height:100%;overflow-y:auto;box-shadow:-8px 0 40px rgba(13,12,29,.2);display:flex;flex-direction:column;}

        /* Input */
        .inp{width:100%;padding:10px 14px;border-radius:7px;border:1px solid var(--edge);background:var(--surface);font-size:13px;color:var(--ink);outline:none;font-family:var(--font);transition:border-color var(--tr);}
        .inp:focus{border-color:var(--accent);}
        .inp-with-icon{position:relative;}
        .inp-with-icon .inp{padding-left:36px;}
        .inp-with-icon .icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none;opacity:.45;}
        select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239896b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:32px;}
        textarea.inp{resize:vertical;min-height:100px;}
        .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;}

        /* Print block */
        @media print{*{display:none!important;visibility:hidden!important;}body::after{content:"© EduDocs  Printing is strictly prohibited.";display:block!important;font-size:22px;text-align:center;padding:100px 40px;color:#1a0050;}}

        /* Protected content */
        .protected-content{-webkit-user-select:none!important;-moz-user-select:none!important;user-select:none!important;}
      `}</style>

      <div
        className="app protected-content"
        onContextMenu={e => { e.preventDefault(); toast.warning("Right-click is disabled for content protection."); }}
        onCopy={e => { e.preventDefault(); toast.error("Copy-pasting is prohibited on this platform."); }}
        onCut={e => e.preventDefault()}
        onPaste={e => e.preventDefault()}
        onDragStart={e => e.preventDefault()}
        style={{ userSelect:"none", WebkitUserSelect:"none" as any }}
      >

        {/*  SIDEBAR  */}
        <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} loginUser={loginUser} stats={stats} />

        {/*  MAIN  */}
        <div className="main">

          {/*  TOPBAR  */}
          <StudentHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} loginUser={loginUser} notifications={notifications} currentPage="My Books" />

          {/*  CONTENT  */}
          <main className="content">
            <div style={{ maxWidth: 1380, margin:"0 auto" }}>

              {/* Page title */}
              <div className="fade-up" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap: 12, marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontFamily:"var(--font)", fontSize: 26, fontWeight: 800, color:"var(--ink)", lineHeight: 1.2, marginBottom: 4 }}> Your Library</h1>
                  <p style={{ color:"var(--ink2)", fontSize: 13.5 }}>{stats.totalBooks} books · {stats.totalSpent} invested in knowledge</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                  {/* DRM badge */}
                  <div style={{ display:"flex", alignItems:"center", gap: 5, background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", padding:"5px 14px", borderRadius: 99 }}>
                    {Icons.shield?.(13,"#10b981")}
                    <span style={{ fontSize: 11, fontWeight: 700, color:"#10b981" }}>DRM Protected</span>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate("/all-books")}>{Icons.shopping?.(15)} Browse New Books</button>
                </div>
              </div>

              <div className="layout-cols" style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap: 22, alignItems:"start" }}>

                {/*  LEFT: Books  */}
                <div>
                  {/* Filters */}
                  <div className="fade-up" style={{ display:"flex", gap: 10, flexWrap:"wrap", marginBottom: 18, animationDelay:".05s" }}>
                    <div style={{ flex: 1, minWidth: 180 }} className="inp-with-icon">
                      <span className="icon">{Icons.search?.(14)}</span>
                      <input className="inp" placeholder="Search your books" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="inp" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ width: 160 }}>
                      <option value="all">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="inp" value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)} style={{ width: 150 }}>
                      <option value="all">All Formats</option>
                      <option value="book">Physical Books</option>
                      <option value="ebook">eBooks</option>
                    </select>
                  </div>

                  {loading && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius:"50%", border:"3px solid var(--edge)", borderTopColor:"var(--accent)" }} className="spinner" />
                      <div style={{ color:"var(--ink2)", fontSize: 14 }}>Loading your library</div>
                    </div>
                  )}

                  {!loading && error && (
                    <div style={{ background:"#fff1f0", border:"1px solid rgba(239,68,68,.2)", borderRadius: 7, padding:"20px", textAlign:"center" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}></div>
                      <div style={{ fontFamily:"var(--font)", fontSize: 17, fontWeight: 700, color:"var(--ink)", marginBottom: 6 }}>{error}</div>
                      <button className="btn btn-primary" onClick={() => loginUser.id && loadMyBooks(loginUser.id)}>Try Again</button>
                    </div>
                  )}

                  {!loading && !error && books.length === 0 && (
                    <div style={{ textAlign:"center", padding:"80px 20px" }}>
                      <div style={{ fontSize: 64, marginBottom: 16 }}></div>
                      <div style={{ fontFamily:"var(--font)", fontSize: 22, fontWeight: 800, color:"var(--ink)", marginBottom: 8 }}>No Books Yet</div>
                      <div style={{ color:"var(--ink2)", fontSize: 14, marginBottom: 24 }}>Start building your personal library by purchasing books</div>
                      <button className="btn btn-primary" onClick={() => navigate("/all-books")}>{Icons.shopping?.(15)} Browse Books</button>
                    </div>
                  )}

                  {!loading && !error && books.length > 0 && (
                    <div className="books-grid">
                      {books.map((book, idx) => (
                        <div
                          key={book.purchaseId}
                          className={`book-card fade-up ${book.readingProgress === 100 ?"completed" :""}`}
                          style={{ animationDelay: `${.08 + idx * .04}s` }}
                          onClick={() => handleBookAccess(book)}
                        >
                          {/* Cover */}
                          <div style={{ position:"relative", height: 210, overflow:"hidden", background:"#f1f0fe" }}>
                            <img
                              alt={book.book.title}
                              src={book.book.coverImage ? `${uri}${book.book.coverImage}` :""}
                              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                              onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect width='200' height='280' fill='%23f1f0fe'/%3E%3Ctext x='100' y='140' font-family='Arial' font-size='40' fill='%236366f1' text-anchor='middle' dominant-baseline='middle'%3E%3C/text%3E%3C/svg%3E`; }}
                            />
                            {/* Format badge */}
                            <div style={{ position:"absolute", top: 8, left: 8, background: book.purchaseType ==="ebook" ?"#6366f1" :"#10b981", color:"white", padding:"3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 800, display:"flex", alignItems:"center", gap: 4 }}>
                              {book.purchaseType ==="ebook" ? Icons.pdf?.(11,"white") : Icons.book?.(11,"white")}
                              {book.purchaseType ==="ebook" ?"eBook" :"Physical"}
                            </div>
                            {/* Completed badge */}
                            {book.readingProgress === 100 && (
                              <div style={{ position:"absolute", bottom: 8, right: 8, background:"#10b981", color:"white", padding:"3px 8px", borderRadius: 99, fontSize: 10, fontWeight: 800, display:"flex", alignItems:"center", gap: 4 }}>
                                {Icons.check?.(11,"white")} Done
                              </div>
                            )}
                            {/* Progress overlay */}
                            {book.purchaseType ==="ebook" && book.readingProgress > 0 && book.readingProgress < 100 && (
                              <div style={{ position:"absolute", bottom: 0, left: 0, right: 0, background:"linear-gradient(transparent,rgba(13,12,29,.8))", padding:"10px 10px 8px" }}>
                                <LinearBar pct={book.readingProgress} color={getProgressColor(book.readingProgress)} h={3} bg="rgba(255,255,255,.25)" />
                                <div style={{ fontSize: 10, color:"rgba(255,255,255,.8)", fontWeight: 700, marginTop: 3 }}>{book.readingProgress}% read</div>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ padding:"14px" }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color:"var(--ink)", marginBottom: 3, lineHeight: 1.3, display:"-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{book.book.title}</div>
                            <div style={{ fontSize: 11.5, color:"var(--ink2)", marginBottom: 8 }}>by {book.book.author}</div>
                            <div style={{ display:"flex", alignItems:"center", gap: 6, marginBottom: 8 }}>
                              <StarRating value={book.book.rating || 0} size={11} />
                              <span style={{ fontSize: 11, color:"var(--ink3)" }}>({book.book.reviews || 0})</span>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns: book.purchaseType ==="ebook" ?"1fr 1fr" :"1fr 1fr", gap: 6 }}>
                              <button className="btn btn-sm" style={{ background: book.purchaseType ==="ebook" ?"#eff6ff" :"#ecfdf5", color: book.purchaseType ==="ebook" ?"#6366f1" :"#10b981", border:"none", justifyContent:"center", fontSize: 11 }} onClick={e => { e.stopPropagation(); handleBookAccess(book); }}>
                                {book.purchaseType ==="ebook" ? Icons.read?.(12,"#6366f1") : Icons.check?.(12,"#10b981")}
                                {book.purchaseType ==="ebook" ? (book.readingProgress > 0 ?"Continue" :"Read") :"Status"}
                              </button>
                          <button
  className="btn btn-sm"
  style={{
    background: book.purchaseType ==="ebook" ?"#eff6ff" :"#ecfdf5",
    color: book.purchaseType ==="ebook" ?"#6366f1" :"#10b981",
    border:"none",
    justifyContent:"center",
    fontSize: 11
  }}
  onClick={e => {
    e.stopPropagation();
    handleBookAccess(book);
  }}
>
  {book.purchaseType ==="ebook"
    ? Icons.read?.(12,"#6366f1")
    : Icons.check?.(12,"#10b981")}

  {book.purchaseType ==="ebook"
    ? (book.readingProgress > 0 ?"Continue" :"Read")
    : (book.deliveryStatus ==="delivered"
        ?"Delivered"
        : book.deliveryStatus ==="shipped"
        ?"Shipped"
        : book.deliveryStatus ==="processing"
        ?"Processing"
        :"Pending")}
</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/*  RIGHT: Stats sidebar  */}
                <div style={{ display:"flex", flexDirection:"column", gap: 16, position:"sticky", top:"calc(var(--header) + 28px)" }}>
                  {/* <div className="card fade-up" style={{ padding:"20px", animationDelay:".1s", textAlign:"center" }}>
                    <div style={{ fontFamily:"var(--font)", fontSize: 14, fontWeight: 700, color:"var(--ink)", marginBottom: 14 }}>Overall Progress</div>
                    <div style={{ display:"flex", justifyContent:"center", marginBottom: 14 }}>
                      <RingMini pct={stats.averageProgress || 0} size={80} stroke={7} color="#10b981" />
                    </div>
                    <div style={{ fontSize: 12, color:"var(--ink2)" }}>Average reading completion</div>
                  </div> */}

                  <div className="card fade-up" style={{ padding:"18px 20px", animationDelay:".15s" }}>
                    <div style={{ fontFamily:"var(--font)", fontSize: 14, fontWeight: 700, color:"var(--ink)", marginBottom: 14 }}>Library Stats</div>
                    {[
                      { label:"Total Books", value: stats.totalBooks, color:"#6366f1", icon:"book" },
                      { label:"Physical", value: stats.physicalBooks, color:"#10b981", icon:"book" },
                      { label:"eBooks", value: stats.ebooks, color:"#5E6BFF", icon:"pdf" },
                      { label:"Completed", value: stats.completedBooks, color:"#10b981", icon:"check" },
                      { label:"In Progress", value: stats.inProgressBooks, color:"#f59e0b", icon:"clock" },
                      { label:"Favourites", value: stats.favoriteBooks, color:"#ef4444", icon:"heartFill" },
                      { label:"Reading Time", value: `${stats.totalReadingTime}m`, color:"#0ea5e9", icon:"clock" },
                      { label:"Total Spent", value: `${stats.totalSpent}`, color:"#5E6BFF", icon:"shopping" },
                    ].map((s, i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom: i < 7 ?"1px solid var(--edge)" :"none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                          {Icons[s.icon]?.(14, s.color)}
                          <span style={{ fontSize: 12.5, color:"var(--ink2)" }}>{s.label}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {stats.notStartedBooks > 0 && (
                    <div className="card fade-up" style={{ padding:"16px 18px", background:"#fffbeb", border:"1px solid rgba(245,158,11,.2)", animationDelay:".2s" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}></div>
                      <div style={{ fontFamily:"var(--font)", fontSize: 13, fontWeight: 700, color:"var(--ink)", marginBottom: 4 }}>{stats.notStartedBooks} books waiting</div>
                      <div style={{ fontSize: 11.5, color:"var(--ink2)" }}>You haven't started reading these yet. Pick one and dive in!</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/*  READING MODAL  */}
      {readingModalVisible && selectedBook && (
        <div className="modal-bg" onClick={() => setReadingModalVisible(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg,#0f0b2d,#2d1b69,#4c1d95)", padding:"28px", textAlign:"center", position:"relative" }}>
              <button onClick={() => setReadingModalVisible(false)} style={{ position:"absolute", top: 14, right: 14, background:"rgba(255,255,255,.15)", border:"none", borderRadius:"50%", width: 30, height: 30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                {Icons.x?.(16,"white")}
              </button>
              <div style={{ fontFamily:"var(--font)", fontSize: 20, fontWeight: 800, color:"white", marginBottom: 6 }}> {selectedBook.book.title}</div>
              <div style={{ color:"rgba(255,255,255,.7)", fontSize: 14 }}>by {selectedBook.book.author}</div>
              {selectedBook.readingProgress > 0 && (
                <div style={{ marginTop: 12 }}>
                  <LinearBar pct={selectedBook.readingProgress} color="#a78bfa" h={4} bg="rgba(255,255,255,.15)" />
                  <div style={{ fontSize: 11, color:"rgba(255,255,255,.6)", marginTop: 4 }}>{selectedBook.readingProgress}% completed</div>
                </div>
              )}
            </div>
            <div style={{ padding:"32px", display:"flex", flexDirection:"column", alignItems:"center", gap: 14 }}>
              <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", padding:"14px" }} onClick={() => { setReadingModalVisible(false); setOpenReader(true); }}>
                {Icons.read?.(16)} Read Online
              </button>
              {selectedBook.purchaseType ==="book" && (
                <button className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", padding:"14px" }} onClick={() => handleDownload(selectedBook)}>
                  {Icons.download?.(16)} Download PDF
                </button>
              )}
              {selectedBook.purchaseType ==="ebook" && (
                <button className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", padding:"14px" }} disabled>
                   Download Disabled
                </button>
              )}
              <div style={{ fontSize: 12, color:"var(--ink3)", textAlign:"center" }}>
                {Icons.download?.(12,"var(--ink3)")} {selectedBook.downloadCount} downloads · {selectedBook.book.pages} pages
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  REVIEW MODAL  */}
      {reviewModalVisible && selectedBookForReview && (
        <div className="modal-bg" onClick={() => { setReviewModalVisible(false); setSelectedBookForReview(null); setReviews([]); setReviewStats(null); setMyReview(null); }}>
          <div className="modal-box" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg,#0f0b2d,#2d1b69)", padding:"24px", flexShrink: 0, position:"relative" }}>
              <button onClick={() => { setReviewModalVisible(false); setSelectedBookForReview(null); setReviews([]); setReviewStats(null); setMyReview(null); }} style={{ position:"absolute", top: 14, right: 14, background:"rgba(255,255,255,.15)", border:"none", borderRadius:"50%", width: 30, height: 30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {Icons.x?.(16,"white")}
              </button>
              <div style={{ display:"flex", gap: 16, alignItems:"center" }}>
                <img src={selectedBookForReview.book.coverImage ? `${uri}/${selectedBookForReview.book.coverImage}` :""} alt={selectedBookForReview.book.title}
                  style={{ width: 64, borderRadius: 7, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display ="none"; }} />
                <div>
                  <div style={{ fontFamily:"var(--font)", fontSize: 20, fontWeight: 800, color:"white", marginBottom: 4 }}>{selectedBookForReview.book.title}</div>
                  <div style={{ color:"rgba(255,255,255,.7)", fontSize: 13 }}>by {selectedBookForReview.book.author}</div>
                  {reviewStats && (
                    <div style={{ display:"flex", alignItems:"center", gap: 8, marginTop: 8 }}>
                      <StarRating value={reviewStats.averageRating} size={13} />
                      <span style={{ color:"white", fontSize: 13, fontWeight: 700 }}>{reviewStats.averageRating.toFixed(1)}</span>
                      <span style={{ color:"rgba(255,255,255,.5)", fontSize: 12 }}>({reviewStats.totalReviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-scroll">
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div style={{ padding:"20px 24px", background:"var(--bg)", borderBottom:"1px solid var(--edge)" }}>
                  <div style={{ fontFamily:"var(--font)", fontSize: 13, fontWeight: 700, color:"var(--ink)", marginBottom: 12 }}>Rating Breakdown</div>
                  {[5, 4, 3, 2, 1].map(r => {
                    const count = reviewStats.distribution[r as keyof typeof reviewStats.distribution];
                    const pct = reviewStats.totalReviews > 0 ? Math.round((count / reviewStats.totalReviews) * 100) : 0;
                    return (
                      <div key={r} style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 6 }}>
                        <div style={{ display:"flex", alignItems:"center", gap: 3, width: 30, flexShrink: 0 }}>
                          <span style={{ fontSize: 12, color:"var(--ink2)", fontWeight: 700 }}>{r}</span>
                          {Icons.starFill?.(11)}
                        </div>
                        <div style={{ flex: 1 }}><LinearBar pct={pct} color="#f59e0b" h={6} /></div>
                        <span style={{ fontSize: 11, color:"var(--ink3)", width: 24, textAlign:"right" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--edge)" }}>
                {myReview ? (
                  <div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 12 }}>
                      <div style={{ fontFamily:"var(--font)", fontSize: 13, fontWeight: 700, color:"var(--ink)" }}>Your Review</div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setReviewDrawerVisible(true)}>{Icons.edit?.(13)} Edit</button>
                    </div>
                    <div style={{ background:"#eff6ff", border:"1px solid rgba(94,107,255,.2)", borderRadius: 7, padding:"14px" }}>
                      <StarRating value={myReview.rating} size={13} />
                      <div style={{ fontFamily:"var(--font)", fontSize: 14, fontWeight: 700, color:"var(--ink)", margin:"8px 0 4px" }}>{myReview.title}</div>
                      <div style={{ fontSize: 13, color:"var(--ink2)", lineHeight: 1.6 }}>{myReview.review}</div>
                      <div style={{ fontSize: 11, color:"var(--ink3)", marginTop: 8 }}>{new Date(myReview.createdAt).toLocaleDateString("en-IN")}{myReview.isEdited &&" · Edited"}</div>
                    </div>
                  </div>
                ) : canReview ? (
                  <button className="btn btn-primary" onClick={() => setReviewDrawerVisible(true)}>{Icons.star?.(15)} Write a Review</button>
                ) : (
                  <div style={{ background:"#eff6ff", border:"1px solid rgba(94,107,255,.2)", borderRadius: 7, padding:"14px", fontSize: 13, color:"var(--ink2)" }}>
                     Purchase this book to leave a review
                  </div>
                )}
              </div>

              <div style={{ padding:"20px 24px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 16 }}>
                  <div style={{ fontFamily:"var(--font)", fontSize: 13, fontWeight: 700, color:"var(--ink)" }}>Reviews ({reviews.length})</div>
                  <select className="inp" value={reviewSort} onChange={e => { setReviewSort(e.target.value); if (selectedBookForReview) fetchBookReviews(selectedBookForReview.bookId, e.target.value); }} style={{ width: 150, padding:"6px 10px", fontSize: 12 }}>
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>

                {loadingReviews ? (
                  <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}>
                    <div style={{ width: 36, height: 36, borderRadius:"50%", border:"3px solid var(--edge)", borderTopColor:"var(--accent)" }} className="spinner" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"var(--ink3)" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}></div>
                    <div style={{ fontSize: 13 }}>No reviews yet. Be the first!</div>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
                    {reviews.map(review => (
                      <div key={review._id} style={{ padding:"16px", borderRadius: 7, border:"1px solid var(--edge)", background:"var(--surface)" }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius:"50%", background:"#5E6BFF", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                            {review.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap: 7, flexWrap:"wrap" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)" }}>{review.studentName}</span>
                              {review.verified && <span className="badge" style={{ background:"#ecfdf5", color:"#10b981", fontSize: 9 }}> Verified</span>}
                            </div>
                            <StarRating value={review.rating} size={11} />
                          </div>
                          <span style={{ fontSize: 11, color:"var(--ink3)" }}>{new Date(review.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                        <div style={{ fontFamily:"var(--font)", fontSize: 13, fontWeight: 700, color:"var(--ink)", marginBottom: 5 }}>{review.title}</div>
                        <div style={{ fontSize: 13, color:"var(--ink2)", lineHeight: 1.6, marginBottom: 10 }}>{review.review}</div>
                        <div style={{ display:"flex", gap: 8 }}>
                          <button onClick={() => handleMarkHelpful(review._id, true)} style={{ display:"flex", alignItems:"center", gap: 5, padding:"5px 10px", borderRadius: 7, border:"1px solid var(--edge)", background:"none", cursor:"pointer", fontSize: 12, color:"var(--ink2)", transition:"all var(--tr)" }} onMouseEnter={e => (e.currentTarget.style.background ="var(--accent-bg)")} onMouseLeave={e => (e.currentTarget.style.background ="none")}>
                            {Icons.like?.(13)} Helpful ({review.helpful})
                          </button>
                          <button onClick={() => handleMarkHelpful(review._id, false)} style={{ display:"flex", alignItems:"center", gap: 5, padding:"5px 10px", borderRadius: 7, border:"1px solid var(--edge)", background:"none", cursor:"pointer", fontSize: 12, color:"var(--ink2)", transition:"all var(--tr)" }} onMouseEnter={e => (e.currentTarget.style.background ="var(--accent-bg)")} onMouseLeave={e => (e.currentTarget.style.background ="none")}>
                            {Icons.dislike?.(13)} ({review.notHelpful})
                          </button>
                          {review.isEdited && <span style={{ fontSize: 11, color:"var(--ink3)", alignSelf:"center" }}>Edited</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  REVIEW DRAWER  */}
      {reviewDrawerVisible && selectedBookForReview && (
        <div className="drawer-bg" onClick={() => setReviewDrawerVisible(false)}>
          <div className="drawer-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--edge)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink: 0 }}>
              <div style={{ fontFamily:"var(--font)", fontSize: 16, fontWeight: 800, color:"var(--ink)" }}>{editingReview ?"Edit Review" :"Write a Review"}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setReviewDrawerVisible(false)}>{Icons.x?.(18)}</button>
            </div>
            <div style={{ padding:"24px", overflowY:"auto", flex: 1 }}>
              <div style={{ display:"flex", gap: 14, alignItems:"center", marginBottom: 24, padding:"14px", borderRadius: 7, background:"var(--bg)" }}>
                <img src={selectedBookForReview.book.coverImage ? `${uri}/${selectedBookForReview.book.coverImage}` :""} alt={selectedBookForReview.book.title}
                  style={{ width: 52, borderRadius: 7, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display ="none"; }} />
                <div>
                  <div style={{ fontFamily:"var(--font)", fontSize: 14, fontWeight: 700, color:"var(--ink)" }}>{selectedBookForReview.book.title}</div>
                  <div style={{ fontSize: 12, color:"var(--ink2)" }}>{selectedBookForReview.book.author}</div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", display:"block", marginBottom: 8 }}>Your Rating *</label>
                <div style={{ display:"flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <span key={r} onClick={() => setReviewRating(r)} style={{ cursor:"pointer", transition:"transform var(--tr)" }}
                      onMouseEnter={e => (e.currentTarget.style.transform ="scale(1.3)")} onMouseLeave={e => (e.currentTarget.style.transform ="scale(1)")}>
                      {r <= reviewRating ? Icons.starFill?.(32) : Icons.star?.(32,"#d1d5db")}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", display:"block", marginBottom: 6 }}>Review Title *</label>
                <input className="inp" placeholder="Summarize your experience" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} maxLength={100} />
                <div style={{ fontSize: 11, color:"var(--ink3)", marginTop: 3, textAlign:"right" }}>{reviewTitle.length}/100</div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", display:"block", marginBottom: 6 }}>Your Review *</label>
                <textarea className="inp" placeholder="Share your thoughts about this book" value={reviewText} onChange={e => setReviewText(e.target.value)} maxLength={1000} rows={6} />
                <div style={{ fontSize: 11, color:"var(--ink3)", marginTop: 3, textAlign:"right" }}>{reviewText.length}/1000</div>
              </div>
              <div style={{ display:"flex", gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent:"center" }} onClick={handleSubmitReview}>
                  {editingReview ?"Update Review" :"Submit Review"}
                </button>
                <button className="btn btn-ghost" onClick={() => setReviewDrawerVisible(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  EBOOK READER  */}
      {openReader && selectedBook && (
        <EbookReaderModal
          open={openReader}
          pdfUrl={`${uri}${selectedBook.book.pdfFile}`}
          onClose={() => { setOpenReader(false); setSelectedBook(null); }}
        />
      )}
    </>
  );
}