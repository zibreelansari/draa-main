/**
 * Checks if a student has any purchases or activity before deletion.
 * Returns detailed info about what the student has.
 */

const BookReview = require('../Models/BookReview.models');
const StudentBookPurchase = require('../Models/BooksPurchaseModels');
const CourseProgress = require('../Models/CourseProgressModels');
const CourseReview = require('../Models/CourseReview');
const TestSeriesEnrollment = require('../Models/testSeriesEnrollMentSchema');
const TestSeriesPurchase = require('../Models/TestSeriesPurchaseModel');
const TopicCategoryPurchase = require('../Models/TopicCategoryPurchaseModel');
const StudentCoursePurchase = require('../Models/studentCoursePurchaseModels');
const Wishlist = require('../Models/WishLists.models');
const ExamSubmission = require('../Models/exam.submission.models');

/**
 * Check all models that reference a student and count associations.
 * @param {string} studentId - The student's ObjectId as string
 * @returns {Promise<{canDelete: boolean, associations: object, message: string}>}
 */
async function checkStudentAssociations(studentId) {
  const associations = {};

  // Check book reviews
  associations.bookReviews = await BookReview.countDocuments({ student: studentId });

  // Check book purchases (student_id stored as string)
  associations.bookPurchases = await StudentBookPurchase.countDocuments({ student_id: studentId });

  // Check course progress (ref:'users')
  associations.courseProgress = await CourseProgress.countDocuments({ student_id: studentId });

  // Check course reviews (ref:'users')
  associations.courseReviews = await CourseReview.countDocuments({ student_id: studentId });

  // Check test series enrollments (ref:'Student')
  associations.testSeriesEnrollments = await TestSeriesEnrollment.countDocuments({ student_id: studentId });

  // Check test series purchases (ref:'Student')
  associations.testSeriesPurchases = await TestSeriesPurchase.countDocuments({ student_id: studentId });

  // Check topic category purchases (ref:'Student')
  associations.topicCategoryPurchases = await TopicCategoryPurchase.countDocuments({ student_id: studentId });

  // Check course purchases (ref:'users')
  associations.coursePurchases = await StudentCoursePurchase.countDocuments({ student_id: studentId });

  // Check wishlists (ref:'User')
  associations.wishlists = await Wishlist.countDocuments({ user_id: studentId });

  // Check exam submissions (ref:'User')
  associations.examSubmissions = await ExamSubmission.countDocuments({ studentId: studentId });

  // Calculate total associations
  const total = Object.values(associations).reduce((sum, count) => sum + count, 0);

  // Build a human-readable message
  const items = [];
  if (associations.bookPurchases > 0) items.push(`${associations.bookPurchases} book purchase${associations.bookPurchases > 1 ?'s' :''}`);
  if (associations.coursePurchases > 0) items.push(`${associations.coursePurchases} course purchase${associations.coursePurchases > 1 ?'s' :''}`);
  if (associations.testSeriesPurchases > 0) items.push(`${associations.testSeriesPurchases} test series purchase${associations.testSeriesPurchases > 1 ?'s' :''}`);
  if (associations.topicCategoryPurchases > 0) items.push(`${associations.topicCategoryPurchases} topic purchase${associations.topicCategoryPurchases > 1 ?'s' :''}`);
  if (associations.courseProgress > 0) items.push(`${associations.courseProgress} course progress record${associations.courseProgress > 1 ?'s' :''}`);
  if (associations.courseReviews > 0) items.push(`${associations.courseReviews} course review${associations.courseReviews > 1 ?'s' :''}`);
  if (associations.bookReviews > 0) items.push(`${associations.bookReviews} book review${associations.bookReviews > 1 ?'s' :''}`);
  if (associations.testSeriesEnrollments > 0) items.push(`${associations.testSeriesEnrollments} test enrollment${associations.testSeriesEnrollments > 1 ?'s' :''}`);
  if (associations.wishlists > 0) items.push(`${associations.wishlists} wishlist item${associations.wishlists > 1 ?'s' :''}`);
  if (associations.examSubmissions > 0) items.push(`${associations.examSubmissions} exam submission${associations.examSubmissions > 1 ?'s' :''}`);

  const canDelete = total === 0;
  const message = canDelete
    ?'Student has no purchases or activity.'
    : `Student has ${total} associated item${total > 1 ?'s' :''}: ${items.join(',')}. Please refund or handle these before deleting the student.`;

  return { canDelete, associations, total, message };
}

module.exports = { checkStudentAssociations };
