// Advanced Live Testing Suite: End-to-End Business Operations
// Tests Institute Offer Issuance, Scoring, Student Offer Acceptance, Course Bookmarking, LMS Progress, Support Tickets

const API_BASE = 'http://127.0.0.1:4000';

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

async function runAdvanced() {
  console.log('====================================================');
  console.log('STARTING ADVANCED BUSINESS LOGIC LIVE TESTS');
  console.log('====================================================\n');

  // Step 1: Log in all 3 personas
  let studentToken, instituteToken, adminToken;
  try {
    const sRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@demo.draa.in', password: 'student1234', role: 'STUDENT' })
    });
    studentToken = (await sRes.json())?.data?.token;

    const iRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'institute@demo.draa.in', password: 'institute1234', role: 'INSTITUTE' })
    });
    instituteToken = (await iRes.json())?.data?.token;

    const aRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.draa.in', password: 'admin12345', role: 'ADMIN' })
    });
    adminToken = (await aRes.json())?.data?.token;

    recordTest('Auth Setup', 'All 3 personas authenticated', Boolean(studentToken && instituteToken && adminToken));
  } catch (e) {
    recordTest('Auth Setup', 'Authentication error', false, e.message);
    return;
  }

  // Step 2: Fetch courses and pick one
  let courseId = '';
  try {
    const res = await fetch(`${API_BASE}/api/catalog/courses`);
    const json = await res.json();
    courseId = json?.data?.courses?.[0]?._id;
    recordTest('Catalog', 'Selected active course for e2e workflow', Boolean(courseId));
  } catch (e) {
    recordTest('Catalog', 'Course fetch error', false, e.message);
  }

  // Step 3: Test Course Bookmarking / Saved Courses
  if (studentToken && courseId) {
    try {
      const saveRes = await fetch(`${API_BASE}/api/student/saved-courses/${courseId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      recordTest('Student', 'Bookmark / Save course to student wishlist', saveRes.status === 200 || saveRes.status === 201);

      const unsaveRes = await fetch(`${API_BASE}/api/student/saved-courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      recordTest('Student', 'Remove course from student wishlist', unsaveRes.status === 200);
    } catch (e) {
      recordTest('Student', 'Saved course toggle', false, e.message);
    }
  }

  // Step 4: LMS Orientation Progress Update
  if (studentToken) {
    try {
      const getOri = await fetch(`${API_BASE}/api/student/orientation`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const oriJson = await getOri.json();
      const firstModule = oriJson?.data?.modules?.[0];
      if (firstModule) {
        const postOri = await fetch(`${API_BASE}/api/student/orientation/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({
            moduleKey: firstModule.moduleKey || firstModule.key || firstModule.slug || 'visa-frro-readiness',
            completed: true
          })
        });
        const postJson = await postOri.json();
        recordTest('Student LMS', 'Record LMS orientation module completion', postOri.status === 200 || postOri.status === 201, postJson?.error);
      }
    } catch (e) {
      recordTest('Student LMS', 'LMS Progress error', false, e.message);
    }
  }

  // Step 5: Support Ticket Lifecycle
  let ticketId = '';
  if (studentToken) {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          subject: 'Visa Consultation Inquiry',
          category: 'VISA',
          message: 'Need clarification on student visa processing time from UAE.'
        })
      });
      const json = await res.json();
      ticketId = json?.data?.ticket?._id;
      recordTest('Support', 'Student creates support ticket', res.status === 200 || res.status === 201);
    } catch (e) {
      recordTest('Support', 'Support ticket creation error', false, e.message);
    }
  }

  if (adminToken && ticketId) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      recordTest('Support', 'Admin updates support ticket to RESOLVED', res.status === 200);
    } catch (e) {
      recordTest('Support', 'Admin resolve ticket error', false, e.message);
    }
  }

  // Step 6: Institute Evaluation & Offer Workflow
  let testAppId = '';
  if (studentToken) {
    try {
      const res = await fetch(`${API_BASE}/api/student/applications`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const json = await res.json();
      const apps = json?.data?.applications || [];
      if (apps.length > 0) {
        testAppId = apps[0]._id;
      }
    } catch (e) {
      recordTest('Applications', 'Fetch student application for evaluation test', false, e.message);
    }
  }

  if (instituteToken && testAppId) {
    // 6.1 Score Applicant
    try {
      const res = await fetch(`${API_BASE}/api/institute/applications/${testAppId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${instituteToken}`
        },
        body: JSON.stringify({
          academicScore: 9,
          sopScore: 8.5,
          languageScore: 9,
          reviewerNotes: 'Excellent credentials. Strong candidate for merit scholarship.'
        })
      });
      recordTest('Institute Evaluation', 'Admissions officer records candidate evaluation & rubric score', res.status === 200);
    } catch (e) {
      recordTest('Institute Evaluation', 'Candidate scoring error', false, e.message);
    }

    // 6.2 Issue Formal Admission Offer
    try {
      const res = await fetch(`${API_BASE}/api/institute/applications/${testAppId}/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${instituteToken}`
        },
        body: JSON.stringify({
          tuitionFee: 4200,
          currency: 'USD',
          scholarshipWaiverPercent: 20,
          reportingDate: '2026-08-15',
          conditions: 'Subject to verification of original high school transcripts upon campus arrival.'
        })
      });
      recordTest('Institute Offer', 'Issue formal admission offer letter with scholarship waiver', res.status === 200);
    } catch (e) {
      recordTest('Institute Offer', 'Issue offer letter error', false, e.message);
    }

    // 6.3 Institute sends message to student
    try {
      const res = await fetch(`${API_BASE}/api/institute/applications/${testAppId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${instituteToken}`
        },
        body: JSON.stringify({
          message: 'Congratulations! Your admission offer has been released. Please review and respond in your portal.'
        })
      });
      recordTest('Institute Messaging', 'Admissions sends official notification message to student', res.status === 200 || res.status === 201);
    } catch (e) {
      recordTest('Institute Messaging', 'Institute message error', false, e.message);
    }
  }

  // Step 7: Student Responds to Offer (Accept)
  if (studentToken && testAppId) {
    try {
      const res = await fetch(`${API_BASE}/api/student/applications/${testAppId}/offer-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({ decision: 'ACCEPT' })
      });
      recordTest('Student Decision', 'Student accepts formal admission offer', res.status === 200);
    } catch (e) {
      recordTest('Student Decision', 'Offer response error', false, e.message);
    }
  }

  // SUMMARY REPORT
  console.log('\n====================================================');
  console.log('ADVANCED BUSINESS FLOW TEST SUMMARY');
  console.log('====================================================');
  console.log(`Total Checks Run : ${results.total}`);
  console.log(`Passed           : ${results.passed}`);
  console.log(`Failed           : ${results.failed}`);
  console.log(`Success Rate     : ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('====================================================');
}

runAdvanced();
