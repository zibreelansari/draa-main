// menu_data.ts - FIXED VERSION with null safety
import { useState, useEffect } from'react';
import axios from'axios';
import url from'../../url';

interface DataType {
    id: number;
    title: string;
    link: string;
    has_dropdown?: boolean;
    megamenu?: boolean;
    is_button?: boolean;
    sub_menus?: {
        link: string;
        title: string;
        icon?: string;
        color?: string;
        description?: string;
    }[];
}

interface CourseCategory {
    _id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    isActive: boolean;
    slug?: string;
}

interface BookCategory {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
}

//  Examination Category Interface
interface ExaminationCategory {
    _id: string;
    name: string;
    code: string;
    year: number;
    description?: string;
    examDate?: string;
    isActive: boolean;
    priority?: number;
    bannerImage?: string;
    statistics?: {
        totalSubjects: number;
        totalTestSeries: number;
        averageRating?: number;
        totalReviews?: number;
    };
}

//  FIXED: Hook with proper null safety
export const useCourseCategories = () => {
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${url}/course/categories?active=true`);

                const categoriesData = response.data?.data?.categories ||
                    response.data?.categories ||
                    response.data || [];

                console.log('Fetched course categories:', categoriesData);
                //  Ensure it's always an array
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (error) {
                console.error('Failed to fetch course categories:', error);
                setCategories([]); //  Always set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories: categories || [], loading }; //  Extra safety
};

//  FIXED: Examination categories hook with null safety
export const useExaminationCategories = () => {
    const [categories, setCategories] = useState<ExaminationCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log(' Fetching examination categories from API...');
                const response = await axios.get(`${url}/test-series/navigation/examinations`);

                console.log(' Raw API response:', response.data);

                //  Enhanced null safety with multiple fallbacks
                const categoriesData = response.data?.data?.examinationCategories ||
                    response.data?.examinationCategories ||
                    response.data?.data ||
                    response.data ||
                    [];

                console.log(' Extracted categories data:', categoriesData);

                //  Ensure it's always an array and filter active categories
                const validCategories = Array.isArray(categoriesData)
                    ? categoriesData.filter(cat => cat && cat._id && cat.name && cat.code)
                    : [];

                console.log(' Valid examination categories:', validCategories);
                setCategories(validCategories);
            } catch (error) {
                console.error(' Failed to fetch examination categories:', error);
                setCategories([]); //  Always set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories: categories || [], loading }; //  Extra safety
};

//  FIXED: Book categories hook with null safety
export const useBookCategories = () => {
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${url}/books/categories/all`);

                const categoriesData = response.data?.categories ||
                    response.data?.data?.categories ||
                    response.data ||
                    [];

                console.log('Fetched book categories:', categoriesData);
                //  Ensure it's always an array
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (error) {
                console.error('Failed to fetch book categories:', error);
                setCategories([]); //  Always set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories: categories || [], loading }; //  Extra safety
};

// Helper function to create category slug
const createCategorySlug = (name: string, slug?: string): string => {
    if (slug) return slug;
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,''));
};

// Examination category colors and icons mapping
const getExaminationCategoryStyle = (code: string, name: string) => {
    const examStyles: Record<string, { icon: string; color: string }> = {
        'GATE': { icon: 'fas fa-cogs', color: '#e74c3c' },
        'JEE': { icon: 'fas fa-atom', color: '#3498db' },
        'UPSC': { icon: 'fas fa-landmark', color: '#2ecc71' },
        'SSC': { icon: 'fas fa-users', color: '#f39c12' },
        'SSC_CGL': { icon: 'fas fa-user-tie', color: '#f39c12' },
        'SSC_CHSL': { icon: 'fas fa-id-card', color: '#e67e22' },
        'BANKING': { icon: 'fas fa-university', color: '#9b59b6' },
        'REGULATORY': { icon: 'fas fa-university', color: '#6c5ce7' },
        'JAIIB_CAIIB': { icon: 'fas fa-piggy-bank', color: '#00b894' },
        'DEFENCE': { icon: 'fas fa-shield-alt', color: '#d63031' },
        'TEACHING': { icon: 'fas fa-chalkboard-teacher', color: '#00cec9' },
        'AGRICULTURE': { icon: 'fas fa-seedling', color: '#27ae60' },
        'NURSING': { icon: 'fas fa-user-nurse', color: '#e84393' },
        'INSURANCE': { icon: 'fas fa-file-contract', color: '#fd79a8' },
        'RAILWAY': { icon: 'fas fa-train', color: '#1abc9c' },
        'RRB_NTPC': { icon: 'fas fa-subway', color: '#16a085' },
        'RRB_GROUP_D': { icon: 'fas fa-tools', color: '#16a085' },
        'NEET': { icon: 'fas fa-heartbeat', color: '#e67e22' },
        'CAT': { icon: 'fas fa-briefcase', color: '#34495e' },
        'CLAT': { icon: 'fas fa-balance-scale', color: '#f1c40f' },
        'STATE_PSC': { icon: 'fas fa-flag', color: '#95a5a6' },
        'STATE_UP': { icon: 'fas fa-map-marker-alt', color: '#e74c3c' },
        'STATE_RJ': { icon: 'fas fa-map-marker-alt', color: '#f39c12' },
        'STATE_KA': { icon: 'fas fa-map-marker-alt', color: '#2ecc71' },
        'STATE_BH': { icon: 'fas fa-map-marker-alt', color: '#3498db' },
        'IBPS': { icon: 'fas fa-chart-line', color: '#fd79a8' },
        'SBI': { icon: 'fas fa-piggy-bank', color: '#00b894' }
    };

    // Try to match by code first, then by name keywords
    const upperCode = (code || '').toUpperCase();
    const upperName = (name || '').toUpperCase();

    // Direct code match
    if (examStyles[upperCode]) {
        return examStyles[upperCode];
    }

    // Name-based matching
    for (const [key, style] of Object.entries(examStyles)) {
        if (upperName.includes(key) || upperCode.includes(key)) {
            return style;
        }
    }

    // Default style
    return { icon: 'fas fa-graduation-cap', color: '#6c5ce7' };
};

// Book category colors and icons
const bookCategoryColors = [
'#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6',
'#1abc9c','#e67e22','#34495e','#f1c40f','#95a5a6'
];

const bookCategoryIcons = [
'fas fa-book','fas fa-graduation-cap','fas fa-lightbulb',
'fas fa-briefcase','fas fa-code','fas fa-paint-brush',
'fas fa-heart','fas fa-globe','fas fa-music','fas fa-camera'
];

//  FIXED: Main hook with comprehensive null safety
export const useMenuData = (): { menuData: DataType[], loading: boolean } => {
    const { categories: courseCategories, loading: coursesLoading } = useCourseCategories();
    const { categories: bookCategories, loading: booksLoading } = useBookCategories();
    const { categories: examinationCategories, loading: examinationsLoading } = useExaminationCategories();

    //  Ensure all categories are arrays with fallbacks
    const safeCourseCategories = courseCategories || [];
    const safeBookCategories = bookCategories || [];
    const safeExaminationCategories = examinationCategories || [];

    const menu_data: DataType[] = [
        {
            id: 1,
            title:"Home",
            link:"/",
        },
        {
            id: 2,
            title:"Courses",
            link:"#",
            has_dropdown: true,
            megamenu: true,
            is_button: true,
            sub_menus: coursesLoading
                ? [{
                    link:"#",
                    title:"Loading categories...",
                    icon:"fas fa-spinner fa-spin",
                    color:"#6c757d",
                    description:"Please wait while we load the categories"
                }]
                : (safeCourseCategories.length > 0) //  Safe length check
                    ? [
                        {
                            link:"/courses",
                            title:"All Courses",
                            icon:"fas fa-th-large",
                            color:"#6c5ce7",
                            description:"Browse all available courses"
                        },
                        ...safeCourseCategories.map(category => ({
                            link: `/courses/category/${createCategorySlug(category.name, category.slug)}`,
                            title: category.name ||'Unnamed Course',
                            icon: category.icon ||"fas fa-book",
                            color: category.color ||"#74b9ff",
                            description: category.description || `Explore ${category.name ||'this'} course and enhance your skills`
                        }))
                    ]
                    : [{
                        link:"/courses",
                        title:"No categories available",
                        icon:"fas fa-exclamation-circle",
                        color:"#ffc107",
                        description:"Categories are being updated. Check back soon!"
                    }]
        },
        {
            id: 3,
            title:"Books",
            link:"#",
            has_dropdown: true,
            megamenu: true,
            is_button: true,
            sub_menus: booksLoading
                ? [{
                    link:"#",
                    title:"Loading book categories...",
                    icon:"fas fa-spinner fa-spin",
                    color:"#6c757d",
                    description:"Please wait while we load the book categories"
                }]
                : (safeBookCategories.length > 0) //  Safe length check
                    ? [
                        {
                            link:"/all-books",
                            title:"All Books",
                            icon:"fas fa-books",
                            color:"#e74c3c",
                            description:"Browse all available books"
                        },
                        {
                            link:"/books/approved",
                            title:"Featured Books",
                            icon:"fas fa-star",
                            color:"#f39c12",
                            description:"Discover our most popular and featured books"
                        },
                        ...safeBookCategories.map((category, index) => ({
                            link: `/books/category/${createCategorySlug(category.name ||'unnamed')}`,
                            title: category.name ||'Unnamed Category',
                            icon: bookCategoryIcons[index % bookCategoryIcons.length],
                            color: bookCategoryColors[index % bookCategoryColors.length],
                            description: category.description || `Explore ${category.name ||'this'} books and expand your knowledge`
                        }))
                    ]
                    : [{
                        link:"/all-books",
                        title:"No book categories available",
                        icon:"fas fa-exclamation-circle",
                        color:"#ffc107",
                        description:"Book categories are being updated. Check back soon!"
                    }]
        },
        {
            id: 4,
            title:"Test Series",
            link:"#",
            has_dropdown: true,
            megamenu: true,
            is_button: true,
            //  FIXED: Safe examination categories handling
            sub_menus: examinationsLoading
                ? [{
                    link:"#",
                    title:"Loading examination categories...",
                    icon:"fas fa-spinner fa-spin",
                    color:"#6c757d",
                    description:"Please wait while we load examination categories"
                }]
                : (safeExaminationCategories.length > 0) //  Safe length check
                    ? [
                        {
                            link:"/online-test-series",
                            title:"All Test Series",
                            icon:"fas fa-tasks",
                            color:"#0984e3",
                            description:"Browse all available test series across examinations"
                        },
                        {
                            link:"/test-series/examinations",
                            title:"Browse by Examination",
                            icon:"fas fa-sitemap",
                            color:"#00b894",
                            description:"Explore test series organized by examination type"
                        },
                        //  Safe mapping with null checks
                        ...safeExaminationCategories
                            .filter(category => category && category._id && category.name && category.code) //  Filter invalid entries
                            .sort((a, b) => (a.priority || 999) - (b.priority || 999))
                            .map(category => {
                                const style = getExaminationCategoryStyle(category.code, category.name);
                                return {
                                    link: `/test-series/examination/${category._id}`,
                                    title: `${category.code} ${category.year ||'Current'}`,
                                    icon: style.icon,
                                    color: style.color,
                                    description: category.description ||
                                        `${category.name} test series with ${category.statistics?.totalTestSeries || 0} tests available`
                                };
                            })
                    ]
                    : [{
                        link:"/online-test-series",
                        title:"No examination categories available",
                        icon:"fas fa-exclamation-circle",
                        color:"#ffc107",
                        description:"Examination categories are being updated. Check back soon!"
                    }]
        },
        {
            id: 5,
            title:"Recorded Videos",
            link:"/recorded-videos",
            has_dropdown: false,
        },
        {
            id: 6,
            title:"Blog",
            link:"/grid-blog",
            has_dropdown: false,
        },
        {
            id: 7,
            title:"Contact",
            link:"/contact",
            has_dropdown: false,
        },
        {
            id: 8,
            title:"About us",
            link:"/about",
            has_dropdown: false,
        },
        {
            id: 9,
            title:"Meet the Team",
            link:"/teams",
            has_dropdown: false,
        },
    ];

    return {
        menuData: menu_data,
        loading: coursesLoading || booksLoading || examinationsLoading
    };
};

// Enhanced static fallback
const menu_data: DataType[] = [
    { id: 1, title:"Home", link:"/" },
    { id: 2, title:"Courses", link:"/courses", has_dropdown: false },
    { id: 3, title:"Books", link:"/all-books", has_dropdown: false },
    { id: 4, title:"Test Series", link:"/online-test-series", has_dropdown: false },
    { id: 5, title:"Recorded Videos", link:"/recorded-videos", has_dropdown: false },
    { id: 6, title:"Blog", link:"/grid-blog", has_dropdown: false },
    { id: 7, title:"Contact", link:"/contact", has_dropdown: false },
    { id: 8, title:"About us", link:"/about", has_dropdown: false },
    { id: 9, title:"Meet the Team", link:"/teams", has_dropdown: false },
];

//  FIXED: Utility functions with null safety
export const getExaminationCategoryById = (categories: ExaminationCategory[], id: string): ExaminationCategory | undefined => {
    return (categories || []).find(cat => cat && cat._id === id);
};

export const getExaminationCategoryByCode = (categories: ExaminationCategory[], code: string): ExaminationCategory | undefined => {
    return (categories || []).find(cat => cat && cat.code && cat.code.toLowerCase() === code.toLowerCase());
};

export const getAllExaminationLinks = (categories: ExaminationCategory[]): string[] => {
    return (categories || [])
        .filter(cat => cat && cat._id)
        .map(category => `/test-series/examination/${category._id}`);
};

export const getCategoryBySlug = (categories: CourseCategory[], slug: string): CourseCategory | undefined => {
    return (categories || []).find(cat =>
        cat && (
            createCategorySlug(cat.name, cat.slug) === slug ||
            cat.slug === slug ||
            createCategorySlug(cat.name) === slug
        )
    );
};

export const getBookCategoryBySlug = (categories: BookCategory[], slug: string): BookCategory | undefined => {
    return (categories || []).find(cat =>
        cat && cat.name && (
            createCategorySlug(cat.name) === slug ||
            cat.name.toLowerCase().replace(/\s+/g,'-') === slug
        )
    );
};

export const getAllCategoryLinks = (categories: CourseCategory[]): string[] => {
    return (categories || [])
        .filter(cat => cat && cat.name)
        .map(category => `/courses/category/${createCategorySlug(category.name, category.slug)}`);
};

export const getAllBookCategoryLinks = (categories: BookCategory[]): string[] => {
    return (categories || [])
        .filter(cat => cat && cat.name)
        .map(category => `/books/category/${createCategorySlug(category.name)}`);
};

export default menu_data;
