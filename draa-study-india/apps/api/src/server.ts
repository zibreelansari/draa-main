import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import {
  createApplication,
  createInstituteProgramme,
  createSupportTicket,
  createInstituteUser,
  createSession,
  createStudent,
  dashboardWorkspace,
  deleteSession,
  findUser,
  getCourseBySlug,
  getSessionUser,
  listCourses,
  listInstitutes,
  markNotificationRead,
  openDatabase,
  studentApplications,
  toggleSavedCourse,
  updateInstituteApplication,
  updateInstituteApproval,
  updateInstituteProgrammeStatus,
  updateSupportTicket,
} from "@draa/database";
import {
  applicationSchema,
  instituteRegistrationSchema,
  loginSchema,
  studentRegistrationSchema,
  type PublicUser,
  type UserRole,
} from "@draa/shared";
import { config } from "./config.js";
import { createSessionToken, hashPassword, hashToken, verifyPassword } from "./security.js";
import { seedDemoUsers } from "./seed.js";

const SESSION_COOKIE = "draa_study_session";
type AuthenticatedRequest = Request & { user?: PublicUser };

const app = express();
const db = openDatabase(config.databaseFile);

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.webOrigin, credentials: true }));
app.use(express.json({ limit: "250kb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.get("origin");
    if (origin && origin !== config.webOrigin) {
      res.status(403).json({ error: "Request origin is not allowed." });
      return;
    }
  }
  next();
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });

function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.secureCookie,
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function sessionFromRequest(req: Request) {
  const token = req.cookies?.[SESSION_COOKIE];
  return typeof token === "string" ? token : undefined;
}

function requireAuth(roles?: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = sessionFromRequest(req);
    const user = token ? getSessionUser(db, hashToken(token)) : undefined;
    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }
    if (roles && !roles.includes(user.role)) {
      res.status(403).json({ error: "You do not have permission for this action." });
      return;
    }
    req.user = user;
    next();
  };
}

function publicUser(user: NonNullable<ReturnType<typeof findUser>>): PublicUser {
  return { id: user.id, email: user.email, role: user.role, displayName: user.display_name };
}

app.get("/api/health", (_req, res) => res.json({ data: { status: "ok", service: "draa-study-india-api" } }));

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the login details.", details: parsed.error.flatten() });
    return;
  }
  const account = findUser(db, parsed.data.email, parsed.data.role);
  const valid = account ? await verifyPassword(parsed.data.password, account.password_hash) : false;
  if (!account || !valid || account.status !== "ACTIVE") {
    res.status(401).json({ error: "Email, password or selected account type is incorrect." });
    return;
  }
  const { token, tokenHash } = createSessionToken();
  const expiresAt = new Date(Date.now() + config.sessionDays * 86_400_000).toISOString();
  createSession(db, account.id, tokenHash, expiresAt);
  setSessionCookie(res, token);
  res.json({ data: { user: publicUser(account) } });
});

app.post("/api/auth/register/student", authLimiter, async (req, res) => {
  const parsed = studentRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the registration details.", details: parsed.error.flatten() });
    return;
  }
  try {
    const user = createStudent(db, parsed.data, await hashPassword(parsed.data.password));
    res.status(201).json({ data: { user, message: "Student account created. You can now log in." } });
  } catch {
    res.status(409).json({ error: "A student account already exists for this email." });
  }
});

app.post("/api/auth/register/institute", authLimiter, async (req, res) => {
  const parsed = instituteRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the registration details.", details: parsed.error.flatten() });
    return;
  }
  try {
    const user = createInstituteUser(db, parsed.data, await hashPassword(parsed.data.password));
    res.status(201).json({ data: { user, message: "Institute registration received for administrator review." } });
  } catch {
    res.status(409).json({ error: "An institute account already exists for this email." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const token = sessionFromRequest(req);
  if (token) deleteSession(db, hashToken(token));
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ data: { success: true } });
});

app.get("/api/auth/me", requireAuth(), (req: AuthenticatedRequest, res) => res.json({ data: { user: req.user } }));
app.get("/api/catalog/institutes", (_req, res) => res.json({ data: { institutes: listInstitutes(db) } }));
app.get("/api/catalog/courses", (req, res) => res.json({ data: { courses: listCourses(db, typeof req.query.level === "string" ? req.query.level : undefined, typeof req.query.discipline === "string" ? req.query.discipline : undefined) } }));
app.get("/api/catalog/courses/:slug", (req, res) => {
  const course = getCourseBySlug(db, req.params.slug);
  if (!course) {
    res.status(404).json({ error: "Programme not found." });
    return;
  }
  res.json({ data: { course } });
});
app.get("/api/dashboard", requireAuth(), (req: AuthenticatedRequest, res) => res.json({ data: dashboardWorkspace(db, req.user!.role, req.user!.id) }));
app.post("/api/dashboard/notifications/:id/read", requireAuth(), (req: AuthenticatedRequest, res) => {
  markNotificationRead(db, req.user!.id, Number(req.params.id));
  res.json({ data: { success: true } });
});
app.post("/api/dashboard/support", requireAuth(), (req: AuthenticatedRequest, res) => {
  const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
  const category = typeof req.body?.category === "string" ? req.body.category.trim() : "General";
  if (subject.length < 8 || subject.length > 180 || category.length > 60) {
    res.status(400).json({ error: "Please provide a clear support request." });
    return;
  }
  res.status(201).json({ data: { ticket: createSupportTicket(db, req.user!.id, subject, category) } });
});
app.post("/api/student/saved-courses/:courseId", requireAuth(["STUDENT"]), (req: AuthenticatedRequest, res) => {
  res.json({ data: toggleSavedCourse(db, req.user!.id, Number(req.params.courseId), true) });
});
app.delete("/api/student/saved-courses/:courseId", requireAuth(["STUDENT"]), (req: AuthenticatedRequest, res) => {
  res.json({ data: toggleSavedCourse(db, req.user!.id, Number(req.params.courseId), false) });
});
app.patch("/api/institute/applications/:id", requireAuth(["INSTITUTE"]), (req: AuthenticatedRequest, res) => {
  try {
    const status = typeof req.body?.status === "string" ? req.body.status : "";
    const note = typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 1000) : undefined;
    res.json({ data: { application: updateInstituteApplication(db, req.user!.id, Number(req.params.id), status, note) } });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Application could not be updated." });
  }
});
app.post("/api/institute/programmes", requireAuth(["INSTITUTE"]), (req: AuthenticatedRequest, res) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const discipline = typeof req.body?.discipline === "string" ? req.body.discipline.trim() : "";
    const level = typeof req.body?.level === "string" ? req.body.level : "";
    const mode = typeof req.body?.mode === "string" ? req.body.mode : "";
    const durationMonths = Number(req.body?.durationMonths);
    const tuitionFeeInr = req.body?.tuitionFeeInr ? Number(req.body.tuitionFeeInr) : undefined;
    const startDate = typeof req.body?.startDate === "string" ? req.body.startDate : undefined;
    if (title.length < 5 || discipline.length < 3 || !Number.isInteger(durationMonths) || durationMonths < 1 || durationMonths > 96) {
      res.status(400).json({ error: "Please provide complete programme information." });
      return;
    }
    res.status(201).json({ data: { programme: createInstituteProgramme(db, req.user!.id, { title, discipline, level, durationMonths, tuitionFeeInr, mode, startDate }) } });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Programme could not be created." });
  }
});
app.patch("/api/institute/programmes/:id/status", requireAuth(["INSTITUTE"]), (req: AuthenticatedRequest, res) => {
  try {
    const status = typeof req.body?.status === "string" ? req.body.status : "";
    res.json({ data: { programme: updateInstituteProgrammeStatus(db, req.user!.id, Number(req.params.id), status) } });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Programme could not be updated." });
  }
});
app.patch("/api/admin/institutes/:userId/approval", requireAuth(["ADMIN"]), (req: AuthenticatedRequest, res) => {
  try {
    const status = typeof req.body?.status === "string" ? req.body.status : "";
    res.json({ data: { institute: updateInstituteApproval(db, req.user!.id, Number(req.params.userId), status) } });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Institute approval could not be updated." });
  }
});
app.patch("/api/admin/support/:id", requireAuth(["ADMIN"]), (req: AuthenticatedRequest, res) => {
  try {
    const status = typeof req.body?.status === "string" ? req.body.status : "";
    res.json({ data: { ticket: updateSupportTicket(db, req.user!.id, Number(req.params.id), status) } });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Support request could not be updated." });
  }
});
app.get("/api/student/applications", requireAuth(["STUDENT"]), (req: AuthenticatedRequest, res) => res.json({ data: { applications: studentApplications(db, req.user!.id) } }));
app.post("/api/student/applications", requireAuth(["STUDENT"]), (req: AuthenticatedRequest, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the application details.", details: parsed.error.flatten() });
    return;
  }
  try {
    res.status(201).json({ data: { application: createApplication(db, req.user!.id, parsed.data.courseId, parsed.data.statement) } });
  } catch {
    res.status(409).json({ error: "An application for this programme already exists." });
  }
});

app.use((_req, res) => res.status(404).json({ error: "API route not found." }));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "The server could not complete this request." });
});

async function start() {
  if (config.seedDemo) await seedDemoUsers();
  app.listen(config.port, "127.0.0.1", () => console.log(`DRAA Study in India API listening on http://127.0.0.1:${config.port}`));
}

void start();
