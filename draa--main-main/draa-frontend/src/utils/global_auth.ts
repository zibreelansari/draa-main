import { useEffect } from"react";
import { useNavigate } from"react-router-dom";
import toast from"./toast";
import { useAuthModal } from"../components/register/auth/AuthModalContext";

export type UserRole ="ADMIN" |"TEACHER" |"STUDENT" |"GUEST";

export const getStoredUser = () => {
  const raw = localStorage.getItem("edudocs");
  if (!raw) return null;

  try {
    const user = JSON.parse(raw);
    // Normalize ID
    if (user && !user.id && user._id) {
      user.id = user._id;
    }
    // Normalize Name
    if (user && (!user.name || user.name.trim() === "")) {
      user.name = user.student_name || user.aname || user.tname || user.A_name || user.T_name || (user.email ? user.email.split("@")[0] : "Student");
    }
    return user;
  } catch {
    return null;
  }
};

/**
 * Returns a consistent cart key based on the user's login status.
 * Prevents"empty cart" bugs caused by mismatched keys.
 */
export const getCartKey = (): string => {
  const user = getStoredUser();
  if (user && user.id) {
    return `draa-cart-${user.id}`;
  }
  return "draa-guest-cart"; // Unified guest key matching local components
};

export const isAuthenticated = (): boolean => {
  const user = getStoredUser();
  return !!(user && user.token && user.id);
};

export const notifyAuthUpdate = () => {
  window.dispatchEvent(new Event("auth-updated"));
};

export const getAuthHeaders = (): Record<string, string> => {
  const user = getStoredUser();
  if (user && user.token) {
    return {
      Authorization: `Bearer ${user.token}`,
    };
  }
  return {};
};

export const getUserRole = (): UserRole => {
  const user = getStoredUser();
  if (!user) return"GUEST";

  //  ADMIN: Check for admin-specific fields
  if (user.A_email || user.aname || user.A_name || user.role ==="admin") {
    return"ADMIN";
  }

  //  TEACHER: Check for teacher-specific fields
  if (user.T_email || user.tname || user.T_name || user.role ==="teacher") {
    return"TEACHER";
  }

  //  STUDENT: If they have a token and aren't admin/teacher, they are likely a student
  //  Also checking for common student fields as fallback
  if (user.token || user.email || user.name || user.id || user.role ==="student") {
    return"STUDENT";
  }

  return"GUEST";
};

export const getLoginPath = (role: UserRole): string => {
  switch (role) {
    case"ADMIN": return"/admin-login";
    case"TEACHER": return"/teacher-login";
    case"STUDENT": return"/student-login";
    default: return"/";
  }
};

export const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case"ADMIN": return"/admin-dashboard";
    case"TEACHER": return"/teacher-dashboard";
    case"STUDENT": return"/v2/student-dashboard";
    default: return"/";
  }
};

export const useStudentAuthGuard = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    // Simple check: if there's a stored session with a token, allow access.
    // Don't over-engineer role detection — just check if logged in at all.
    const user = getStoredUser();
    if (user && user.token) return; // Has a session — allow

    // No session at all — redirect to login
    toast.error("Please log in to access this page");
    openAuthModal("student", "login");
    navigate("/", { replace: true });
  }, [navigate, openAuthModal]);
};

export const useAdminAuthGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getUserRole();
    if (role === "ADMIN") return;
    toast.error("Access Denied: Admin privileges required");
    navigate(role === "GUEST" ? "/admin-login" : getLoginPath(role), { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useTeacherAuthGuard = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const role = getUserRole();
    if (role === "TEACHER") return;
    toast.error("Access Denied: Teacher privileges required");
    if (role === "GUEST") {
      openAuthModal("teacher", "login");
      navigate("/", { replace: true });
      return;
    }
    navigate(getLoginPath(role), { replace: true });
  }, [navigate, openAuthModal]);
};

export const redirectToLogin = (navigate: (path: string, options?: any) => void, errorMsg?: string) => {
  if (errorMsg) {
    toast.error(errorMsg);
  }
  
  const path = window.location.pathname.toLowerCase();
  
  // Try to read last known user role from storage before clearing
  let lastRole: string | null = null;
  const raw = localStorage.getItem("edudocs");
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user.A_email || user.aname || user.A_name || user.role === "admin") {
        lastRole = "ADMIN";
      } else if (user.T_email || user.tname || user.T_name || user.role === "teacher") {
        lastRole = "TEACHER";
      } else if (user.role === "student") {
        lastRole = "STUDENT";
      }
    } catch (_) {}
  }
  
  // Clear the expired session
  localStorage.removeItem("edudocs");
  
  // Detect if the path is teacher-oriented
  const isTeacherRoute = 
    path.includes("teacher") || 
    path.includes("manage-courses") || 
    path.includes("add-courses") || 
    path.includes("course-categories") ||
    path.includes("exams") || 
    path.includes("manage-exams") ||
    path.includes("assignments") || 
    path.includes("publish-course-content") || 
    path.includes("manage-courses-content") ||
    path.includes("recorded-videos") ||
    path.includes("live-sessions") ||
    path.includes("books") ||
    path.includes("syllabus") ||
    path.includes("previous-year-questions");

  // Detect if the path is admin-oriented
  const isAdminRoute = 
    path.includes("admin") || 
    path.includes("manage-teachers") || 
    path.includes("manage-students") || 
    path.includes("finance") || 
    path.includes("payment");

  if (isTeacherRoute || lastRole === "TEACHER") {
    navigate("/teacher-login", { replace: true });
  } else if (isAdminRoute || lastRole === "ADMIN") {
    navigate("/admin-login", { replace: true });
  } else if (lastRole === "STUDENT") {
    navigate("/student-login", { replace: true });
  } else {
    navigate("/", { replace: true });
  }
};

