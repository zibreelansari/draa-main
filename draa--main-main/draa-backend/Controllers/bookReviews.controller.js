const express = require('express');
const router = express.Router();
const BookReview = require('../Models/BookReview.models');
const Book = require('../Models/booksModel');
const BookPurchase = require('../Models/BooksPurchaseModels');
const Student = require('../Models/UserModel'); //  Your student model
const { authMiddleware } = require('../Middlewares/student.auth.middleware');

//  GET: Fetch all reviews for a book
router.get('/book/:bookId/reviews', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10, sort ='recent' } = req.query;

    let sortQuery = {};
    switch (sort) {
      case'recent':
        sortQuery = { createdAt: -1 };
        break;
      case'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case'highest':
        sortQuery = { rating: -1 };
        break;
      case'lowest':
        sortQuery = { rating: 1 };
        break;
      case'helpful':
        sortQuery = { helpful: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await BookReview.find({
      book: bookId,
      isApproved: true
    })
      .sort(sortQuery)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const totalReviews = await BookReview.countDocuments({
      book: bookId,
      isApproved: true
    });

    const stats = await BookReview.calculateAverageRating(bookId);

    res.json({
      success: true,
      reviews,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / parseInt(limit)),
        totalReviews,
        hasMore: skip + reviews.length < totalReviews
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch reviews',
      error: error.message
    });
  }
});

//  POST: Create a review
router.post('/book/:bookId/review', authMiddleware, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, title, review } = req.body;

    //  Use userId from YOUR auth middleware
    const studentId = req.user.userId;
    const studentEmail = req.user.email;

    console.log(' User from auth:', req.user);
    console.log(' Student ID:', studentId);

    //  Fetch student from UserModel
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message:'Student not found'
      });
    }

    const studentName = student.name;
    console.log(' Student details:', { studentId, studentName, studentEmail });

    // Validate input
    if (!rating || !title || !review) {
      return res.status(400).json({
        success: false,
        message:'Rating, title, and review are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message:'Rating must be between 1 and 5'
      });
    }

    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({
        success: false,
        message:'Title must be between 3 and 100 characters'
      });
    }

    if (review.length < 10 || review.length > 1000) {
      return res.status(400).json({
        success: false,
        message:'Review must be between 10 and 1000 characters'
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message:'Book not found'
      });
    }

    console.log(' Looking for purchase:', { studentId, bookId });

    //  Check purchase - try different field combinations
    let purchase = await BookPurchase.findOne({
      student: studentId,
      book: bookId
    });

    console.log(' Purchase (attempt 1):', purchase);

    if (!purchase) {
      purchase = await BookPurchase.findOne({
        studentId: studentId,
        bookId: bookId
      });
      console.log(' Purchase (attempt 2):', purchase);
    }

    // Check if student already reviewed this book
    const existingReview = await BookReview.findOne({
      book: bookId,
      student: studentId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:'You have already reviewed this book. You can edit your existing review.'
      });
    }

    //  Create review
    const newReview = new BookReview({
      book: bookId,
      student: studentId,
      studentName: studentName,
      studentEmail: studentEmail,
      rating: rating,
      title: title,
      review: review,
      verified: !!purchase
    });

    console.log(' Creating review:', newReview);

    await newReview.save();

    // Update book's average rating
    const stats = await BookReview.calculateAverageRating(bookId);
    await Book.findByIdAndUpdate(bookId, {
      rating: stats.averageRating,
      reviews: stats.totalReviews
    });

    res.status(201).json({
      success: true,
      message:'Review submitted successfully',
      review: newReview,
      stats
    });
  } catch (error) {
    console.error(' Error creating review:', error);
    res.status(500).json({
      success: false,
      message:'Failed to submit review',
      error: error.message
    });
  }
});

//  GET: Check if student can review a book
router.get('/book/:bookId/can-review', authMiddleware, async (req, res) => {
  try {
    const { bookId } = req.params;
    const studentId = req.user.userId; //  Changed

    const existingReview = await BookReview.findOne({
      book: bookId,
      student: studentId
    });

    res.json({
      success: true,
      canReview: !existingReview,
      hasPurchased: true,
      hasReviewed: !!existingReview,
      existingReview: existingReview || null
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      message:'Failed to check review eligibility',
      error: error.message
    });
  }
});

//  GET: Get student's review for a book
router.get('/book/:bookId/my-review', authMiddleware, async (req, res) => {
  try {
    const { bookId } = req.params;
    const studentId = req.user.userId; //  Changed

    const review = await BookReview.findOne({
      book: bookId,
      student: studentId
    });

    res.json({
      success: true,
      review: review || null,
      hasReviewed: !!review
    });
  } catch (error) {
    console.error('Error fetching student review:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch review',
      error: error.message
    });
  }
});

//  PUT: Edit a review
router.put('/review/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, review } = req.body;
    const studentId = req.user.userId; //  Changed

    const existingReview = await BookReview.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message:'Review not found'
      });
    }

    if (existingReview.student.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message:'You can only edit your own reviews'
      });
    }

    existingReview.rating = rating;
    existingReview.title = title;
    existingReview.review = review;
    existingReview.isEdited = true;
    existingReview.editedAt = new Date();

    await existingReview.save();

    const stats = await BookReview.calculateAverageRating(existingReview.book);
    await Book.findByIdAndUpdate(existingReview.book, {
      rating: stats.averageRating,
      reviews: stats.totalReviews
    });

    res.json({
      success: true,
      message:'Review updated successfully',
      review: existingReview,
      stats
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update review',
      error: error.message
    });
  }
});

//  DELETE: Delete a review
router.delete('/review/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user.userId; //  Changed

    const review = await BookReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message:'Review not found'
      });
    }

    if (review.student.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message:'You can only delete your own reviews'
      });
    }

    const bookId = review.book;
    await BookReview.findByIdAndDelete(reviewId);

    const stats = await BookReview.calculateAverageRating(bookId);
    await Book.findByIdAndUpdate(bookId, {
      rating: stats.averageRating,
      reviews: stats.totalReviews
    });

    res.json({
      success: true,
      message:'Review deleted successfully',
      stats
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message:'Failed to delete review',
      error: error.message
    });
  }
});

//  POST: Mark review as helpful/not helpful
router.post('/review/:reviewId/helpful', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;
    const studentId = req.user.userId; //  Changed

    const review = await BookReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message:'Review not found'
      });
    }

    // Remove from both arrays first
    review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== studentId);
    review.notHelpfulBy = review.notHelpfulBy.filter(id => id.toString() !== studentId);

    // Add to appropriate array
    if (isHelpful) {
      review.helpfulBy.push(studentId);
    } else {
      review.notHelpfulBy.push(studentId);
    }

    review.helpful = review.helpfulBy.length;
    review.notHelpful = review.notHelpfulBy.length;

    await review.save();

    res.json({
      success: true,
      message: `Marked as ${isHelpful ?'helpful' :'not helpful'}`,
      helpful: review.helpful,
      notHelpful: review.notHelpful
    });
  } catch (error) {
    console.error('Error marking review:', error);
    res.status(500).json({
      success: false,
      message:'Failed to mark review',
      error: error.message
    });
  }
});

module.exports = router;
