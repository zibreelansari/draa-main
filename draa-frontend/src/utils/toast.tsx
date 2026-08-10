/**
 * toast.tsx - Custom toast notification system
 *
 * Drop-in replacement for Ant Design `message.success / error / warning / info`.
 * Renders a fixed overlay (top-right) that matches the screenshot style:
 *   white card | colored circle icon | bold title | body text | x close button
 *
 * Usage:
 *   import toast from '../utils/toast';
 *   toast.success('Saved!');
 *   toast.error('Something went wrong.');
 *   toast.warning('Please check your input.');
 *   toast.info('Link copied!');
 *   toast.success('Title', 'Optional longer description');
 *   toast.success('Title', 'Description', 6000); // custom duration ms
 *
 * Mount once in your app root (App.tsx):
 *   import { ToastContainer } from '../utils/toast';
 *   <ToastContainer />
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// --- types -------------------------------------------------------------------

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;  // ms; 0 = sticky
  removing: boolean;
}

// --- per-type config ----------------------------------------------------------

const CONFIG: Record<ToastType, { bg: string; shadow: string; icon: React.ReactNode }> = {
  success: {
    bg: '#22c55e',
    shadow: '0 8px 32px rgba(34,197,94,0.22)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    bg: '#ef4444',
    shadow: '0 8px 32px rgba(239,68,68,0.22)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  warning: {
    bg: '#f59e0b',
    shadow: '0 8px 32px rgba(245,158,11,0.22)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    bg: '#6366f1',
    shadow: '0 8px 32px rgba(99,102,241,0.22)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="12" x2="12" y2="16" />
      </svg>
    ),
  },
};

// --- event bus (no React context needed) --------------------------------------

type Listener = (item: ToastItem) => void;
let _listener: Listener | null = null;
let _idCounter = 0;

function emit(type: ToastType, title: string, description?: string, duration = 4500) {
  const item: ToastItem = {
    id: ++_idCounter,
    type,
    title,
    description,
    duration,
    removing: false,
  };
  if (_listener) {
    _listener(item);
  } else {
    ensureContainer();
    setTimeout(() => _listener && _listener(item), 20);
  }
}

// --- single toast card --------------------------------------------------------

const ANIM_MS = 300;

const ToastCard: React.FC<{ item: ToastItem; onClose: (id: number) => void }> = ({
  item, onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIG[item.type];

  // entrance animation — wait one paint
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // auto-dismiss
  useEffect(() => {
    if (!item.duration) return;
    const t = setTimeout(handleClose, item.duration);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // parent can trigger exit by setting removing = true
  useEffect(() => {
    if (item.removing) setVisible(false);
  }, [item.removing]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => onClose(item.id), ANIM_MS);
  }

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 13,
        background: '#ffffff',
        borderRadius: 16,
        padding: '15px 17px',
        boxShadow: `0 4px 24px rgba(0,0,0,0.11), ${cfg.shadow}`,
        minWidth: 300,
        maxWidth: 420,
        border: '1px solid rgba(0,0,0,0.06)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(56px) scale(0.96)',
        transition: `transform ${ANIM_MS}ms cubic-bezier(.34,1.56,.64,1), opacity ${ANIM_MS}ms ease`,
        marginBottom: 10,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        background: cfg.bg,
        borderRadius: '16px 0 0 16px',
      }} />

      {/* icon circle */}
      <div style={{
        flexShrink: 0,
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: cfg.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 12px ${cfg.bg}55`,
        marginLeft: 5,
      }}>
        {cfg.icon}
      </div>

      {/* text block */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: '#111827',
          lineHeight: 1.25, marginBottom: item.description ? 3 : 0,
        }}>
          {item.title}
        </div>
        {item.description && (
          <div style={{
            fontSize: 13, color: '#6b7280',
            lineHeight: 1.55, wordBreak: 'break-word',
          }}>
            {item.description}
          </div>
        )}
      </div>

      {/* close button */}
      <button
        onClick={handleClose}
        aria-label="Dismiss notification"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
          color: '#9ca3af',
          fontSize: 17,
          lineHeight: 1,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -1,
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#374151';
          e.currentTarget.style.background = '#f3f4f6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#9ca3af';
          e.currentTarget.style.background = 'none';
        }}
      >
        &#x2715;
      </button>
    </div>
  );
};

// --- container ----------------------------------------------------------------

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _listener = (item) => setToasts(prev => [...prev, item]);
    return () => { _listener = null; };
  }, []);

  const close = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(item => (
        <div key={item.id} style={{ pointerEvents: 'auto' }}>
          <ToastCard item={item} onClose={close} />
        </div>
      ))}
    </div>
  );
};

// --- auto-mount fallback (for components that call toast without ToastContainer) ---

let _mounted = false;

function ensureContainer() {
  if (_mounted || typeof document === 'undefined') return;
  _mounted = true;
  const div = document.createElement('div');
  div.id = '__toast_root__';
  document.body.appendChild(div);
  const root = createRoot(div);
  root.render(<ToastContainer />);
}

// --- public API ---------------------------------------------------------------

/**
 * Drop-in replacement for antd `message`.
 *
 *   toast.success(text)
 *   toast.success(title, description)
 *   toast.success(title, description, durationMs)
 */
function makeToastFn(type: ToastType) {
  return (title: string, description?: string, duration?: number) => {
    emit(type, title, description, duration);
  };
}

const toast = {
  success: makeToastFn('success'),
  error:   makeToastFn('error'),
  warning: makeToastFn('warning'),
  warn:    makeToastFn('warning'),  // antd alias
  info:    makeToastFn('info'),
  loading: (msg: string) => emit('info', msg),  // antd compat
};

export default toast;
