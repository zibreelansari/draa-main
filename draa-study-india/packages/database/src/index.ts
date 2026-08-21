import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { InstituteRegistrationInput, PublicUser, StudentRegistrationInput, UserRole } from "@draa/shared";
import { migrations } from "./schema.js";

export type PortalDatabase = Database.Database;

export function openDatabase(file = process.env.DATABASE_FILE || resolve(process.cwd(), "../../data/draa-study-india.db")): PortalDatabase {
  mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
  const applied = new Set((db.prepare("SELECT version FROM schema_migrations").all() as Array<{ version: number }>).map((row) => row.version));
  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;
    db.transaction(() => {
      db.exec(migration.sql);
      db.prepare("INSERT INTO schema_migrations(version) VALUES (?)").run(migration.version);
    })();
  }
  seedCatalog(db);
  return db;
}

export function seedCatalog(db: PortalDatabase) {
  db.transaction(() => {
    const saveInstitute = db.prepare(`INSERT INTO institutes(name,slug,city,state,type,description,image_url)
      VALUES (?,?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name,city=excluded.city,state=excluded.state,type=excluded.type,description=excluded.description,image_url=excluded.image_url`);
    const institutes = [
      ["DRAA Institute of Technology", "draa-institute-technology", "Bengaluru", "Karnataka", "Technology", "Demonstration institution profile for engineering, computing and applied research.", "/media/university-building.jpg"],
      ["DRAA School of Management", "draa-school-management", "New Delhi", "Delhi", "Management", "Demonstration institution profile for business, public policy and leadership programmes.", "/media/campus-students.jpg"],
      ["DRAA University of Liberal Studies", "draa-university-liberal-studies", "Pune", "Maharashtra", "Multidisciplinary", "Demonstration institution profile for humanities, sciences and interdisciplinary learning.", "/media/books-library.jpg"],
      ["DRAA College of Life Sciences", "draa-college-life-sciences", "Hyderabad", "Telangana", "Health & Sciences", "Demonstration institution profile for health, biotechnology and life-science pathways.", "/media/campus-students.jpg"],
      ["DRAA Institute of Agriculture & Sustainability", "draa-agriculture-sustainability", "Coimbatore", "Tamil Nadu", "Agriculture", "Demonstration institution profile for agriculture, food systems and sustainability.", "/media/university-building.jpg"],
      ["DRAA Centre for Indian Knowledge Systems", "draa-indian-knowledge-systems", "Varanasi", "Uttar Pradesh", "Specialist", "Demonstration institution profile for yoga, Buddhist studies, languages and cultural learning.", "/media/books-library.jpg"],
    ] as const;
    for (const institute of institutes) saveInstitute.run(...institute);

    const instituteId = db.prepare("SELECT id FROM institutes WHERE slug=?");
    const id = (slug: string) => Number((instituteId.get(slug) as { id: number }).id);
    const saveCourse = db.prepare(`INSERT INTO courses(institute_id,title,slug,discipline,level,duration_months,tuition_fee_inr,mode,course_type,scholarship_available,eligibility,start_date)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET institute_id=excluded.institute_id,title=excluded.title,discipline=excluded.discipline,level=excluded.level,duration_months=excluded.duration_months,tuition_fee_inr=excluded.tuition_fee_inr,mode=excluded.mode,course_type=excluded.course_type,scholarship_available=excluded.scholarship_available,eligibility=excluded.eligibility,start_date=excluded.start_date`);
    const courses = [
      ["draa-institute-technology", "Bachelor of Computer Science", "bachelor-computer-science", "Engineering & Technology", "UNDERGRADUATE", 48, 450000, "OFFLINE", "REGULAR", 1, "Secondary education with Mathematics and programme-specific minimum results.", "2027-07-15"],
      ["draa-institute-technology", "B.Tech in Artificial Intelligence & Machine Learning", "btech-artificial-intelligence", "Engineering & Technology", "UNDERGRADUATE", 48, 510000, "OFFLINE", "REGULAR", 1, "Secondary education with Physics and Mathematics; additional entrance conditions may apply.", "2027-07-15"],
      ["draa-institute-technology", "Master of Data Science", "master-data-science", "Engineering & Technology", "POSTGRADUATE", 24, 520000, "BLENDED", "REGULAR", 1, "Relevant bachelor’s degree with quantitative or computing preparation.", "2027-08-01"],
      ["draa-institute-technology", "PG Diploma in Cybersecurity", "pg-diploma-cybersecurity", "Engineering & Technology", "POSTGRADUATE", 12, 240000, "BLENDED", "SKILL_BASED", 0, "Bachelor’s degree; foundational computing knowledge is recommended.", "2027-01-15"],
      ["draa-institute-technology", "Certificate in Web Development", "certificate-web-development", "Computer Applications", "CERTIFICATE", 6, 85000, "ONLINE", "SKILL_BASED", 0, "Secondary education and basic computer literacy.", "2027-02-01"],
      ["draa-institute-technology", "Certificate in Mobile App Development", "certificate-mobile-app-development", "Computer Applications", "CERTIFICATE", 6, 95000, "BLENDED", "SKILL_BASED", 0, "Secondary education; prior coding experience is helpful but not mandatory.", "2027-02-01"],
      ["draa-school-management", "Master of Business Administration", "master-business-administration", "Management", "POSTGRADUATE", 24, 600000, "OFFLINE", "REGULAR", 1, "Recognised bachelor’s degree; institution-specific selection requirements apply.", "2027-07-10"],
      ["draa-school-management", "Master of Public Policy", "master-public-policy", "Law & Public Policy", "POSTGRADUATE", 24, 420000, "OFFLINE", "REGULAR", 1, "Recognised bachelor’s degree and statement of purpose.", "2027-07-10"],
      ["draa-school-management", "Diploma in Digital Marketing", "diploma-digital-marketing", "Management", "CERTIFICATE", 9, 120000, "ONLINE", "SKILL_BASED", 0, "Secondary education; suitable for early-career learners and professionals.", "2027-03-01"],
      ["draa-university-liberal-studies", "Bachelor of Liberal Arts", "bachelor-liberal-arts", "Arts & Humanities", "UNDERGRADUATE", 36, 330000, "OFFLINE", "REGULAR", 1, "Recognised secondary education with institution-specific minimum results.", "2027-07-20"],
      ["draa-university-liberal-studies", "Bachelor of Laws", "bachelor-laws", "Law & Public Policy", "UNDERGRADUATE", 60, 480000, "OFFLINE", "REGULAR", 0, "Recognised secondary education; professional recognition conditions must be checked separately.", "2027-07-20"],
      ["draa-university-liberal-studies", "Bachelor of Hospitality Management", "bachelor-hospitality-management", "Hospitality & Tourism", "UNDERGRADUATE", 36, 360000, "OFFLINE", "REGULAR", 1, "Recognised secondary education and programme-specific language requirements.", "2027-07-20"],
      ["draa-college-life-sciences", "M.Sc. Biotechnology", "msc-biotechnology", "Sciences", "POSTGRADUATE", 24, 390000, "OFFLINE", "REGULAR", 1, "Relevant life-science bachelor’s degree with laboratory preparation.", "2027-08-05"],
      ["draa-college-life-sciences", "Bachelor of Nursing", "bachelor-nursing", "Allied Health", "UNDERGRADUATE", 48, 440000, "OFFLINE", "REGULAR", 0, "Secondary education with relevant science subjects; regulatory conditions apply.", "2027-08-05"],
      ["draa-agriculture-sustainability", "B.Sc. Agriculture", "bsc-agriculture", "Agriculture", "UNDERGRADUATE", 48, 350000, "OFFLINE", "REGULAR", 1, "Secondary education with relevant science or agriculture subjects.", "2027-07-25"],
      ["draa-agriculture-sustainability", "PhD in Sustainable Agriculture", "phd-sustainable-agriculture", "Agriculture", "DOCTORAL", 36, 480000, "OFFLINE", "REGULAR", 1, "Relevant postgraduate degree, research proposal and supervisor alignment.", "2027-01-10"],
      ["draa-indian-knowledge-systems", "Certificate in Yoga Studies", "certificate-yoga-studies", "Yoga & Wellness", "CERTIFICATE", 6, 70000, "BLENDED", "SHORT_TERM", 0, "Open to eligible adult learners; health declarations may be required.", "2027-02-15"],
      ["draa-indian-knowledge-systems", "Certificate in Buddhist Studies", "certificate-buddhist-studies", "Indian Knowledge Systems", "CERTIFICATE", 6, 65000, "ONLINE", "SHORT_TERM", 0, "Open to eligible adult learners with suitable language proficiency.", "2027-02-15"],
    ] as const;
    for (const [instituteSlug, ...course] of courses) saveCourse.run(id(instituteSlug), ...course);
  })();
}

export function findUser(db: PortalDatabase, email: string, role: UserRole) {
  return db.prepare("SELECT id,email,password_hash,role,status,display_name FROM users WHERE email=? AND role=?").get(email, role) as undefined | { id: number; email: string; password_hash: string; role: UserRole; status: string; display_name: string };
}

export function createStudent(db: PortalDatabase, input: StudentRegistrationInput, passwordHash: string): PublicUser {
  return db.transaction((): PublicUser => {
    const result = db.prepare("INSERT INTO users(email,password_hash,role,status,display_name) VALUES (?,?,'STUDENT','ACTIVE',?)").run(input.email, passwordHash, `${input.firstName} ${input.lastName}`);
    const id = Number(result.lastInsertRowid);
    db.prepare("INSERT INTO student_profiles(user_id,first_name,last_name,country) VALUES (?,?,?,?)").run(id, input.firstName, input.lastName, input.country);
    return { id, email: input.email, role: "STUDENT", displayName: `${input.firstName} ${input.lastName}` };
  })();
}

export function createInstituteUser(db: PortalDatabase, input: InstituteRegistrationInput, passwordHash: string): PublicUser {
  return db.transaction((): PublicUser => {
    const result = db.prepare("INSERT INTO users(email,password_hash,role,status,display_name) VALUES (?,?,'INSTITUTE','PENDING',?)").run(input.email, passwordHash, input.instituteName);
    const id = Number(result.lastInsertRowid);
    db.prepare("INSERT INTO institute_profiles(user_id,institute_name,contact_name,city,website) VALUES (?,?,?,?,?)").run(id, input.instituteName, input.contactName, input.city, input.website || null);
    return { id, email: input.email, role: "INSTITUTE", displayName: input.instituteName };
  })();
}

export function ensureUser(db: PortalDatabase, email: string, role: UserRole, displayName: string, passwordHash: string) {
  db.prepare("INSERT OR IGNORE INTO users(email,password_hash,role,status,display_name) VALUES (?,?,?,'ACTIVE',?)").run(email, passwordHash, role, displayName);
}

export function ensureDemoWorkspace(db: PortalDatabase) {
  const student = db.prepare("SELECT id FROM users WHERE email=? AND role='STUDENT'").get("student@demo.draa.in") as { id: number } | undefined;
  const institute = db.prepare("SELECT id FROM users WHERE email=? AND role='INSTITUTE'").get("institute@demo.draa.in") as { id: number } | undefined;
  const admin = db.prepare("SELECT id FROM users WHERE email=? AND role='ADMIN'").get("admin@demo.draa.in") as { id: number } | undefined;
  if (!student || !institute || !admin) return;

  db.transaction(() => {
    db.prepare("INSERT OR IGNORE INTO student_profiles(user_id,first_name,last_name,country,passport_number,date_of_birth) VALUES (?,?,?,?,?,?)")
      .run(student.id, "Amina", "Rahman", "Bangladesh", "PENDING", "2003-04-18");
    db.prepare("INSERT OR IGNORE INTO institute_profiles(user_id,institute_name,contact_name,city,website,approval_status) VALUES (?,?,?,?,?,'APPROVED')")
      .run(institute.id, "DRAA Institute of Technology", "Dr. Meera Kapoor", "Bengaluru", "https://example.edu");
    db.prepare("UPDATE institute_profiles SET approval_status='APPROVED' WHERE user_id=?").run(institute.id);
    db.prepare("UPDATE users SET status='ACTIVE' WHERE id=?").run(institute.id);
    db.prepare("UPDATE institutes SET owner_user_id=? WHERE slug='draa-institute-technology'").run(institute.id);

    const courseRows = db.prepare("SELECT id,slug FROM courses WHERE slug IN ('bachelor-computer-science','master-data-science','btech-artificial-intelligence','pg-diploma-cybersecurity')").all() as Array<{ id: number; slug: string }>;
    const courseId = new Map(courseRows.map((course) => [course.slug, course.id]));
    const saveApplication = db.prepare("INSERT OR IGNORE INTO applications(student_user_id,course_id,statement,status,decision_note,offer_letter_url) VALUES (?,?,?,?,?,?)");
    const csId = courseId.get("bachelor-computer-science");
    const dataId = courseId.get("master-data-science");
    if (csId) saveApplication.run(student.id, csId, "I want to build a strong foundation in computing and use technology to improve access to education in my community.", "UNDER_REVIEW", "Academic documents are being reviewed by the institution.", null);
    if (dataId) saveApplication.run(student.id, dataId, "My quantitative background and interest in responsible data systems motivate me to pursue advanced study in data science.", "OFFERED", "Conditional offer issued subject to final transcript verification.", "/demo/offer-letter.pdf");
    for (const slug of ["btech-artificial-intelligence", "pg-diploma-cybersecurity"]) {
      const id = courseId.get(slug);
      if (id) db.prepare("INSERT OR IGNORE INTO saved_courses(student_user_id,course_id) VALUES (?,?)").run(student.id, id);
    }

    const saveDocument = db.prepare("INSERT OR IGNORE INTO student_documents(student_user_id,document_type,file_name,status) VALUES (?,?,?,?)");
    saveDocument.run(student.id, "Passport", "passport-amina.pdf", "ACTION_REQUIRED");
    saveDocument.run(student.id, "Academic transcripts", "transcripts.pdf", "VERIFIED");
    saveDocument.run(student.id, "English proficiency", "ielts-score.pdf", "UPLOADED");
    saveDocument.run(student.id, "Statement of purpose", null, "MISSING");

    const addNotification = db.prepare(`INSERT INTO notifications(user_id,audience_role,title,body,kind)
      SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=? AND title=?)`);
    const notifications = [
      [student.id, "STUDENT", "Document needs attention", "Upload a clearer passport scan before your application review can be completed.", "ACTION"],
      [student.id, "STUDENT", "Conditional offer received", "DRAA Institute of Technology has issued a conditional offer for Master of Data Science.", "SUCCESS"],
      [institute.id, "INSTITUTE", "Two applications need review", "Review the latest academic documents and record an admission decision.", "ACTION"],
      [admin.id, "ADMIN", "Portal operations summary ready", "Review institute approvals, support activity and catalogue health.", "INFO"],
    ] as const;
    for (const [userId, role, title, body, kind] of notifications) addNotification.run(userId, role, title, body, kind, userId, title);

    db.prepare(`INSERT INTO support_tickets(user_id,subject,category,status,priority)
      SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM support_tickets WHERE user_id=? AND subject=?)`)
      .run(student.id, "Clarification on transcript verification", "Application", "IN_PROGRESS", "NORMAL", student.id, "Clarification on transcript verification");
    db.prepare(`INSERT INTO audit_logs(user_id,action,entity_type,entity_id,metadata_json)
      SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM audit_logs WHERE action=? AND entity_id=?)`)
      .run(admin.id, "DEMO_WORKSPACE_INITIALISED", "SYSTEM", "dashboard-v1", JSON.stringify({ source: "seed" }), "DEMO_WORKSPACE_INITIALISED", "dashboard-v1");
  })();
}

export function createSession(db: PortalDatabase, userId: number, tokenHash: string, expiresAt: string) {
  db.prepare("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES (?,?,?)").run(userId, tokenHash, expiresAt);
}

export function deleteSession(db: PortalDatabase, tokenHash: string) {
  db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash);
}

export function getSessionUser(db: PortalDatabase, tokenHash: string): PublicUser | undefined {
  const row = db.prepare(`SELECT u.id,u.email,u.role,u.display_name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now') AND u.status='ACTIVE'`).get(tokenHash) as undefined | { id: number; email: string; role: UserRole; display_name: string };
  return row ? { id: row.id, email: row.email, role: row.role, displayName: row.display_name } : undefined;
}

export function listInstitutes(db: PortalDatabase) {
  return db.prepare("SELECT id,name,slug,city,state,type,description,image_url AS imageUrl FROM institutes WHERE status='PUBLISHED' ORDER BY name").all();
}

export function listCourses(db: PortalDatabase, level?: string, discipline?: string) {
  const filters = ["c.status='PUBLISHED'"];
  const values: string[] = [];
  if (level) { filters.push("c.level=?"); values.push(level); }
  if (discipline) { filters.push("c.discipline=?"); values.push(discipline); }
  return db.prepare(`SELECT c.id,c.title,c.slug,c.discipline,c.level,c.duration_months AS durationMonths,c.tuition_fee_inr AS tuitionFeeInr,c.mode,c.course_type AS courseType,c.scholarship_available AS scholarshipAvailable,c.eligibility,c.start_date AS startDate,i.name AS instituteName,i.slug AS instituteSlug,i.city,i.state,i.type AS instituteType FROM courses c JOIN institutes i ON i.id=c.institute_id WHERE ${filters.join(" AND ")} ORDER BY c.title`).all(...values);
}

export function getCourseBySlug(db: PortalDatabase, slug: string) {
  return db.prepare(`SELECT c.id,c.title,c.slug,c.discipline,c.level,c.duration_months AS durationMonths,c.tuition_fee_inr AS tuitionFeeInr,c.mode,c.course_type AS courseType,c.scholarship_available AS scholarshipAvailable,c.eligibility,c.start_date AS startDate,i.name AS instituteName,i.slug AS instituteSlug,i.city,i.state,i.type AS instituteType,i.description AS instituteDescription,i.image_url AS imageUrl FROM courses c JOIN institutes i ON i.id=c.institute_id WHERE c.slug=? AND c.status='PUBLISHED' AND i.status='PUBLISHED'`).get(slug);
}

export function createApplication(db: PortalDatabase, studentUserId: number, courseId: number, statement: string) {
  const result = db.prepare("INSERT INTO applications(student_user_id,course_id,statement) VALUES (?,?,?)").run(studentUserId, courseId, statement);
  return { id: Number(result.lastInsertRowid), status: "SUBMITTED" };
}

export function studentApplications(db: PortalDatabase, studentUserId: number) {
  return db.prepare("SELECT a.id,a.status,a.submitted_at AS submittedAt,c.title,i.name AS instituteName FROM applications a JOIN courses c ON c.id=a.course_id JOIN institutes i ON i.id=c.institute_id WHERE a.student_user_id=? ORDER BY a.submitted_at DESC").all(studentUserId);
}

export function dashboardSummary(db: PortalDatabase, role: UserRole, userId: number) {
  if (role === "STUDENT") return { applications: (db.prepare("SELECT COUNT(*) AS count FROM applications WHERE student_user_id=?").get(userId) as { count: number }).count, courses: (db.prepare("SELECT COUNT(*) AS count FROM courses WHERE status='PUBLISHED'").get() as { count: number }).count };
  if (role === "INSTITUTE") return { approvalStatus: (db.prepare("SELECT approval_status AS approvalStatus FROM institute_profiles WHERE user_id=?").get(userId) as { approvalStatus?: string } | undefined)?.approvalStatus || "PENDING", publishedCourses: 0 };
  return { students: (db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='STUDENT'").get() as { count: number }).count, institutes: (db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='INSTITUTE'").get() as { count: number }).count, applications: (db.prepare("SELECT COUNT(*) AS count FROM applications").get() as { count: number }).count };
}

function notificationsFor(db: PortalDatabase, userId: number, role: UserRole) {
  return db.prepare(`SELECT id,title,body,kind,is_read AS isRead,created_at AS createdAt
    FROM notifications WHERE user_id=? OR (user_id IS NULL AND audience_role=?) ORDER BY is_read,created_at DESC LIMIT 8`).all(userId, role);
}

export function dashboardWorkspace(db: PortalDatabase, role: UserRole, userId: number) {
  const user = db.prepare("SELECT id,email,role,display_name AS displayName,created_at AS createdAt FROM users WHERE id=?").get(userId);
  if (role === "STUDENT") {
    const profile = db.prepare(`SELECT first_name AS firstName,last_name AS lastName,country,passport_number AS passportNumber,date_of_birth AS dateOfBirth
      FROM student_profiles WHERE user_id=?`).get(userId) || {};
    const applications = db.prepare(`SELECT a.id,a.status,a.submitted_at AS submittedAt,a.updated_at AS updatedAt,a.decision_note AS decisionNote,a.offer_letter_url AS offerLetterUrl,
      c.id AS courseId,c.title,c.slug,c.discipline,c.level,c.start_date AS startDate,c.tuition_fee_inr AS tuitionFeeInr,i.name AS instituteName,i.city,i.state
      FROM applications a JOIN courses c ON c.id=a.course_id JOIN institutes i ON i.id=c.institute_id
      WHERE a.student_user_id=? ORDER BY a.updated_at DESC`).all(userId);
    const savedCourses = db.prepare(`SELECT c.id,c.title,c.slug,c.level,c.discipline,c.start_date AS startDate,c.tuition_fee_inr AS tuitionFeeInr,i.name AS instituteName,i.city
      FROM saved_courses s JOIN courses c ON c.id=s.course_id JOIN institutes i ON i.id=c.institute_id WHERE s.student_user_id=? ORDER BY s.saved_at DESC`).all(userId);
    const documents = db.prepare("SELECT id,document_type AS documentType,file_name AS fileName,status,updated_at AS updatedAt FROM student_documents WHERE student_user_id=? ORDER BY id").all(userId);
    const totalCourses = (db.prepare("SELECT COUNT(*) AS count FROM courses WHERE status='PUBLISHED'").get() as { count: number }).count;
    const openTickets = (db.prepare("SELECT COUNT(*) AS count FROM support_tickets WHERE user_id=? AND status!='RESOLVED'").get(userId) as { count: number }).count;
    return { role, user, profile, applications, savedCourses, documents, notifications: notificationsFor(db, userId, role), metrics: { applications: applications.length, saved: savedCourses.length, documentsReady: (documents as Array<{ status: string }>).filter((d) => d.status === "VERIFIED").length, totalCourses, openTickets } };
  }

  if (role === "INSTITUTE") {
    const profile = db.prepare(`SELECT institute_name AS instituteName,contact_name AS contactName,city,website,approval_status AS approvalStatus FROM institute_profiles WHERE user_id=?`).get(userId) || {};
    const institute = db.prepare("SELECT id,name,slug,city,state,type,description,status FROM institutes WHERE owner_user_id=?").get(userId) as { id?: number } | undefined;
    const instituteId = institute?.id || -1;
    const programmes = db.prepare(`SELECT c.id,c.title,c.slug,c.level,c.discipline,c.mode,c.status,c.start_date AS startDate,c.tuition_fee_inr AS tuitionFeeInr,
      COUNT(a.id) AS applications FROM courses c LEFT JOIN applications a ON a.course_id=c.id WHERE c.institute_id=? GROUP BY c.id ORDER BY c.created_at DESC`).all(instituteId);
    const applicants = db.prepare(`SELECT a.id,a.status,a.submitted_at AS submittedAt,a.updated_at AS updatedAt,a.decision_note AS decisionNote,a.offer_letter_url AS offerLetterUrl,
      u.display_name AS studentName,u.email,sp.country,c.title AS courseTitle,c.level
      FROM applications a JOIN users u ON u.id=a.student_user_id LEFT JOIN student_profiles sp ON sp.user_id=u.id JOIN courses c ON c.id=a.course_id
      WHERE c.institute_id=? ORDER BY CASE a.status WHEN 'SUBMITTED' THEN 0 WHEN 'UNDER_REVIEW' THEN 1 ELSE 2 END,a.updated_at DESC`).all(instituteId);
    const applicationCounts = db.prepare(`SELECT a.status,COUNT(*) AS count FROM applications a JOIN courses c ON c.id=a.course_id WHERE c.institute_id=? GROUP BY a.status`).all(instituteId);
    return { role, user, profile, institute, programmes, applicants, applicationCounts, notifications: notificationsFor(db, userId, role), metrics: { programmes: programmes.length, applicants: applicants.length, awaitingReview: (applicants as Array<{ status: string }>).filter((a) => ["SUBMITTED", "UNDER_REVIEW"].includes(a.status)).length, offers: (applicants as Array<{ status: string }>).filter((a) => a.status === "OFFERED").length } };
  }

  const metrics = {
    students: (db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='STUDENT'").get() as { count: number }).count,
    institutes: (db.prepare("SELECT COUNT(*) AS count FROM institutes WHERE status='PUBLISHED'").get() as { count: number }).count,
    pendingInstitutes: (db.prepare("SELECT COUNT(*) AS count FROM institute_profiles WHERE approval_status='PENDING'").get() as { count: number }).count,
    applications: (db.prepare("SELECT COUNT(*) AS count FROM applications").get() as { count: number }).count,
    openTickets: (db.prepare("SELECT COUNT(*) AS count FROM support_tickets WHERE status!='RESOLVED'").get() as { count: number }).count,
    publishedCourses: (db.prepare("SELECT COUNT(*) AS count FROM courses WHERE status='PUBLISHED'").get() as { count: number }).count,
  };
  const instituteApprovals = db.prepare(`SELECT ip.user_id AS userId,ip.institute_name AS instituteName,ip.contact_name AS contactName,ip.city,ip.website,ip.approval_status AS approvalStatus,u.email,u.created_at AS createdAt
    FROM institute_profiles ip JOIN users u ON u.id=ip.user_id ORDER BY CASE ip.approval_status WHEN 'PENDING' THEN 0 ELSE 1 END,u.created_at DESC`).all();
  const applications = db.prepare(`SELECT a.id,a.status,a.updated_at AS updatedAt,u.display_name AS studentName,sp.country,c.title AS courseTitle,i.name AS instituteName
    FROM applications a JOIN users u ON u.id=a.student_user_id LEFT JOIN student_profiles sp ON sp.user_id=u.id JOIN courses c ON c.id=a.course_id JOIN institutes i ON i.id=c.institute_id ORDER BY a.updated_at DESC LIMIT 20`).all();
  const recentUsers = db.prepare("SELECT id,display_name AS displayName,email,role,status,created_at AS createdAt FROM users ORDER BY created_at DESC LIMIT 10").all();
  const tickets = db.prepare(`SELECT t.id,t.subject,t.category,t.status,t.priority,t.created_at AS createdAt,u.display_name AS raisedBy,u.role
    FROM support_tickets t JOIN users u ON u.id=t.user_id ORDER BY CASE t.priority WHEN 'HIGH' THEN 0 WHEN 'NORMAL' THEN 1 ELSE 2 END,t.created_at DESC LIMIT 12`).all();
  const audit = db.prepare(`SELECT a.id,a.action,a.entity_type AS entityType,a.entity_id AS entityId,a.created_at AS createdAt,u.display_name AS actor
    FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 12`).all();
  return { role, user, metrics, instituteApprovals, applications, recentUsers, tickets, audit, notifications: notificationsFor(db, userId, role) };
}

export function toggleSavedCourse(db: PortalDatabase, studentUserId: number, courseId: number, save: boolean) {
  if (save) db.prepare("INSERT OR IGNORE INTO saved_courses(student_user_id,course_id) VALUES (?,?)").run(studentUserId, courseId);
  else db.prepare("DELETE FROM saved_courses WHERE student_user_id=? AND course_id=?").run(studentUserId, courseId);
  return { saved: save };
}

export function createSupportTicket(db: PortalDatabase, userId: number, subject: string, category: string) {
  const result = db.prepare("INSERT INTO support_tickets(user_id,subject,category) VALUES (?,?,?)").run(userId, subject, category);
  return { id: Number(result.lastInsertRowid), status: "OPEN" };
}

export function markNotificationRead(db: PortalDatabase, userId: number, notificationId: number) {
  db.prepare("UPDATE notifications SET is_read=1 WHERE id=? AND (user_id=? OR user_id IS NULL)").run(notificationId, userId);
}

export function updateInstituteApplication(db: PortalDatabase, instituteUserId: number, applicationId: number, status: string, note?: string) {
  const allowed = new Set(["UNDER_REVIEW", "OFFERED", "DECLINED"]);
  if (!allowed.has(status)) throw new Error("Unsupported application status.");
  const owned = db.prepare(`SELECT a.id FROM applications a JOIN courses c ON c.id=a.course_id JOIN institutes i ON i.id=c.institute_id WHERE a.id=? AND i.owner_user_id=?`).get(applicationId, instituteUserId);
  if (!owned) throw new Error("Application not found for this institution.");
  db.prepare("UPDATE applications SET status=?,decision_note=?,offer_letter_url=CASE WHEN ?='OFFERED' THEN COALESCE(offer_letter_url,'/demo/offer-letter.pdf') ELSE offer_letter_url END,updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .run(status, note || null, status, applicationId);
  return { id: applicationId, status };
}

export function createInstituteProgramme(db: PortalDatabase, instituteUserId: number, input: { title: string; discipline: string; level: string; durationMonths: number; tuitionFeeInr?: number; mode: string; startDate?: string }) {
  const institute = db.prepare("SELECT id FROM institutes WHERE owner_user_id=?").get(instituteUserId) as { id: number } | undefined;
  if (!institute) throw new Error("An approved institute profile is required before adding programmes.");
  const allowedLevels = new Set(["UNDERGRADUATE", "POSTGRADUATE", "DOCTORAL", "CERTIFICATE"]);
  const allowedModes = new Set(["OFFLINE", "BLENDED", "ONLINE"]);
  if (!allowedLevels.has(input.level) || !allowedModes.has(input.mode)) throw new Error("Programme level or study mode is not supported.");
  const slugBase = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "programme";
  const slug = `${slugBase}-${Date.now().toString(36)}`;
  const result = db.prepare(`INSERT INTO courses(institute_id,title,slug,discipline,level,duration_months,tuition_fee_inr,status,mode,course_type,scholarship_available,eligibility,start_date)
    VALUES (?,?,?,?,?,?,?,'DRAFT',?,'REGULAR',0,'Confirm programme-specific requirements with the institution.',?)`)
    .run(institute.id, input.title, slug, input.discipline, input.level, input.durationMonths, input.tuitionFeeInr || null, input.mode, input.startDate || null);
  return { id: Number(result.lastInsertRowid), slug, status: "DRAFT" };
}

export function updateInstituteProgrammeStatus(db: PortalDatabase, instituteUserId: number, courseId: number, status: string) {
  const allowed = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);
  if (!allowed.has(status)) throw new Error("Programme status is not supported.");
  const result = db.prepare(`UPDATE courses SET status=? WHERE id=? AND institute_id IN (SELECT id FROM institutes WHERE owner_user_id=?)`).run(status, courseId, instituteUserId);
  if (!result.changes) throw new Error("Programme not found for this institution.");
  return { id: courseId, status };
}

export function updateInstituteApproval(db: PortalDatabase, adminUserId: number, instituteUserId: number, status: string) {
  const allowed = new Set(["APPROVED", "REJECTED"]);
  if (!allowed.has(status)) throw new Error("Unsupported approval status.");
  const result = db.prepare("UPDATE institute_profiles SET approval_status=? WHERE user_id=?").run(status, instituteUserId);
  if (!result.changes) throw new Error("Institute registration not found.");
  db.prepare("UPDATE users SET status=? WHERE id=? AND role='INSTITUTE'").run(status === "APPROVED" ? "ACTIVE" : "SUSPENDED", instituteUserId);
  db.prepare("INSERT INTO audit_logs(user_id,action,entity_type,entity_id,metadata_json) VALUES (?,?,?,?,?)")
    .run(adminUserId, `INSTITUTE_${status}`, "INSTITUTE_PROFILE", String(instituteUserId), JSON.stringify({ status }));
  return { userId: instituteUserId, approvalStatus: status };
}

export function updateSupportTicket(db: PortalDatabase, adminUserId: number, ticketId: number, status: string) {
  const allowed = new Set(["OPEN", "IN_PROGRESS", "RESOLVED"]);
  if (!allowed.has(status)) throw new Error("Support status is not supported.");
  const result = db.prepare("UPDATE support_tickets SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(status, ticketId);
  if (!result.changes) throw new Error("Support request not found.");
  db.prepare("INSERT INTO audit_logs(user_id,action,entity_type,entity_id,metadata_json) VALUES (?,?,?,?,?)")
    .run(adminUserId, "SUPPORT_STATUS_UPDATED", "SUPPORT_TICKET", String(ticketId), JSON.stringify({ status }));
  return { id: ticketId, status };
}
