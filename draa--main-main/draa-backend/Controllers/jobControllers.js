const { JobPost, JobCategory } = require('../Models/jobsModel');
const fs = require('fs');
const path = require('path');

// Helper to log requests for debugging
const logJobRequest = (action, req) => {
    console.log(`\n---  JOB ${action.toUpperCase()} REQUEST ---`);
    console.log(` Timestamp: ${new Date().toISOString()}`);
    console.log(` Endpoint: ${req.originalUrl}`);
    console.log(` Raw Body:`, JSON.stringify(req.body, null, 2));
    if (req.files) {
        console.log(` Files:`, Object.keys(req.files));
    }
    console.log('-------------------------------\n');
};

// Helper function to generate slug
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Helper function to sort jobs based on priority logic:
// - Active (non-expired) jobs first, sorted by newest posted first (descending).
// - Featured active jobs are pinned at the very top of active jobs.
// - Expired/closed jobs are placed at the very bottom (last), sorted by most recently expired first.
const sortJobs = (jobsList) => {
    const now = new Date();

    return [...jobsList].sort((a, b) => {
        const deadlineA = a.deadline ? new Date(a.deadline) : null;
        const deadlineB = b.deadline ? new Date(b.deadline) : null;

        const isExpiredA = deadlineA ? (deadlineA < now) : false;
        const isExpiredB = deadlineB ? (deadlineB < now) : false;

        // 1. Active jobs first, Expired jobs last
        if (isExpiredA !== isExpiredB) {
            return isExpiredA ? 1 : -1;
        }

        // 2. Featured first within their group
        const featA = a.featured ? 1 : 0;
        const featB = b.featured ? 1 : 0;
        if (featA !== featB) {
            return featB - featA;
        }

        // 3. Sorting within the group
        if (!isExpiredA) {
            // Active: Newest posted first (descending)
            const dateA = a.posted_on ? new Date(a.posted_on) : (a.createdAt ? new Date(a.createdAt) : new Date(0));
            const dateB = b.posted_on ? new Date(b.posted_on) : (b.createdAt ? new Date(b.createdAt) : new Date(0));
            return dateB - dateA;
        } else {
            // Expired: Most recently expired first (deadline descending)
            const timeA = deadlineA ? deadlineA.getTime() : 0;
            const timeB = deadlineB ? deadlineB.getTime() : 0;
            if (timeA !== timeB) {
                return timeB - timeA;
            }
            const dateA = a.posted_on ? new Date(a.posted_on) : (a.createdAt ? new Date(a.createdAt) : new Date(0));
            const dateB = b.posted_on ? new Date(b.posted_on) : (b.createdAt ? new Date(b.createdAt) : new Date(0));
            return dateB - dateA;
        }
    });
};

// Helper function to extract keywords from job data
const extractJobKeywords = (jobData) => {
    const keywords = [];

    if (jobData.title) keywords.push(...jobData.title.toLowerCase().split(''));
    if (jobData.organization_name) keywords.push(...jobData.organization_name.toLowerCase().split(''));
    if (jobData.location) keywords.push(...jobData.location.toLowerCase().split(''));
    if (jobData.job_type) keywords.push(jobData.job_type.toLowerCase());

    // Filter common words and duplicates
    const filteredKeywords = [...new Set(keywords)]
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));

    return filteredKeywords.slice(0, 10).join(',');
};

//  ALL YOUR EXISTING FUNCTIONS REMAIN EXACTLY THE SAME
exports.createJobPost = async (req, res) => {
    logJobRequest('create', req);
    try {
        console.log(" Request Body:", req.body);
        console.log(" Request Files:", req.files);

        const jobData = req.body;

        // Check for missing required fields first
        const requiredFields = ['title', 'job_type', 'organization_name', 'location', 'deadline'];
        const missingFields = requiredFields.filter(field => !jobData[field] || jobData[field] === '');

        if (missingFields.length > 0) {
            console.log(" Missing fields:", missingFields);
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                missing_fields: missingFields,
                received_data: Object.keys(jobData)
            });
        }

        // SEO fields will be handled by auto-generation fallbacks below

        // Validate if job category exists (if provided)
        let category = null;
        if (jobData.job_category) {
            category = await JobCategory.findById(jobData.job_category);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid job category ID',
                    provided_id: jobData.job_category
                });
            }
        }

        // Parse JSON fields if they come as strings from FormData
        const fieldsToParseAsJSON = [
            'qualifications_required',
            'reservation_details',
            'application_fee',
            'important_dates',
            'selection_process'
        ];

        fieldsToParseAsJSON.forEach(field => {
            if (typeof jobData[field] === 'string' && jobData[field].trim() !== '') {
                try {
                    jobData[field] = JSON.parse(jobData[field]);
                } catch (e) {
                    console.log(`Error parsing ${field}:`, e);
                }
            }
        });

        // Support for syncing deadline with last_date
        if (jobData.deadline) {
            jobData.last_date = new Date(jobData.deadline);
        }

        // Convert all date strings to Date objects (FLAT fields)
        const dateFields = ['start_date', 'last_date', 'fee_last_date', 'exam_date', 'admit_card_release', 'result_date'];
        dateFields.forEach(field => {
            if (jobData[field] && jobData[field] !== '__EMPTY__' && jobData[field] !== '') {
                jobData[field] = new Date(jobData[field]);
            } else {
                jobData[field] = null;
            }
        });

        // Also support backward compatibility: nested important_dates object
        if (jobData.important_dates) {
            try {
                const nestedDates = typeof jobData.important_dates === 'string'
                    ? JSON.parse(jobData.important_dates)
                    : jobData.important_dates;
                dateFields.forEach(field => {
                    if (nestedDates[field] && !jobData[field]) {
                        jobData[field] = new Date(nestedDates[field]);
                    }
                });
            } catch (e) {
                console.log('Error parsing important_dates:', e);
            }
        }

        console.log(' Important Dates being saved:', {
            start_date: jobData.start_date,
            last_date: jobData.last_date,
            fee_last_date: jobData.fee_last_date,
            exam_date: jobData.exam_date,
            admit_card_release: jobData.admit_card_release,
            result_date: jobData.result_date
        });

        // Process flat application fee fields
        const feeFields = ['application_fee_general', 'application_fee_obc', 'application_fee_ews', 'application_fee_sc', 'application_fee_st', 'application_fee_pwd', 'application_fee_female'];
        feeFields.forEach(field => {
            if (jobData[field]) {
                jobData[field] = Number(jobData[field]) || null;
            } else {
                jobData[field] = null;
            }
        });

        // Also support backward compat: nested application_fee object
        if (jobData.application_fee) {
            try {
                const nestedFee = typeof jobData.application_fee === 'string'
                    ? JSON.parse(jobData.application_fee)
                    : jobData.application_fee;
                const feeMapping = {
                    general: 'application_fee_general',
                    obc: 'application_fee_obc',
                    ews: 'application_fee_ews',
                    sc: 'application_fee_sc',
                    st: 'application_fee_st',
                    pwd: 'application_fee_pwd',
                    female: 'application_fee_female'
                };
                Object.keys(feeMapping).forEach(key => {
                    if (nestedFee[key] !== undefined && nestedFee[key] !== null && nestedFee[key] !== '') {
                        if (!jobData[feeMapping[key]]) {
                            jobData[feeMapping[key]] = Number(nestedFee[key]) || null;
                        }
                    }
                });
            } catch (e) {
                console.log('Error parsing application_fee:', e);
            }
        }

        console.log(' Application Fee being saved:', {
            general: jobData.application_fee_general,
            obc: jobData.application_fee_obc,
            ews: jobData.application_fee_ews,
            sc: jobData.application_fee_sc,
            st: jobData.application_fee_st,
            pwd: jobData.application_fee_pwd,
            female: jobData.application_fee_female
        });

        // SEO fields - DO NOT auto-generate, use what user provides
        // Only generate slug if not provided
        const jobSlug = jobData.slug || (jobData.title ? generateSlug(jobData.title) : `job-${Date.now()}`);

        // Check if slug already exists
        const existingJob = await JobPost.findOne({ 'seo.slug': jobSlug });
        if (existingJob) {
            const uniqueSlug = `${jobSlug}-${Date.now()}`;
            jobData.slug = uniqueSlug;
            console.log(`Slug updated to avoid conflict: ${uniqueSlug}`);
        } else {
            jobData.slug = jobSlug;
        }

        const vacancyText = jobData.total_vacancies ? `${jobData.total_vacancies} vacancies available` : 'Vacancies available';
        const autoMetaDescription = jobData.meta_description ||
            `${jobData.title} at ${jobData.organization_name}. ${vacancyText} in ${jobData.location}. Apply before deadline.`;

        // Auto-generate keywords if not provided
        const autoKeywords = jobData.meta_keywords || extractJobKeywords(jobData);

        // Prepare SEO data
        const seoData = {
            seo_title: jobData.seo_title || (jobData.title.length > 60 ? jobData.title.substring(0, 57) + '...' : jobData.title),
            meta_keywords: autoKeywords,
            meta_description: autoMetaDescription.length > 1000 ? autoMetaDescription.substring(0, 157) + '...' : autoMetaDescription,
            slug: jobData.slug,
            og_title: jobData.og_title || jobData.seo_title || jobData.title,
            og_description: jobData.og_description || autoMetaDescription,
            canonical_url: jobData.canonical_url || '',
            robots: jobData.robots || 'index, follow',
            schema_markup: jobData.schema_markup || JSON.stringify({
                "@context": "https://schema.org",
                "@type": "JobPosting",
                "title": jobData.title,
                "description": autoMetaDescription,
                "hiringOrganization": {
                    "@type": "Organization",
                    "name": jobData.organization_name
                },
                "jobLocation": {
                    "@type": "Place",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": jobData.location
                    }
                },
                "employmentType": jobData.job_type === 'Government' ? 'FULL_TIME' : 'FULL_TIME',
                "industry": category ? category.name : 'Education',
                "qualifications": jobData.qualifications_required ? jobData.qualifications_required.join(',') : '',
                "totalJobOpenings": jobData.total_vacancies,
                "validThrough": jobData.deadline,
                "datePosted": new Date().toISOString(),
                "baseSalary": jobData.salary_min && jobData.salary_max ? {
                    "@type": "MonetaryAmount",
                    "currency": "INR",
                    "value": {
                        "@type": "QuantitativeValue",
                        "minValue": jobData.salary_min,
                        "maxValue": jobData.salary_max,
                        "unitText": jobData.salary_type || "MONTH"
                    }
                } : undefined
            }, null, 2)
        };

        //  UPDATED: Handle file uploads including cover_image
        if (req.files) {
            //  NEW: Handle cover image upload
            if (req.files.cover_image && req.files.cover_image[0]) {
                jobData.cover_image = req.files.cover_image[0].path;
                console.log(' Cover image uploaded:', jobData.cover_image);
            }

            if (req.files.job_pdf_file && req.files.job_pdf_file[0]) {
                jobData.job_pdf_url = req.files.job_pdf_file[0].path;
                console.log(' Job PDF uploaded:', jobData.job_pdf_url);
            }

            if (req.files.syllabus_file && req.files.syllabus_file[0]) {
                jobData.syllabus_url = req.files.syllabus_file[0].path;
                console.log(' Syllabus PDF uploaded:', jobData.syllabus_url);
            }
        }

        // Create new job post
        const newJob = new JobPost({
            ...jobData,
            seo: seoData,
            views: 0,
            applications: 0,
            featured: jobData.featured === 'true' || jobData.featured === true,
            tags: jobData.tags ? (Array.isArray(jobData.tags) ? jobData.tags : JSON.parse(jobData.tags)) : [],
            isApproved: false // Default to unapproved
        });

        const savedJob = await newJob.save();

        // Trigger notification to all students
        try {
            const Notification = require("../Models/NotificationModel");
            await Notification.create({
                recipient: 'all_students',
                recipientModel: 'all_students',
                sender: null,
                senderModel: 'Admin',
                senderName: 'EduDocs Team',
                type: 'job_alert',
                title: 'New Job Alert!',
                message: `New Job Opportunity:"${savedJob.title}" at ${savedJob.organization_name || "a premium recruiter"}. Location: ${savedJob.location}. Apply now!`,
                referenceId: savedJob._id
            });
            console.log('Notification triggered for all students (Job Alert)');
        } catch (notifErr) {
            console.error('Failed to trigger job alert notification:', notifErr);
        }

        // Populate category for response
        await savedJob.populate('job_category', 'name');

        res.status(201).json({
            success: true,
            message: 'Job posted successfully and is pending approval',
            data: savedJob,
            seo_preview: {
                title: seoData.seo_title,
                description: seoData.meta_description,
                url: `${req.protocol}://${req.get('host')}/jobs/${jobData.slug}`,
                keywords: seoData.meta_keywords.split(',').slice(0, 5)
            },
            analytics: {
                total_vacancies: jobData.total_vacancies,
                application_deadline: jobData.deadline,
                job_type: jobData.job_type,
                location: jobData.location,
                approval_status: 'pending',
                cover_image: jobData.cover_image || null //  NEW: Include cover image in response
            }
        });

    } catch (err) {
        console.error(' Full Error Details:', err);

        // Handle specific errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => ({
                field: error.path,
                message: error.message,
                value: error.value
            }));
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate entry',
                details: 'Job with this slug already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create job post',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

exports.getAllJobPosts = async (req, res) => {
    try {
        const filters = (req.user && req.user.role === 'ADMIN') ? {} : { status: 'Active' }; // Default to active jobs for non-admins
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 1000;
        const skip = limit === 0 ? 0 : (page - 1) * limit;

        // Build filters (ALL EXISTING FILTERS PRESERVED)
        if (req.query.teacher_id) filters.created_by = req.query.teacher_id; // Added teacher_id support
        if (req.query.job_type) filters.job_type = req.query.job_type;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.category) filters.job_category = req.query.category;
        if (req.query.location) {
            filters.location = { $regex: req.query.location, $options: 'i' };
        }
        if (req.query.organization) {
            filters.organization_name = { $regex: req.query.organization, $options: 'i' };
        }

        //  NEW: Add approval filter (optional)
        if (req.query.isApproved !== undefined) {
            filters.isApproved = req.query.isApproved === 'true';
        }

        // Date filters (UNCHANGED)
        if (req.query.posted_after) {
            filters.posted_on = { $gte: new Date(req.query.posted_after) };
        }
        if (req.query.deadline_before) {
            filters.deadline = { $lte: new Date(req.query.deadline_before) };
        }

        // Search functionality (UNCHANGED)
        if (req.query.search) {
            const searchRegex = { $regex: req.query.search, $options: 'i' };
            filters.$or = [
                { title: searchRegex },
                { organization_name: searchRegex },
                { location: searchRegex },
                { 'seo.meta_keywords': searchRegex }
            ];
        }

        // Fetch all matching jobs to sort in-memory based on priority tiers, then paginate.
        const rawJobs = await JobPost.find(filters)
            .populate('job_category', 'name')
            .populate('approvedBy', 'aname aemail')
            .select('-job_description -seo.schema_markup -selection_process -reservation_details') // RESTORED qualifications_required
            .lean();

        const totalJobs = rawJobs.length;
        const sortedJobs = sortJobs(rawJobs);
        const jobs = limit === 0 ? sortedJobs : sortedJobs.slice(skip, skip + limit);

        // Calculate pagination info (UNCHANGED)
        const totalPages = limit === 0 ? 1 : Math.ceil(totalJobs / limit);
        const hasNext = limit === 0 ? false : page < totalPages;
        const hasPrev = page > 1;

        res.status(200).json({
            success: true,
            message: 'Jobs fetched successfully',
            jobs: jobs,
            data: {
                jobs,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_jobs: totalJobs,
                    jobs_per_page: limit,
                    has_next: hasNext,
                    has_previous: hasPrev
                },
                filters_applied: Object.keys(filters).length > 1 ? filters : null
            }
        });

    } catch (err) {
        console.error('Error fetching job posts:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch job posts',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

//  NEW: Get approved jobs only (for public display)
exports.getApprovedJobs = async (req, res) => {
    try {
        const filters = { isApproved: true, status: 'Active' };
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        // Apply same filtering options as getAllJobPosts but only for approved jobs
        if (req.query.job_type) filters.job_type = req.query.job_type;
        if (req.query.category) filters.job_category = req.query.category;
        if (req.query.location) {
            filters.location = { $regex: req.query.location, $options: 'i' };
        }
        if (req.query.organization) {
            filters.organization_name = { $regex: req.query.organization, $options: 'i' };
        }

        if (req.query.search) {
            const searchRegex = { $regex: req.query.search, $options: 'i' };
            filters.$or = [
                { title: searchRegex },
                { organization_name: searchRegex },
                { location: searchRegex },
                { 'seo.meta_keywords': searchRegex }
            ];
        }

        // Fetch all matching approved jobs to sort in-memory based on priority tiers, then paginate.
        const rawJobs = await JobPost.find(filters)
            .populate('job_category', 'name')
            .select('-job_description -seo.schema_markup -selection_process') // RESTORED qualifications_required
            .lean();

        const totalJobs = rawJobs.length;
        const sortedJobs = sortJobs(rawJobs);
        const jobs = sortedJobs.slice(skip, skip + limit);

        const totalPages = Math.ceil(totalJobs / limit);

        res.status(200).json({
            success: true,
            message: 'Approved jobs fetched successfully',
            jobs: jobs,
            data: {
                jobs,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_jobs: totalJobs,
                    jobs_per_page: limit,
                    has_next: page < totalPages,
                    has_previous: page > 1
                }
            }
        });

    } catch (err) {
        console.error('Error fetching approved jobs:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch approved jobs',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

//  NEW: Get pending jobs (for admin review)
exports.getPendingJobs = async (req, res) => {
    try {
        const filters = { isApproved: false, rejectedBy: null };
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        if (req.query.search) {
            const searchRegex = { $regex: req.query.search, $options: 'i' };
            filters.$or = [
                { title: searchRegex },
                { organization_name: searchRegex },
                { location: searchRegex }
            ];
        }

        const totalJobs = await JobPost.countDocuments(filters);
        const jobs = await JobPost.find(filters)
            .populate('job_category', 'name')
            .sort({ posted_on: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: `Found ${totalJobs} jobs pending approval`,
            jobs: jobs,
            data: {
                jobs,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(totalJobs / limit),
                    total_jobs: totalJobs,
                    jobs_per_page: limit
                }
            }
        });

    } catch (err) {
        console.error('Error fetching pending jobs:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pending jobs'
        });
    }
};

//  NEW: Job approval controller
exports.updateJobApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        // Get admin ID from request (adjust based on your auth middleware)
        const adminId = req.admin?.id || req.user?.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required'
            });
        }

        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isApproved must be a boolean value'
            });
        }

        const job = await JobPost.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Update approval status using the model's instance method
        if (isApproved) {
            await job.approve(adminId);
        } else {
            await job.unapprove();
        }

        // Populate for response
        await job.populate([
            { path: 'job_category', select: 'name' },
            { path: 'approvedBy', select: 'aname aemail' }
        ]);

        // Create notification for the teacher
        try {
            if (job.created_by) {
                const Notification = require("../Models/NotificationModel");
                const notifTitle = isApproved ? 'Job Alert Approved!' : 'Job Alert Status Update';
                const notifMessage = isApproved
                    ? `Congratulations! Your job post"${job.title}" has been approved by the Admin and sent to all students.`
                    : `Your job post"${job.title}" status has been set to pending by the Admin.`;

                await Notification.create({
                    recipient: job.created_by.toString(),
                    recipientModel: 'Teacher',
                    sender: null,
                    senderModel: 'Admin',
                    senderName: 'EduDocs Team',
                    type: 'general',
                    title: notifTitle,
                    message: notifMessage,
                    referenceId: job._id
                });
                console.log('Notification triggered for job approval status');
            }
        } catch (notifErr) {
            console.error('Failed to trigger notification for job approval:', notifErr);
        }

        res.status(200).json({
            success: true,
            job,
            message: `Job ${isApproved ? 'approved' : 'unapproved'} successfully`
        });

    } catch (err) {
        console.error('Error updating job approval:', err);

        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update approval status',
            error: err.message
        });
    }
};

//  NEW: Bulk approve jobs
exports.bulkApproveJobs = async (req, res) => {
    try {
        const { jobIds, isApproved } = req.body;
        const adminId = req.admin?.id || req.user?.id;

        if (!Array.isArray(jobIds) || jobIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Job IDs array is required'
            });
        }

        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isApproved must be a boolean value'
            });
        }

        const updateData = isApproved
            ? {
                isApproved: true,
                approvedBy: adminId,
                approvedAt: new Date(),
                rejectedBy: null,
                rejectedAt: null,
                rejectionReason: null
            }
            : {
                isApproved: false,
                approvedBy: null,
                approvedAt: null
            };

        const result = await JobPost.updateMany(
            { _id: { $in: jobIds } },
            updateData
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} jobs ${isApproved ? 'approved' : 'unapproved'} successfully`,
            modified_count: result.modifiedCount,
            matched_count: result.matchedCount
        });

    } catch (err) {
        console.error('Error in bulk approval:', err);
        res.status(500).json({
            success: false,
            message: 'Bulk approval failed',
            error: err.message
        });
    }
};

//  NEW: Get job statistics
exports.getJobStats = async (req, res) => {
    try {
        const totalJobs = await JobPost.countDocuments();
        const approvedJobs = await JobPost.countDocuments({ isApproved: true });
        const pendingJobs = await JobPost.countDocuments({ isApproved: false, rejectedBy: null });
        const rejectedJobs = await JobPost.countDocuments({ isApproved: false, rejectedBy: { $ne: null } });
        const activeJobs = await JobPost.countDocuments({ status: 'Active' });
        const expiredJobs = await JobPost.countDocuments({ status: 'Expired' });
        const featuredJobs = await JobPost.countDocuments({ featured: true });

        // Recent jobs (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentJobs = await JobPost.countDocuments({
            posted_on: { $gte: thirtyDaysAgo }
        });

        // Top categories
        const topCategories = await JobPost.aggregate([
            { $match: { isApproved: true } },
            { $group: { _id: '$job_category', count: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'jobcategories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $project: {
                    name: '$categoryInfo.name',
                    count: 1
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            stats: {
                total: totalJobs,
                approved: approvedJobs,
                pending: pendingJobs,
                rejected: rejectedJobs,
                active: activeJobs,
                expired: expiredJobs,
                featured: featuredJobs,
                recent: recentJobs,
                approval_rate: totalJobs > 0 ? ((approvedJobs / totalJobs) * 100).toFixed(1) : 0
            },
            top_categories: topCategories
        });
    } catch (error) {
        console.error('Error fetching job stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
};

// Get a single job post by ID (UNCHANGED - just added approval info in population)
exports.getJobPostById = async (req, res) => {
    try {
        const job = await JobPost.findById(req.params.id)
            .populate('job_category', 'name subcategories')
            .populate('approvedBy', 'aname aemail'); //  NEW: Populate approval info

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job post not found'
            });
        }

        // Increment view count
        await JobPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

        res.status(200).json({
            success: true,
            data: job,
            meta: {
                views: job.views + 1,
                seo_url: job.seo?.slug ? `/jobs/${job.seo.slug}` : null,
                days_until_deadline: job.deadline ? Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null,
                approval_status: job.isApproved ? 'approved' : 'pending' //  NEW: Include approval status
            }
        });

    } catch (err) {
        console.error('Error fetching job post:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch job post',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

//  FULLY UPDATED: Update a job post by ID with cover_image support
exports.updateJobPost = async (req, res) => {
    logJobRequest('update', req);
    try {
        const jobId = req.params.id;
        const jobData = req.body;

        // Check if job exists
        const existingJob = await JobPost.findById(jobId);
        if (!existingJob) {
            return res.status(404).json({
                success: false,
                error: 'Job post not found'
            });
        }

        // Validate job category if provided
        if (jobData.job_category) {
            const category = await JobCategory.findById(jobData.job_category);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid job category ID'
                });
            }
        }

        // Parse JSON fields if they come as strings
        const fieldsToParseAsJSON = [
            'qualifications_required',
            'reservation_details',
            'application_fee',
            'important_dates',
            'selection_process'
        ];

        fieldsToParseAsJSON.forEach(field => {
            if (typeof jobData[field] === 'string' && jobData[field]) {
                try {
                    jobData[field] = JSON.parse(jobData[field]);
                } catch (e) {
                    console.log(`Error parsing ${field}:`, e);
                }
            }
        });

        // Sync deadline with last_date if needed
        if (jobData.deadline) {
            jobData.last_date = new Date(jobData.deadline);
        }

        // Convert all date strings to Date objects (FLAT fields)
        const dateFields = ['start_date', 'last_date', 'fee_last_date', 'exam_date', 'admit_card_release', 'result_date'];
        dateFields.forEach(field => {
            if (jobData[field] && jobData[field] !== '__EMPTY__' && jobData[field] !== '') {
                jobData[field] = new Date(jobData[field]);
            } else {
                jobData[field] = null;
            }
        });

        // Also support backward compatibility: nested important_dates object
        if (jobData.important_dates) {
            try {
                const nestedDates = typeof jobData.important_dates === 'string'
                    ? JSON.parse(jobData.important_dates)
                    : jobData.important_dates;
                dateFields.forEach(field => {
                    if (nestedDates[field] && !jobData[field]) {
                        jobData[field] = new Date(nestedDates[field]);
                    }
                });
            } catch (e) {
                console.log('Error parsing important_dates:', e);
            }
        }

        // Handle slug update
        if (jobData.slug && jobData.slug !== existingJob.seo?.slug) {
            const duplicateJob = await JobPost.findOne({
                'seo.slug': jobData.slug,
                _id: { $ne: jobId }
            });
            if (duplicateJob) {
                return res.status(400).json({
                    success: false,
                    error: "Job slug already exists. Please use a different slug."
                });
            }
        }

        // Check if major changes require re-approval
        const requiresReapproval = (
            jobData.title !== existingJob.title ||
            jobData.organization_name !== existingJob.organization_name ||
            jobData.total_vacancies !== existingJob.total_vacancies ||
            jobData.location !== existingJob.location ||
            (jobData.deadline && new Date(jobData.deadline).getTime() !== new Date(existingJob.deadline).getTime())
        );

        // Reset to pending on every edit (unconditional)
        if (existingJob.isApproved) {
            jobData.isApproved = false;
            jobData.approvedBy = null;
            jobData.approvedAt = null;
            console.log(' Job edit detected, resetting to pending for re-approval');
        }

        // Update SEO data - preserve existing values if not provided, DO NOT auto-generate
        const existingSEO = existingJob.seo || {};
        const seoData = {
            seo_title: jobData.seo_title || existingSEO.seo_title || jobData.title || '',
            meta_keywords: jobData.meta_keywords || existingSEO.meta_keywords || '',
            meta_description: jobData.meta_description || existingSEO.meta_description || '',
            slug: jobData.slug || existingSEO.slug || (jobData.title ? generateSlug(jobData.title) : existingSEO.slug),
            og_title: jobData.og_title || existingSEO.og_title || jobData.seo_title || jobData.title || '',
            og_description: jobData.og_description || existingSEO.og_description || jobData.meta_description || '',
            canonical_url: jobData.canonical_url || existingSEO.canonical_url || '',
            robots: jobData.robots || existingSEO.robots || 'index, follow',
            schema_markup: jobData.schema_markup || existingSEO.schema_markup || ''
        };

        //  UPDATED: Handle file uploads including cover_image
        if (req.files) {
            //  NEW: Handle cover image update
            if (req.files.cover_image && req.files.cover_image[0]) {
                // Delete old cover image if exists
                if (existingJob.cover_image && fs.existsSync(existingJob.cover_image)) {
                    try {
                        fs.unlinkSync(existingJob.cover_image);
                        console.log(' Old cover image deleted:', existingJob.cover_image);
                    } catch (err) {
                        console.error(' Failed to delete old cover image:', err);
                    }
                }
                jobData.cover_image = req.files.cover_image[0].path;
                console.log(' New cover image uploaded:', jobData.cover_image);
            }

            if (req.files.job_pdf_file && req.files.job_pdf_file[0]) {
                // Delete old file if exists
                if (existingJob.job_pdf_url && fs.existsSync(existingJob.job_pdf_url)) {
                    try {
                        fs.unlinkSync(existingJob.job_pdf_url);
                        console.log(' Old job PDF deleted');
                    } catch (err) {
                        console.error(' Failed to delete old job PDF:', err);
                    }
                }
                jobData.job_pdf_url = req.files.job_pdf_file[0].path;
                console.log(' New job PDF uploaded');
            }

            if (req.files.syllabus_file && req.files.syllabus_file[0]) {
                // Delete old file if exists
                if (existingJob.syllabus_url && fs.existsSync(existingJob.syllabus_url)) {
                    try {
                        fs.unlinkSync(existingJob.syllabus_url);
                        console.log(' Old syllabus PDF deleted');
                    } catch (err) {
                        console.error(' Failed to delete old syllabus PDF:', err);
                    }
                }
                jobData.syllabus_url = req.files.syllabus_file[0].path;
                console.log(' New syllabus PDF uploaded');
            }
        }

        // Update existingJob fields - Skip file fields and nested objects handled elsewhere
        Object.keys(jobData).forEach(key => {
            const nestedOrFileKeys = [
                'seo', 'application_fee', 'reservation_details', 'qualifications_required',
                'selection_process', 'job_pdf_file', 'syllabus_file', 'cover_image',
                'job_pdf_url', 'syllabus_url', 'cover_image_url'
            ];

            if (!nestedOrFileKeys.includes(key) && jobData[key] !== undefined) {
                existingJob[key] = jobData[key];
            }
        });

        // Explicitly handle file path preservation
        if (jobData.job_pdf_url) existingJob.job_pdf_url = jobData.job_pdf_url;
        if (jobData.syllabus_url) existingJob.syllabus_url = jobData.syllabus_url;
        // Handle cover_image preservation (field is'cover_image' in model, but we might send'cover_image_url' from frontend)
        if (jobData.cover_image_url) existingJob.cover_image = jobData.cover_image_url;


        // Robust Update for Important Dates (FLAT fields)
        const updateDateFields = ['start_date', 'last_date', 'fee_last_date', 'exam_date', 'admit_card_release', 'result_date'];
        updateDateFields.forEach(dKey => {
            if (jobData[dKey] !== undefined) {
                existingJob[dKey] = jobData[dKey] ? new Date(jobData[dKey]) : null;
            }
        });

        // Robust Update for Application Fee (FLAT fields)
        const updateFeeFields = ['application_fee_general', 'application_fee_obc', 'application_fee_ews', 'application_fee_sc', 'application_fee_st', 'application_fee_pwd', 'application_fee_female'];
        updateFeeFields.forEach(fKey => {
            if (jobData[fKey] !== undefined) {
                existingJob[fKey] = jobData[fKey] ? Number(jobData[fKey]) : null;
            }
        });

        // Robust Update for Reservation Details
        if (jobData.reservation_details) {
            if (!existingJob.reservation_details) existingJob.reservation_details = {};
            Object.keys(jobData.reservation_details).forEach(rKey => {
                const val = jobData.reservation_details[rKey];
                if (val !== undefined) {
                    existingJob.reservation_details[rKey] = val;
                }
            });
            existingJob.markModified('reservation_details');
        }

        // Explicitly handle simple fields
        if (jobData.featured !== undefined) {
            existingJob.featured = jobData.featured === 'true' || jobData.featured === true;
        }
        if (jobData.exam_mode !== undefined) existingJob.exam_mode = jobData.exam_mode;
        if (jobData.application_mode !== undefined) existingJob.application_mode = jobData.application_mode;

        // Explicitly set simple arrays
        if (jobData.tags !== undefined) {
            if (Array.isArray(jobData.tags)) {
                existingJob.tags = jobData.tags;
            } else {
                try {
                    existingJob.tags = JSON.parse(jobData.tags);
                } catch {
                    existingJob.tags = jobData.tags ? jobData.tags.split(',').map(t => t.trim()) : [];
                }
            }
            existingJob.markModified('tags');
        }
        if (jobData.selection_process) {
            if (Array.isArray(jobData.selection_process)) {
                existingJob.selection_process = jobData.selection_process;
            } else {
                try {
                    existingJob.selection_process = JSON.parse(jobData.selection_process);
                } catch {
                    existingJob.selection_process = jobData.selection_process ? jobData.selection_process.split(',').map(t => t.trim()) : [];
                }
            }
            existingJob.markModified('selection_process');
        }

        existingJob.seo = seoData;
        existingJob.updatedAt = new Date();

        // Mark as pending if it was approved
        if (existingJob.isApproved && requiresReapproval) {
            existingJob.isApproved = false;
            existingJob.approvedBy = null;
            existingJob.approvedAt = null;
        }

        const updatedJob = await existingJob.save();

        // Re-populate for response
        await updatedJob.populate('job_category', 'name');
        if (updatedJob.approvedBy) await updatedJob.populate('approvedBy', 'aname aemail');

        const responseMessage = requiresReapproval && !jobData.isApproved
            ? 'Job updated successfully but requires re-approval due to major changes'
            : 'Job updated successfully';

        res.status(200).json({
            success: true,
            message: responseMessage,
            data: updatedJob,
            requires_reapproval: requiresReapproval,
            seo_preview: {
                title: seoData.seo_title,
                description: seoData.meta_description,
                url: `${req.protocol}://${req.get('host')}/jobs/${seoData.slug}`
            },
            files_updated: {
                cover_image: req.files?.cover_image ? true : false, //  NEW
                job_pdf: req.files?.job_pdf_file ? true : false,
                syllabus: req.files?.syllabus_file ? true : false
            }
        });

    } catch (err) {
        console.error('Error updating job post:', err);

        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => ({
                field: error.path,
                message: error.message
            }));
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to update job post',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};


//  UPDATED: Delete a job post by ID (includes cover_image deletion)
exports.deleteJobPost = async (req, res) => {
    try {
        const deletedJob = await JobPost.findByIdAndDelete(req.params.id);

        if (!deletedJob) {
            return res.status(404).json({
                success: false,
                error: 'Job post not found'
            });
        }

        //  UPDATED: Delete all associated files including cover_image
        const filesToDelete = [
            { path: deletedJob.cover_image, name: 'Cover image' },
            { path: deletedJob.job_pdf_url, name: 'Job PDF' },
            { path: deletedJob.syllabus_url, name: 'Syllabus PDF' }
        ];

        filesToDelete.forEach(file => {
            if (file.path && fs.existsSync(file.path)) {
                try {
                    fs.unlinkSync(file.path);
                    console.log(` ${file.name} deleted:`, file.path);
                } catch (err) {
                    console.error(` Failed to delete ${file.name}:`, err);
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Job post deleted successfully',
            data: {
                deleted_job_id: deletedJob._id,
                deleted_job_title: deletedJob.title,
                files_deleted: {
                    cover_image: !!deletedJob.cover_image,
                    job_pdf: !!deletedJob.job_pdf_url,
                    syllabus: !!deletedJob.syllabus_url
                }
            }
        });

    } catch (err) {
        console.error('Error deleting job post:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete job post',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};


//    NEW CATEGORY-SPECIFIC FUNCTIONS ADDED BELOW   

// @desc Get jobs by category with filters and pagination
// @route GET /api/jobs/category/:categoryId
// @access Public
exports.getJobsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const {
            page = 1,
            limit = 12,
            subcategory,
            job_type,
            location,
            salary_min,
            salary_max,
            experience_required,
            sortBy = 'posted_on',
            sortOrder = 'desc',
            search
        } = req.query;

        // Validate category exists
        const category = await JobCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                error: 'Category not found',
                code: 'CATEGORY_NOT_FOUND'
            });
        }

        // Build query object
        const query = {
            job_category: categoryId,
            isApproved: true,
            status: 'Active'
        };

        // Add subcategory filter
        if (subcategory) {
            query.subcategory = { $regex: subcategory, $options: 'i' };
        }

        // Add job type filter
        if (job_type) {
            query.job_type = job_type;
        }

        // Add location filter
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Add salary range filter
        if (salary_min || salary_max) {
            query.$and = query.$and || [];
            if (salary_min) {
                query.$and.push({
                    $or: [
                        { salary_min: { $gte: parseInt(salary_min) } },
                        { salary_max: { $gte: parseInt(salary_min) } }
                    ]
                });
            }
            if (salary_max) {
                query.$and.push({
                    $or: [
                        { salary_min: { $lte: parseInt(salary_max) } },
                        { salary_max: { $lte: parseInt(salary_max) } }
                    ]
                });
            }
        }

        // Add experience filter
        if (experience_required) {
            query.experience_required = { $regex: experience_required, $options: 'i' };
        }

        // Add search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { organization_name: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
                { qualifications_required: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Add secondary sort by posted_on if not already sorting by it
        if (sortBy !== 'posted_on') {
            sort.posted_on = -1;
        }

        // Pagination calculations
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Execute queries in parallel for better performance
        const [allJobs, categoryStats] = await Promise.all([
            // Get all matching category jobs to sort in-memory based on priority tiers, then paginate.
            JobPost.find(query)
                .populate('job_category', 'name')
                .populate('approvedBy', 'aname')
                .select('-seo.schema_markup') // Exclude large schema markup
                .lean(),

            // Get category statistics
            JobPost.aggregate([
                { $match: { job_category: category._id, isApproved: true, status: 'Active' } },
                {
                    $group: {
                        _id: null,
                        totalJobs: { $sum: 1 },
                        jobTypes: { $addToSet: '$job_type' },
                        locations: { $addToSet: '$location' },
                        avgSalaryMin: { $avg: '$salary_min' },
                        avgSalaryMax: { $avg: '$salary_max' },
                        totalVacancies: { $sum: '$total_vacancies' }
                    }
                }
            ])
        ]);

        const totalJobs = allJobs.length;
        const sortedJobs = sortJobs(allJobs);
        const jobs = sortedJobs.slice(skip, skip + limitNumber);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalJobs / limitNumber);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;

        // Get unique subcategories for this category
        const subcategories = await JobPost.distinct('subcategory', {
            job_category: categoryId,
            isApproved: true,
            status: 'Active',
            subcategory: { $nin: [null, ''] }
        });

        // Format jobs data
        const formattedJobs = jobs.map(job => ({
            ...job,
            daysRemaining: job.deadline ? Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null,
            isExpiringSoon: job.deadline ? (new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24) <= 7 : false,
            salaryRange: job.salary_min && job.salary_max
                ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_type || 'Monthly'}`
                : job.salary_min
                    ? `${job.salary_min.toLocaleString()}+ ${job.salary_type || 'Monthly'}`
                    : 'Salary not disclosed'
        }));

        res.status(200).json({
            success: true,
            message: 'Jobs retrieved successfully',
            jobs: formattedJobs, // For backward compatibility
            data: {
                jobs: formattedJobs,
                category: {
                    _id: category._id,
                    name: category.name,
                    subcategories: category.subcategories
                },
                pagination: {
                    current_page: pageNumber,
                    total_pages: totalPages,
                    total_jobs: totalJobs,
                    jobs_per_page: limitNumber,
                    has_next: hasNextPage,
                    has_previous: hasPrevPage,
                    next_page: hasNextPage ? pageNumber + 1 : null,
                    prev_page: hasPrevPage ? pageNumber - 1 : null
                },
                filters: {
                    available_subcategories: subcategories,
                    applied_filters: {
                        subcategory: subcategory || null,
                        job_type: job_type || null,
                        location: location || null,
                        salary_range: salary_min || salary_max ? { min: salary_min, max: salary_max } : null,
                        experience_required: experience_required || null,
                        search: search || null
                    }
                },
                statistics: categoryStats[0] || {
                    totalJobs: 0,
                    jobTypes: [],
                    locations: [],
                    avgSalaryMin: 0,
                    avgSalaryMax: 0,
                    totalVacancies: 0
                }
            },
            code: 'JOBS_RETRIEVED_SUCCESS'
        });

    } catch (error) {
        console.error(' Get jobs by category error:', {
            error: error.message,
            stack: error.stack,
            categoryId: req.params.categoryId,
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve jobs',
            error: 'Failed to retrieve jobs',
            code: 'JOBS_RETRIEVAL_ERROR'
        });
    }
};

// @desc Get jobs by subcategory
// @route GET /api/jobs/subcategory/:categoryId/:subcategory
// @access Public
exports.getJobsBySubcategory = async (req, res) => {
    try {
        const { categoryId, subcategory } = req.params;
        const {
            page = 1,
            limit = 12,
            sortBy = 'posted_on',
            sortOrder = 'desc',
            ...filters
        } = req.query;

        // Decode subcategory name
        const decodedSubcategory = decodeURIComponent(subcategory);

        // Validate category exists
        const category = await JobCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                error: 'Category not found',
                code: 'CATEGORY_NOT_FOUND'
            });
        }

        // Check if subcategory exists in category
        if (!category.subcategories.includes(decodedSubcategory)) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found in this category',
                error: 'Subcategory not found in this category',
                code: 'SUBCATEGORY_NOT_FOUND'
            });
        }

        // Use the main function with subcategory filter
        req.query.subcategory = decodedSubcategory;
        req.params.categoryId = categoryId;

        return exports.getJobsByCategory(req, res);

    } catch (error) {
        console.error(' Get jobs by subcategory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve jobs by subcategory',
            error: 'Failed to retrieve jobs by subcategory',
            code: 'SUBCATEGORY_JOBS_ERROR'
        });
    }
};

// @desc Get job details by ID with related jobs
// @route GET /api/jobs/details/:id
// @access Public
exports.getJobDetailsById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await JobPost.findOne({
            _id: id,
            isApproved: true,
            status: 'Active'
        })
            .populate('job_category', 'name subcategories')
            .populate('approvedBy', 'aname')
            .lean();

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not available',
                error: 'Job not found or not available',
                code: 'JOB_NOT_FOUND'
            });
        }

        // Increment view count
        await JobPost.findByIdAndUpdate(id, { $inc: { views: 1 } });

        // Get related jobs in the same category
        const relatedJobs = job.job_category ? await JobPost.find({
            job_category: job.job_category._id,
            _id: { $ne: id },
            isApproved: true,
            status: 'Active'
        })
            .populate('job_category', 'name')
            .sort({ posted_on: -1 })
            .limit(5)
            .select('title organization_name location job_type posted_on deadline total_vacancies')
            .lean() : [];

        // Format job data with FLAT important date fields and application fee fields
        const formattedJob = {
            ...job,
            // Explicitly include flat date fields
            start_date: job.start_date,
            last_date: job.last_date || job.deadline,
            fee_last_date: job.fee_last_date,
            exam_date: job.exam_date,
            admit_card_release: job.admit_card_release,
            result_date: job.result_date,
            // Flat application fee fields
            application_fee_general: job.application_fee_general,
            application_fee_obc: job.application_fee_obc,
            application_fee_ews: job.application_fee_ews,
            application_fee_sc: job.application_fee_sc,
            application_fee_st: job.application_fee_st,
            application_fee_pwd: job.application_fee_pwd,
            application_fee_female: job.application_fee_female,
            daysRemaining: job.deadline ? Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null,
            isExpiringSoon: job.deadline ? (new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24) <= 7 : false,
            salaryRange: job.salary_min && job.salary_max
                ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_type || 'Monthly'}`
                : job.salary_min
                    ? `${job.salary_min.toLocaleString()}+ ${job.salary_type || 'Monthly'}`
                    : 'Salary not disclosed',
            totalReservations: Object.values(job.reservation_details || {}).reduce((sum, val) => sum + (val || 0), 0)
        };

        res.status(200).json({
            success: true,
            message: 'Job details retrieved successfully',
            data: {
                job: formattedJob,
                relatedJobs: relatedJobs.map(relatedJob => ({
                    _id: relatedJob._id,
                    title: relatedJob.title,
                    organization_name: relatedJob.organization_name,
                    location: relatedJob.location,
                    job_type: relatedJob.job_type,
                    posted_on: relatedJob.posted_on,
                    deadline: relatedJob.deadline,
                    total_vacancies: relatedJob.total_vacancies
                }))
            },
            code: 'JOB_DETAILS_SUCCESS'
        });

    } catch (error) {
        console.error(' Get job by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve job details',
            error: 'Failed to retrieve job details',
            code: 'JOB_DETAILS_ERROR'
        });
    }
};

// @desc Get featured jobs
// @route GET /api/jobs/featured
// @access Public
exports.getFeaturedJobs = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const featuredJobs = await JobPost.find({
            featured: true,
            isApproved: true,
            status: 'Active'
        })
            .populate('job_category', 'name')
            .sort({ posted_on: -1 })
            .limit(parseInt(limit))
            .select('title organization_name location job_type total_vacancies deadline posted_on salary_min salary_max')
            .lean();

        const formattedJobs = featuredJobs.map(job => ({
            _id: job._id,
            title: job.title,
            organization_name: job.organization_name,
            location: job.location,
            job_type: job.job_type,
            total_vacancies: job.total_vacancies,
            deadline: job.deadline,
            posted_on: job.posted_on,
            job_category: job.job_category,
            daysRemaining: job.deadline ? Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null,
            salaryRange: job.salary_min && job.salary_max
                ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                : job.salary_min
                    ? `${job.salary_min.toLocaleString()}+`
                    : 'Not disclosed'
        }));

        res.status(200).json({
            success: true,
            message: 'Featured jobs retrieved successfully',
            jobs: formattedJobs, // For backward compatibility
            data: {
                jobs: formattedJobs,
                count: formattedJobs.length
            },
            code: 'FEATURED_JOBS_SUCCESS'
        });

    } catch (error) {
        console.error(' Get featured jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve featured jobs',
            error: 'Failed to retrieve featured jobs',
            code: 'FEATURED_JOBS_ERROR'
        });
    }
};

module.exports = {
    //  EXISTING EXPORTS (UNCHANGED)
    createJobPost: exports.createJobPost,
    getAllJobPosts: exports.getAllJobPosts,
    getJobPostById: exports.getJobPostById,
    updateJobPost: exports.updateJobPost,
    deleteJobPost: exports.deleteJobPost,

    //  NEW EXPORTS (APPROVAL FUNCTIONALITY)
    getApprovedJobs: exports.getApprovedJobs,
    getPendingJobs: exports.getPendingJobs,
    updateJobApproval: exports.updateJobApproval,
    bulkApproveJobs: exports.bulkApproveJobs,
    getJobStats: exports.getJobStats,

    //   NEW CATEGORY-SPECIFIC EXPORTS  
    getJobsByCategory: exports.getJobsByCategory,
    getJobsBySubcategory: exports.getJobsBySubcategory,
    getJobDetailsById: exports.getJobDetailsById,
    getFeaturedJobs: exports.getFeaturedJobs
};
