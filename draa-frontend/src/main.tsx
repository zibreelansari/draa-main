import'./styles/index.css'
import'./App.css'
import { StrictMode } from"react";
import { createRoot } from"react-dom/client";
import App from"./App.tsx";
import { GoogleOAuthProvider } from"@react-oauth/google";
import url, { googleClientId } from"./url";
import { pdfjs } from"react-pdf";
import { setupAxiosInterceptors } from"./utils/setupAxios";
import { message } from 'antd';
import toast from './utils/toast';
import { initGA } from "./analytics";

// Initialize Google Analytics
initGA();

// Global chunk load error handling to prevent "Unexpected Application Error" on production
const catchChunkError = (error: any) => {
  const isChunkError = 
    error?.name === 'ChunkLoadError' || 
    (typeof error?.message === 'string' && (
      error.message.toLowerCase().includes('dynamically imported module') ||
      error.message.toLowerCase().includes('importing a module script failed')
    ));

  if (isChunkError) {
    const chunkFailedKey = 'chunk_failed_reload';
    if (!sessionStorage.getItem(chunkFailedKey)) {
      sessionStorage.setItem(chunkFailedKey, 'true');
      window.location.reload();
    }
  }
};

window.addEventListener('error', (e) => {
  catchChunkError(e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  catchChunkError(e.reason);
});

// Globally override Ant Design's message methods with our custom toast
const handleAntdMessage = (type: 'success' | 'error' | 'warning' | 'warn' | 'info') => {
  return (content: any, duration?: any) => {
    let title = '';
    let description: string | undefined = undefined;
    let durationMs: number | undefined = undefined;

    if (content && typeof content === 'object') {
      if ('content' in content) {
        title = typeof content.content === 'string' ? content.content : String(content.content || '');
      }
      if ('duration' in content && typeof content.duration === 'number') {
        durationMs = content.duration * 1000;
      }
    } else {
      title = typeof content === 'string' ? content : String(content || '');
      if (typeof duration === 'number') {
        durationMs = duration * 1000;
      }
    }

    toast[type](title, description, durationMs);
    return () => {}; // return dummy destroy function
  };
};

Object.assign(message, {
  success: handleAntdMessage('success'),
  error:   handleAntdMessage('error'),
  warning: handleAntdMessage('warning'),
  warn:    handleAntdMessage('warn'),
  info:    handleAntdMessage('info'),
  loading: (content: any) => {
    const title = typeof content === 'string' ? content : (content && typeof content === 'object' && 'content' in content ? String(content.content) : String(content || ''));
    toast.loading(title);
    return () => {};
  }
});

// Initialize global axios interceptors for auth handling
setupAxiosInterceptors();

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
"pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
);
