const Book = require('../Models/booksModel.js');
const Category = require('../Models/booksCategories.js');
const { checkBookPurchases } = require('../utils/purchaseCheck');

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g,'')
    .replace(/[\s_-]+/g,'-')
    .replace(/^-+|-+$/g,'');
};

// ===========================
// CREATE BOOK
// ===========================
const createBook = async (req, res) => {
  try {
    console.log(' Create Book Request Body:', req.body);
    console.log(' Uploaded Files:', req.files);

    const physicalPrice = Number(req.body.physicalPrice) || 0;
    const digitalPrice = Number(req.body.digitalPrice) || 0;

    const physicalDiscountPercentage =
      req.body.physicalDiscountPercentage === undefined
        ? 0
        : Math.min(100, Math.max(0, Number(req.body.physicalDiscountPercentage)));

    const digitalDiscountPercentage =
      req.body.digitalDiscountPercentage === undefined
        ? 0
        : Math.min(100, Math.max(0, Number(req.body.digitalDiscountPercentage)));



    const categoryName = req.body.category.trim().toUpperCase();
    let categoryDoc = await Category.findOne({ name: categoryName });

    if (!categoryDoc) {
      categoryDoc = await Category.create({
        name: categoryName,
        description:'Auto-created category',
      });
    }

    // Handle multiple additional images
    let addOnImages = [];
    if (req.files?.addOnImages) {
      addOnImages = req.files.addOnImages.map(
        file => `/uploads/books/${file.filename}`
      );
      console.log(' Additional Images:', addOnImages);
    }

    const book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      description: req.body.description ||'',
      features:
        req.body.features === undefined ||
          req.body.features ==='' ||
          req.body.features ==='[]'
          ? []
          : Array.isArray(req.body.features)
            ? req.body.features
            : JSON.parse(req.body.features),

      category: categoryDoc.name,
      physicalPrice,
      digitalPrice,
      physicalDiscountPercentage,
      digitalDiscountPercentage,

      isFeatured: req.body.isFeatured ==='true',
      isPopular: req.body.isPopular ==='true',
      bookType: req.body.bookType ||'pdftype',
      language: req.body.language ||'English',

      //  NEW: Publication Fields
      publicationName: req.body.publicationName ||'',
      publicationYear: req.body.publicationYear ? Number(req.body.publicationYear) : undefined,
      isbn: req.body.isbn ||'',

      coverImage: req.files?.coverImage
        ? `/uploads/books/${req.files.coverImage[0].filename}`
        :'',
      addOnImages: addOnImages,
      pdfUrl: req.files?.pdf
        ? `/uploads/books/${req.files.pdf[0].filename}`
        :'',
      youtubeUrl: req.body.youtubeUrl ||'',
      pages: req.body.pages ? Number(req.body.pages) : undefined,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : [],
      seo: {
        seo_title: req.body.seo_title,
        meta_keywords: req.body.meta_keywords,
        meta_description: req.body.meta_description,
        slug: req.body.slug,
        og_title: req.body.og_title,
        og_description: req.body.og_description,
        canonical_url: req.body.canonical_url,
        robots: req.body.robots ||'index, follow',
        schema_markup: req.body.schema_markup
      },
      uploadedBy: req.user.role ==="TEACHER" ? req.user.id : (req.body.uploadedBy || null),
      isApproved: false,
    });

    console.log(' Book Created:', book);

    // Create notification for admin if uploaded by a teacher
    try {
      if (req.user && req.user.role ==="TEACHER") {
        const Notification = require("../Models/NotificationModel");
        const TeacherModel = require("../Models/TeacherModel");
        const teacher = await TeacherModel.findById(req.user.id);
        const teacherName = teacher ? teacher.tname : (req.user.tname || req.user.name ||"A Teacher");
        
        await Notification.create({
          recipient:'admin',
          recipientModel:'Admin',
          sender: req.user.id,
          senderModel:'Teacher',
          senderName: teacherName,
          type:'book_upload',
          title:'New Book Uploaded',
          message: `Teacher ${teacherName} uploaded a new book:"${book.title}" (Pending Approval)`,
          referenceId: book._id
        });
        console.log('Notification triggered for new book upload');
      }
    } catch (notifErr) {
      console.error('Failed to trigger admin notification for book upload:', notifErr);
    }

    res.status(201).json({
      success: true,
      book,
      message:'Book created successfully and pending approval'
    });
  } catch (err) {
    console.error(' Create Book Error:', err);
    res.status(500).json({
      success: false,
      message:'Create failed',
      error: err.message
    });
  }
};

// ===========================
// UPDATE BOOK
// ===========================
const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log(' Update Book ID:', bookId);
    console.log(' Update Request Body:', req.body);
    console.log(' Uploaded Files:', req.files);

    const existingBook = await Book.findById(bookId);

    if (!existingBook) {
      return res.status(404).json({ success: false, message:'Book not found' });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && existingBook.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message:"Access denied. You do not own this record." });
    }

    const updateData = {};

    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.author !== undefined) updateData.author = req.body.author;
    if (req.body.description !== undefined) updateData.description = req.body.description;

    if (req.body.features !== undefined) {
      if (req.body.features ==='' || req.body.features ==='[]') {
        updateData.features = [];
      } else if (Array.isArray(req.body.features)) {
        updateData.features = req.body.features;
      } else {
        try {
          updateData.features = JSON.parse(req.body.features);
        } catch {
          updateData.features = [];
        }
      }
    }

    if (req.body.bookType !== undefined) updateData.bookType = req.body.bookType;
    if (req.body.youtubeUrl !== undefined) updateData.youtubeUrl = req.body.youtubeUrl;
    if (req.body.language !== undefined) updateData.language = req.body.language;

    // Publication fields
    if (req.body.publicationName !== undefined) updateData.publicationName = req.body.publicationName;
    if (req.body.publicationYear !== undefined) {
      updateData.publicationYear = req.body.publicationYear ? Number(req.body.publicationYear) : undefined;
    }
    if (req.body.isbn !== undefined) updateData.isbn = req.body.isbn;

    //  FIX: Handle physicalPrice and digitalPrice (what frontend actually sends)
    if (req.body.physicalPrice !== undefined) {
      updateData.physicalPrice = Number(req.body.physicalPrice) || 0;
      console.log(' Updating physicalPrice to:', updateData.physicalPrice);
    }

    if (req.body.digitalPrice !== undefined) {
      updateData.digitalPrice = Number(req.body.digitalPrice) || 0;
      console.log(' Updating digitalPrice to:', updateData.digitalPrice);
    }

    //  Also keep legacy `price` field in sync (use whichever is relevant by bookType)
    if (req.body.physicalPrice !== undefined || req.body.digitalPrice !== undefined) {
      const bookType = req.body.bookType || existingBook.bookType;
      if (bookType ==='paperback') {
        updateData.price = updateData.physicalPrice ?? existingBook.physicalPrice ?? 0;
      } else if (bookType ==='pdftype') {
        updateData.price = updateData.digitalPrice ?? existingBook.digitalPrice ?? 0;
      } else if (bookType ==='both(ppt+pdf)') {
        // For both types, use digital as the primary display price (or whichever you prefer)
        updateData.price = updateData.digitalPrice ?? existingBook.digitalPrice ?? 0;
      }
    }

    if (req.body.physicalDiscountPercentage !== undefined) {
      updateData.physicalDiscountPercentage =
        Math.min(100, Math.max(0, Number(req.body.physicalDiscountPercentage)));
      console.log(' Updating physicalDiscountPercentage to:', updateData.physicalDiscountPercentage);
    }

    if (req.body.digitalDiscountPercentage !== undefined) {
      updateData.digitalDiscountPercentage =
        Math.min(100, Math.max(0, Number(req.body.digitalDiscountPercentage)));
      console.log(' Updating digitalDiscountPercentage to:', updateData.digitalDiscountPercentage);
    }

    //  Also sync legacy discountPercentage field
    if (req.body.physicalDiscountPercentage !== undefined || req.body.digitalDiscountPercentage !== undefined) {
      const bookType = req.body.bookType || existingBook.bookType;
      if (bookType ==='paperback') {
        updateData.discountPercentage = updateData.physicalDiscountPercentage ?? existingBook.physicalDiscountPercentage ?? 0;
      } else {
        updateData.discountPercentage = updateData.digitalDiscountPercentage ?? existingBook.digitalDiscountPercentage ?? 0;
      }
    }

    if (req.body.isFeatured !== undefined) {
      updateData.isFeatured = req.body.isFeatured ==='true' || req.body.isFeatured === true;
    }
    if (req.body.isPopular !== undefined) {
      updateData.isPopular = req.body.isPopular ==='true' || req.body.isPopular === true;
    }

    if (req.body.category) {
      let categoryDoc = await Category.findOne({
        name: new RegExp(`^${req.body.category.trim()}$`,'i'),
      });

      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: req.body.category.trim().toUpperCase(),
          description:'Auto-created category',
        });
      }

      updateData.category = categoryDoc.name;
    }

    if (req.files?.coverImage) {
      updateData.coverImage = `/uploads/books/${req.files.coverImage[0].filename}`;
    }

    if (req.files?.addOnImages) {
      const newAddOnImages = req.files.addOnImages.map(
        file => `/uploads/books/${file.filename}`
      );
      updateData.addOnImages = [
        ...(existingBook.addOnImages || []),
        ...newAddOnImages
      ];
    }

    if (req.files?.pdf) {
      updateData.pdfUrl = `/uploads/books/${req.files.pdf[0].filename}`;
    }

    if (req.body.pages !== undefined) {
      updateData.pages = req.body.pages ? Number(req.body.pages) : undefined;
    }

    if (req.body.tags !== undefined) {
      if (Array.isArray(req.body.tags)) {
        updateData.tags = req.body.tags;
      } else {
        try {
          updateData.tags = JSON.parse(req.body.tags);
        } catch {
          updateData.tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [];
        }
      }
    }

    updateData.seo = {
      ...existingBook.seo,
      seo_title: req.body.seo_title ?? existingBook.seo?.seo_title,
      meta_keywords: req.body.meta_keywords ?? existingBook.seo?.meta_keywords,
      meta_description: req.body.meta_description ?? existingBook.seo?.meta_description,
      slug: req.body.slug ?? existingBook.seo?.slug,
      og_title: req.body.og_title ?? existingBook.seo?.og_title,
      og_description: req.body.og_description ?? existingBook.seo?.og_description,
      canonical_url: req.body.canonical_url ?? existingBook.seo?.canonical_url,
      robots: req.body.robots ?? existingBook.seo?.robots,
      schema_markup: req.body.schema_markup ?? existingBook.seo?.schema_markup,
    };

    // Reset to pending on any edit/update
    updateData.isApproved = false;
    updateData.approvedBy = null;
    updateData.approvedAt = null;

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      book: updatedBook,
      message:'Book updated successfully',
    });
  } catch (err) {
    console.error(' Update Book Error:', err);
    res.status(500).json({
      success: false,
      message:'Update failed',
      error: err.message
    });
  }
};

// ===========================
// GET ALL BOOKS
// ===========================
const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 10;
    const skip = limit === 0 ? 0 : (page - 1) * limit;

    const filters = {};

    if (req.query.category) {
      filters.category = { $regex: new RegExp(`^${req.query.category.trim()}$`,'i') };
    }

    //  NEW: Language filter
    if (req.query.language) {
      filters.language = req.query.language;
    }

    if (req.query.isFeatured !== undefined) filters.isFeatured = req.query.isFeatured ==='true';
    if (req.query.isPopular !== undefined) filters.isPopular = req.query.isPopular ==='true';
    if (req.query.isApproved !== undefined) filters.isApproved = req.query.isApproved ==='true';

    // Force teacher filter
    if (req.user.role ==="TEACHER") {
      filters.uploadedBy = req.user.id;
    } else if (req.query.uploadedBy) {
      filters.uploadedBy = req.query.uploadedBy;
    }

    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
      const escapedSearch = escapeRegex(searchTerm);

      const fuzzyPatterns = [
        new RegExp(escapedSearch,'i'),
        new RegExp(escapedSearch.split('').join('.?'),'i'),
        new RegExp(`\\b${escapedSearch}`,'i'),
        new RegExp(escapedSearch.split('').join('.*'),'i')
      ];

      filters.$or = [
        { title: fuzzyPatterns[0] },
        { author: fuzzyPatterns[0] },
        { description: fuzzyPatterns[0] },
        { category: fuzzyPatterns[0] },
        { language: fuzzyPatterns[0] }, //  NEW: Search by language
        {'seo.meta_keywords': fuzzyPatterns[0] },
        { title: fuzzyPatterns[1] },
        { author: fuzzyPatterns[1] },
        { title: fuzzyPatterns[2] },
        { author: fuzzyPatterns[2] }
      ];
    }

    const totalBooks = await Book.countDocuments(filters);
    let queryObj = Book.find(filters)
      .populate('approvedBy','aname aemail')
      .sort({ createdAt: -1 });

    if (limit > 0) {
      queryObj = queryObj.skip(skip).limit(limit);
    }
    const books = await queryObj;

    const booksWithCategoryInfo = books.map(book => ({
      ...book.toObject(),
      category: {
        name: book.category
      }
    }));

    res.status(200).json({
      success: true,
      books: booksWithCategoryInfo,
      pagination: {
        current_page: page,
        total_pages: limit === 0 ? 1 : Math.ceil(totalBooks / limit),
        total_books: totalBooks,
        books_per_page: limit
      }
    });
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ success: false, message:'Fetch failed' });
  }
};

// ===========================
// GET BOOK BY ID
// ===========================
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:'Book ID is required'
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message:'Book not found'
      });
    }

    await Book.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const bookResponse = {
      ...book.toObject(),
      category: {
        name: book.category
      }
    };

    res.status(200).json({
      success: true,
      book: bookResponse,
      message:'Book retrieved successfully'
    });

  } catch (err) {
    console.error('Error fetching book by ID:', err);

    if (err.name ==='CastError') {
      return res.status(400).json({
        success: false,
        message:'Invalid book ID format'
      });
    }

    res.status(500).json({
      success: false,
      message:'Failed to fetch book',
      error: err.message
    });
  }
};

const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        message:'Category name is required'
      });
    }

    // Case-insensitive search
    const category = await Category.findOne({
      name: { $regex: `^${name}$`, $options:'i' }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message:'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      category,
      message:'Category retrieved successfully'
    });

  } catch (err) {
    console.error('Error fetching category by name:', err);

    res.status(500).json({
      success: false,
      message:'Failed to fetch category',
      error: err.message
    });
  }
};

// ===========================
// DELETE BOOK
// ===========================
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message:'Book not found'
      });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && book.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message:"Access denied. You do not own this record." });
    }

    // Check for purchases before deletion
    const { canDelete, message } = await checkBookPurchases(req.params.id);
    if (!canDelete) {
      return res.status(400).json({
        success: false,
        message: message
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message:'Book deleted successfully',
      deleted_book: {
        id: book._id,
        title: book.title
      }
    });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ success: false, message:'Delete failed' });
  }
};

// ===========================
// GET APPROVED BOOKS
// ===========================
const getApprovedBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 10;
    const skip = limit === 0 ? 0 : (page - 1) * limit;

    const filters = { isApproved: true };

    if (req.query.category) {
      filters.category = { $regex: new RegExp(`^${req.query.category.trim()}$`,'i') };
    }

    if (req.query.isFeatured !== undefined) filters.isFeatured = req.query.isFeatured ==='true';
    if (req.query.isPopular !== undefined) filters.isPopular = req.query.isPopular ==='true';

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options:'i' };
      filters.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        {'seo.meta_keywords': searchRegex }
      ];
    }

    const totalBooks = await Book.countDocuments(filters);
    let queryObj = Book.find(filters)
      .sort({ createdAt: -1 });

    if (limit > 0) {
      queryObj = queryObj.skip(skip).limit(limit);
    }
    const books = await queryObj;

    const booksWithCategoryInfo = books.map(book => ({
      ...book.toObject(),
      category: {
        name: book.category
      }
    }));

    res.status(200).json({
      success: true,
      books: booksWithCategoryInfo,
      pagination: {
        current_page: page,
        total_pages: limit === 0 ? 1 : Math.ceil(totalBooks / limit),
        total_books: totalBooks,
        books_per_page: limit
      }
    });
  } catch (err) {
    console.error('Error fetching approved books:', err);
    res.status(500).json({ success: false, message:'Fetch failed' });
  }
};

// ===========================
// GET PENDING BOOKS
// ===========================
const getPendingBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = { isApproved: false };

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options:'i' };
      filters.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    const totalBooks = await Book.countDocuments(filters);
    const books = await Book.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const booksWithCategoryInfo = books.map(book => ({
      ...book.toObject(),
      category: {
        name: book.category
      }
    }));

    res.status(200).json({
      success: true,
      books: booksWithCategoryInfo,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalBooks / limit),
        total_books: totalBooks,
        books_per_page: limit
      },
      message: `Found ${totalBooks} books pending approval`
    });
  } catch (err) {
    console.error('Error fetching pending books:', err);
    res.status(500).json({ success: false, message:'Fetch failed' });
  }
};

// ===========================
// UPDATE BOOK APPROVAL
// ===========================
const updateBookApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const adminId = req.admin?.id || req.user?.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:'Book ID is required'
      });
    }

    if (typeof isApproved !=='boolean') {
      return res.status(400).json({
        success: false,
        message:'isApproved must be a boolean value'
      });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message:'Book not found'
      });
    }

    if (isApproved) {
      book.isApproved = true;
      book.approvedBy = adminId;
      book.approvedAt = new Date();
    } else {
      book.isApproved = false;
      book.approvedBy = null;
      book.approvedAt = null;
    }

    await book.save();

    // Create notification for the teacher and students
    try {
      const Notification = require("../Models/NotificationModel");
      if (book.uploadedBy) {
        const notifTitle = isApproved ? 'Book Approved!' : 'Book Status Update';
        const notifMessage = isApproved 
          ? `Congratulations! Your book "${book.title}" has been approved by the Admin and is now live.`
          : `Your book "${book.title}" status has been set to pending by the Admin.`;

        await Notification.create({
          recipient: book.uploadedBy.toString(),
          recipientModel: 'Teacher',
          sender: null,
          senderModel: 'Admin',
          senderName: 'EduDocs Team',
          type: 'book_upload',
          title: notifTitle,
          message: notifMessage,
          referenceId: book._id
        });
        console.log('Notification triggered for book approval status');
      }

      if (isApproved) {
        await Notification.create({
          recipient: 'all_students',
          recipientModel: 'User',
          sender: null,
          senderModel: 'Admin',
          senderName: 'EduDocs Team',
          type: 'book_upload',
          title: 'New Book Published!',
          message: `New Book Available: "${book.title}" by ${book.author} is now live!`,
          referenceId: book._id
        });
        console.log('Notification triggered for all students (book approval)');
      }
    } catch (notifErr) {
      console.error('Failed to trigger notification for book approval:', notifErr);
    }

    const bookResponse = {
      ...book.toObject(),
      category: {
        name: book.category
      }
    };

    res.status(200).json({
      success: true,
      book: bookResponse,
      message: `Book ${isApproved ?'approved' :'unapproved'} successfully`
    });

  } catch (err) {
    console.error('Error updating book approval:', err);

    if (err.name ==='CastError') {
      return res.status(400).json({
        success: false,
        message:'Invalid book ID format'
      });
    }

    res.status(500).json({
      success: false,
      message:'Failed to update approval status',
      error: err.message
    });
  }
};

// ===========================
// BULK APPROVE BOOKS
// ===========================
const bulkApproveBooks = async (req, res) => {
  try {
    const { bookIds, isApproved } = req.body;
    const adminId = req.admin?.id || req.user?.id;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({
        success: false,
        message:'Book IDs array is required'
      });
    }

    if (typeof isApproved !=='boolean') {
      return res.status(400).json({
        success: false,
        message:'isApproved must be a boolean value'
      });
    }

    const updateData = isApproved
      ? {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date()
      }
      : {
        isApproved: false,
        approvedBy: null,
        approvedAt: null
      };

    // Fetch books to have access to titles and creator teacher info
    const books = await Book.find({ _id: { $in: bookIds } });

    const result = await Book.updateMany(
      { _id: { $in: bookIds } },
      updateData
    );

    // Send notifications for each book
    try {
      const Notification = require("../Models/NotificationModel");
      for (const book of books) {
        if (isApproved) {
          // Notify the creator teacher
          if (book.uploadedBy) {
            await Notification.create({
              recipient: book.uploadedBy.toString(),
              recipientModel: 'Teacher',
              sender: null,
              senderModel: 'Admin',
              senderName: 'EduDocs Team',
              type: 'book_upload',
              title: 'Book Approved!',
              message: `Congratulations! Your book "${book.title}" has been approved by the Admin and is now live.`,
              referenceId: book._id
            });
          }
          // Notify all students
          await Notification.create({
            recipient: 'all_students',
            recipientModel: 'User',
            sender: null,
            senderModel: 'Admin',
            senderName: 'EduDocs Team',
            type: 'book_upload',
            title: 'New Book Published!',
            message: `New Book Available: "${book.title}" by ${book.author} is now live!`,
            referenceId: book._id
          });
        } else {
          // Notify the creator teacher on pending status
          if (book.uploadedBy) {
            await Notification.create({
              recipient: book.uploadedBy.toString(),
              recipientModel: 'Teacher',
              sender: null,
              senderModel: 'Admin',
              senderName: 'EduDocs Team',
              type: 'book_upload',
              title: 'Book Status Update',
              message: `Your book "${book.title}" status has been set to pending by the Admin.`,
              referenceId: book._id
            });
          }
        }
      }
      console.log('Notifications triggered for bulk book approval status');
    } catch (notifErr) {
      console.error('Failed to trigger bulk book approval notifications:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} books ${isApproved ?'approved' :'unapproved'} successfully`,
      modified_count: result.modifiedCount,
      matched_count: result.matchedCount
    });

  } catch (err) {
    console.error('Error in bulk approval:', err);
    res.status(500).json({
      success: false,
      message:'Bulk approval failed',
      error: err.message
    });
  }
};

// ===========================
// GET BOOKS BY CATEGORY
// ===========================
const getBooksByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const categoryVariations = [
      categorySlug,
      categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
      categorySlug.toUpperCase(),
      categorySlug.replace(/-/g,''),
      categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(''),
      categorySlug.replace(/-/g,'').toUpperCase()
    ];

    let category = await Category.findOne({
      $or: categoryVariations.map(variation => ({
        name: { $regex: new RegExp(`^${variation.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`,'i') }
      }))
    });

    if (!category) {
      const broadPattern = categorySlug
        .replace(/-/g,'\\s*')
        .replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

      category = await Category.findOne({
        name: { $regex: new RegExp(broadPattern,'i') }
      });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message:'Category not found'
      });
    }

    const filters = {
      category: { $regex: new RegExp(`^${category.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`,'i') },
      isApproved: true
    };

    //  NEW: Language filter
    if (req.query.language) {
      filters.language = req.query.language;
    }

    if (req.query.isFeatured !== undefined) {
      filters.isFeatured = req.query.isFeatured ==='true';
    }
    if (req.query.isPopular !== undefined) {
      filters.isPopular = req.query.isPopular ==='true';
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options:'i' };
      filters.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
        { language: searchRegex }, //  NEW
        {'seo.meta_keywords': searchRegex }
      ];
    }

    let sortOptions = { createdAt: -1 };

    if (req.query.sort) {
      switch (req.query.sort) {
        case'title_asc': sortOptions = { title: 1 }; break;
        case'title_desc': sortOptions = { title: -1 }; break;
        case'price_asc': sortOptions = { price: 1 }; break;
        case'price_desc': sortOptions = { price: -1 }; break;
        case'popular': sortOptions = { views: -1, downloads: -1 }; break;
        default: sortOptions = { createdAt: -1 };
      }
    }

    const totalBooks = await Book.countDocuments(filters);
    const books = await Book.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const booksWithCategoryInfo = books.map(book => ({
      ...book,
      category: {
        name: book.category,
        _id: category._id
      }
    }));

    res.status(200).json({
      success: true,
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
        slug: categorySlug
      },
      books: booksWithCategoryInfo,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalBooks / limit),
        total_books: totalBooks,
        books_per_page: limit
      }
    });

  } catch (err) {
    console.error('Error fetching books by category:', err);
    res.status(500).json({
      success: false,
      message:'Failed to fetch books by category',
      error: err.message
    });
  }
};

// ===========================
// SEARCH BOOKS
// ===========================
const searchBooks = async (req, res) => {
  try {
    const { search ='', page = 1, limit = 12 } = req.query;

    const baseFilter = { isApproved: true };

    if (search && search.trim()) {
      const searchTerm = search.trim();
      baseFilter.$or = [
        { title: { $regex: searchTerm, $options:'i' } },
        { author: { $regex: searchTerm, $options:'i' } },
        { description: { $regex: searchTerm, $options:'i' } }
      ];
    }

    const totalBooks = await Book.countDocuments(baseFilter);
    const books = await Book.find(baseFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      books,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalBooks / limit),
        total_books: totalBooks
      }
    });
  } catch (err) {
    console.error('Error searching books:', err);
    res.status(500).json({ success: false, message:'Search failed' });
  }
};

// ===========================
// GET BOOK STATS
// ===========================
const getBookStats = async (req, res) => {
  try {
    const stats = await Book.aggregate([
      {
        $facet: {
          total: [{ $count:'count' }],
          approved: [{ $match: { isApproved: true } }, { $count:'count' }],
          pending: [{ $match: { isApproved: false } }, { $count:'count' }],
          featured: [{ $match: { isFeatured: true } }, { $count:'count' }],
          popular: [{ $match: { isPopular: true } }, { $count:'count' }]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: stats[0].total[0]?.count || 0,
        approved: stats[0].approved[0]?.count || 0,
        pending: stats[0].pending[0]?.count || 0,
        featured: stats[0].featured[0]?.count || 0,
        popular: stats[0].popular[0]?.count || 0
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, message:'Stats fetch failed' });
  }
};

// ===========================
// CATEGORY CRUD
// ===========================
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() ==='') {
      return res.status(400).json({ message:'Category name is required.' });
    }

    const categoryName = name.trim().toUpperCase();

    const existing = await Category.findOne({ name: categoryName });
    if (existing) {
      return res.status(409).json({ message:'Category already exists.' });
    }

    const category = new Category({
      name: categoryName,
      description: `Category for ${categoryName} books`
    });
    await category.save();

    res.status(201).json({ message:'Category created successfully.', category });
  } catch (error) {
    res.status(500).json({ message:'Failed to create category.', error: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message:'Failed to fetch categories.', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() ==='') {
      return res.status(400).json({ message:'New category name is required.' });
    }

    const categoryName = name.trim().toUpperCase();

    const updated = await Category.findByIdAndUpdate(
      id,
      { name: categoryName },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message:'Category not found.' });
    }

    res.status(200).json({ message:'Category updated successfully.', category: updated });
  } catch (error) {
    res.status(500).json({ message:'Failed to update category.', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message:'Category not found.' });
    }

    res.status(200).json({ message:'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message:'Failed to delete category.', error: error.message });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getApprovedBooks,
  getPendingBooks,
  updateBookApproval,
  bulkApproveBooks,
  getBooksByCategory,
  searchBooks,
  getBookStats,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryByName
};
