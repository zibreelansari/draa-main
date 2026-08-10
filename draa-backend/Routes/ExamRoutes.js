const express = require('express');
const router = express.Router();
const examController = require('../Controllers/ExamController');
// const auth = require('../middlewares/auth'); // assumes JWT middleware

const checkAuth = require('../Middlewares/checkAuth');

router.post('/create', checkAuth, examController.createExam);
router.get('/teacher/:id', checkAuth, examController.getExamsByTeacher);
router.get("/fetch/:id", checkAuth, examController.getExamById);
router.put('/update/:id', checkAuth, examController.updateExamByCreator)
router.delete('/delete/:id', checkAuth, examController.deleteExam);
router.get("/student/fetch/:id", examController.getExamDetailsForStudent);
// GET /exam/student/list/:studentId
router.get("/student/list", examController.getAllExamsForStudents);
router.post("/student/submit/:examId", examController.submitExam);
//  ADD this route to your existing routes
router.get("/results/:submissionId", examController.getExamResults);

router.get("/admin", examController.getExams)
router.get("/stats/overview", checkAuth, examController.getStatsOverview);
module.exports = router;
