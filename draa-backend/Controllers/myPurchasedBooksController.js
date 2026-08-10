const express = require('express');
const router = express.Router();
const PurchaseModel = require('../Models/purchaseModels');
const mongoose = require('mongoose');

const { authMiddleware } = require('../Middlewares/student.auth.middleware');



// routes protected
router.use(authMiddleware);


//  Get Student's Purchased Books
router.get('/my-books/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 50, category, search, format, status } = req.query;

    console.log(` Getting books for student: ${studentId}`);

    // Build match query
    const matchQuery = {
      customer_id: new mongoose.Types.ObjectId(studentId),
      purchase_type: { $in: ['book','ebook'] },
      payment_status:'paid'
    };

    // Add filters
    if (category && category !=='all') {
      matchQuery['item_details.category'] = category;
    }

    if (search) {
      matchQuery.$or = [
        {'item_details.name': { $regex: search, $options:'i' } },
        {'item_details.description': { $regex: search, $options:'i' } }
      ];
    }

    if (format && format !=='all') {
      matchQuery.purchase_type = format;
    }

    if (status && status !=='all') {
      matchQuery.status = status;
    }

    // Aggregate pipeline for books with enhanced data
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from:'books', // Assuming you have a books collection
          localField:'item_id',
          foreignField:'_id',
          as:'bookDetails'
        }
      },
      {
        $addFields: {
          book: { $arrayElemAt: ['$bookDetails', 0] }
        }
      },
      {
        $project: {
          purchaseId:'$_id',
          bookId:'$item_id',
          book: {
            title:'$item_details.name',
            description:'$item_details.description',
            category:'$item_details.category',
            coverImage:'$book.coverImage',
            author:'$book.author',
            publisher:'$book.publisher',
            pages:'$book.pages',
            language:'$book.language',
            isbn:'$book.isbn',
            publishedDate:'$book.publishedDate',
            rating:'$book.rating',
            reviews:'$book.reviews',
            pdfFile:'$book.pdfUrl',
            format:'$book.format'
          },
          purchaseType:'$purchase_type',
          purchaseDate:'$purchase_initiated_at',
          amountPaid:'$pricing.final_amount',
          currency:'$pricing.currency',
          status:'$status',
          paymentStatus:'$payment_status',
          deliveryStatus: {
            $cond: {
              if: { $eq: ['$purchase_type','book'] },
              then:'$delivery_status', // Physical book delivery
              else:'delivered' // Digital books are instantly available
            }
          },
          downloadCount: { $ifNull: ['$download_count', 0] },
          lastDownloaded:'$last_downloaded_at',
          readingProgress: { $ifNull: ['$reading_progress', 0] },
          bookmarks: { $ifNull: ['$bookmarks', []] },
          notes: { $ifNull: ['$notes', []] },
          isFavorite: { $ifNull: ['$is_favorite', false] }
        }
      },
      { $sort: { purchaseDate: -1 } },
      { $limit: parseInt(limit) }
    ];

    const [books, categoriesResult, stats] = await Promise.all([
      PurchaseModel.aggregate(pipeline),
      PurchaseModel.aggregate([
        { $match: { customer_id: new mongoose.Types.ObjectId(studentId), purchase_type: { $in: ['book','ebook'] }, payment_status:'paid' } },
        { $group: { _id:'$item_details.category' } },
        { $match: { _id: { $ne: null } } },
        { $sort: { _id: 1 } }
      ]),
      calculateBookStats(studentId)
    ]);

    const categories = categoriesResult.map(c => c._id);

    console.log(` Retrieved ${books.length} books for student ${studentId}`);

    res.json({
      success: true,
      books: books,
      categories: categories,
      stats: stats,
      total: books.length
    });

  } catch (error) {
    console.error(' Error getting student books:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get student books',
      error: error.message
    });
  }
});

//  Get Book Reading Progress
router.get('/book/:studentId/:bookId/progress', async (req, res) => {
  try {
    const { studentId, bookId } = req.params;

    const purchase = await PurchaseModel.findOne({
      customer_id: studentId,
      item_id: bookId,
      purchase_type: { $in: ['book','ebook'] },
      payment_status:'paid'
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:'Book purchase not found'
      });
    }

    res.json({
      success: true,
      progress: {
        readingProgress: purchase.reading_progress || 0,
        bookmarks: purchase.bookmarks || [],
        notes: purchase.notes || [],
        lastRead: purchase.last_read_at,
        totalTimeSpent: purchase.reading_time_spent || 0
      }
    });

  } catch (error) {
    console.error(' Error getting book progress:', error);
    res.status(500).json({
      success: false,
      message:'Failed to get book progress',
      error: error.message
    });
  }
});

//  Update Book Reading Progress
router.post('/book/:studentId/:bookId/progress', async (req, res) => {
  try {
    const { studentId, bookId } = req.params;
    const { progress, bookmark, note, timeSpent } = req.body;

    const updateData = {
      last_read_at: new Date()
    };

    if (progress !== undefined) {
      updateData.reading_progress = Math.min(100, Math.max(0, progress));
    }

    if (timeSpent !== undefined) {
      updateData.$inc = { reading_time_spent: timeSpent };
    }

    if (bookmark) {
      updateData.$push = { bookmarks: { ...bookmark, created_at: new Date() } };
    }

    if (note) {
      updateData.$push = { notes: { ...note, created_at: new Date() } };
    }

    const result = await PurchaseModel.findOneAndUpdate(
      {
        customer_id: studentId,
        item_id: bookId,
        purchase_type: { $in: ['book','ebook'] },
        payment_status:'paid'
      },
      updateData,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:'Book purchase not found'
      });
    }

    res.json({
      success: true,
      message:'Reading progress updated',
      progress: {
        readingProgress: result.reading_progress,
        lastRead: result.last_read_at
      }
    });

  } catch (error) {
    console.error(' Error updating book progress:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update reading progress',
      error: error.message
    });
  }
});

//  Download Book (for eBooks)
router.get('/book/:studentId/:bookId/download', async (req, res) => {
  try {
    const { studentId, bookId } = req.params;

    const purchase = await PurchaseModel.findOneAndUpdate(
      {
        customer_id: studentId,
        item_id: bookId,
        purchase_type:'ebook',
        payment_status:'paid'
      },
      {
        $inc: { download_count: 1 },
        last_downloaded_at: new Date()
      },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:'eBook purchase not found or not accessible'
      });
    }

    // Here you would typically serve the actual file
    // For now, we'll return the download URL
    res.json({
      success: true,
      downloadUrl: `/downloads/books/${bookId}.pdf`, // This should be the actual file path
      message:'Download initiated',
      downloadCount: purchase.download_count
    });

  } catch (error) {
    console.error(' Error downloading book:', error);
    res.status(500).json({
      success: false,
      message:'Failed to download book',
      error: error.message
    });
  }
});

//  Toggle Book Favorite Status
router.post('/book/:studentId/:bookId/favorite', async (req, res) => {
  try {
    const { studentId, bookId } = req.params;
    const { isFavorite } = req.body;

    const result = await PurchaseModel.findOneAndUpdate(
      {
        customer_id: studentId,
        item_id: bookId,
        purchase_type: { $in: ['book','ebook'] },
        payment_status:'paid'
      },
      { is_favorite: isFavorite },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:'Book purchase not found'
      });
    }

    res.json({
      success: true,
      message: isFavorite ?'Added to favorites' :'Removed from favorites',
      isFavorite: result.is_favorite
    });

  } catch (error) {
    console.error(' Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update favorite status',
      error: error.message
    });
  }
});

// Helper function to calculate book statistics
async function calculateBookStats(studentId) {
  try {
    const pipeline = [
      {
        $match: {
          customer_id: new mongoose.Types.ObjectId(studentId),
          purchase_type: { $in: ['book','ebook'] },
          payment_status:'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalBooks: { $sum: 1 },
          physicalBooks: {
            $sum: { $cond: [{ $eq: ['$purchase_type','book'] }, 1, 0] }
          },
          ebooks: {
            $sum: { $cond: [{ $eq: ['$purchase_type','ebook'] }, 1, 0] }
          },
          completedBooks: {
            $sum: { $cond: [{ $gte: ['$reading_progress', 100] }, 1, 0] }
          },
          inProgressBooks: {
            $sum: { $cond: [{ $and: [{ $gt: ['$reading_progress', 0] }, { $lt: ['$reading_progress', 100] }] }, 1, 0] }
          },
          totalSpent: { $sum:'$pricing.final_amount' },
          totalReadingTime: { $sum: { $ifNull: ['$reading_time_spent', 0] } },
          averageProgress: { $avg: { $ifNull: ['$reading_progress', 0] } },
          favoriteBooks: {
            $sum: { $cond: [{ $eq: ['$is_favorite', true] }, 1, 0] }
          }
        }
      }
    ];

    const result = await PurchaseModel.aggregate(pipeline);
    const stats = result[0] || {};

    return {
      totalBooks: stats.totalBooks || 0,
      physicalBooks: stats.physicalBooks || 0,
      ebooks: stats.ebooks || 0,
      completedBooks: stats.completedBooks || 0,
      inProgressBooks: stats.inProgressBooks || 0,
      notStartedBooks: (stats.totalBooks || 0) - (stats.completedBooks || 0) - (stats.inProgressBooks || 0),
      totalSpent: stats.totalSpent || 0,
      totalReadingTime: Math.round((stats.totalReadingTime || 0) / 60), // Convert to minutes
      averageProgress: Math.round(stats.averageProgress || 0),
      favoriteBooks: stats.favoriteBooks || 0
    };

  } catch (error) {
    console.error(' Error calculating book stats:', error);
    return {
      totalBooks: 0,
      physicalBooks: 0,
      ebooks: 0,
      completedBooks: 0,
      inProgressBooks: 0,
      notStartedBooks: 0,
      totalSpent: 0,
      totalReadingTime: 0,
      averageProgress: 0,
      favoriteBooks: 0
    };
  }
}

module.exports = router;
