const express = require('express');
const CourseModel = require('../Models/CourseModel');
const TeacherModel = require('../Models/TeacherModel');

// 
//  UTILITY FUNCTIONS
// 

const sanitizeSearchTerm = (term) => {
    if (!term || typeof term !=='string') return'';
    return term.trim().slice(0, 100).replace(/[<>]/g,''); // Prevent XSS
};

const buildSearchRegex = (term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp(escaped,'i');
};

const createFuzzyRegex = (str) => {
    return str.split('').join('.*');
};

const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0 || len2 === 0) return 0;

    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len2; i++) matrix[i][0] = i;
    for (let j = 0; j <= len1; j++) matrix[0][j] = j;

    for (let i = 1; i <= len2; i++) {
        for (let j = 1; j <= len1; j++) {
            if (str2[i - 1] === str1[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    const distance = matrix[len2][len1];
    return 1 - (distance / Math.max(len1, len2));
};

// 
//  CONTROLLER 1: ALL APPROVED COURSES ( FULLY ENHANCED)
// 

const allApprovedCourses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sortBy ='createdAt',
            sortOrder ='desc',
            search ='',
            category,
            priceMin,
            priceMax,
            skill_level,
            language,
            featured,
            fuzzyMode ='hybrid'
        } = req.query;

        //  Input validation
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        //  Base filter
        const filter = { isApproved: true };

        //  Category filter
        if (category) {
            filter.course_category = { $regex: new RegExp(category.replace(/-/g,''),'i') };
        }

        //  Price range filter
        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = parseFloat(priceMin);
            if (priceMax) filter.price.$lte = parseFloat(priceMax);
        }

        //  Skill level filter
        if (skill_level) {
            filter.skill_level = skill_level;
        }

        //  Language filter
        if (language) {
            filter.language = { $regex: new RegExp(language,'i') };
        }

        //  Featured filter
        if (featured ==='true') {
            filter.$or = [
                { isFeatured: true },
                { enrollmentCount: { $gte: 50 } },
                { rating: { $gte: 4.5 } }
            ];
        }

        let courses = [];
        let totalCount = 0;
        let searchApplied = false;
        let searchInfo = null;

        //  ENHANCED SEARCH LOGIC
        if (search && sanitizeSearchTerm(search)) {
            searchApplied = true;
            const searchTerm = sanitizeSearchTerm(search);

            if (fuzzyMode ==='strict') {
                //  STRICT MODE: Exact/Partial matching only
                filter.$or = [
                    { title: buildSearchRegex(searchTerm) },
                    { short_desc: buildSearchRegex(searchTerm) },
                    { course_category: buildSearchRegex(searchTerm) },
                    {'teacher_id.tname': buildSearchRegex(searchTerm) }
                ];

                courses = await CourseModel.find(filter)
                    .populate('teacher_id','tname temail tprofile tspecialization')
                    .sort({ [sortBy]: sortOrder ==='desc' ? -1 : 1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean();

                totalCount = await CourseModel.countDocuments(filter);

            } else if (fuzzyMode ==='fuzzy') {
                //  FUZZY MODE: Advanced Levenshtein distance
                const allCourses = await CourseModel.find(filter)
                    .populate('teacher_id','tname temail tprofile tspecialization')
                    .limit(500)
                    .lean();

                courses = allCourses
                    .map(course => {
                        const titleScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.title ||'').toLowerCase()
                        );
                        const descScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.short_desc ||'').toLowerCase()
                        ) * 0.7;
                        const categoryScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.course_category ||'').toLowerCase()
                        ) * 0.8;
                        const teacherScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.teacher_id?.tname ||'').toLowerCase()
                        ) * 0.6;

                        const relevanceScore = Math.max(titleScore, descScore, categoryScore, teacherScore);
                        return { course, relevanceScore };
                    })
                    .filter(item => item.relevanceScore > 0.3)
                    .sort((a, b) => b.relevanceScore - a.relevanceScore)
                    .map(item => item.course);

                totalCount = courses.length;
                courses = courses.slice(skip, skip + limitNum);

            } else {
                //  HYBRID MODE: Best of both worlds
                const exactFilter = { ...filter };
                exactFilter.$or = [
                    { title: { $regex: new RegExp(`\\b${searchTerm}\\b`,'i') } },
                    { course_category: buildSearchRegex(searchTerm) }
                ];

                const exactMatches = await CourseModel.find(exactFilter)
                    .populate('teacher_id','tname temail tprofile tspecialization')
                    .limit(50)
                    .lean();

                const exactIds = new Set(exactMatches.map(c => c._id.toString()));

                if (exactMatches.length < limitNum * 2) {
                    const allCourses = await CourseModel.find(filter)
                        .populate('teacher_id','tname temail tprofile tspecialization')
                        .limit(300)
                        .lean();

                    const fuzzyMatches = allCourses
                        .filter(c => !exactIds.has(c._id.toString()))
                        .map(course => {
                            const titleScore = calculateSimilarity(
                                searchTerm.toLowerCase(),
                                (course.title ||'').toLowerCase()
                            );
                            const descScore = calculateSimilarity(
                                searchTerm.toLowerCase(),
                                (course.short_desc ||'').toLowerCase()
                            ) * 0.7;
                            const categoryScore = calculateSimilarity(
                                searchTerm.toLowerCase(),
                                (course.course_category ||'').toLowerCase()
                            ) * 0.8;

                            const relevanceScore = Math.max(titleScore, descScore, categoryScore);
                            return { course, relevanceScore };
                        })
                        .filter(item => item.relevanceScore > 0.4)
                        .sort((a, b) => b.relevanceScore - a.relevanceScore)
                        .slice(0, 50)
                        .map(item => item.course);

                    courses = [...exactMatches, ...fuzzyMatches];
                } else {
                    courses = exactMatches;
                }

                totalCount = courses.length;
                courses = courses.slice(skip, skip + limitNum);
            }

            searchInfo = {
                term: searchTerm,
                mode: fuzzyMode,
                resultsCount: totalCount
            };

        } else {
            //  NO SEARCH: Standard query with all filters
            const sortObj = {};
            sortObj[sortBy] = sortOrder ==='desc' ? -1 : 1;

            courses = await CourseModel.find(filter)
                .populate('teacher_id','tname temail tprofile tspecialization Status isVerified')
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum)
                .lean();

            totalCount = await CourseModel.countDocuments(filter);
        }

        //  Calculate pagination
        const totalPages = Math.ceil(totalCount / limitNum);

        //  ENHANCED RESPONSE WITH ALL FIELDS DISPLAYED
        res.status(200).json({
            success: true,
            data: {
                courses: courses.map(course => ({
                    _id: course._id,
                    title: course.title,
                    short_desc: course.short_desc,
                    long_desc: course.long_desc,
                    price: course.price,
                    actual_price: course.actual_price || course.price,
                    discounted_price: course.discounted_price || course.price,
                    discount_percentage: course.discount_percentage || 0,
                    duration: course.duration,
                    language: course.language,
                    skill_level: course.skill_level,
                    course_category: course.course_category,
                    coverphoto: course.coverphoto,
                    youtube_link: course.youtube_link,
                    youtube_links: course.youtube_links || [],
                    enrolled_count: course.enrolled_count || 0,
                    rating: course.rating || 0,
                    reviews_count: course.reviews_count || 0,
                    isFeatured: course.isFeatured || false,
                    isApproved: course.isApproved,
                    chapters_count: (course.chapters || []).length,
                    video_count: (course.chapters || []).filter(c => c.youtube_video).length,
                    pdf_count: (course.chapters || []).filter(c => c.study_material).length,
                    practice_set_count: (course.chapters || []).filter(c => c.practice_set).length,
                    teacher: course.teacher_id ? {
                        _id: course.teacher_id._id,
                        name: course.teacher_id.tname,
                        email: course.teacher_id.temail,
                        profile: course.teacher_id.tprofile,
                        specialization: course.teacher_id.tspecialization,
                        status: course.teacher_id.Status,
                        isVerified: course.teacher_id.isVerified
                    } : null,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt
                })),
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                },
                filters: {
                    applied: {
                        search: search || null,
                        category: category || null,
                        priceMin: priceMin || null,
                        priceMax: priceMax || null,
                        skill_level: skill_level || null,
                        language: language || null,
                        featured: featured ==='true',
                        sortBy,
                        sortOrder
                    }
                },
                searchInfo
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error(' allApprovedCourses error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch courses',
            error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
        });
    }
};

// 
//  CONTROLLER 2: COURSES BY CATEGORY ( FULLY ENHANCED)
// 

const coursesByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        if (!category) {
            return res.status(400).json({
                success: false,
                message:'Category parameter is required'
            });
        }

        const {
            page = 1,
            limit = 12,
            sortBy ='createdAt',
            sortOrder ='desc',
            search ='',
            priceMin,
            priceMax,
            skill_level,
            language
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        //  Convert slug  name (Test Series)
        const categoryName = category
            .replace(/-/g,'')
            .replace(/\b\w/g, c => c.toUpperCase());

        //  STRING-BASED FILTER (NO SCHEMA CHANGE)
        const filter = {
            isApproved: true,
            course_category: categoryName
        };

        // Search
        if (search && sanitizeSearchTerm(search)) {
            const searchTerm = sanitizeSearchTerm(search);
            filter.$or = [
                { title: buildSearchRegex(searchTerm) },
                { short_desc: buildSearchRegex(searchTerm) }
            ];
        }

        // Price filter
        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = parseFloat(priceMin);
            if (priceMax) filter.price.$lte = parseFloat(priceMax);
        }

        if (skill_level) filter.skill_level = skill_level;
        if (language) filter.language = { $regex: new RegExp(language,'i') };

        const sortObj = { [sortBy]: sortOrder ==='desc' ? -1 : 1 };

        const courses = await CourseModel.find(filter)
            .populate('teacher_id','tname temail tprofile tspecialization Status isVerified')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalCount = await CourseModel.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limitNum);

        res.status(200).json({
            success: true,
            data: {
                category: {
                    name: categoryName,
                    slug: category,
                    totalCourses: totalCount
                },
                courses,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });

    } catch (error) {
        console.error(' coursesByCategory error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch category courses',
            error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
        });
    }
};

// 
//  CONTROLLER 3: FEATURED COURSES ( FULLY ENHANCED)
// 

const featuredCourses = async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

        const courses = await CourseModel.find({
            isApproved: true,
            $or: [
                { isFeatured: true },
                { enrolled_count: { $gte: 25 } },
                { rating: { $gte: 4.5 } }
            ]
        })
            .populate('teacher_id','tname temail tprofile tspecialization Status isVerified')
            .sort({
                isFeatured: -1,
                enrolled_count: -1,
                rating: -1,
                createdAt: -1
            })
            .limit(limitNum)
            .lean();

        res.status(200).json({
            success: true,
            data: {
                courses: courses.map(course => ({
                    _id: course._id,
                    title: course.title,
                    short_desc: course.short_desc,
                    price: course.price,
                    actual_price: course.actual_price || course.price,
                    discounted_price: course.discounted_price || course.price,
                    discount_percentage: course.discount_percentage || 0,
                    duration: course.duration,
                    language: course.language,
                    skill_level: course.skill_level,
                    course_category: course.course_category,
                    coverphoto: course.coverphoto,
                    enrolled_count: course.enrolled_count || 0,
                    rating: course.rating || 0,
                    reviews_count: course.reviews_count || 0,
                    isFeatured: course.isFeatured || false,
                    teacher: course.teacher_id ? {
                        name: course.teacher_id.tname,
                        profile: course.teacher_id.tprofile
                    } : null,
                    createdAt: course.createdAt
                })),
                count: courses.length
            }
        });

    } catch (error) {
        console.error(' featuredCourses error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch featured courses'
        });
    }
};

// 
//  CONTROLLER 4: COURSE STATISTICS ( FULLY ENHANCED)
// 

const courseStats = async (req, res) => {
    try {
        const [
            totalApproved,
            totalPending,
            categoryStats,
            skillStats,
            languageStats,
            priceStats
        ] = await Promise.all([
            CourseModel.countDocuments({ isApproved: true }),
            CourseModel.countDocuments({ isApproved: false }),

            CourseModel.aggregate([
                { $match: { isApproved: true } },
                {
                    $group: {
                        _id:'$course_category',
                        count: { $sum: 1 },
                        avgPrice: { $avg:'$price' },
                        totalEnrolled: { $sum:'$enrolled_count' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 15 }
            ]),

            CourseModel.aggregate([
                { $match: { isApproved: true } },
                {
                    $group: {
                        _id:'$skill_level',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            CourseModel.aggregate([
                { $match: { isApproved: true } },
                {
                    $group: {
                        _id:'$language',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            CourseModel.aggregate([
                { $match: { isApproved: true } },
                {
                    $group: {
                        _id: null,
                        avgPrice: { $avg:'$price' },
                        minPrice: { $min:'$price' },
                        maxPrice: { $max:'$price' },
                        totalRevenue: { $sum: { $multiply: ['$price','$enrolled_count'] } }
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalApproved,
                    totalPending,
                    totalCourses: totalApproved + totalPending
                },
                byCategory: categoryStats.map(stat => ({
                    category: stat._id,
                    count: stat.count,
                    avgPrice: Math.round(stat.avgPrice || 0),
                    totalEnrolled: stat.totalEnrolled || 0
                })),
                bySkillLevel: skillStats.map(stat => ({
                    level: stat._id,
                    count: stat.count
                })),
                byLanguage: languageStats.map(stat => ({
                    language: stat._id,
                    count: stat.count
                })),
                pricing: priceStats[0] || {
                    avgPrice: 0,
                    minPrice: 0,
                    maxPrice: 0,
                    totalRevenue: 0
                },
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error(' courseStats error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to fetch statistics'
        });
    }
};

// 
//  CONTROLLER 5: ADVANCED SEARCH ( FULLY ENHANCED)
// 

const searchCourses = async (req, res) => {
    try {
        const {
            search ='',
            page = 1,
            limit = 12,
            sortBy ='relevance',
            sortOrder ='desc',
            category,
            priceMin,
            priceMax,
            skill_level,
            language,
            fuzzyMode ='hybrid'
        } = req.query;

        const baseFilter = { isApproved: true };

        if (category) {
            baseFilter.course_category = { $regex: new RegExp(category,'i') };
        }
        if (priceMin || priceMax) {
            baseFilter.price = {};
            if (priceMin) baseFilter.price.$gte = parseFloat(priceMin);
            if (priceMax) baseFilter.price.$lte = parseFloat(priceMax);
        }
        if (skill_level) {
            baseFilter.skill_level = skill_level;
        }
        if (language) {
            baseFilter.language = { $regex: new RegExp(language,'i') };
        }

        let courses = [];
        let searchApplied = false;

        if (search && sanitizeSearchTerm(search)) {
            searchApplied = true;
            const searchTerm = sanitizeSearchTerm(search);

            if (fuzzyMode ==='strict') {
                baseFilter.$or = [
                    { title: buildSearchRegex(searchTerm) },
                    { short_desc: buildSearchRegex(searchTerm) },
                    { course_category: buildSearchRegex(searchTerm) }
                ];
                courses = await CourseModel.find(baseFilter)
                    .populate('teacher_id','tname temail tprofile tspecialization')
                    .lean();

            } else if (fuzzyMode ==='fuzzy') {
                const allCourses = await CourseModel.find(baseFilter)
                    .populate('teacher_id','tname temail tprofile tspecialization')
                    .lean();

                courses = allCourses
                    .map(course => {
                        const titleScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.title ||'').toLowerCase()
                        );
                        const descScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.short_desc ||'').toLowerCase()
                        ) * 0.7;
                        const categoryScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.course_category ||'').toLowerCase()
                        ) * 0.8;

                        const relevanceScore = Math.max(titleScore, descScore, categoryScore);
                        return { course, relevanceScore };
                    })
                    .filter(item => item.relevanceScore > 0.3)
                    .sort((a, b) => b.relevanceScore - a.relevanceScore)
                    .map(item => item.course);

            } else {
                // Hybrid mode
                const exactFilter = { ...baseFilter };
                exactFilter.$or = [
                    { title: { $regex: new RegExp(`\\b${searchTerm}\\b`,'i') } },
                    { course_category: buildSearchRegex(searchTerm) }
                ];

                const exactMatches = await CourseModel.find(exactFilter)
                    .populate('teacher_id','tname temail tprofile tspecialization')
                    .lean();

                const allCourses = await CourseModel.find(baseFilter)
                    .populate('teacher_id','tname temail tprofile tspecialization')
                    .lean();

                const exactIds = new Set(exactMatches.map(c => c._id.toString()));

                const fuzzyMatches = allCourses
                    .filter(c => !exactIds.has(c._id.toString()))
                    .map(course => {
                        const titleScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.title ||'').toLowerCase()
                        );
                        const descScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.short_desc ||'').toLowerCase()
                        ) * 0.7;
                        const categoryScore = calculateSimilarity(
                            searchTerm.toLowerCase(),
                            (course.course_category ||'').toLowerCase()
                        ) * 0.8;

                        const relevanceScore = Math.max(titleScore, descScore, categoryScore);
                        return { course, relevanceScore };
                    })
                    .filter(item => item.relevanceScore > 0.4)
                    .sort((a, b) => b.relevanceScore - a.relevanceScore)
                    .map(item => item.course);

                courses = [
                    ...exactMatches.map(c => ({ ...c, relevanceScore: 1.0 })),
                    ...fuzzyMatches
                ];
            }
        } else {
            courses = await CourseModel.find(baseFilter)
                .populate('teacher_id','tname temail tprofile tspecialization')
                .lean();
        }

        // Apply sorting
        if (!searchApplied || sortBy !=='relevance') {
            const sortField = sortBy ==='relevance' ?'createdAt' : sortBy;
            const sortDirection = sortOrder ==='desc' ? -1 : 1;

            courses.sort((a, b) => {
                const aVal = a[sortField];
                const bVal = b[sortField];

                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === -1 ? bVal - aVal : aVal - bVal;
                }
                if (typeof aVal ==='number' && typeof bVal ==='number') {
                    return sortDirection === -1 ? bVal - aVal : aVal - bVal;
                }
                if (typeof aVal ==='string' && typeof bVal ==='string') {
                    return sortDirection === -1 ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
                }
                return 0;
            });
        }

        const totalResults = courses.length;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedCourses = courses.slice(skip, skip + parseInt(limit));
        const totalPages = Math.ceil(totalResults / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                courses: paginatedCourses.map(course => ({
                    _id: course._id,
                    title: course.title,
                    short_desc: course.short_desc,
                    price: course.price,
                    actual_price: course.actual_price || course.price,
                    discounted_price: course.discounted_price || course.price,
                    discount_percentage: course.discount_percentage || 0,
                    duration: course.duration,
                    language: course.language,
                    skill_level: course.skill_level,
                    course_category: course.course_category,
                    coverphoto: course.coverphoto,
                    youtube_links: course.youtube_links || [],
                    enrolled_count: course.enrolled_count || 0,
                    rating: course.rating || 0,
                    teacher: course.teacher_id ? {
                        name: course.teacher_id.tname,
                        profile: course.teacher_id.tprofile
                    } : null,
                    relevanceScore: course.relevanceScore,
                    createdAt: course.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalResults,
                    resultsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                },
                searchInfo: {
                    query: search || null,
                    mode: searchApplied ? fuzzyMode :'none',
                    resultsCount: totalResults,
                    filters: {
                        category: category || null,
                        priceRange: priceMin || priceMax ? { min: priceMin, max: priceMax } : null,
                        skill_level: skill_level || null,
                        language: language || null
                    },
                    sorting: { by: sortBy, order: sortOrder }
                }
            }
        });

    } catch (error) {
        console.error(' searchCourses error:', error);
        res.status(500).json({
            success: false,
            message:'Failed to search courses',
            error: process.env.NODE_ENV ==='development' ? error.message :'Internal server error'
        });
    }
};

// 
//  EXPORTS
// 

module.exports = {
    allApprovedCourses,
    coursesByCategory,
    featuredCourses,
    courseStats,
    searchCourses,
    // Legacy exports (for backward compatibility)
    fuzzySearchCourses: allApprovedCourses,
    allApprovedCoursesWithFuzzySearch: allApprovedCourses,
    calculateSimilarity,
    createFuzzyRegex
};
