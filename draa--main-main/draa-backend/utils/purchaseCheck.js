/**
 * Utility to check if an item has any purchases before deletion/deactivation.
 * Returns detailed info about what purchases exist.
 */

const StudentCoursePurchase = require('../Models/studentCoursePurchaseModels');
const StudentBookPurchase = require('../Models/BooksPurchaseModels');
const TestSeriesPurchase = require('../Models/TestSeriesPurchaseModel');
const TestSeriesEnrollment = require('../Models/testSeriesEnrollMentSchema');
const TopicCategoryPurchase = require('../Models/TopicCategoryPurchaseModel');
const Subject = require('../Models/Subject.models');
const TopicCategory = require('../Models/Topic.models');
const TestSeries = require('../Models/TestSeriesModels');

/**
 * Check if a course has any purchases/enrollments
 * @param {string} courseId - Course ObjectId as string
 * @returns {Promise<{canDelete: boolean, purchaseCount: number, message: string}>}
 */
async function checkCoursePurchases(courseId) {
  const purchaseCount = await StudentCoursePurchase.countDocuments({ course_id: courseId });

  if (purchaseCount > 0) {
    return {
      canDelete: false,
      purchaseCount,
      message: `Cannot delete or deactivate this course. It has ${purchaseCount} purchase${purchaseCount > 1 ?'s' :''}. Please refund/cancel purchases first.`
    };
  }

  return { canDelete: true, purchaseCount, message:'Course has no purchases.' };
}

/**
 * Check if a book has any purchases
 * @param {string} bookId - Book ObjectId as string
 * @returns {Promise<{canDelete: boolean, purchaseCount: number, message: string}>}
 */
async function checkBookPurchases(bookId) {
  const purchaseCount = await StudentBookPurchase.countDocuments({ book_id: bookId });

  if (purchaseCount > 0) {
    return {
      canDelete: false,
      purchaseCount,
      message: `Cannot delete this book. It has ${purchaseCount} purchase${purchaseCount > 1 ?'s' :''}. Please refund/cancel purchases first.`
    };
  }

  return { canDelete: true, purchaseCount, message:'Book has no purchases.' };
}

/**
 * Check if a test series has any purchases or enrollments
 * @param {string} testSeriesId - TestSeries ObjectId as string
 * @returns {Promise<{canDelete: boolean, purchaseCount: number, message: string}>}
 */
async function checkTestSeriesPurchases(testSeriesId) {
  const [purchaseCount, enrollmentCount] = await Promise.all([
    TestSeriesPurchase.countDocuments({ test_series_id: testSeriesId }),
    TestSeriesEnrollment.countDocuments({ test_series_id: testSeriesId })
  ]);

  const total = purchaseCount + enrollmentCount;

  if (total > 0) {
    const parts = [];
    if (purchaseCount > 0) parts.push(`${purchaseCount} purchase${purchaseCount > 1 ?'s' :''}`);
    if (enrollmentCount > 0) parts.push(`${enrollmentCount} enrollment${enrollmentCount > 1 ?'s' :''}`);
    return {
      canDelete: false,
      purchaseCount: total,
      message: `Cannot delete or deactivate this test series. It has ${parts.join(' and')}. Please refund/cancel first.`
    };
  }

  return { canDelete: true, purchaseCount: total, message:'Test series has no purchases.' };
}

/**
 * Check if a topic category has any purchases
 * @param {string} topicId - TopicCategory ObjectId as string
 * @returns {Promise<{canDelete: boolean, purchaseCount: number, message: string}>}
 */
async function checkTopicCategoryPurchases(topicId) {
  const purchaseCount = await TopicCategoryPurchase.countDocuments({ topic_category_id: topicId });

  if (purchaseCount > 0) {
    return {
      canDelete: false,
      purchaseCount,
      message: `Cannot delete or deactivate this topic. It has ${purchaseCount} purchase${purchaseCount > 1 ?'s' :''}. Please refund/cancel purchases first.`
    };
  }

  return { canDelete: true, purchaseCount, message:'Topic category has no purchases.' };
}

/**
 * Check if an examination category can be deleted/deactivated.
 * Must check subjects, topics under subjects, and test series with purchases.
 * @param {string} examId - ExaminationCategory ObjectId as string
 * @returns {Promise<{canDelete: boolean, details: object, message: string}>}
 */
async function checkExaminationCategoryPurchases(examId) {
  // Get all subjects under this exam category
  const subjects = await Subject.find({ examinationCategory: examId }).select('_id');
  const subjectIds = subjects.map(s => s._id);

  // Get all topic categories under those subjects
  const topics = await TopicCategory.find({ subject: { $in: subjectIds } }).select('_id');
  const topicIds = topics.map(t => t._id);

  // Check for purchases at each level
  const [subjectCount, topicCount, topicPurchaseCount, testSeriesCount, testPurchaseCount] = await Promise.all([
    Subject.countDocuments({ examinationCategory: examId }),
    TopicCategory.countDocuments({ subject: { $in: subjectIds } }),
    TopicCategoryPurchase.countDocuments({ topic_category_id: { $in: topicIds } }),
    TestSeries.countDocuments({ examinationCategory: examId }),
    TestSeriesPurchase.countDocuments({ test_series_id: { $in: await TestSeries.find({ examinationCategory: examId }).distinct('_id') } })
  ]);

  const totalPurchases = topicPurchaseCount + testPurchaseCount;

  if (totalPurchases > 0) {
    const parts = [];
    if (topicPurchaseCount > 0) parts.push(`${topicPurchaseCount} topic purchase${topicPurchaseCount > 1 ?'s' :''}`);
    if (testPurchaseCount > 0) parts.push(`${testPurchaseCount} test purchase${testPurchaseCount > 1 ?'s' :''}`);
    return {
      canDelete: false,
      details: { subjectCount, topicCount, topicPurchaseCount, testSeriesCount, testPurchaseCount },
      message: `Cannot delete or deactivate this examination. It has ${parts.join(' and')}. Please refund/cancel first.`
    };
  }

  if (subjectCount > 0 || topicCount > 0 || testSeriesCount > 0) {
    return {
      canDelete: false,
      details: { subjectCount, topicCount, testSeriesCount },
      message: `Cannot delete examination category that has ${subjectCount} subject${subjectCount > 1 ?'s' :''}, ${topicCount} topic${topicCount > 1 ?'s' :''}, or ${testSeriesCount} test series. Please remove all content first.`
    };
  }

  return { canDelete: true, details: { subjectCount: 0, topicCount: 0, testSeriesCount: 0, topicPurchaseCount: 0, testPurchaseCount: 0 }, message:'Examination category has no associated content.' };
}

module.exports = {
  checkCoursePurchases,
  checkBookPurchases,
  checkTestSeriesPurchases,
  checkTopicCategoryPurchases,
  checkExaminationCategoryPurchases
};
