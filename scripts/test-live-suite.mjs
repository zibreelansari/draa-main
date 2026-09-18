// Comprehensive Automated Live Testing Suite for DRAA Platform
// Tests Backend API, Database operations, Auth, Student, Institute, Admin, and Frontend routes.

const API_BASE = 'http://127.0.0.1:4000';
const STUDY_BASE = 'http://localhost:5175';
const CORP_BASE = 'http://localhost:5173';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(category, name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    results.tests.push({ category, name, status: 'PASS', details });
    console.log(`  [PASS] [${category}] ${name}`);
  } else {
    results.failed++;
    results.tests.push({ category, name, status: 'FAIL', details });
    console.error(`  [FAIL] [${category}] ${name}: ${details}`);
  }
}

async function run() {
  console.log('====================================================');
  console.log('STARTING COMPREHENSIVE LIVE TESTING: DRAA PLATFORM');
  console.log('====================================================\n');

  // 1. HEALTH & SECURITY HEADERS
  console.log('--- Phase 1: Health & Security Headers ---');
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    recordTest('Health', 'API Health Check returns 200 and status ok', res.status === 200 && data?.data?.status === 'ok');
    
    const xContentType = res.headers.get('x-content-type-options');
    recordTest('Security', 'X-Content-Type-Options nosniff header present', xContentType === 'nosniff', `got: ${xContentType}`);
    
    const poweredBy = res.headers.get('x-powered-by');
    recordTest('Security', 'X-Powered-By is hidden for security', !poweredBy, `got: ${poweredBy}`);
  } catch (err) {
    recordTest('Health', 'API Health Check accessible', false, err.message);
  }

  // 2. PUBLIC CATALOG API
  console.log('\n--- Phase 2: Public Course & Institute Catalog ---');
  let sampleCourseSlug = '';
  let sampleInstituteSlug = '';
  let sampleCourseId = '';

  try {
    const res = await fetch(`${API_BASE}/api/catalog/courses`);
    const json = await res.json();
    const courses = json?.data?.courses || [];
    recordTest('Catalog', `Fetch all courses returns active catalog (${courses.length} courses found)`, res.status === 200 && courses.length > 0);
    
    if (courses.length > 0) {
      sampleCourseSlug = courses[0].slug;
      sampleCourseId = courses[0]._id;
      recordTest('Catalog', 'Course schema contains title, institute, slug, level', Boolean(courses[0].title && courses[0].instituteId && courses[0].slug && courses[0].level));
    }
  } catch (err) {
    recordTest('Catalog', 'Fetch all courses', false, err.message);
  }

  if (sampleCourseSlug) {
    try {
      const res = await fetch(`${API_BASE}/api/catalog/courses/${sampleCourseSlug}`);
      const json = await res.json();
      recordTest('Catalog', `Fetch course detail by slug (/courses/${sampleCourseSlug})`, res.status === 200 && json?.data?.course?.slug === sampleCourseSlug);
    } catch (err) {
      recordTest('Catalog', 'Fetch course detail by slug', false, err.message);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/api/catalog/institutes`);
    const json = await res.json();
    const institutes = json?.data?.institutes || [];
    recordTest('Catalog', `Fetch institutes returns list (${institutes.length} institutes found)`, res.status === 200 && institutes.length > 0);
    if (institutes.length > 0) {
      sampleInstituteSlug = institutes[0].slug;
    }
  } catch (err) {
    recordTest('Catalog', 'Fetch institutes', false, err.message);
  }

  if (sampleInstituteSlug) {
    try {
      const res = await fetch(`${API_BASE}/api/catalog/institutes/${sampleInstituteSlug}`);
      const json = await res.json();
      recordTest('Catalog', `Fetch institute detail (/institutes/${sampleInstituteSlug})`, res.status === 200 && json?.data?.institute?.slug === sampleInstituteSlug);
    } catch (err) {
      recordTest('Catalog', 'Fetch institute detail', false, err.message);
    }
  }

  // 3. CONTACT & NEWSLETTER API
  console.log('\n--- Phase 3: Contact Inquiries & Newsletter ---');
  try {
    const res = await fetch(`${API_BASE}/api/contact/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Live QA Tester',
        email: 'qa.tester@draa.in',
        subject: 'Live Pre-Launch Verification',
        message: 'This is an automated live integration test message verifying the inquiry pipeline.',
        type: 'GENERAL'
      })
    });
    const json = await res.json();
    recordTest('Contact', 'Submit contact inquiry returns 200/201 success', res.status >= 200 && res.status < 300);
  } catch (err) {
    recordTest('Contact', 'Submit contact inquiry', false, err.message);
  }

  try {
    const res = await fetch(`${API_BASE}/api/contact/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber.test@draa.in' })
    });
    const json = await res.json();
    recordTest('Newsletter', 'Subscribe to newsletter returns success', res.status >= 200 && res.status < 300);
  } catch (err) {
    recordTest('Newsletter', 'Subscribe to newsletter', false, err.message);
  }

  // 4. AUTHENTICATION & ACCESS CONTROL
  console.log('\n--- Phase 4: Authentication & Security Controls ---');
  let studentToken = '';
  let instituteToken = '';
  let adminToken = '';
  let studentUser = null;

  // 4.1 Invalid credentials check
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@demo.draa.in', password: 'wrongpassword', role: 'STUDENT' })
    });
    recordTest('Auth', 'Reject invalid password with 401', res.status === 401);
  } catch (err) {
    recordTest('Auth', 'Reject invalid password', false, err.message);
  }

  // 4.2 Student Login
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@demo.draa.in', password: 'student1234', role: 'STUDENT' })
    });
    const json = await res.json();
    studentToken = json?.data?.token;
    studentUser = json?.data?.user;
    recordTest('Auth', 'Student login succeeds with valid token', res.status === 200 && Boolean(studentToken) && studentUser?.role === 'STUDENT', json?.error);
  } catch (err) {
    recordTest('Auth', 'Student login', false, err.message);
  }

  // 4.3 Institute Login
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'institute@demo.draa.in', password: 'institute1234', role: 'INSTITUTE' })
    });
    const json = await res.json();
    instituteToken = json?.data?.token;
    recordTest('Auth', 'Institute login succeeds with INSTITUTE role', res.status === 200 && Boolean(instituteToken) && json?.data?.user?.role === 'INSTITUTE', json?.error);
  } catch (err) {
    recordTest('Auth', 'Institute login', false, err.message);
  }

  // 4.4 Admin Login
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.draa.in', password: 'admin12345', role: 'ADMIN' })
    });
    const json = await res.json();
    adminToken = json?.data?.token;
    recordTest('Auth', 'Admin login succeeds with ADMIN role', res.status === 200 && Boolean(adminToken) && json?.data?.user?.role === 'ADMIN', json?.error);
  } catch (err) {
    recordTest('Auth', 'Admin login', false, err.message);
  }

  // 4.5 Verify /api/auth/me session
  if (studentToken) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const json = await res.json();
      recordTest('Auth', 'Verify /api/auth/me returns authenticated student identity', res.status === 200 && json?.data?.user?.email === 'student@demo.draa.in');
    } catch (err) {
      recordTest('Auth', 'Verify /api/auth/me', false, err.message);
    }
  }

  // 4.6 Role-Based Authorization Enforcement
  if (studentToken) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      recordTest('RBAC', 'Student cannot access Admin endpoints (returns 403 Forbidden)', res.status === 403);
    } catch (err) {
      recordTest('RBAC', 'Student blocked from Admin', false, err.message);
    }
  }

  // 5. STUDENT PORTAL WORKFLOW
  console.log('\n--- Phase 5: Student Workflow & Dashboard ---');
  let studentApplicationId = '';

  if (studentToken) {
    // 5.1 Fetch student applications
    try {
      const res = await fetch(`${API_BASE}/api/student/applications`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const json = await res.json();
      const apps = json?.data?.applications || [];
      recordTest('Student', `Fetch student applications (found ${apps.length} applications)`, res.status === 200);
      if (apps.length > 0) {
        studentApplicationId = apps[0]._id;
      }
    } catch (err) {
      recordTest('Student', 'Fetch student applications', false, err.message);
    }

    // 5.2 Fetch orientation modules
    try {
      const res = await fetch(`${API_BASE}/api/student/orientation`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const json = await res.json();
      const modules = json?.data?.modules || [];
      recordTest('Student', `Fetch LMS pre-departure orientation modules (${modules.length} modules found)`, res.status === 200 && modules.length > 0);
    } catch (err) {
      recordTest('Student', 'Fetch orientation modules', false, err.message);
    }

    // 5.3 Fetch dashboard overview
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const json = await res.json();
      recordTest('Dashboard', 'Student dashboard metrics overview loaded', res.status === 200 && Boolean(json?.data));
    } catch (err) {
      recordTest('Dashboard', 'Student dashboard', false, err.message);
    }

    // 5.4 Test Student Application submission if not already applied
    if (sampleCourseId) {
      try {
        const res = await fetch(`${API_BASE}/api/student/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({
            courseId: sampleCourseId,
            statement: 'Automated live pre-launch application test statement of purpose.'
          })
        });
        const json = await res.json();
        // Either created (201) or already applied (409) is valid
        const valid = res.status === 201 || res.status === 409;
        if (res.status === 201 && json?.data?.application?._id) {
          studentApplicationId = json.data.application._id;
        }
        recordTest('Student', 'Student can apply for a programme (or detects existing duplicate)', valid, `status: ${res.status}`);
      } catch (err) {
        recordTest('Student', 'Apply for programme', false, err.message);
      }
    }
  }

  // 6. MESSAGING SYSTEM (Student <-> Institute)
  console.log('\n--- Phase 6: Admissions Messaging System ---');
  if (studentApplicationId && studentToken) {
    try {
      // 6.1 Student sends a message
      const sendRes = await fetch(`${API_BASE}/api/student/applications/${studentApplicationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({ message: 'Hello admissions team, is hostel accommodation included in tuition fee?' })
      });
      const sendJson = await sendRes.json();
      recordTest('Messaging', 'Student sends inquiry message to admissions', sendRes.status === 200 || sendRes.status === 201, sendJson?.error);

      // 6.2 Student fetches messages
      const getRes = await fetch(`${API_BASE}/api/student/applications/${studentApplicationId}/messages`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const getJson = await getRes.json();
      const messages = getJson?.data?.messages || [];
      recordTest('Messaging', `Student reads application message history (${messages.length} messages found)`, getRes.status === 200 && messages.length > 0);
    } catch (err) {
      recordTest('Messaging', 'Student admissions messaging', false, err.message);
    }
  }

  // 7. INSTITUTE PORTAL WORKFLOW
  console.log('\n--- Phase 7: Institute Admissions Workflow ---');
  if (instituteToken) {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${instituteToken}` }
      });
      const json = await res.json();
      recordTest('Institute', 'Institute dashboard metrics & pipeline overview loaded', res.status === 200 && Boolean(json?.data));
    } catch (err) {
      recordTest('Institute', 'Institute dashboard', false, err.message);
    }
  }

  // 8. ADMIN DASHBOARD & ANALYTICS
  console.log('\n--- Phase 8: Admin Operations & Governance ---');
  if (adminToken) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const json = await res.json();
      recordTest('Admin', 'Admin platform analytics overview loaded', res.status === 200 && Boolean(json?.data?.stats || json?.data));
    } catch (err) {
      recordTest('Admin', 'Admin analytics', false, err.message);
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const json = await res.json();
      const users = json?.data?.data || json?.data?.users || [];
      const total = json?.data?.total || users.length;
      recordTest('Admin', `Admin lists registered users (${total} total registered users)`, res.status === 200 && total > 0);
    } catch (err) {
      recordTest('Admin', 'Admin list users', false, err.message);
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/fraud-queue`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      recordTest('Admin', 'Admin compliance / fraud verification queue accessible', res.status === 200);
    } catch (err) {
      recordTest('Admin', 'Admin fraud queue', false, err.message);
    }
  }

  // 9. FRONTEND HTTP ENDPOINT ACCESSIBILITY & ROUTING
  console.log('\n--- Phase 9: Frontend Applications Accessibility (Vite Dev Servers) ---');
  const studyIndiaPages = [
    { path: '/', title: 'Home Page' },
    { path: '/courses', title: 'Courses Catalog' },
    { path: '/login', title: 'Login Page' },
    { path: '/register', title: 'Registration Page' },
    { path: '/about', title: 'About India Page' },
    { path: '/why-india', title: 'Why India' },
    { path: '/scholarships', title: 'Scholarships' },
    { path: '/how-to-apply', title: 'How to Apply' },
    { path: '/visa-frro', title: 'Visa & FRRO Support' },
    { path: '/contact', title: 'Contact Page' }
  ];

  for (const page of studyIndiaPages) {
    try {
      const res = await fetch(`${STUDY_BASE}${page.path}`);
      recordTest('Frontend (Study-India)', `Page ${page.path} (${page.title}) returns HTTP 200`, res.status === 200);
    } catch (err) {
      recordTest('Frontend (Study-India)', `Page ${page.path}`, false, err.message);
    }
  }

  const corpPages = [
    { path: '/', title: 'Corporate Home' },
    { path: '/about-draa', title: 'About DRAA' },
    { path: '/capabilities', title: 'Capabilities & Services' },
    { path: '/services/digital-learning', title: 'Digital Learning Solutions' },
    { path: '/services/content-publishing', title: 'Content Publishing' },
    { path: '/events', title: 'Corporate Events' },
    { path: '/who-we-support', title: 'Who We Support' },
    { path: '/contact', title: 'Corporate Contact' },
    { path: '/careers', title: 'Careers' }
  ];

  for (const page of corpPages) {
    try {
      const res = await fetch(`${CORP_BASE}${page.path}`);
      recordTest('Frontend (Corporate)', `Page ${page.path} (${page.title}) returns HTTP 200`, res.status === 200);
    } catch (err) {
      recordTest('Frontend (Corporate)', `Page ${page.path}`, false, err.message);
    }
  }

  // 10. FRONTEND VITE PROXY API TEST
  console.log('\n--- Phase 10: Frontend Vite API Proxy Integration ---');
  try {
    const res = await fetch(`${STUDY_BASE}/api/catalog/courses`);
    const json = await res.json();
    const courses = json?.data?.courses || [];
    recordTest('Proxy', `Vite reverse proxy (/api -> :4000) serves courses correctly (${courses.length} courses)`, res.status === 200 && courses.length > 0);
  } catch (err) {
    recordTest('Proxy', 'Vite reverse proxy', false, err.message);
  }

  // SUMMARY REPORT
  console.log('\n====================================================');
  console.log('LIVE TESTING EXECUTION SUMMARY');
  console.log('====================================================');
  console.log(`Total Checks Run : ${results.total}`);
  console.log(`Passed           : ${results.passed}`);
  console.log(`Failed           : ${results.failed}`);
  console.log(`Success Rate     : ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('====================================================');

  if (results.failed > 0) {
    console.log('\nFAILED CHECKS:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`- [${t.category}] ${t.name}: ${t.details}`);
    });
  }
}

run();
