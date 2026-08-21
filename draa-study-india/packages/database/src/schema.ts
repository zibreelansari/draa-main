export const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('STUDENT','INSTITUTE','ADMIN')),
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PENDING','SUSPENDED')),
        display_name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, role)
      );

      CREATE TABLE student_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        country TEXT NOT NULL,
        passport_number TEXT,
        date_of_birth TEXT
      );

      CREATE TABLE institute_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        institute_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        city TEXT NOT NULL,
        website TEXT,
        approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING','APPROVED','REJECTED'))
      );

      CREATE TABLE sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_sessions_token ON sessions(token_hash);
      CREATE INDEX idx_sessions_expiry ON sessions(expires_at);

      CREATE TABLE institutes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        discipline TEXT NOT NULL,
        level TEXT NOT NULL CHECK (level IN ('UNDERGRADUATE','POSTGRADUATE','DOCTORAL','CERTIFICATE')),
        duration_months INTEGER NOT NULL,
        tuition_fee_inr INTEGER,
        status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_courses_filters ON courses(level, discipline, status);

      CREATE TABLE applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
        statement TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','OFFERED','DECLINED','WITHDRAWN')),
        submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_user_id, course_id)
      );

      CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    version: 2,
    sql: `
      ALTER TABLE courses ADD COLUMN mode TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (mode IN ('OFFLINE','BLENDED','ONLINE'));
      ALTER TABLE courses ADD COLUMN course_type TEXT NOT NULL DEFAULT 'REGULAR' CHECK (course_type IN ('REGULAR','SHORT_TERM','SKILL_BASED'));
      ALTER TABLE courses ADD COLUMN scholarship_available INTEGER NOT NULL DEFAULT 0 CHECK (scholarship_available IN (0,1));
      ALTER TABLE courses ADD COLUMN eligibility TEXT NOT NULL DEFAULT 'Confirm programme-specific requirements with the institution.';
      ALTER TABLE courses ADD COLUMN start_date TEXT;
      CREATE INDEX idx_courses_discovery ON courses(course_type, mode, scholarship_available, discipline);
    `,
  },
  {
    version: 3,
    sql: `
      ALTER TABLE institutes ADD COLUMN owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE applications ADD COLUMN decision_note TEXT;
      ALTER TABLE applications ADD COLUMN offer_letter_url TEXT;

      CREATE TABLE saved_courses (
        student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_user_id, course_id)
      );

      CREATE TABLE student_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        document_type TEXT NOT NULL,
        file_name TEXT,
        status TEXT NOT NULL DEFAULT 'MISSING' CHECK (status IN ('MISSING','UPLOADED','VERIFIED','ACTION_REQUIRED')),
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_user_id, document_type)
      );

      CREATE TABLE notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        audience_role TEXT CHECK (audience_role IN ('STUDENT','INSTITUTE','ADMIN')),
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'INFO' CHECK (kind IN ('INFO','ACTION','SUCCESS','WARNING')),
        is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0,1)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_notifications_user ON notifications(user_id, created_at);

      CREATE TABLE support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED')),
        priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_support_status ON support_tickets(status, priority);
    `,
  },
] as const;
