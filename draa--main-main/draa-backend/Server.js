const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fs = require('fs');
const connectDB = require('./Config/ConnectDB');



const path = require("path");
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

dotenv.config();
const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────
// CORS configuration (declared FIRST so it runs before any error)
// so that even error responses (404, 413, 500) carry CORS headers
// ─────────────────────────────────────────────
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, postman) or matching draa
        if (!origin || origin.includes('draa.in') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            callback(null, true); // permissive fallback to avoid blocking on error responses
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-device-browser",
        "x-device-os",
        "x-device-type",
        "X-Requested-With",
        "Accept",
        "Origin"
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: 86400 // cache preflight for 24h
};

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? ["https://draa.in", "https://www.draa.in"] : "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    }
});

// Real-time notification socket service registration
const socketService = require('./utils/socketService');
socketService.setIO(io);

// Middleware to guarantee CORS headers on ALL responses (including 4xx/5xx errors).
// This must run FIRST so that any error thrown downstream still carries CORS headers.
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Echo the origin when present, otherwise allow any (for non-browser clients)
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-device-browser, x-device-os, x-device-type, X-Requested-With, Accept, Origin');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// 1. Security Middlewares — disabled COEP/COOP so they don't block cross-origin assets
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// 2. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs (adjusted for EdTech app)
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

const logger = require('./utils/logger');
app.use(logger);
// Increased limits to comfortably accommodate cover photos + syllabus PDFs + chapters.
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Global audit logging middleware to capture activities for all users
const auditLogger = require('./Middlewares/auditLogger.middleware');
app.use(auditLogger);

// Options to explicitly set CORS headers on static files (especially important for PDF/media fetches)
const staticOptions = {
    setHeaders: (res, path, stat) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/api/v1/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/api/v1/uploads/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/api/v1/uploads/coursematerials', express.static(path.join(__dirname, 'uploads', 'coursematerials'), staticOptions));
app.use('/uploads/editor', express.static(path.join(__dirname, 'uploads', 'editor'), staticOptions));

// Public assets (e.g. /assets/intro.mp4) — also resolve under /api/v1/assets
// so the frontend can hit either path through the API domain.
const publicAssetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(publicAssetsDir)) {
    fs.mkdirSync(publicAssetsDir, { recursive: true });
}
app.use('/assets', express.static(publicAssetsDir, staticOptions));
app.use('/api/v1/assets', express.static(publicAssetsDir, staticOptions));

// Backwards-compat: /api/draa.in/api/* — strip the redundant prefix and rewrite
// to /api/*. This repairs the malformed URL the admin dashboard was generating.
app.use((req, res, next) => {
    const match = req.url.match(/^\/api\/draa\.in(\/.*)$/);
    if (match) {
        req.url = match[1];
    }
    next();
});





// sitemap route
app.use('/sitemap.xml', require('./Routes/SitemapRoutes.js'));

//search route
app.use('/api/v1/search', require('./Routes/search.routes.js'));

//user routes

app.use('/api/v1/users', require('./Routes/UserRoutes'));

// Student Routes
app.use('/api/v1/student', require('./Routes/studentRoutes'));

// teacher routes
app.use('/api/v1/teachers', require('./Routes/TeachersRoutes'));

// admin routes         
app.use('/api/v1/admin', require('./Routes/AdminRoutes'));
app.use('/api/v1/admin/logs', require('./Routes/AdminLogRoutes'));


// Count Routes
app.use('/api/v1/notifications', require('./Routes/NotificationRoutes'));
app.use('/api/v1/count', require('./Routes/CountRoutes'));

// User Profile Routes
app.use('/api/v1/userProfile', require('./Routes/UserProfileRoutes'));

// delete student route
app.use('/api/v1/deleteStudent', require('./Routes/DeleteStudentRoutes'));

// update student status route
app.use('/api/v1/users', require('./Routes/UpdateStudentStatus'));

//teacher profile route`
app.use('/api/v1/teacherProfile', require('./Routes/TeacherProfileRoutes'));

// delete teacher route
app.use('/api/v1/deleteTeacher', require('./Routes/DeleteTeacherRoutes'));

// update teacher status route
app.use('/api/v1/updateTeacherStatus', require('./Routes/UpdateTeacherStatusRoutes'));


// teacher stats route
app.use('/api/v1/teacher/stats', require('./Routes/TeacherStatsRoutes'));


// all teacher name
app.use('/api/v1/', require('./Routes/TeachersNameRoutes'));

// add course route
app.use('/api/v1/course', require('./Routes/CourseAddRoutes'));


// course status route
app.use('/api/v1/course', require('./Routes/CourseStatusRoutes.js'));


// admin course routes (mounted under /api/v1/admin/courses and /api/v1/course/admin/courses)
app.use('/api/v1/admin/courses', require('./Routes/AdminCourseRoutes.js'));
app.use('/api/v1/course/admin/courses', require('./Routes/AdminCourseRoutes.js'));

//course stats route
app.use('/api/v1/course', require('./Routes/courseStatsRoute.js'));

// all courses route
app.use('/api/v1/course', require('./Routes/AllcoursesRoutes'));

//course Details route
app.use('/api/v1/course/courseDetails', require('./Routes/SpecficCourseRoutes'));

// course delete route
app.use('/api/v1/course/deleteCourse', require('./Routes/DeleteCourseRoutes'));

// course update route
app.use('/api/v1/course/updateCourse', require('./Routes/UpdateCourseRoutes'));

const { TeacherOwnProfile, AdminOwnProfile } = require('./Controllers/AdminTeacherProfile');

//route for TeacherOwnProfile
app.get('/api/v1/course/Teacher/MyProfile/:id', TeacherOwnProfile);

//route for AdminOwnProfile
app.get('/api/v1/course/Admin/MyProfile/:id', AdminOwnProfile);

//course approval status
app.use('/api/v1/course/UpdateCourseApprovalStatus', require('./Routes/CourseApprovalUpdateStatus'));

//course review routes
app.use('/api/v1/course/review', require('./Routes/courseReviewRoutes.js'));

//course details
app.use('/api/v1/course/', require('./Routes/CourseDetailsRoutes'))

// publish course content
app.use('/api/v1/course', require('./Routes/CourseContentRoutes'));


// sdtudent blog routes
app.use('/api/v1/student/blogs', require('./Routes/studentBlogRoutes'));
// teacher blog routes (same controller, role-aware)
app.use('/api/v1/teacher/blogs', require('./Routes/teacherBlogRoutes'));
// admin blog routes (same controller, role-aware; admins auto-approve)
app.use('/api/v1/admin/blogs', require('./Routes/adminBlogRoutes'));


// all course content
app.use('/api/v1/course', require('./Routes/AllCourseContentRoutes'));

// update course Content Status
app.use('/api/v1/course/courseContent/updateStatus', require('./Routes/UpdateCourseContentRoutes'));


// student coins routes
app.use('/api/v1/student/wallet', require('./Routes/student.wallet.routes.js'));

// delete course content
app.use('/api/v1/course/deleteCourseContent', require('./Routes/DeleteCourseContent'));


// course content details
app.use('/api/v1/course/courseContentDetails', require('./Routes/CourseContentDetailsRoutes'));

// exam routes
app.use('/api/v1/exams', require('./Routes/exams.routes'));

// course category routes
app.use('/api/v1/exam-categories', require('./Routes/examCategory.routes.js'));

// course content update 
app.use('/api/v1/course/UpdateCourseContent', require('./Routes/CourseContentUpdateRoutes'));


//exam routes
app.use('/api/v1/exam', require('./Routes/ExamRoutes'));




// assignmment routes
app.use('/api/v1/assignmments', require('./Routes/Asignmment.routes'));

//jobs routes

app.use('/api/v1/jobs', require('./Routes/jobsRoutes'));

//jobs categoriesroutes.js
app.use('/api/v1/jobs/categories', require('./Routes/jobcategoryroutes'));

//booksroutes
app.use('/api/v1/books', require('./Routes/booksroutes.js'));
app.use('/api/v1/books/review', require('./Controllers/bookReviews.controller.js'));

//live sessions
app.use("/api/v1/live-sessions", require("./Routes/LiveSessionsRoutes.js"));

//test series routes // topic wise 
app.use("/api/v1/test-series/review", require("./Routes/testSeriesReviewRoutes.js"));
app.use("/api/v1/test-series", require("./Routes/TestSeriesRoutes.js"));
const topicPurchaseRoutes = require('./Controllers/topicCategoryPurchaseRoutes.js');

app.use('/api/v1/test-series-enrollment/purchase', topicPurchaseRoutes);

// course category routes
app.use("/api/v1/course/categories", require("./Routes/CourseCategoryRoutes.js"));
app.use("/api/v1/admin/contactus", require("./Routes/ContactUsRoutes.js"));

//inqury routes

app.use("/api/v1/admin/inquiry", require("./Routes/Inqury.routes.js"));


//student course purchase 
app.use("/api/v1/students/course/payment", require("./Controllers/coursePayemntController.js"));


app.use("/api/v1/students/books/payment", require("./Controllers/BooksPaymentController.js"));



//payment management
app.use("/api/v1/admin/payments", require("./Controllers/PayemntManagementController.js"));


app.use("/api/v1/student/courses/progress", require("./Controllers/CourseProgressController.js"));

app.use("/api/v1/student/books/purchase", require("./Controllers/myPurchasedBooksController.js"));




app.use("/api/v1/student/test-series/purchase", require("./Controllers/TestSeriesPaymentController.js"));


app.use("/api/v1/student/test-series/attempt", require("./Routes/testAttemptRoutes.js"));


app.use("/api/v1/student/dashboard/analytics", require("./Routes/dashboardRoutes.js"));

// Student Metrics Routes
app.use("/api/v1/student/metrics", require("./Routes/studentMetricsRoutes.js"));

// Student Leaderboard Routes
app.use("/api/v1/student/leaderboard", require("./Routes/studentLeaderboardRoutes.js"));

app.use("/api/v1/teacher/dashboard/analytics", require("./Routes/TeacherDashboardRoutes.js"));



//cms

app.use("/api/v1/admin/cms", require("./Controllers/PrivacyPolicyController.js"));

app.use("/api/v1/admin/tnc", require("./Controllers/TrmsnCndtns.js"));


app.use("/api/v1/admin/aboutus", require("./Controllers/AboutusCtrl.js"));
app.use("/api/v1/aboutus", require("./Controllers/AboutusCtrl.js"));
app.use("/api/v1/toppers", require("./Routes/topperRoutes.js"));


app.use("/api/v1/admin/faqs", require("./Controllers/FAQCtrl.js"));


app.use("/api/v1/admin/banner", require("./Routes/AdminBanner_Slider_content.routes.js"));
app.use("/api/v1/videography", require("./Routes/VideographyRoutes.js"));
app.use("/api/v1/chatbot", require("./Routes/ChatbotFAQRoutes.js"));
app.use("/api/v1/agent", require("./agent/agentRoutes.js"));


//books purchase (cart)
app.use("/api/v1/books/cart", require("./Controllers/cartBooksPurchasd.js"));

//ca
app.use("/api/v1/current-affairs", require("./Controllers/currentAffairs.js"));

//wishlists
app.use("/api/v1/wishlist", require("./Routes/wishlistRoutes.js"));

//teacher attadances
app.use("/api/v1/teachers/attandances", require("./Routes/TeacherAttandancesApi.js"));

//pyqs
app.use("/api/v1/pyq", require("./Routes/pyqRoutes.js"));

//syllabus  
app.use("/api/v1/syllabus", require("./Routes/syllabus.Routes.js"));

// editor
app.use('/api/v1/editor', require('./Routes/editorUpload'));

// footer dynamic config
app.use('/api/v1/admin/footer', require('./Routes/FooterRoutes.js'));

// Public corporate website content + protected admin editing routes
app.use('/api/v1/corporate', require('./Routes/CorporateSiteRoutes.js'));

// newsletter routes
app.use('/api/v1/newsletter', require('./Routes/NewsletterRoutes.js'));

// coupon routes
app.use('/api/v1/coupons', require('./Routes/couponRoutes.js'));

// student purchase routes
app.use('/api/v1/student/purchases', require('./Routes/studentPurchase.routes.js'));

// free resources (leads) routes
app.use('/api/v1/free-resources', require('./Routes/FreeResourceRoutes.js'));

// support ticket routes
app.use('/api/v1/support', require('./Routes/SupportTicketRoutes'));

// ─────────────────────────────────────────────
//  SOCKET.IO — Production-grade real-time layer
// ─────────────────────────────────────────────

// Track online users: userId → Set of socketIds (one user can have multiple tabs)
const onlineUsers = new Map();

// Expose io to controllers so they can emit notifications
app.set('io', io);

io.on('connection', (socket) => {

    // PRESENCE
    socket.on('user_online', ({ userId, role }) => {
        if (!userId) return;
        socket.userId = userId;
        socket.userRole = role;

        // Join individual and role rooms for targeted real-time updates
        socket.join(userId);
        if (role) {
            const roleLower = role.toLowerCase();
            socket.join(roleLower);
            if (roleLower === 'student') socket.join('all_students');
            if (roleLower === 'teacher') socket.join('all_teachers');
        }
        socket.join('all');

        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);
        io.emit('presence_update', { userId, online: true });
    });

    // TICKET ROOM
    socket.on('join_ticket', (ticketId) => {
        socket.join(ticketId);
    });

    socket.on('leave_ticket', (ticketId) => {
        socket.leave(ticketId);
    });

    // MESSAGING — relay only; persistence done via HTTP before this emit
    socket.on('send_message', (data) => {
        socket.to(data.ticketId).emit('receive_message', data);
    });

    // TYPING
    socket.on('typing', (data) => {
        socket.to(data.ticketId).emit('user_typing', data);
    });

    socket.on('stop_typing', (data) => {
        socket.to(data.ticketId).emit('user_stop_typing', data);
    });

    // READ RECEIPTS
    socket.on('message_seen', (data) => {
        socket.to(data.ticketId).emit('messages_read', data);
    });

    // NOTIFICATION ACK — sync read state across tabs
    socket.on('notification_read', ({ notificationId, userId }) => {
        if (userId && onlineUsers.has(userId)) {
            onlineUsers.get(userId).forEach(sid => {
                if (sid !== socket.id) io.to(sid).emit('notification_read_ack', { notificationId });
            });
        }
    });

    // DISCONNECT
    socket.on('disconnect', () => {
        const uid = socket.userId;
        if (uid && onlineUsers.has(uid)) {
            onlineUsers.get(uid).delete(socket.id);
            if (onlineUsers.get(uid).size === 0) {
                onlineUsers.delete(uid);
                io.emit('presence_update', { userId: uid, online: false });
            }
        }
    });
});
// 4. Centralized Global Error Handling Middleware
app.use((err, req, res, next) => {
    if (req.log) {
        req.log.error(err);
    } else {
        console.error(err);
    }

    let statusCode = err.statusCode || err.status || (res.statusCode !== 200 ? res.statusCode : 500);
    if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
    }

    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-device-browser, x-device-os, x-device-type, X-Requested-With, Accept, Origin');

    const errorMsg = err.message || 'An error occurred processing request.';

    res.status(statusCode === 200 ? 500 : statusCode).json({
        success: false,
        error: errorMsg,
        message: errorMsg,
        details: err.code || err.name || null,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Handle body-parser errors (incl. 413 PayloadTooLarge) so the response is JSON, not HTML,
// and always carries CORS headers. Body-parser errors fire BEFORE routes, so this catches them.
app.use((err, req, res, next) => {
    if (err && (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413)) {
        const origin = req.headers.origin;
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.status(413).json({
            success: false,
            message: 'Uploaded content is too large. Please compress files and retry.',
            error: 'PayloadTooLargeError',
            details: err.code || err.type || null
        });
    }
    next(err);
});

// 404 fallthrough — return JSON instead of HTML so the frontend doesn't choke on parsing.
app.use((req, res) => {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        error: 'NotFound'
    });
});

// 5. Unhandled Promise Rejections & Uncaught Exception Handlers
process.on('uncaughtException', (err) => {
    console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
    // Exit process with failure code so orchestrators (PM2, Docker, Kubernetes) recycle it
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
});

// 6. Graceful Server Shutdown Signals (SIGTERM/SIGINT)
const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Initiating graceful server shutdown...`.cyan.bold);

    server.close(() => {
        console.log('Active HTTP & Socket connections closed successfully.'.green.bold);
        process.exit(0);
    });

    // Enforce shutdown timeout of 10 seconds
    setTimeout(() => {
        console.error('Enforced shutdown timeout exceeded. Hard exiting...'.red.bold);
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Connecting to DATABASE
connectDB().then(() => {
    try {
        const bannerCtrl = require('./Controllers/AdminBanner_Slider_content.controllrt');
        bannerCtrl.migrateExistingBanners();
    } catch (err) {
        console.error("Migration error:", err);
    }

    // Start Abandoned Cart Reminder Service
    try {
        const abandonedCartService = require('./services/abandonedCartService');
        abandonedCartService.start();
    } catch (err) {
        console.error("Failed to start abandoned cart service:", err);
    }

    // Start Email Alert Scheduler (daily jobs + weekly digest)
    try {
        const { registerEmailAlertScheduler } = require('./services/emailAlertScheduler');
        registerEmailAlertScheduler();
    } catch (err) {
        console.error("Failed to start email alert scheduler:", err);
    }

    // Seed required Job Categories
    try {
        const { JobCategory } = require('./Models/jobsModel');
        const requiredCategories = [
            'Jobs',
            'Admissions',
            'Scholarships',
            'Foreign University admissions & scholarships',
            'Scholarly contributions'
        ];
        (async () => {
            for (const catName of requiredCategories) {
                const exists = await JobCategory.findOne({ name: catName });
                if (!exists) {
                    const newCat = new JobCategory({ name: catName, subcategories: [] });
                    await newCat.save();
                    console.log(`Seeded category: ${catName}`);
                }
            }
        })();
    } catch (err) {
        console.error("Error seeding job categories:", err);
    }
});

//Assiging PORT
const PORT = process.env.PORT || 8080

//Listening PORT
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`.yellow.bold);
});
