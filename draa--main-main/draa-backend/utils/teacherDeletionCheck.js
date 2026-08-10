/**
 * Checks if a teacher has any associated content before deletion.
 * Returns detailed info about what content the teacher has created.
 */

const Course = require('../Models/CourseModel');
const TestSeries = require('../Models/TestSeriesModels');
const Livesessions = require('../Models/liveSessionModels');
const Assignment = require('../Models/Assignmentmodel');
const PYQ = require('../Models/PYQ.models');
const Syllabus = require('../Models/Syllabus.model');
const ExamCategory = require('../Models/ExamCategory');
const CourseCategory = require('../Models/courseCategoriesModels');
const Attendance = require('../Models/attandances.models');
const Leave = require('../Models/leaves.models');

/**
 * Check all models that reference a teacher and count associations.
 * @param {string} teacherId - The teacher's ObjectId as string
 * @returns {Promise<{canDelete: boolean, associations: object, message: string}>}
 */
async function checkTeacherAssociations(teacherId) {
  const associations = {};

  // Check courses
  associations.courses = await Course.countDocuments({ teacher_id: teacherId });

  // Check test series
  associations.testSeries = await TestSeries.countDocuments({ createdBy: teacherId });

  // Check live sessions
  associations.liveSessions = await Livesessions.countDocuments({ createdBy: teacherId });

  // Check assignments
  associations.assignments = await Assignment.countDocuments({ createdBy: teacherId });

  // Check PYQs
  associations.pyqs = await PYQ.countDocuments({ uploadedBy: teacherId });

  // Check syllabi
  associations.syllabi = await Syllabus.countDocuments({ uploadedBy: teacherId });

  // Check exam categories
  associations.examCategories = await ExamCategory.countDocuments({ createdBy: teacherId });

  // Check course categories (both createdBy and updatedBy)
  associations.courseCategories = await CourseCategory.countDocuments({
    $or: [{ createdBy: teacherId }, { updatedBy: teacherId }]
  });

  // Check attendance records (teacher_id stored as string)
  associations.attendanceRecords = await Attendance.countDocuments({ teacher_id: teacherId });

  // Check leave records (teacher_id stored as string)
  associations.leaveRecords = await Leave.countDocuments({ teacher_id: teacherId });

  // Calculate total associations
  const total = Object.values(associations).reduce((sum, count) => sum + count, 0);

  // Build a human-readable message
  const items = [];
  if (associations.courses > 0) items.push(`${associations.courses} course${associations.courses > 1 ?'s' :''}`);
  if (associations.testSeries > 0) items.push(`${associations.testSeries} test series`);
  if (associations.liveSessions > 0) items.push(`${associations.liveSessions} live session${associations.liveSessions > 1 ?'s' :''}`);
  if (associations.assignments > 0) items.push(`${associations.assignments} assignment${associations.assignments > 1 ?'s' :''}`);
  if (associations.pyqs > 0) items.push(`${associations.pyqs} PYQ${associations.pyqs > 1 ?'s' :''}`);
  if (associations.syllabi > 0) items.push(`${associations.syllabi} syllabus${associations.syllabi > 1 ?'s' :''}`);
  if (associations.examCategories > 0) items.push(`${associations.examCategories} exam category${associations.examCategories > 1 ?'ies' :''}`);
  if (associations.courseCategories > 0) items.push(`${associations.courseCategories} course categor${associations.courseCategories > 1 ?'ies' :'y'}`);
  if (associations.attendanceRecords > 0) items.push(`${associations.attendanceRecords} attendance record${associations.attendanceRecords > 1 ?'s' :''}`);
  if (associations.leaveRecords > 0) items.push(`${associations.leaveRecords} leave record${associations.leaveRecords > 1 ?'s' :''}`);

  const canDelete = total === 0;
  const message = canDelete
    ?'Teacher has no associated content.'
    : `Teacher has ${total} associated item${total > 1 ?'s' :''}: ${items.join(',')}. Please delete or reassign these items before deleting the teacher.`;

  return { canDelete, associations, total, message };
}

module.exports = { checkTeacherAssociations };
