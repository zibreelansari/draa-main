import React, { useEffect, useState, useRef, useCallback, useMemo } from"react";
import toast from '../../utils/toast';
import { useParams, useNavigate } from"react-router-dom";
import { notification } from"antd";
import ReactPlayer from"react-player";
import uri, { getImageUrl } from "../../url";
import { getStoredUser } from "../../utils/global_auth";
import DashboardLayout from "../../student-dashboards/layouts/DashboardLayout";
import DashboardLoader from "../../student-dashboards/components/DashboardLoader";

//  Material UI
import {
  Box, Typography, Button, IconButton, Chip, Avatar, Stack, Grid, Card, CardContent,
  Divider, LinearProgress, CircularProgress, Tooltip, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  ListItemText, ListItemButton,
  Badge, Drawer, Fab, alpha, useTheme, Fade
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  CheckCircle as CheckFilledIcon,
  AccessTime as TimeIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Slideshow as PptIcon,
  Article as WordIcon,
  OndemandVideo as OndemandVideoIcon,
  Lock as LockIcon,
  Visibility as EyeIcon,
  Bookmark as BookmarkIcon,
  Note as NoteIcon,
  NoteAdd as NoteAddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Replay10 as Replay10Icon,
  Forward10 as Forward10Icon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Fullscreen as FullscreenIcon,
  BarChart as ChartIcon,
  Language as LanguageIcon,
  School as LevelIcon,
  MenuBook as BookIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';

// ─────────────────────────────────────────────
//  DRM / SCREEN PROTECTION (preserved)
// ─────────────────────────────────────────────
const useScreenProtection = () => {
  useEffect(() => {
    const BLOCKED: Set<string> = new Set(['PrintScreen','F12','F11']);
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const k = e.key.toLowerCase();
      if (
        BLOCKED.has(e.key) ||
        (ctrl && ['p','s','u','a'].includes(k)) ||
        (ctrl && shift && ['i','j','c','k','s'].includes(k))
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key ==='PrintScreen') {
        e.preventDefault();
        try { navigator.clipboard.writeText(''); } catch (_) { }
      }
    };
    const onContext = (e: MouseEvent) => e.preventDefault();
    const onDrag = (e: DragEvent) => e.preventDefault();
    const onSelect = (e: Event) => e.preventDefault();
    document.addEventListener('keydown', onKeyDown, { capture: true });
    document.addEventListener('keyup', onKeyUp, { capture: true });
    document.addEventListener('contextmenu', onContext, { capture: true });
    document.addEventListener('dragstart', onDrag, { capture: true });
    document.addEventListener('selectstart', onSelect, { capture: true });
    const devTimer = setInterval(() => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        document.body.style.filter ='blur(24px)';
      } else {
        document.body.style.filter ='none';
      }
    }, 1000);
    return () => {
      document.removeEventListener('keydown', onKeyDown, { capture: true });
      document.removeEventListener('keyup', onKeyUp, { capture: true });
      document.removeEventListener('contextmenu', onContext, { capture: true });
      document.removeEventListener('dragstart', onDrag, { capture: true });
      document.removeEventListener('selectstart', onSelect, { capture: true });
      clearInterval(devTimer);
      document.body.style.filter ='none';
    };
  }, []);
};

const useFocusBlur = (): boolean => {
  const [blurred, setBlurred] = useState(false);
  useEffect(() => {
    const onBlur = () => setBlurred(true);
    const onFocus = () => setBlurred(false);
    const onVisChange = () => setBlurred(document.visibilityState ==='hidden');
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);
  return blurred;
};

const ScreenWatermark: React.FC<{ email?: string; name?: string }> = ({ email, name }) => {
  const label = ((email || name ||'Draa User')).toUpperCase();
  const ts = new Date().toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' });
  const svgTile = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='140'>` +
    `<text x='50%' y='44%' font-family='monospace' font-size='11.5'` +
    ` fill='rgba(0,0,0,0.052)' text-anchor='middle' dominant-baseline='middle'` +
    ` transform='rotate(-22 210 70)'>${label} · Draa -Sabko Padhao</text>` +
    `<text x='50%' y='68%' font-family='monospace' font-size='9'` +
    ` fill='rgba(0,0,0,0.038)' text-anchor='middle' dominant-baseline='middle'` +
    ` transform='rotate(-22 210 70)'>${ts} · PROTECTED CONTENT</text>` +
    `</svg>`
  );
  return (
    <Box sx={{ position:'fixed', inset: 0, pointerEvents:'none', zIndex: 8999, overflow:'hidden' }} aria-hidden="true">
      <Box sx={{ position:'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,${svgTile}")`, backgroundRepeat:'repeat' }} />
    </Box>
  );
};

const FocusLockOverlay: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <Box sx={{ position:'fixed', inset: 0, background:'rgba(8,6,20,0.97)', zIndex: 9800, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 2.25, backdropFilter:'blur(40px)' }} onClick={() => window.focus()}>
      <Box sx={{ width: 96, height: 96, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 60px rgba(94,107,255,.6), 0 0 120px rgba(94,107,255,.25)', animation:'pulse 2s ease-in-out infinite' }}>
        <LockIcon sx={{ fontSize: 46, color:'white' }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: 28, color:'white', letterSpacing:'-0.02em', textAlign:'center' }}>Content Protected</Typography>
      <Typography sx={{ color:'rgba(255,255,255,.5)', fontSize: 15, maxWidth: 380, textAlign:'center', lineHeight: 1.65 }}>
        This course is protected by Draa DRM.<br />
        <strong style={{ color:'rgba(255,255,255,.75)' }}>Click anywhere to resume watching.</strong>
      </Typography>
      <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Draa Content Protection Active" sx={{ background:'rgba(16,185,129,.12)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,.3)', fontWeight: 700, '& .MuiChip-icon': { color:'#6ee7b7' } }} />
      <Typography sx={{ color:'rgba(255,255,255,.2)', fontSize: 11, mt: 0.75 }}>Unauthorized recording or distribution is a violation of our Terms of Service</Typography>
    </Box>
  );
};

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
interface LoginUser { name?: string; email?: string; id?: string; token?: string;[k: string]: any; }

interface Chapter {
  _id: string;
  chapter_name: string;
  study_material?: string;
  practice_set?: string;
  youtube_video?: string;
  other_materials?: string[];
}

interface CourseData {
  _id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  duration: number;
  coverphoto: string;
  youtube_link: string;
  chapters: Chapter[];
  teacher_details: { tname: string; tspecialization: string; tprofile: string; };
  skill_level: string;
  language: string;
  syllabus?: string;
  materials?: Array<{ name: string; path: string; type: string }>;
}

export interface ChapterMaterial {
  id: string;
  title: string;
  type: 'study' | 'practice' | 'video' | 'other' | 'syllabus';
  fileUrl: string | null;
  ext: string;
  isYoutube?: boolean;
  rawPath: string;
}

const getChapterMaterials = (ch: Chapter | null): ChapterMaterial[] => {
  if (!ch) return [];
  const list: ChapterMaterial[] = [];

  // 1. Study Material
  if (ch.study_material && ch.study_material.trim()) {
    const raw = ch.study_material.trim();
    const ytUrl = cleanYT(raw);
    const isYt = !!ytUrl && (raw.includes('youtube.com') || raw.includes('youtu.be'));
    const ext = getFileExt(raw);
    list.push({
      id: 'study_material',
      title: 'Study Material',
      type: isYt ? 'video' : 'study',
      fileUrl: isYt ? ytUrl : getImageUrl(raw),
      ext: isYt ? 'youtube' : ext,
      isYoutube: isYt,
      rawPath: raw
    });
  }

  // 2. YouTube Video
  if (ch.youtube_video && ch.youtube_video.trim()) {
    const raw = ch.youtube_video.trim();
    const ytUrl = cleanYT(raw);
    if (ytUrl) {
      list.push({
        id: 'youtube_video',
        title: 'Chapter Video',
        type: 'video',
        fileUrl: ytUrl,
        ext: 'youtube',
        isYoutube: true,
        rawPath: raw
      });
    }
  }

  // 3. Practice Set
  if (ch.practice_set && ch.practice_set.trim()) {
    const raw = ch.practice_set.trim();
    const ytUrl = cleanYT(raw);
    const isYt = !!ytUrl && (raw.includes('youtube.com') || raw.includes('youtu.be'));
    const ext = getFileExt(raw);
    list.push({
      id: 'practice_set',
      title: 'Practice Set',
      type: isYt ? 'video' : 'practice',
      fileUrl: isYt ? ytUrl : getImageUrl(raw),
      ext: isYt ? 'youtube' : ext,
      isYoutube: isYt,
      rawPath: raw
    });
  }

  // 4. Other Materials
  if (Array.isArray(ch.other_materials)) {
    ch.other_materials.forEach((matPath, idx) => {
      if (matPath && matPath.trim()) {
        const raw = matPath.trim();
        const ytUrl = cleanYT(raw);
        const isYt = !!ytUrl && (raw.includes('youtube.com') || raw.includes('youtu.be'));
        const ext = getFileExt(raw);
        const filename = raw.split('/').pop() || `Material ${idx + 1}`;
        const cleanTitle = filename.replace(/^[0-9]+-/, '');
        list.push({
          id: `other_material_${idx}`,
          title: cleanTitle.length > 25 ? cleanTitle.substring(0, 22) + '...' : cleanTitle,
          type: 'other',
          fileUrl: isYt ? ytUrl : getImageUrl(raw),
          ext: isYt ? 'youtube' : ext,
          isYoutube: isYt,
          rawPath: raw
        });
      }
    });
  }

  return list;
};

interface ChapterProgress {
  chapter_id: string;
  chapter_name: string;
  chapter_index: number;
  status: string;
  time_spent: number;
  completion_percentage: number;
  completed_at?: string;
  last_accessed_at?: string;
  video_progress?: { watched_duration: number; total_duration: number; completion_rate: number; };
  interactions?: { bookmarks: any[]; notes: any[]; };
}

interface CourseProgress {
  _id: string;
  overall_progress: {
    completion_percentage: number;
    status: string;
    total_time_spent: number;
    effective_learning_time: number;
    chapters_completed: number;
    chapters_in_progress: number;
    introduction_watched: boolean;
    last_chapter_accessed: { chapter_id: string; chapter_index: number; accessed_at: string; };
  };
  chapters: ChapterProgress[];
  milestones: Array<{ type: string; description: string; achieved_at: string; points_earned: number; }>;
  analytics: {
    daily_streaks: { current_streak: number; longest_streak: number; last_activity_date: string; };
    performance_metrics: { focus_score: number; consistency_score: number; engagement_score: number; overall_performance_score: number; };
    learning_patterns: { avg_session_duration: number; total_sessions: number; preferred_learning_time: string; learning_velocity: number; };
  };
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const getAllNotes = (courseProgress: CourseProgress | null, courseData: CourseData | null) => {
  if (!courseProgress || !courseData) return [];
  const notes: Array<{ noteContent: string; noteIndex: number; chapterId: string; chapterName: string; chapterIndex: number; createdAt?: string; }> = [];
  courseProgress.chapters.forEach((cp) => {
    const chapter = courseData.chapters.find(c => c._id === cp.chapter_id);
    if (!chapter) return;
    (cp.interactions?.notes || []).forEach((n: any, ni: number) => {
      notes.push({
        noteContent: n.content || n,
        noteIndex: ni,
        chapterId: cp.chapter_id,
        chapterName: cp.chapter_name || chapter.chapter_name,
        chapterIndex: cp.chapter_index,
        createdAt: n.created_at || n.createdAt
      });
    });
  });
  return notes;
};

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const cleanYT = (url?: string | null) => {
  if (!url) return null;
  try {
    const d = url.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').trim();
    const m = d.match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return m ? `https://www.youtube.com/watch?v=${m[1]}` : d;
  } catch { return url; }
};

const getFileExt = (filename?: string): string => {
  if (!filename) return '';
  const fn = filename.split('/').pop() || '';
  return fn.split('.').pop()?.toLowerCase() || '';
};

const capitalize = (s?: string) => {
  if (!s) return 'Beginner';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// ─────────────────────────────────────────────
//  STAT TILE COMPONENTS
// ─────────────────────────────────────────────
interface StatTileProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'secondary';
  sub?: string;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, icon, color = 'primary', sub }) => {
  const theme = useTheme();
  return (
    <Box sx={{
      textAlign:'center', p: 1.25, borderRadius: 2,
      background: alpha(theme.palette[color].main, 0.08),
      border: `1px solid ${alpha(theme.palette[color].main, 0.15)}`,
    }}>
      <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center" sx={{ mb: 0.25 }}>
        <Box sx={{ color: `${color}.main`, display:'flex' }}>{icon}</Box>
      </Stack>
      <Typography sx={{ fontWeight: 800, fontSize: 22, color: `${color}.main`, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, mt: 0.5, textTransform:'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.25 }}>{sub}</Typography>}
    </Box>
  );
};

const ProgressRing: React.FC<{ pct: number; size?: number; stroke?: number }> = ({ pct, size = 120, stroke = 8 }) => {
  const theme = useTheme();
  const value = Math.min(100, Math.max(0, pct || 0));
  return (
    <Box sx={{ position:'relative', display:'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={stroke * 100 / size}
        sx={{ color: alpha(theme.palette.primary.main, 0.12), position:'absolute' }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={stroke * 100 / size}
        sx={{
          color:'primary.main',
          '& .MuiCircularProgress-circle': { strokeLinecap:'round', transition:'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }
        }}
      />
      <Box sx={{ position:'absolute', inset: 0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: size > 100 ? 28 : 20, color: 'text.primary', lineHeight: 1 }}>{Math.round(value)}%</Typography>
        <Typography sx={{ fontSize: '0.65rem', color:'text.secondary', fontWeight: 700, textTransform:'uppercase', letterSpacing: '0.05em', mt: 0.25 }}>Complete</Typography>
      </Box>
    </Box>
  );
};

const Av: React.FC<{ name?: string; size?: number; src?: string }> = ({ name, size = 36, src }) => {
  const safeName = (name || "Student").trim();
  const parts = safeName.split(/\s+/).filter(Boolean);
  const ini = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : safeName.slice(0, 2).toUpperCase();
  if (src) {
    return <Avatar src={src} alt={name} sx={{ width: size, height: size }} onError={(e: any) => { e.target.style.display = "none"; }} />;
  }
  return (
    <Avatar sx={{
      width: size, height: size, fontWeight: 800, fontSize: size * 0.36,
      background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: 'white',
    }}>
      {ini}
    </Avatar>
  );
};

// ─────────────────────────────────────────────
//  CHAPTER CONTENT RENDERER (with secure viewers)
// ─────────────────────────────────────────────
const DOC_CSS = `body{font-family:'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.8;color:#1a1a2a;padding:48px 56px;max-width:860px;margin:0 auto;background:#fff}h1,h2,h3,h4,h5,h6{color:#2d1b69;font-weight:700;margin-top:1.6em;margin-bottom:.5em}h1{font-size:2em;border-bottom:2px solid #ede9fe;padding-bottom:10px}p{margin-bottom:1em}table{border-collapse:collapse;width:100%;margin:1.5em 0}td,th{border:1px solid #d1d5db;padding:10px 14px}th{background:#f5f3ff;font-weight:600;color:#4c1d95}tr:nth-child(even){background:#fafafa}img{max-width:100%;border-radius:8px;margin:1em 0}ul,ol{margin:.8em 0 .8em 2em}li{margin-bottom:.4em}strong,b{color:#3b0764}blockquote{border-left:4px solid #7c3aed;padding:8px 20px;margin:1.2em 0;background:#faf5ff;color:#5b21b6;border-radius:0 8px 8px 0}*{-webkit-user-select:none!important;user-select:none!important}`;

const WordViewer: React.FC<{ fileUrl: string; chapterName: string; onView?: () => void }> = ({ fileUrl, chapterName, onView }) => {
  const [html, setHtml] = useState("");
  const [st, setSt] = useState<"loading" |"done" |"error">("loading");
  const [fs, setFs] = useState(false);
  const theme = useTheme();
  useEffect(() => {
    let cancelled = false; setSt("loading"); setHtml("");
    (async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error();
        const ab = await res.arrayBuffer();
        // @ts-ignore
        const m = await import("mammoth/mammoth.browser");
        const r = await m.convertToHtml({ arrayBuffer: ab });
        if (!cancelled) { setHtml(r.value); setSt("done"); onView?.(); }
      } catch { if (!cancelled) setSt("error"); }
    })();
    return () => { cancelled = true; };
  }, [fileUrl]);
  const srcDoc = `<!DOCTYPE html><html><head><style>${DOC_CSS}</style></head><body>${html}</body></html>`;
  return (
    <Box sx={{ borderRadius: 2, overflow:'hidden', border: '1.5px solid', borderColor:'divider', boxShadow: 1 }}>
      <Box sx={{ background:'linear-gradient(135deg,#0f0b2d 0%,#1e1060 40%,#3b1fa8 70%,#1a0e4f 100%)', px: 2.5, py: 1.75, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ width: 36, height: 36, borderRadius: 1.25, bgcolor:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <WordIcon sx={{ fontSize: 18, color:'#60a5fa' }} />
          </Box>
          <Box>
            <Typography sx={{ color:'#ffffff !important', fontWeight: 700, fontSize: 14, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{chapterName}</Typography>
            <Typography sx={{ color:'rgba(255,255,255,.85) !important', fontSize: 11.5 }}>Word Document · Read-only</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Protected" size="small" sx={{ bgcolor:'rgba(16,185,129,.15)', color:'#10b981', border:'1px solid rgba(16,185,129,.35)', fontWeight: 700, '& .MuiChip-icon': { color:'#10b981' } }} />
          <IconButton size="small" onClick={() => setFs(true)} sx={{ bgcolor:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.18)', color:'white', '&:hover': { bgcolor:'rgba(255,255,255,.2)' } }}>
            <FullscreenIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
      <Box sx={{ background: alpha(theme.palette.primary.main, 0.04), minHeight: 300 }}>
        {st ==="loading" && (
          <Stack alignItems="center" justifyContent="center" sx={{ height: 400 }} spacing={1.75}>
            <CircularProgress size={36} />
            <Typography sx={{ color:'text.secondary', fontSize: 13 }}>Loading document</Typography>
          </Stack>
        )}
        {st ==="error" && (
          <Stack alignItems="center" justifyContent="center" sx={{ height: 400 }} spacing={1.5}>
            <FileIcon sx={{ fontSize: 48, color:'divider' }} />
            <Typography sx={{ color:'text.secondary', fontSize: 13 }}>Unable to load document</Typography>
          </Stack>
        )}
        {st ==="done" && <iframe srcDoc={srcDoc} width="100%" height="760px" title={chapterName} style={{ border:"none", display:"block" }} sandbox="allow-same-origin" onContextMenu={(e) => e.preventDefault()} />}
      </Box>
      <Box sx={{ background:'#faf8ff', borderTop:'1px solid', borderColor:'divider', px: 2.25, py: 1.125, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <EyeIcon sx={{ fontSize: 14, color:'primary.main' }} />
          <Typography sx={{ color:'primary.main', fontSize: 11.5, fontWeight: 600 }}>View-only · Downloading disabled</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <LockIcon sx={{ fontSize: 12, color:'text.secondary' }} />
          <Typography sx={{ color:'text.secondary', fontSize: 10.5 }}>© Draa</Typography>
        </Stack>
      </Box>
      {fs && (
        <Box sx={{ position:'fixed', inset: 0, background:'rgba(0,0,0,.9)', zIndex: 9999, display:'flex', flexDirection:'column' }}>
          <Box sx={{ background:'linear-gradient(135deg,#0f0b2d,#1e1060)', px: 2.5, py: 1.5, display:'flex', justifyContent:'flex-end' }}>
            <Button size="small" onClick={() => setFs(false)} sx={{ color:'white', bgcolor:'rgba(255,255,255,.1)', '&:hover': { bgcolor:'rgba(255,255,255,.2)' } }}>Close</Button>
          </Box>
          <Box sx={{ flex: 1, overflow:'hidden' }}>
            {st ==="done" && <iframe srcDoc={srcDoc} width="100%" height="100%" title={chapterName} style={{ border:"none", display:"block" }} sandbox="allow-same-origin" />}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const IframeViewer: React.FC<{ fileUrl: string; fileExt: string; chapterName: string; onView?: () => void }> = ({ fileUrl, fileExt, chapterName, onView }) => {
  const [fs, setFs] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const isPdf = fileExt === "pdf";

  const src = isPdf
    ? `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`
    : (fileUrl.startsWith('http://127.0.0.1') || fileUrl.startsWith('http://localhost') || fileUrl.startsWith('/')
        ? fileUrl
        : `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`);

  const icon = isPdf ? <PdfIcon sx={{ fontSize: 18, color:'#f87171' }} /> : <PptIcon sx={{ fontSize: 18, color:'#fb923c' }} />;
  const label = isPdf ? "PDF Document" : "Presentation";

  useEffect(() => {
    let cancelled = false;
    setLoadFailed(false);
    if (!fileUrl) {
      setLoadFailed(true);
      return;
    }
    fetch(fileUrl, { method: "GET" })
      .then((r) => {
        if (!cancelled && r.status === 404) setLoadFailed(true);
      })
      .catch(() => {
        // Do not fail on CORS or fetch catch for static media; let embed/iframe try loading
      });
    return () => { cancelled = true; };
  }, [fileUrl]);

  return (
    <Box sx={{ borderRadius: 2, overflow:'hidden', border: '1.5px solid', borderColor:'divider', boxShadow: 1 }}>
      <Box sx={{ background:'linear-gradient(135deg,#0f0b2d 0%,#1e1060 40%,#3b1fa8 70%,#1a0e4f 100%)', px: 2.5, py: 1.75, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ width: 36, height: 36, borderRadius: 1.25, bgcolor:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</Box>
          <Box>
            <Typography sx={{ color:'#ffffff !important', fontWeight: 700, fontSize: 14, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{chapterName}</Typography>
            <Typography sx={{ color:'rgba(255,255,255,.85) !important', fontSize: 11.5 }}>{label} · Read-only</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Protected" size="small" sx={{ bgcolor:'rgba(16,185,129,.15)', color:'#10b981', border:'1px solid rgba(16,185,129,.35)', fontWeight: 700, '& .MuiChip-icon': { color:'#10b981' } }} />
          <IconButton size="small" onClick={() => setFs(true)} sx={{ bgcolor:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.18)', color:'white', '&:hover': { bgcolor:'rgba(255,255,255,.2)' } }}>
            <FullscreenIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
      <Box sx={{ position:'relative', background:'#f8f7ff', minHeight: 400 }}>
        {loadFailed ? (
          <Box sx={{ textAlign:'center', py: 6, px: 4 }}>
            <FileIcon sx={{ fontSize: 56, color:'text.disabled', mb: 2 }} />
            <Typography sx={{ fontSize: 16, fontWeight: 700, color:'text.secondary', mb: 1 }}>File unavailable</Typography>
            <Typography sx={{ color:'text.secondary', fontSize: 13 }}>The {label.toLowerCase()} for this chapter could not be loaded. Please contact your teacher.</Typography>
          </Box>
        ) : isPdf ? (
          <>
            <object
              data={src}
              type="application/pdf"
              width="100%"
              height="760px"
              style={{ border: "none", display: "block" }}
              onLoad={onView}
              onError={() => setLoadFailed(true)}
            >
              <iframe
                src={src}
                width="100%"
                height="760px"
                title={chapterName}
                style={{ border: "none", display: "block" }}
                onLoad={onView}
                onContextMenu={(e) => e.preventDefault()}
              />
            </object>
            <Box sx={{ position:'absolute', bottom: 0, left: 0, right: 0, height: 40, background:'#f8f7ff', zIndex: 10, pointerEvents: 'none' }} />
          </>
        ) : (
          <iframe
            src={src}
            width="100%"
            height="760px"
            title={chapterName}
            style={{ border: "none", display: "block" }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={onView}
            onError={() => setLoadFailed(true)}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </Box>
      <Box sx={{ background:'#faf8ff', borderTop:'1px solid', borderColor:'divider', px: 2.25, py: 1.125, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <EyeIcon sx={{ fontSize: 14, color:'primary.main' }} />
          <Typography sx={{ color:'primary.main', fontSize: 11.5, fontWeight: 600 }}>View-only · Downloading disabled</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <LockIcon sx={{ fontSize: 12, color:'text.secondary' }} />
          <Typography sx={{ color:'text.secondary', fontSize: 10.5 }}>© Draa</Typography>
        </Stack>
      </Box>
      {fs && !loadFailed && (
        <Box sx={{ position:'fixed', inset: 0, background:'rgba(0,0,0,.9)', zIndex: 9999, display:'flex', flexDirection:'column' }}>
          <Box sx={{ background:'linear-gradient(135deg,#0f0b2d,#1e1060)', px: 2.5, py: 1.5, display:'flex', justifyContent:'flex-end' }}>
            <Button size="small" onClick={() => setFs(false)} sx={{ color:'white', bgcolor:'rgba(255,255,255,.1)', '&:hover': { bgcolor:'rgba(255,255,255,.2)' } }}>Close</Button>
          </Box>
          <Box sx={{ flex: 1, overflow:'hidden' }}>
            {isPdf ? (
              <object data={src} type="application/pdf" width="100%" height="100%" style={{ border: "none", display: "block" }}>
                <iframe src={src} width="100%" height="100%" title={chapterName} style={{ border: "none", display: "block" }} />
              </object>
            ) : (
              <iframe src={src} width="100%" height="100%" title={chapterName} style={{ border: "none", display: "block" }} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const SecureViewer = (p: { fileUrl: string; fileExt: string; chapterName: string; onView?: () => void }) =>
  ["doc","docx"].includes(p.fileExt)
    ? <WordViewer fileUrl={p.fileUrl} chapterName={p.chapterName} onView={p.onView} />
    : <IframeViewer {...p} />;

// ─────────────────────────────────────────────
//  API
// ─────────────────────────────────────────────
const API_BASE = `${uri}/student/courses/progress`;

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
export default function EnhancedCourseLearnPage() {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [currentChapter, setCurrentChapter] = useState(-1);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chapterStartTime, setChapterStartTime] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<{ [k: string]: number }>({});
  const [realtimeProgress, setRealtimeProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [rightTab, setRightTab] = useState<0 | 1>(0);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [noteFilterChapter, setNoteFilterChapter] = useState<string | 'all'>('all');
  const [noteSearch, setNoteSearch] = useState('');

  useScreenProtection();
  const isWindowBlurred = useFocusBlur();

  const { courseId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<any>(null);
  const sessionStart = useRef(Date.now());
  const lastUpd = useRef(0);
  const timerRef = useRef<any>(null);
  const actBuf = useRef<any[]>([]);

  // ─── Data fetchers (preserve all existing logic) ───
  const initProgress = useCallback(async () => {
    if (!loginUser.id || !courseId || !courseData) return;
    try {
      const r = await fetch(`${API_BASE}/${loginUser.id}/${courseId}?` + new URLSearchParams({
        student_name: loginUser.name ||"",
        student_email: loginUser.email ||"",
        course_title: courseData.title,
        course_duration: courseData.duration.toString(),
        total_chapters: courseData.chapters.length.toString()
      }), { headers: { Authorization: `Bearer ${loginUser.token}` } });
      const d = await r.json();
      if (d.success) {
        setCourseProgress(d.data);
        setCompletedChapters(d.data.chapters.filter((c: any) => c.status ==="completed").map((c: any) => c.chapter_index));
        setRealtimeProgress(d.data.overall_progress.completion_percentage);
        if (d.data.overall_progress.last_chapter_accessed?.chapter_index >= 0) {
          setCurrentChapter(d.data.overall_progress.last_chapter_accessed.chapter_index);
        }
      }
      try {
        const sr = await fetch(`${API_BASE}/${loginUser.id}/${courseId}/session/start`, {
          method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` },
          body: JSON.stringify({ device_info: { browser: navigator.userAgent, os: navigator.platform, device:"web" } })
        });
        const sd = await sr.json();
        if (sd.success) { setCurrentSessionId(sd.data.session_id); sessionStart.current = Date.now(); }
      } catch (e) { console.error(e); }
    } catch (e) { console.error(e); }
  }, [loginUser.id, courseId, courseData]);

  const updateChapter = async (idx: number, status: string, timeSpent?: number, pct?: number) => {
    if (!loginUser.id || !courseId || !courseData || idx < 0) return;
    try {
      const ch = courseData.chapters[idx];
      const r = await fetch(`${API_BASE}/${loginUser.id}/${courseId}/chapter`, {
        method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` },
        body: JSON.stringify({
          chapter_id: ch._id, chapter_name: ch.chapter_name, chapter_index: idx,
          status, time_spent: timeSpent || 0,
          completion_percentage: pct !== undefined ? pct : (status ==="completed" ? 100 : 0),
          video_progress: {
            watched_duration: videoProgress[ch._id] || 0,
            total_duration: 0,
            completion_rate: videoProgress[ch._id] || 0
          }
        })
      });
      const res = await r.json();
      if (res.success) {
        setRealtimeProgress(res.data.overall_progress.completion_percentage);
        if (res.data.new_milestones?.length) {
          res.data.new_milestones.forEach((m: any) => notification.success({
            message:" Milestone Achieved!", description: m.description, placement:"topRight", duration: 5
          }));
        }
        refreshProgress();
      }
    } catch (e) { console.error(e); }
  };

  const updateIntro = async (watched: boolean, t?: number) => {
    if (!loginUser.id || !courseId) return;
    try {
      const r = await fetch(`${API_BASE}/${loginUser.id}/${courseId}/introduction`, {
        method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` },
        body: JSON.stringify({ watched, watch_time: t || 0 })
      });
      const d = await r.json();
      if (d.success) refreshProgress();
    } catch (e) { console.error(e); }
  };

  const logAct = async (type: string, details?: any) => {
    if (!currentSessionId) return;
    actBuf.current.push({ type, details, timestamp: new Date().toISOString() });
    if (actBuf.current.length >= 5) flushBuf();
  };

  const flushBuf = async () => {
    if (!actBuf.current.length || !currentSessionId) return;
    try {
      const a = [...actBuf.current]; actBuf.current = [];
      await fetch(`${API_BASE}/${loginUser.id}/${courseId}/activities/batch`, {
        method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` },
        body: JSON.stringify({ session_id: currentSessionId, activities: a })
      });
    } catch (e) { console.error(e); }
  };

  const endSession = async () => {
    if (!currentSessionId || !loginUser.id || !courseId) return;
    try {
      await flushBuf();
      await fetch(`${API_BASE}/${loginUser.id}/${courseId}/session/end`, {
        method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` },
        body: JSON.stringify({
          session_id: currentSessionId, end_time: new Date().toISOString(),
          total_duration: Math.floor((Date.now() - sessionStart.current) / 1000)
        })
      });
    } catch (e) { console.error(e); }
  };

  const refreshProgress = async () => {
    if (!loginUser.id || !courseId) return;
    try {
      const r = await fetch(`${API_BASE}/${loginUser.id}/${courseId}`, { headers: { Authorization: `Bearer ${loginUser.token}` } });
      const d = await r.json();
      if (d.success) {
        setCourseProgress(d.data);
        setRealtimeProgress(d.data.overall_progress.completion_percentage);
      }
    } catch (e) { console.error(e); }
  };

  const markDone = async (idx: number) => {
    const ts = chapterStartTime ? Math.floor((Date.now() - chapterStartTime) / 1000) : 0;
    if (!completedChapters.includes(idx)) {
      setCompletedChapters(p => [...p, idx]);
      await updateChapter(idx,"completed", ts, 100);
      await logAct("chapter_complete", { chapter_index: idx, time_spent: ts });
      toast.success("Chapter completed!");
    }
  };

  const changeChapter = async (n: number) => {
    if (currentChapter >= 0 && chapterStartTime) {
      await updateChapter(currentChapter,"in_progress", Math.floor((Date.now() - chapterStartTime) / 1000));
    }
    setCurrentChapter(n);
    setChapterStartTime(Date.now());
    setPlaying(false);
    setPlayerKey(p => p + 1);
    if (n >= 0) { await updateChapter(n,"in_progress"); await logAct("chapter_access", { chapter_index: n }); }
  };

  const handleVid = (prog: { played: number; playedSeconds: number }, chId?: string) => {
    if (!chId) return;
    const pct = prog.played * 100;
    setVideoProgress(p => ({ ...p, [chId]: pct }));
    if (pct >= 95) {
      const idx = courseData?.chapters.findIndex(c => c._id === chId);
      if (idx !== undefined && idx >= 0 && !completedChapters.includes(idx)) markDone(idx);
    }
  };

  const saveNote = async () => {
    if (!currentNote.trim() || currentChapter < 0) return;
    const ch = courseData?.chapters[currentChapter];
    if (!ch) return;
    try {
      await fetch(`${API_BASE}/${loginUser.id}/${courseId}/chapter/${ch._id}/note`, {
        method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` },
        body: JSON.stringify({ content: currentNote })
      });
      toast.success("Note saved!");
      setCurrentNote("");
      setShowNotes(false);
      await refreshProgress();
    } catch { toast.error("Failed to save note"); }
  };

  const addBookmark = async (ts: number) => {
    const ch = courseData?.chapters[currentChapter]; if (!ch || currentChapter < 0) return;
    try {
      await fetch(`${API_BASE}/${loginUser.id}/${courseId}/chapter/${ch._id}/bookmark`, {
        method:"POST", headers: {"Content-Type":"application/json", Authorization: `Bearer ${loginUser.token}` },
        body: JSON.stringify({ timestamp: ts, note: `Bookmark at ${fmtTime(ts)}` })
      });
      toast.success("Bookmark added!");
    } catch { toast.error("Failed"); }
  };

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      if (currentChapter >= 0 && chapterStartTime) {
        const ts = Math.floor((Date.now() - chapterStartTime) / 1000);
        if (ts > lastUpd.current + 30) {
          await updateChapter(currentChapter,"in_progress", ts);
          lastUpd.current = ts;
        }
      }
      if (actBuf.current.length) flushBuf();
    }, 30000);
    return () => clearInterval(timerRef.current);
  }, [currentChapter, chapterStartTime]);

  useEffect(() => { return () => { endSession(); }; }, [currentSessionId]);

  useEffect(() => {
    const u = getStoredUser();
    if (!u || !u.token || (!u.id && !u._id)) { navigate("/student-login"); return; }
    setLoginUser(u);
    loadCourse(u.id || u._id);
  }, [courseId]);

  useEffect(() => { if (courseData && loginUser.id) initProgress(); }, [courseData, loginUser.id]);

  const loadCourse = async (sid: string) => {
    try {
      setLoading(true);
      const r = await fetch(`${uri}/students/course/payment/course-access/${sid}/${courseId}`);
      const d = await r.json();
      if (d.success && d.hasAccess) setCourseData(d.course);
      else setError("You do not have access to this course.");
    } catch { setError("Failed to verify course access"); }
    finally { setLoading(false); }
  };

  // ─── Derived data ───
  const allNotes = useMemo(() => getAllNotes(courseProgress, courseData), [courseProgress, courseData]);
  const totalNotesCount = allNotes.length;

  const chaptersWithNotes = useMemo(() => {
    const map = new Map<string, { id: string; name: string; index: number }>();
    allNotes.forEach(n => {
      if (!map.has(n.chapterId)) {
        map.set(n.chapterId, { id: n.chapterId, name: n.chapterName, index: n.chapterIndex });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.index - b.index);
  }, [allNotes]);

  const filteredNotes = useMemo(() => {
    return allNotes.filter(n => {
      const matchSearch = !noteSearch ||
        n.noteContent.toLowerCase().includes(noteSearch.toLowerCase()) ||
        n.chapterName.toLowerCase().includes(noteSearch.toLowerCase());
      const matchChapter = noteFilterChapter === 'all' || n.chapterId === noteFilterChapter;
      return matchSearch && matchChapter;
    });
  }, [allNotes, noteSearch, noteFilterChapter]);

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  // ─── ERROR STATE ───
  if (error || !courseData) {
    return (
      <DashboardLayout>
        <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'error.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <LockIcon sx={{ fontSize: 30, color: 'error.main' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Access Denied</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{error || "You don't have access to this course"}</Typography>
          <Button variant="contained" size="large" onClick={() => navigate(`/v2/student/my-courses/${loginUser.id || loginUser._id}`)}>
            Back to My Courses
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const chData = currentChapter >= 0 ? courseData.chapters[currentChapter] : null;

  // ─── RENDER ───
  return (
    <DashboardLayout>
      {/* Screen protection layers */}
      <ScreenWatermark email={loginUser.email} name={loginUser.name} />
      <FocusLockOverlay visible={isWindowBlurred} />

      {/* Protected content area */}
      <Box
        onContextMenu={(e) => { e.preventDefault(); toast.warning("Right-click is disabled for content protection."); }}
        onCopy={(e) => { e.preventDefault(); toast.error("Copy-pasting is prohibited on this platform."); }}
        onCut={(e) => { e.preventDefault(); }}
        onPaste={(e) => { e.preventDefault(); }}
        onDragStart={(e) => e.preventDefault()}
        sx={{
          userSelect:'none', WebkitUserSelect:'none',
          maxWidth: 1400, mx:'auto',
        }}
      >
        <Grid container spacing={3}>
          {/* LEFT COLUMN */}
          <Grid item xs={12} lg={8.5}>
            <Stack spacing={3}>
              {/* Current Chapter / Intro Hero */}
              <Fade in timeout={400}>
                <Box>
                  {currentChapter === -1
                    ? <IntroHero courseData={courseData} courseProgress={courseProgress} onMarkWatched={() => updateIntro(true).then(() => toast.success("Marked as watched!"))} playerKey={playerKey} playbackRate={playbackRate} setPlaying={setPlaying} playing={playing} cleanYT={cleanYT} handleVid={handleVid} updateIntro={updateIntro} logAct={logAct} />
                    : chData && <ChapterHero ch={chData} idx={currentChapter} totalChapters={courseData.chapters.length} courseProgress={courseProgress} completedChapters={completedChapters} markDone={markDone} setShowNotes={setShowNotes} addBookmark={addBookmark} playerRef={playerRef} playbackRate={playbackRate} setPlaybackRate={setPlaybackRate} playing={playing} setPlaying={setPlaying} playerKey={playerKey} handleVid={handleVid} updateChapter={updateChapter} logAct={logAct} />
                  }
                </Box>
              </Fade>

              {/* Previous / Next Navigation */}
              <ChapterNavigator
                currentChapter={currentChapter}
                totalChapters={courseData.chapters.length}
                sessionActive={!!currentSessionId}
                onPrev={() => changeChapter(Math.max(-1, currentChapter - 1))}
                onNext={() => changeChapter(Math.min(courseData.chapters.length - 1, currentChapter + 1))}
              />
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} lg={3.5}>
            <RightPanel
              courseData={courseData}
              courseProgress={courseProgress}
              realtimeProgress={realtimeProgress}
              completedChapters={completedChapters}
              currentChapter={currentChapter}
              changeChapter={changeChapter}
              rightTab={rightTab}
              setRightTab={setRightTab}
              totalNotesCount={totalNotesCount}
              filteredNotes={filteredNotes}
              chaptersWithNotes={chaptersWithNotes}
              noteSearch={noteSearch}
              setNoteSearch={setNoteSearch}
              noteFilterChapter={noteFilterChapter}
              setNoteFilterChapter={setNoteFilterChapter}
              onShowAnalytics={() => setShowAnalytics(true)}
              fmtTime={fmtTime}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Floating Notes FAB */}
      <Tooltip title="View all notes" placement="left">
        <Badge
          badgeContent={totalNotesCount}
          color="error"
          overlap="circular"
          sx={{
            position:'fixed', bottom: 28, right: 28, zIndex: 500,
            '& .MuiBadge-badge': { fontWeight: 800, fontSize: 10, border:'2px solid white', minWidth: 18, height: 18, p: 0 }
          }}
        >
          <Fab color="primary" onClick={() => setNotesDrawerOpen(true)} sx={{ boxShadow: '0 8px 24px rgba(99,102,241,0.45)', '&:hover': { transform:'translateY(-3px) scale(1.05)' }, transition:'all 0.2s' }}>
            <NoteIcon />
          </Fab>
        </Badge>
      </Tooltip>

      {/* Notes Drawer */}
      <NotesDrawer
        open={notesDrawerOpen}
        onClose={() => setNotesDrawerOpen(false)}
        courseProgress={courseProgress}
        courseData={courseData}
        onJumpToChapter={(idx) => { changeChapter(idx); setNotesDrawerOpen(false); }}
      />

      {/* Note Modal */}
      <NoteModal
        open={showNotes}
        onClose={() => { setShowNotes(false); setCurrentNote(""); }}
        note={currentNote}
        setNote={setCurrentNote}
        onSave={saveNote}
        chapterName={currentChapter >= 0 && courseData ? courseData.chapters[currentChapter]?.chapter_name : ''}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        courseProgress={courseProgress}
      />
    </DashboardLayout>
  );
}

// ════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════

// ─── Hero Banner (shared visual treatment for Intro / Chapter) ───
interface HeroBannerProps {
  badge: string;
  title: string;
  subtitle?: React.ReactNode;
  progressPct?: number;
  primaryAction: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ badge, title, subtitle, progressPct, primaryAction, secondaryActions }) => (
  <Box sx={{
    borderRadius: '20px 20px 0 0',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0f0b2d 0%, #1e1060 40%, #3b1fa8 70%, #1a0e4f 100%)',
    position: 'relative',
    px: { xs: 3, md: 4 },
    py: { xs: 3, md: 3.5 },
  }}>
    {/* Decorative glow blobs */}
    <Box sx={{ position:'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius:'50%', background:'rgba(94,107,255,.2)', filter:'blur(40px)', pointerEvents:'none' }} />
    <Box sx={{ position:'absolute', bottom: -20, left:'30%', width: 140, height: 140, borderRadius:'50%', background:'rgba(236,72,153,.15)', filter:'blur(30px)', pointerEvents:'none' }} />

    <Stack direction={{ xs:'column', md:'row' }} alignItems={{ xs:'flex-start', md:'flex-start' }} justifyContent="space-between" spacing={2} sx={{ position: 'relative', zIndex: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Chip
          label={badge}
          size="small"
          sx={{
            bgcolor:'rgba(255,255,255,.18)', color:'#ffffff !important',
            border:'1px solid rgba(255,255,255,.3)', fontWeight: 800, fontSize: 11,
            letterSpacing:'.05em', mb: 1.25, height: 24
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: 800, color:'#ffffff !important', textShadow:'0 2px 10px rgba(0,0,0,0.6)', lineHeight: 1.25, mb: subtitle ? 1 : 0, maxWidth: 540 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color:'rgba(255,255,255,.9) !important', fontSize: 14, lineHeight: 1.55 }}>
            {subtitle}
          </Typography>
        )}
        {progressPct !== undefined && progressPct > 0 && (
          <Box sx={{ background:'rgba(255,255,255,.15)', borderRadius: 1.25, p: '8px 14px', maxWidth: 320, mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography sx={{ color:'rgba(255,255,255,.85) !important', fontSize: 11, fontWeight: 600 }}>Video Progress</Typography>
              <Typography sx={{ color:'#ffffff !important', fontSize: 11, fontWeight: 800 }}>{Math.round(progressPct)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={Math.min(100, progressPct)} sx={{
              height: 4, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,.25)',
              '& .MuiLinearProgress-bar': { bgcolor: '#ffffff', borderRadius: 2 }
            }} />
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
        <Stack spacing={0.75} alignItems="stretch">
          {primaryAction}
          {secondaryActions && <Stack direction="row" spacing={0.75}>{secondaryActions}</Stack>}
        </Stack>
      </Stack>
    </Stack>
  </Box>
);

// ─── Chapter Hero (chapter content + actions) ───
interface ChapterHeroProps {
  ch: Chapter;
  idx: number;
  totalChapters: number;
  courseProgress: CourseProgress | null;
  completedChapters: number[];
  markDone: (idx: number) => void;
  setShowNotes: (b: boolean) => void;
  addBookmark: (ts: number) => void;
  playerRef: React.MutableRefObject<any>;
  playbackRate: number;
  setPlaybackRate: (r: number) => void;
  playing: boolean;
  setPlaying: (b: boolean | ((p: boolean) => boolean)) => void;
  playerKey: number;
  handleVid: (prog: { played: number; playedSeconds: number }, chId?: string) => void;
  updateChapter: (idx: number, status: string, ts?: number, pct?: number) => Promise<void>;
  logAct: (type: string, details?: any) => Promise<void>;
}

const ChapterHero: React.FC<ChapterHeroProps> = ({
  ch, idx, totalChapters, courseProgress, completedChapters, markDone, setShowNotes,
  addBookmark, playerRef, playbackRate, setPlaybackRate, playing, setPlaying, playerKey,
  handleVid, updateChapter, logAct
}) => {
  const theme = useTheme();
  const materials = useMemo(() => getChapterMaterials(ch), [ch]);
  const [selectedMatId, setSelectedMatId] = useState<string>('');

  const activeMaterial = useMemo(() => {
    if (!materials.length) return null;
    const found = materials.find(m => m.id === selectedMatId);
    return found || materials[0];
  }, [materials, selectedMatId]);

  const done = completedChapters.includes(idx);
  const cp = courseProgress?.chapters.find(c => c.chapter_id === ch._id);
  const vr = cp?.video_progress?.completion_rate || 0;
  const chapterNotes = cp?.interactions?.notes || [];

  const getMatIcon = (m: ChapterMaterial) => {
    if (m.isYoutube || ['mp4','webm','mkv'].includes(m.ext)) return <OndemandVideoIcon sx={{ fontSize: 18, color: '#3b82f6' }} />;
    if (m.ext === 'pdf') return <PdfIcon sx={{ fontSize: 18, color: '#ef4444' }} />;
    if (['ppt','pptx'].includes(m.ext)) return <PptIcon sx={{ fontSize: 18, color: '#f97316' }} />;
    if (['doc','docx'].includes(m.ext)) return <WordIcon sx={{ fontSize: 18, color: '#2563eb' }} />;
    return <FileIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />;
  };

  return (
    <Box sx={{ borderRadius: 2.5, overflow:'hidden', boxShadow: 1 }}>
      <HeroBanner
        badge={`CHAPTER ${idx + 1} OF ${totalChapters}`}
        title={ch.chapter_name || 'Untitled Chapter'}
        progressPct={vr}
        primaryAction={
          <Button
            onClick={() => markDone(idx)}
            disabled={done}
            variant={done ? 'contained' : 'outlined'}
            startIcon={done ? <CheckFilledIcon /> : <CheckIcon />}
            sx={{
              ...(done
                ? { bgcolor:'#10b981', color:'white', '&:hover': { bgcolor:'#059669' }, '&.Mui-disabled': { bgcolor:'#10b981', color:'white', opacity: 0.85 } }
                : { color:'white', borderColor:'rgba(255,255,255,.3)', borderWidth: 1.5, '&:hover': { borderColor:'rgba(255,255,255,.6)', bgcolor:'rgba(255,255,255,.08)' } }
              ),
              fontWeight: 700,
              minWidth: 160,
            }}
          >
            {done ? 'Completed' : 'Mark Complete'}
          </Button>
        }
        secondaryActions={
          <>
            <Tooltip title="Add Note">
              <IconButton
                onClick={() => setShowNotes(true)}
                sx={{
                  bgcolor:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)',
                  color:'white', '&:hover': { bgcolor:'rgba(255,255,255,.2)' }
                }}
              >
                <NoteAddIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Bookmark">
              <IconButton
                onClick={() => { const t = playerRef.current?.getCurrentTime() || 0; addBookmark(t); }}
                sx={{
                  bgcolor:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)',
                  color:'white', '&:hover': { bgcolor:'rgba(255,255,255,.2)' }
                }}
              >
                <BookmarkIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        }
      />

      {/* Material Selector Tabs */}
      {materials.length > 1 && (
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.04), px: 2, pt: 1 }}>
          <Tabs
            value={materials.findIndex(m => m.id === activeMaterial?.id)}
            onChange={(_, v) => setSelectedMatId(materials[v].id)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 44,
              '& .MuiTab-root': { minHeight: 44, py: 0.75, px: 2, fontSize: 13, fontWeight: 700, textTransform: 'none' },
              '& .Mui-selected': { color: 'primary.main' },
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {materials.map((m) => (
              <Tab
                key={m.id}
                icon={getMatIcon(m)}
                iconPosition="start"
                label={m.title}
              />
            ))}
          </Tabs>
        </Box>
      )}

      <Card variant="outlined" sx={{ borderTop:'none', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderRadius: '0 0 16px 16px' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 }, '&:last-child': { pb: { xs: 2.5, md: 4 } } }}>
          {!activeMaterial || !activeMaterial.fileUrl ? (
            <Box sx={{ textAlign:'center', py: { xs: 5, md: 7.5 }, px: 4, borderRadius: 2, bgcolor: 'action.hover', border: '2px dashed', borderColor: 'divider' }}>
              <FileIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography sx={{ fontSize: 17, fontWeight: 700, color: 'text.secondary', mb: 1 }}>No Study Content Yet</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>This chapter doesn't have study material or documents attached yet.</Typography>
            </Box>
          ) : activeMaterial.isYoutube ? (
            <Box>
              <Box sx={{ bgcolor:'#000', borderRadius: 2, overflow:'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.35)', position:'relative' }}>
                <ReactPlayer
                  key={`intro-${activeMaterial.id}-${playerKey}`}
                  url={activeMaterial.fileUrl}
                  width="100%"
                  height="560px"
                  controls
                  playing={playing}
                  playbackRate={playbackRate}
                  onProgress={(p) => handleVid(p, ch._id)}
                  onEnded={() => { markDone(idx); logAct("video_watch", { chapter_id: ch._id, completed: true }); }}
                  onStart={() => { setPlaying(true); logAct("video_watch", { chapter_id: ch._id, started: true }); }}
                  config={{ youtube: { playerVars: { showinfo: 1, controls: 1, modestbranding: 1, rel: 0, fs: 1 } } }}
                />
                <Box sx={{ position:'absolute', inset: 0, zIndex: 5, background:'transparent', pointerEvents:'none' }} onContextMenu={e => e.preventDefault()} />
                <Chip label={activeMaterial.title} size="small" sx={{ position:'absolute', top: 14, left: 14, bgcolor:'rgba(99,102,241,.9)', color:'white', fontWeight: 700, zIndex: 6 }} />
                <Chip icon={<LockIcon sx={{ fontSize: 12 }} />} label="Protected" size="small" sx={{ position:'absolute', top: 14, right: 14, bgcolor:'rgba(0,0,0,.55)', color:'rgba(255,255,255,.85)', fontSize: 11, zIndex: 6, '& .MuiChip-icon': { color:'rgba(255,255,255,.75)' } }} />
              </Box>
            </Box>
          ) : ['mp4','webm','mkv'].includes(activeMaterial.ext) ? (
            <Box>
              <Box sx={{ bgcolor:'#000', borderRadius: 2, overflow:'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.35)', position:'relative' }}>
                <ReactPlayer
                  ref={playerRef}
                  key={`ch-${activeMaterial.id}-${playerKey}`}
                  url={activeMaterial.fileUrl}
                  width="100%"
                  height="560px"
                  controls
                  playing={playing}
                  playbackRate={playbackRate}
                  onProgress={(p) => handleVid(p, ch._id)}
                  onEnded={() => { markDone(idx); logAct("video_watch", { chapter_id: ch._id, completed: true }); }}
                  onStart={() => { setPlaying(true); logAct("video_watch", { chapter_id: ch._id, started: true }); }}
                  onPause={() => logAct("pause", { chapter_id: ch._id })}
                  onPlay={() => logAct("resume", { chapter_id: ch._id })}
                  config={{ file: { attributes: { controlsList:"nodownload nofullscreen" } } }}
                />
                <Box sx={{ position:'absolute', inset: 0, zIndex: 5, background:'transparent', pointerEvents:'none' }} onContextMenu={e => e.preventDefault()} />
                <Chip label={activeMaterial.title} size="small" sx={{ position:'absolute', top: 14, left: 14, bgcolor:'rgba(99,102,241,.9)', color:'white', fontWeight: 700, zIndex: 6 }} />
                <Chip icon={<LockIcon sx={{ fontSize: 12 }} />} label="Protected" size="small" sx={{ position:'absolute', top: 14, right: 14, bgcolor:'rgba(0,0,0,.55)', color:'rgba(255,255,255,.85)', fontSize: 11, zIndex: 6, '& .MuiChip-icon': { color:'rgba(255,255,255,.75)' } }} />
              </Box>

              {/* Player Controls */}
              <Card variant="outlined" sx={{ mt: 1.75, p: 1.75 }}>
                <Stack direction={{ xs:'column', sm:'row' }} alignItems={{ xs:'flex-start', sm:'center' }} justifyContent="space-between" spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <SpeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color:'text.secondary' }}>Speed:</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                        <Button
                          key={r}
                          size="small"
                          variant={playbackRate === r ? 'contained' : 'outlined'}
                          onClick={() => { setPlaybackRate(r); logAct("speed_change", { speed: r }); }}
                          sx={{
                            minWidth: 40, py: 0.25, px: 1, fontSize: 11.5, fontWeight: 600,
                            ...(playbackRate === r
                              ? {}
                              : { color:'text.secondary', borderColor:'divider' }
                            )
                          }}
                        >
                          {r}x
                        </Button>
                      ))}
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={0.75}>
                    <Button size="small" variant="outlined" startIcon={<Replay10Icon sx={{ fontSize: 16 }} />} onClick={() => { const t = playerRef.current?.getCurrentTime() || 0; playerRef.current?.seekTo(Math.max(0, t - 10)); }}>
                      -10s
                    </Button>
                    <Button size="small" variant="contained" startIcon={playing ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayIcon sx={{ fontSize: 16 }} />} onClick={() => setPlaying(p => !p)}>
                      {playing ? 'Pause' : 'Play'}
                    </Button>
                    <Button size="small" variant="outlined" endIcon={<Forward10Icon sx={{ fontSize: 16 }} />} onClick={() => { const t = playerRef.current?.getCurrentTime() || 0; playerRef.current?.seekTo(t + 10); }}>
                      +10s
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Box>
          ) : (
            <SecureViewer
              key={activeMaterial.id}
              fileUrl={activeMaterial.fileUrl}
              fileExt={activeMaterial.ext}
              chapterName={`${ch.chapter_name} (${activeMaterial.title})`}
              onView={() => logAct("chapter_content_view", { type: activeMaterial.ext, chapter_id: ch._id, material_id: activeMaterial.id })}
            />
          )}

          {/* Chapter Documents & Materials Grid */}
          {materials.length > 0 && (
            <Card variant="outlined" sx={{ mt: 3, p: 2.25, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.75}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FileIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>
                    Chapter Documents & Materials ({materials.length})
                  </Typography>
                </Stack>
                <Chip label={`${materials.length} Document${materials.length !== 1 ? 's' : ''}`} size="small" color="primary" sx={{ fontWeight: 700 }} />
              </Stack>
              <Grid container spacing={1.5}>
                {materials.map((m) => {
                  const isActive = m.id === activeMaterial?.id;
                  return (
                    <Grid item xs={12} sm={6} key={m.id}>
                      <Card
                        variant="outlined"
                        onClick={() => setSelectedMatId(m.id)}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          borderRadius: 2,
                          borderColor: isActive ? 'primary.main' : 'divider',
                          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                          '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                          transition: 'all 0.2s',
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: isActive ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                              color: isActive ? 'white' : 'primary.main',
                            }}
                          >
                            {getMatIcon(m)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: isActive ? 'primary.main' : 'text.primary' }} noWrap>
                              {m.title}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                              {m.type.toUpperCase()} · {m.ext.toUpperCase()}
                            </Typography>
                          </Box>
                          {isActive ? (
                            <Chip label="Viewing" size="small" color="primary" sx={{ fontWeight: 800, fontSize: 10, height: 22 }} />
                          ) : (
                            <Button size="small" variant="outlined" sx={{ fontSize: 11, py: 0.25, px: 1, minWidth: 0, fontWeight: 700 }}>
                              View
                            </Button>
                          )}
                        </Stack>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Card>
          )}
        </CardContent>

        {/* Chapter-specific notes */}
        {chapterNotes.length > 0 && (
          <Box sx={{ px: { xs: 2.5, md: 4 }, pb: { xs: 2.5, md: 4 } }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <NoteIcon sx={{ fontSize: 16, color:'primary.main' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color:'text.primary' }}>Your Notes for this Chapter</Typography>
                </Stack>
                <Chip label={chapterNotes.length} size="small" color="primary" sx={{ fontWeight: 700 }} />
              </Stack>
              <Stack spacing={0.75}>
                {chapterNotes.map((n: any, i: number) => (
                  <Box key={i} sx={{ p: 1.25, borderRadius: 1, bgcolor: 'action.hover', fontSize: 13, color:'text.secondary', border:'1px solid', borderColor:'divider' }}>
                    {n.content}
                  </Box>
                ))}
              </Stack>
            </Card>
          </Box>
        )}
      </Card>
    </Box>
  );
};

// ─── Intro Hero ───
interface IntroHeroProps {
  courseData: CourseData;
  courseProgress: CourseProgress | null;
  onMarkWatched: () => void;
  playerKey: number;
  playbackRate: number;
  playing: boolean;
  setPlaying: (b: boolean | ((p: boolean) => boolean)) => void;
  cleanYT: (url?: string | null) => string | null;
  handleVid: (prog: { played: number; playedSeconds: number }, chId?: string) => void;
  updateIntro: (watched: boolean, t?: number) => Promise<void>;
  logAct: (type: string, details?: any) => Promise<void>;
}

const IntroHero: React.FC<IntroHeroProps> = ({ courseData, courseProgress, onMarkWatched, playerKey, playbackRate, playing, cleanYT, handleVid, updateIntro, logAct }) => {
  const yt = cleanYT(courseData?.youtube_link);
  const watched = courseProgress?.overall_progress.introduction_watched;

  return (
    <Box sx={{ borderRadius: 2.5, overflow:'hidden', boxShadow: 1 }}>
      <HeroBanner
        badge="INTRODUCTION"
        title="Course Introduction"
        subtitle={<>Welcome to <strong style={{ color:'#c4b5fd' }}>{courseData?.title}</strong>! Start here.</>}
        primaryAction={
          <Button
            onClick={onMarkWatched}
            disabled={!!watched}
            variant={watched ? 'contained' : 'outlined'}
            startIcon={watched ? <CheckFilledIcon /> : <CheckIcon />}
            sx={{
              ...(watched
                ? { bgcolor:'#10b981', color:'white', '&:hover': { bgcolor:'#059669' }, '&.Mui-disabled': { bgcolor:'#10b981', color:'white', opacity: 0.85 } }
                : { color:'white', borderColor:'rgba(255,255,255,.3)', borderWidth: 1.5, '&:hover': { borderColor:'rgba(255,255,255,.6)', bgcolor:'rgba(255,255,255,.08)' } }
              ),
              fontWeight: 700,
              minWidth: 160,
            }}
          >
            {watched ? 'Watched' : 'Mark Watched'}
          </Button>
        }
      />

      <Card variant="outlined" sx={{ borderTop:'none', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderRadius: '0 0 16px 16px' }}>
        <Box sx={{ bgcolor:'#000', p: 3, borderRadius: '0 0 16px 16px' }}>
          {yt ? (
            <Box sx={{ borderRadius: 1.75, overflow:'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.4)', position:'relative' }}>
              <ReactPlayer
                key={`intro-${playerKey}`}
                url={yt}
                width="100%"
                height="540px"
                controls
                playing={playing}
                playbackRate={playbackRate}
                onProgress={(p) => handleVid(p,"introduction")}
                onEnded={async () => { await updateIntro(true, 100); await logAct("video_watch", { type:"introduction", completed: true }); toast.success("Introduction completed!"); }}
                onStart={async () => logAct("video_watch", { type:"introduction", started: true })}
                config={{ youtube: { playerVars: { showinfo: 1, controls: 1, modestbranding: 1, rel: 0, fs: 1 } } }}
              />
              <Box sx={{ position:'absolute', inset: 0, zIndex: 5, background:'transparent', pointerEvents:'none' }} onContextMenu={e => e.preventDefault()} />
              <Chip label="Introduction" size="small" sx={{ position:'absolute', top: 14, left: 14, bgcolor:'rgba(99,102,241,.9)', color:'white', fontWeight: 700, zIndex: 6 }} />
            </Box>
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ height: 420, gap: 1.75, borderRadius: 1.75, bgcolor:'#111' }}>
              <OndemandVideoIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,.2)' }} />
              <Typography sx={{ color:'rgba(255,255,255,.4)', fontSize: 14 }}>No introduction video available</Typography>
            </Stack>
          )}
        </Box>
      </Card>
    </Box>
  );
};

// ─── Chapter Navigator (Prev / Next) ───
interface ChapterNavigatorProps {
  currentChapter: number;
  totalChapters: number;
  sessionActive: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const ChapterNavigator: React.FC<ChapterNavigatorProps> = ({ currentChapter, totalChapters, sessionActive, onPrev, onNext }) => (
  <Card variant="outlined" sx={{ p: 2 }}>
    <Stack direction={{ xs:'column', sm:'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
      <Button
        variant="outlined"
        size="large"
        startIcon={<ArrowBackIcon />}
        disabled={currentChapter <= -1}
        onClick={onPrev}
        sx={{ minWidth: 140 }}
      >
        Previous
      </Button>
      <Box sx={{ textAlign:'center', flex: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color:'text.primary', mb: 0.5 }}>
          {currentChapter === -1 ? "Course Introduction" : `Chapter ${currentChapter + 1} of ${totalChapters}`}
        </Typography>
        {sessionActive && (
          <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
            <DotIcon sx={{ fontSize: 8, color:'success.main', animation:'pulse 2s ease-in-out infinite' }} />
            <Typography sx={{ fontSize: 11.5, color:'text.secondary' }}>Session Active · Auto-Saved</Typography>
          </Stack>
        )}
      </Box>
      <Button
        variant="contained"
        size="large"
        endIcon={<ArrowForwardIcon />}
        disabled={currentChapter >= totalChapters - 1}
        onClick={onNext}
        sx={{ minWidth: 140 }}
      >
        Next
      </Button>
    </Stack>
  </Card>
);

// ─── Right Panel (Course Info / Notes / Progress / Chapters) ───
interface RightPanelProps {
  courseData: CourseData;
  courseProgress: CourseProgress | null;
  realtimeProgress: number;
  completedChapters: number[];
  currentChapter: number;
  changeChapter: (n: number) => void;
  rightTab: 0 | 1;
  setRightTab: (t: 0 | 1) => void;
  totalNotesCount: number;
  filteredNotes: ReturnType<typeof getAllNotes>;
  chaptersWithNotes: Array<{ id: string; name: string; index: number }>;
  noteSearch: string;
  setNoteSearch: (s: string) => void;
  noteFilterChapter: string | 'all';
  setNoteFilterChapter: React.Dispatch<React.SetStateAction<string | 'all'>>;
  onShowAnalytics: () => void;
  fmtTime: (s: number) => string;
}

const RightPanel: React.FC<RightPanelProps> = ({
  courseData, courseProgress, realtimeProgress, completedChapters, currentChapter,
  changeChapter, rightTab, setRightTab, totalNotesCount, filteredNotes, chaptersWithNotes,
  noteSearch, setNoteSearch, noteFilterChapter, setNoteFilterChapter, onShowAnalytics, fmtTime
}) => {
  const cp = courseProgress;
  const totalChapters = courseData?.chapters?.length || 0;
  const completedCount = completedChapters.length;
  const activeCount = cp?.overall_progress?.chapters_in_progress || 0;
  const leftCount = Math.max(0, totalChapters - completedCount);

  return (
    <Stack spacing={2.25}>
      {/* Course Info / Notes Tabs Card */}
      <Card variant="outlined" sx={{ overflow:'hidden' }}>
        <Tabs
          value={rightTab}
          onChange={(_, v) => setRightTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            borderBottom: '1px solid', borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 44, py: 1, fontSize: 12.5, fontWeight: 700, textTransform:'none' },
            '& .Mui-selected': { color:'primary.main' },
            '& .MuiTabs-indicator': { height: 2.5, borderRadius: '2px 2px 0 0' },
          }}
        >
          <Tab icon={<BookIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Course Info" />
          <Tab
            icon={
              <Badge badgeContent={totalNotesCount} color="primary" max={99} sx={{ '& .MuiBadge-badge': { fontSize: 9, fontWeight: 800, minWidth: 16, height: 16 } }}>
                <NoteIcon sx={{ fontSize: 16 }} />
              </Badge>
            }
            iconPosition="start"
            label="All Notes"
          />
        </Tabs>

        {/* Course Info */}
        {rightTab === 0 && (
          <Box sx={{ p: 2.25 }}>
            <Stack alignItems="center" spacing={1} sx={{ pb: 2 }}>
              <Av
                name={courseData?.teacher_details?.tname}
                size={64}
                src={courseData?.teacher_details?.tprofile ? `${uri}${courseData.teacher_details.tprofile}` : undefined}
              />
              <Box sx={{ textAlign:'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color:'text.primary' }}>
                  {courseData?.teacher_details?.tname || 'Instructor'}
                </Typography>
                <Typography sx={{ color:'text.secondary', fontSize: 12 }}>
                  {courseData?.teacher_details?.tspecialization || 'Expert Educator'}
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={0}>
              <InfoRow icon={<TimeIcon sx={{ fontSize: 14 }} />} label="Duration" value={`${courseData?.duration ?? 0} hours`} />
              <InfoRow icon={<BookIcon sx={{ fontSize: 14 }} />} label="Chapters" value={totalChapters} />
              <InfoRow icon={<LevelIcon sx={{ fontSize: 14 }} />} label="Level" value={capitalize(courseData?.skill_level)} />
              <InfoRow icon={<LanguageIcon sx={{ fontSize: 14 }} />} label="Language" value={courseData?.language || 'English'} />
            </Stack>

            {(courseData?.syllabus || (courseData?.materials && courseData.materials.length > 0)) && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: 'text.primary', mb: 1 }}>Course Resources</Typography>
                <Stack spacing={0.75}>
                  {courseData.syllabus && (
                    <Box
                      onClick={() => window.open(getImageUrl(courseData.syllabus), '_blank')}
                      sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PdfIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Course Syllabus</Typography>
                      </Stack>
                      <Chip label="PDF" size="small" sx={{ fontSize: 10, height: 20 }} />
                    </Box>
                  )}
                  {courseData.materials?.map((m, idx) => (
                    <Box
                      key={idx}
                      onClick={() => window.open(getImageUrl(m.path), '_blank')}
                      sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FileIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>{m.name || `Material ${idx + 1}`}</Typography>
                      </Stack>
                      <Chip label={(m.type || getFileExt(m.path)).toUpperCase()} size="small" sx={{ fontSize: 10, height: 20 }} />
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        )}

        {/* Notes */}
        {rightTab === 1 && (
          <Box sx={{ minHeight: 280, maxHeight: 520, display:'flex', flexDirection:'column' }}>
            <NotesPanel
              notes={filteredNotes}
              chaptersWithNotes={chaptersWithNotes}
              search={noteSearch}
              setSearch={setNoteSearch}
              filterChapter={noteFilterChapter}
              setFilterChapter={setNoteFilterChapter}
              onJumpToChapter={(idx) => { changeChapter(idx); setRightTab(0); }}
            />
          </Box>
        )}
      </Card>

      {/* Progress Card */}
      <Card variant="outlined" sx={{ p: 2.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendIcon sx={{ fontSize: 16, color:'primary.main' }} />
            <Typography sx={{ fontWeight: 700, fontSize: 15, color:'text.primary' }}>Your Progress</Typography>
          </Stack>
          <Button size="small" variant="outlined" startIcon={<ChartIcon sx={{ fontSize: 14 }} />} onClick={onShowAnalytics} sx={{ fontSize: 11, py: 0.25, px: 1, minWidth: 0 }}>
            Analytics
          </Button>
        </Stack>
        <Stack alignItems="center" mb={2}>
          <ProgressRing pct={Math.round(realtimeProgress || 0)} size={120} stroke={8} />
        </Stack>
        <Grid container spacing={1} mb={cp ? 1.5 : 0}>
          <Grid item xs={4}>
            <StatTile label="Done" value={completedCount} icon={<CheckFilledIcon sx={{ fontSize: 16 }} />} color="success" />
          </Grid>
          <Grid item xs={4}>
            <StatTile label="Active" value={activeCount} icon={<BrainIcon sx={{ fontSize: 16 }} />} color="warning" />
          </Grid>
          <Grid item xs={4}>
            <StatTile label="Left" value={leftCount} icon={<BookIcon sx={{ fontSize: 16 }} />} color="info" />
          </Grid>
        </Grid>
        {cp && (
          <>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={0}>
              <InfoRow
                icon={<FireIcon sx={{ fontSize: 14, color:'#f97316' }} />}
                label="Streak"
                value={
                  <Stack alignItems="flex-end" spacing={0}>
                    <Typography sx={{ fontWeight: 800, fontSize: 12.5, color:'text.primary' }}>
                      {cp.analytics.daily_streaks.current_streak}d
                    </Typography>
                    <Typography sx={{ fontSize: 10, color:'text.secondary' }}>
                      Best: {cp.analytics.daily_streaks.longest_streak}d
                    </Typography>
                  </Stack>
                }
              />
              <InfoRow
                icon={<TimeIcon sx={{ fontSize: 14 }} />}
                label="Time Spent"
                value={<Typography sx={{ fontWeight: 800, fontSize: 12.5, color:'text.primary' }}>{fmtTime(cp.overall_progress.total_time_spent)}</Typography>}
              />
              <InfoRow
                icon={<TrophyIcon sx={{ fontSize: 14 }} />}
                label="Milestones"
                value={<Typography sx={{ fontWeight: 800, fontSize: 12.5, color:'text.primary' }}>{cp.milestones?.length || 0}</Typography>}
              />
              <InfoRow
                icon={<TrendIcon sx={{ fontSize: 14 }} />}
                label="Performance"
                value={
                  <Stack alignItems="flex-end" spacing={0.5} sx={{ minWidth: 80 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 12.5, color:'text.primary' }}>
                      {cp.analytics.performance_metrics.overall_performance_score}%
                    </Typography>
                    <LinearProgress variant="determinate" value={cp.analytics.performance_metrics.overall_performance_score} sx={{ width: 80, height: 4, borderRadius: 2 }} />
                  </Stack>
                }
              />
            </Stack>
          </>
        )}
      </Card>

      {/* Chapter List */}
      <Card variant="outlined" sx={{ p: 1.75 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5, mb: 1.5 }}>
          <BookIcon sx={{ fontSize: 16, color:'primary.main' }} />
          <Typography sx={{ fontWeight: 700, fontSize: 15, color:'text.primary' }}>Chapters</Typography>
        </Stack>
        <Stack spacing={0.5}>
          {courseData?.youtube_link && (
            <ChapterListItem
              active={currentChapter === -1}
              done={!!courseProgress?.overall_progress.introduction_watched}
              title="Course Introduction"
              subtitle="Welcome Video"
              onClick={() => changeChapter(-1)}
              isIntro
            />
          )}
          <Box sx={{ maxHeight: 400, overflowY:'auto', pr: 0.5 }}>
            {courseData?.chapters.map((ch, i) => {
              const cp3 = courseProgress?.chapters.find(c => c.chapter_id === ch._id);
              const vr = cp3?.video_progress?.completion_rate || 0;
              const done = completedChapters.includes(i);
              const hasNotes = (cp3?.interactions?.notes?.length || 0) > 0;
              const noteCount = cp3?.interactions?.notes?.length || 0;
              const mats = getChapterMaterials(ch);
              const docCount = mats.length;
              return (
                <ChapterListItem
                  key={ch._id}
                  active={currentChapter === i}
                  done={done}
                  title={ch.chapter_name}
                  subtitle={`Ch. ${i + 1}${docCount > 0 ? ` · 📄 ${docCount} doc${docCount > 1 ? 's' : ''}` : ''}${vr > 0 && vr < 100 ? ` · ${Math.round(vr)}% watched` : ''}${done ? ' · Done' : ''}`}
                  progressPct={vr}
                  noteCount={hasNotes ? noteCount : undefined}
                  onClick={() => changeChapter(i)}
                />
              );
            })}
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
};

// ─── Info Row (right panel info list item) ───
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.125, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom:'none' } }}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ color:'primary.main', display:'flex' }}>{icon}</Box>
      <Typography sx={{ color:'text.secondary', fontSize: 12.5 }}>{label}</Typography>
    </Stack>
    {typeof value === 'string' || typeof value === 'number'
      ? <Typography sx={{ fontWeight: 700, fontSize: 12.5, color:'text.primary' }}>{value}</Typography>
      : value
    }
  </Stack>
);

// ─── Chapter List Item ───
interface ChapterListItemProps {
  active: boolean;
  done: boolean;
  title: string;
  subtitle?: string;
  progressPct?: number;
  noteCount?: number;
  isIntro?: boolean;
  onClick: () => void;
}

const ChapterListItem: React.FC<ChapterListItemProps> = ({ active, done, title, subtitle, progressPct, noteCount, isIntro, onClick }) => {
  const theme = useTheme();
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: 1.25,
        border: '1.5px solid',
        borderColor: active ? 'primary.main' : 'transparent',
        bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
        mb: 0.5,
        py: 1.25,
        px: 1.25,
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06), borderColor: alpha(theme.palette.primary.main, 0.25) },
        transition:'all 0.2s',
      }}
    >
      <Avatar
        sx={{
          width: 30, height: 30, fontSize: 12, fontWeight: 800, mr: 1.25,
          ...(done
            ? { bgcolor:'success.main', color:'white' }
            : active
              ? { bgcolor:'primary.main', color:'white' }
              : { bgcolor:'action.hover', color:'text.secondary' }
          ),
        }}
      >
        {done ? <CheckFilledIcon sx={{ fontSize: 16 }} /> : isIntro ? <PlayIcon sx={{ fontSize: 14 }} /> : (subtitle?.match(/Ch\. (\d+)/)?.[1] || '')}
      </Avatar>
      <ListItemText
        primary={
          <Typography sx={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'primary.main' : 'text.primary', lineHeight: 1.3 }} noWrap>
            {title}
          </Typography>
        }
        secondary={
          <Stack spacing={0.5} mt={0.25}>
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontSize: 11, color:'text.secondary' }}>{subtitle}</Typography>
              {noteCount !== undefined && (
                <Stack direction="row" spacing={0.25} alignItems="center" sx={{ ml: 0.5 }}>
                  <NoteIcon sx={{ fontSize: 11, color:'primary.main' }} />
                  <Typography sx={{ fontSize: 10, color:'primary.main', fontWeight: 700 }}>{noteCount}</Typography>
                </Stack>
              )}
            </Stack>
            {progressPct !== undefined && progressPct > 0 && progressPct < 100 && (
              <LinearProgress variant="determinate" value={progressPct} sx={{ height: 3, borderRadius: 2, mt: 0.5 }} />
            )}
          </Stack>
        }
      />
      {active && <PlayIcon sx={{ fontSize: 14, color:'primary.main', ml: 1 }} />}
    </ListItemButton>
  );
};

// ─── Notes Panel ───
interface NotesPanelProps {
  notes: ReturnType<typeof getAllNotes>;
  chaptersWithNotes: Array<{ id: string; name: string; index: number }>;
  search: string;
  setSearch: (s: string) => void;
  filterChapter: string | 'all';
  setFilterChapter: React.Dispatch<React.SetStateAction<string | 'all'>>;
  onJumpToChapter: (idx: number) => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ notes, chaptersWithNotes, search, setSearch, filterChapter, setFilterChapter, onJumpToChapter }) => {
  if (notes.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 6, px: 2.5 }} spacing={1.75}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: alpha('#6366f1', 0.08) }}>
          <NoteIcon sx={{ fontSize: 28, color:'primary.main' }} />
        </Avatar>
        <Box sx={{ textAlign:'center' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color:'text.primary', mb: 0.75 }}>No Notes Yet</Typography>
          <Typography sx={{ color:'text.secondary', fontSize: 12.5, lineHeight: 1.6 }}>
            Start adding notes while studying.<br />They'll all appear here across chapters.
          </Typography>
        </Box>
      </Stack>
    );
  }

  return (
    <Box sx={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <Box sx={{ p: '12px 16px 0' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search notes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ fontSize: 14, color:'text.secondary', mr: 1 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: 12.5, bgcolor: 'action.hover',
              '& fieldset': { borderColor:'divider' },
              '&:hover fieldset': { borderColor:'primary.main' },
              '&.Mui-focused fieldset': { borderColor:'primary.main', borderWidth: 1.5 },
            }
          }}
        />
      </Box>
      {chaptersWithNotes.length > 1 && (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ px: 2, py: 1 }}>
          <Chip
            label="All"
            size="small"
            onClick={() => setFilterChapter('all')}
            color={filterChapter === 'all' ? 'primary' : 'default'}
            variant={filterChapter === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, fontSize: 11 }}
          />
          {chaptersWithNotes.map(ch => (
            <Chip
              key={ch.id}
              label={`Ch.${ch.index + 1}`}
              size="small"
              onClick={() => setFilterChapter(f => f === ch.id ? 'all' : ch.id)}
              color={filterChapter === ch.id ? 'primary' : 'default'}
              variant={filterChapter === ch.id ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700, fontSize: 11 }}
            />
          ))}
        </Stack>
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 0.5 }}>
        <Typography sx={{ fontSize: 11, color:'text.secondary', fontWeight: 600 }}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}{search ? ' found' : ''}
        </Typography>
        {search && (
          <Button size="small" onClick={() => setSearch('')} sx={{ fontSize: 11, fontWeight: 700, minWidth: 0, p: 0.25 }}>Clear</Button>
        )}
      </Stack>
      <Box sx={{ flex: 1, overflowY:'auto', px: 2, pb: 2, pt: 0.5 }}>
        {notes.length === 0 ? (
          <Box sx={{ textAlign:'center', py: 4, color:'text.secondary', fontSize: 13 }}>No notes match your search.</Box>
        ) : (
          <Stack spacing={1.25}>
            {notes.map((n) => (
              <Card key={`${n.chapterId}-${n.noteIndex}`} variant="outlined" sx={{ p: 0, overflow:'hidden', transition:'all 0.2s', '&:hover': { boxShadow: 2, borderColor:'primary.main' } }}>
                <Box sx={{ p: '10px 13px', bgcolor: alpha('#6366f1', 0.04), display:'flex', alignItems:'center', justifyContent:'space-between', gap: 1 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                    <Chip
                      icon={<BookIcon sx={{ fontSize: 12 }} />}
                      label={`Ch.${n.chapterIndex + 1}`}
                      size="small"
                      sx={{ bgcolor: alpha('#6366f1', 0.12), color:'primary.main', border:`1px solid ${alpha('#6366f1', 0.25)}`, fontSize: 10.5, fontWeight: 700, height: 22, '& .MuiChip-icon': { color:'primary.main', fontSize: 12 } }}
                    />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color:'text.primary', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {n.chapterName}
                    </Typography>
                  </Stack>
                  <Button size="small" onClick={() => onJumpToChapter(n.chapterIndex)} endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />} sx={{ fontSize: 11, fontWeight: 700, minWidth: 0, p: '2px 8px', color:'primary.main' }}>
                    Go
                  </Button>
                </Box>
                <CardContent sx={{ p: '0 13px 12px !important' }}>
                  <Typography sx={{ fontSize: 13, lineHeight: 1.65, color:'text.secondary' }}>{n.noteContent}</Typography>
                  {n.createdAt && (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
                      <TimeIcon sx={{ fontSize: 11, color:'text.secondary' }} />
                      <Typography sx={{ fontSize: 10.5, color:'text.secondary' }}>
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

// ─── Notes Drawer (floating, full-screen on mobile) ───
interface NotesDrawerProps {
  open: boolean;
  onClose: () => void;
  courseProgress: CourseProgress | null;
  courseData: CourseData;
  onJumpToChapter: (idx: number) => void;
}

const NotesDrawer: React.FC<NotesDrawerProps> = ({ open, onClose, courseProgress, courseData, onJumpToChapter }) => {
  const allNotes = getAllNotes(courseProgress, courseData);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | 'all'>('all');

  const filtered = allNotes.filter(n => {
    const matchSearch = !search || n.noteContent.toLowerCase().includes(search.toLowerCase()) || n.chapterName.toLowerCase().includes(search.toLowerCase());
    const matchChapter = filter === 'all' || n.chapterId === filter;
    return matchSearch && matchChapter;
  });

  const chaptersWithNotes = Array.from(new Map(allNotes.map(n => [n.chapterId, { id: n.chapterId, name: n.chapterName, index: n.chapterIndex }])).values()).sort((a, b) => a.index - b.index);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs:'100%', sm: 480 }, maxWidth:'95vw' } }}
    >
      <Box sx={{ background:'linear-gradient(135deg,#0f0b2d,#1e1060)', p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 40, height: 40, bgcolor: alpha('#ffffff', 0.12) }}>
              <NoteIcon sx={{ fontSize: 18, color:'#c4b5fd' }} />
            </Avatar>
            <Box>
              <Typography sx={{ color:'white', fontWeight: 800, fontSize: 16 }}>All Course Notes</Typography>
              <Typography sx={{ color:'rgba(255,255,255,.55)', fontSize: 12, mt: 0.25 }}>
                {allNotes.length} note{allNotes.length !== 1 ? 's' : ''} across all chapters
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} sx={{ bgcolor: alpha('#ffffff', 0.1), border:'1px solid rgba(255,255,255,.2)', color:'white', '&:hover': { bgcolor: alpha('#ffffff', 0.2) } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflow:'hidden' }}>
        <NotesPanel
          notes={filtered}
          chaptersWithNotes={chaptersWithNotes}
          search={search}
          setSearch={setSearch}
          filterChapter={filter}
          setFilterChapter={setFilter}
          onJumpToChapter={(idx) => { onJumpToChapter(idx); }}
        />
      </Box>
    </Drawer>
  );
};

// ─── Note Modal ───
interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  note: string;
  setNote: (s: string) => void;
  onSave: () => void;
  chapterName: string;
}

const NoteModal: React.FC<NoteModalProps> = ({ open, onClose, note, setNote, onSave, chapterName }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2.5, overflow:'hidden' } }}>
    <DialogTitle sx={{ background:'linear-gradient(135deg,#0f0b2d,#1e1060)', color:'white', display:'flex', alignItems:'center', gap: 1.25, p: 2.25 }}>
      <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#ffffff', 0.12) }}>
        <NoteIcon sx={{ fontSize: 16, color:'#c4b5fd' }} />
      </Avatar>
      <Box>
        <Typography sx={{ color:'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Add Note</Typography>
        {chapterName && <Typography sx={{ color:'rgba(255,255,255,.5)', fontSize: 12, mt: 0.25 }}>{chapterName}</Typography>}
      </Box>
    </DialogTitle>
    <DialogContent sx={{ p: 2.75 }}>
      <TextField
        autoFocus
        fullWidth
        multiline
        rows={5}
        placeholder="Write your notes here"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: 14, bgcolor:'action.hover',
            '& fieldset': { borderColor:'divider' },
            '&:hover fieldset': { borderColor:'primary.main' },
            '&.Mui-focused fieldset': { borderColor:'primary.main', borderWidth: 1.5 },
          }
        }}
      />
    </DialogContent>
    <DialogActions sx={{ p: 2, gap: 1 }}>
      <Button variant="outlined" onClick={onClose}>Cancel</Button>
      <Button variant="contained" startIcon={<BookmarkIcon sx={{ fontSize: 16 }} />} onClick={onSave}>Save Note</Button>
    </DialogActions>
  </Dialog>
);

// ─── Analytics Modal ───
interface AnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  courseProgress: CourseProgress | null;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ open, onClose, courseProgress }) => {
  if (!courseProgress) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display:'flex', alignItems:'center', gap: 1.5 }}>
          <ChartIcon sx={{ color:'primary.main' }} /> Learning Analytics
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign:'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color:'text.secondary' }}>Loading analytics...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2.5, overflow:'hidden' } }}>
      <DialogTitle sx={{ background:'linear-gradient(135deg,#0f0b2d,#1e1060)', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between', p: 2.25 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#ffffff', 0.12) }}>
            <ChartIcon sx={{ fontSize: 16, color:'#c4b5fd' }} />
          </Avatar>
          <Typography sx={{ color:'white', fontWeight: 700, fontSize: 15 }}>Learning Analytics</Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color:'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={1.5} mb={2.75}>
          <Grid item xs={4}>
            <StatTile label="Focus Score" value={courseProgress.analytics.performance_metrics.focus_score} icon={<BrainIcon sx={{ fontSize: 16 }} />} color="info" />
          </Grid>
          <Grid item xs={4}>
            <StatTile label="Consistency" value={courseProgress.analytics.performance_metrics.consistency_score} icon={<CheckFilledIcon sx={{ fontSize: 16 }} />} color="success" />
          </Grid>
          <Grid item xs={4}>
            <StatTile label="Engagement" value={courseProgress.analytics.performance_metrics.engagement_score} icon={<FireIcon sx={{ fontSize: 16 }} />} color="warning" />
          </Grid>
        </Grid>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 15, mb: 1.5 }}>Learning Patterns</Typography>
        <Stack spacing={0}>
          <InfoRow icon={<TimeIcon sx={{ fontSize: 14 }} />} label="Avg Session Duration" value={`${courseProgress.analytics.learning_patterns.avg_session_duration} min`} />
          <InfoRow icon={<PlayIcon sx={{ fontSize: 14 }} />} label="Total Sessions" value={courseProgress.analytics.learning_patterns.total_sessions} />
          <InfoRow icon={<BrainIcon sx={{ fontSize: 14 }} />} label="Preferred Time" value={courseProgress.analytics.learning_patterns.preferred_learning_time} />
          <InfoRow icon={<TrendIcon sx={{ fontSize: 14 }} />} label="Learning Velocity" value={`${courseProgress.analytics.learning_patterns.learning_velocity} chapters/week`} />
        </Stack>
        {courseProgress.milestones.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 15, mt: 2.5, mb: 1.5 }}>
              Milestones
            </Typography>
            <Stack spacing={1}>
              {courseProgress.milestones.map((m, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.25, borderRadius: 1.25, bgcolor:'action.hover', border:'1px solid', borderColor:'divider' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor:'success.lighter' }}>
                    <TrophyIcon sx={{ fontSize: 14, color:'success.main' }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, color:'text.primary' }}>{m.description}</Typography>
                    <Typography sx={{ fontSize: 11, color:'text.secondary', mt: 0.25 }}>{new Date(m.achieved_at).toLocaleDateString()}</Typography>
                  </Box>
                  {m.points_earned > 0 && (
                    <Chip label={`+${m.points_earned} pts`} size="small" color="warning" sx={{ fontWeight: 700 }} />
                  )}
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}