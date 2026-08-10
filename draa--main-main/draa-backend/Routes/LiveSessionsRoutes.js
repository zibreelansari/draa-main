const express = require("express");
const {
  createMeeting,
  listMeetings,
  updateMeeting,
  deleteMeeting,
  getMeetingById,
  getStudentLiveSessions,
  getLiveSessionsByCourse,
  checkStudentAccess,
  getUpcomingLiveSessions,
  getLiveSessionsByTeacher
} = require("../Controllers/LiveSessionController");

const checkAuth = require("../Middlewares/checkAuth");

const router = express.Router();

// ========================================
// ADMIN/TEACHER ROUTES
// ========================================
router.post("/", checkAuth, createMeeting);                    // POST /api/live-sessions
router.get("/", checkAuth, listMeetings);                      // GET /api/live-sessions (all)
router.get("/meeting/:id", checkAuth, getMeetingById);         // GET /api/live-sessions/meeting/:id
router.put("/:id", checkAuth, updateMeeting);                  // PUT /api/live-sessions/:id
router.delete("/:id", checkAuth, deleteMeeting);               // DELETE /api/live-sessions/:id

// ========================================
// TEACHER-SPECIFIC ROUTES
// ========================================
router.get("/teacher/:teacherId", getLiveSessionsByTeacher); // GET /api/live-sessions/teacher/:teacherId

// ========================================
// STUDENT-SPECIFIC ROUTES (PURCHASED COURSES FILTER)
// ========================================
router.get("/student/:studentId", getStudentLiveSessions);  // GET /api/live-sessions/student/:studentId
router.get("/student/:studentId/access/:sessionId", checkStudentAccess); // GET /api/live-sessions/student/:studentId/access/:sessionId

// ========================================
// COURSE-SPECIFIC ROUTES
// ========================================
router.get("/course/:courseId", getLiveSessionsByCourse);  // GET /api/live-sessions/course/:courseId

// ========================================
// PUBLIC ROUTES
// ========================================
router.get("/upcoming", getUpcomingLiveSessions);  // GET /api/live-sessions/upcoming?limit=10

module.exports = router;
