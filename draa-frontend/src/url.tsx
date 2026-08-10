const isProd = import.meta.env.PROD;

// In production, use the absolute URL. In development, use relative path to leverage Vite proxy.
const url = isProd ?'https://api.draa.in/api/v1' :'/api/v1';

export const googleClientId ="388392832057-bne7f64qudvrooqbacud41tte0i7fitp.apps.googleusercontent.com"

export const BACKEND_UPLOAD_URL = isProd 
  ?'https://api.draa.in' 
  :"http://127.0.0.1:5000";

/**
 * Standardizes image URL construction.
 * Handles full URLs, relative paths with/without leading slashes, and legacy hardcoded strings.
 */
export const getImageUrl = (path: string | null | undefined): string => {
  // Fallback when no path is given — return a working absolute URL.
  if (!path || (typeof path === "string" && path.trim() === "")) {
    return `${BACKEND_UPLOAD_URL}/assets/img/default-placeholder.png`;
  }

  const normalizedPath = String(path).replace(/\\/g, '/').trim();

  // If it's already an absolute URL, just return it (with dev override).
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    const isLocalDev = BACKEND_UPLOAD_URL.includes('localhost') || BACKEND_UPLOAD_URL.includes('127.0.0.1');
    if (normalizedPath.includes('api.draa.in') && isLocalDev) {
      return normalizedPath.replace('https://api.draa.in', BACKEND_UPLOAD_URL);
    }
    return normalizedPath;
  }

  // Some legacy entries store the full server filesystem path (e.g. from
  // multer's `file.path`). Trim everything before the last `uploads/` segment
  // so the URL points at the public static dir, not the server's absolute path.
  let cleanPath = normalizedPath;
  const uploadsIdx = normalizedPath.lastIndexOf('uploads/');
  if (uploadsIdx > 0) {
    cleanPath = normalizedPath.substring(uploadsIdx);
  } else if (!normalizedPath.startsWith('uploads/')
          && !normalizedPath.startsWith('/uploads/')
          && !normalizedPath.startsWith('assets/')
          && !normalizedPath.startsWith('/assets/')) {
    cleanPath = `uploads/${normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath}`;
  }

  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${BACKEND_UPLOAD_URL}${finalPath}`;
};

/**
 * Returns a fallback image URL if the given path is empty/invalid, otherwise
 * returns the result of `getImageUrl(path)`.
 */
export const getImageUrlOrFallback = (path: string | null | undefined): string => {
  if (!path || (typeof path === "string" && path.trim() === "")) {
    return `${BACKEND_UPLOAD_URL}/assets/img/default-placeholder.png`;
  }
  return getImageUrl(path);
};
export default url;