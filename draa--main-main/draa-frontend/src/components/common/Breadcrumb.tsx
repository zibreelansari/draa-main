import { useState, useEffect } from"react";
import { Link, useNavigate } from"react-router-dom";
import axios from"axios";
import url, { getImageUrl } from"../../url";
import"./Breadcrumb.css";
import { Home, Play, Search, Zap } from"lucide-react";
import useDraaLanguage from "../../hooks/useDraaLanguage";

interface BreadcrumbProp {
    pathName: string;
    url?: string;
}

export interface StatItem {
    label: string;
    value: string;
}

export type DraaPageTheme = "courses" | "books" | "test-series" | "exams" | "resources" | "e-learning";

type Props = {
    title: string;
    subtitle?: string;
    category?: string;
    isFree?: boolean;
    image?: string;
    paths?: BreadcrumbProp[];
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchBtnText?: string;
    stats?: StatItem[];
    theme?: DraaPageTheme;
};

const PAGE_CONTENT: Record<DraaPageTheme, {
    category: { en: string; hi: string };
    title: { en: string; hi: string };
    subtitle: { en: string; hi: string };
    image: string;
    highlights: { en: string[]; hi: string[] };
}> = {
    courses: {
        category: { en: "Online Courses", hi: "ऑनलाइन पाठ्यक्रम" },
        title: {
            en: "Build Knowledge That Moves You Forward",
            hi: "ऐसा ज्ञान अर्जित करें जो आपको आगे बढ़ाए",
        },
        subtitle: {
            en: "Study through thoughtfully structured courses, expert instruction, and outcome-focused learning pathways designed for serious academic and competitive preparation.",
            hi: "गंभीर शैक्षणिक और प्रतियोगी तैयारी के लिए सुव्यवस्थित पाठ्यक्रमों, विशेषज्ञ मार्गदर्शन और परिणाम-केंद्रित अध्ययन पथों के साथ सीखें।",
        },
        image: "/brand/page-heroes/courses.webp",
        highlights: {
            en: ["Expert Faculty", "Structured Learning", "Practical Outcomes"],
            hi: ["विशेषज्ञ शिक्षक", "सुव्यवस्थित अध्ययन", "व्यावहारिक परिणाम"],
        },
    },
    books: {
        category: { en: "Academic Library", hi: "शैक्षणिक पुस्तकालय" },
        title: {
            en: "Scholarly Books for Focused Preparation",
            hi: "एकाग्र तैयारी के लिए प्रामाणिक शैक्षणिक पुस्तकें",
        },
        subtitle: {
            en: "Explore carefully selected books, previous-year question collections, and syllabus-aligned study material that turn reading into measurable progress.",
            hi: "चयनित पुस्तकों, विगत-वर्ष प्रश्न संग्रहों और पाठ्यक्रमानुकूल अध्ययन सामग्री के माध्यम से अपनी तैयारी को ठोस प्रगति में बदलें।",
        },
        image: "/brand/page-heroes/books.webp",
        highlights: {
            en: ["Curated Titles", "Syllabus Aligned", "Concept Clarity"],
            hi: ["चयनित पुस्तकें", "पाठ्यक्रमानुकूल", "अवधारणा की स्पष्टता"],
        },
    },
    "test-series": {
        category: { en: "Assessment & Practice", hi: "मूल्यांकन और अभ्यास" },
        title: {
            en: "Measure Progress. Master the Examination.",
            hi: "प्रगति मापें। परीक्षा में प्रवीणता प्राप्त करें।",
        },
        subtitle: {
            en: "Practise with exam-aligned mock tests, evidence-based performance analysis, and detailed explanations that convert every attempt into informed improvement.",
            hi: "परीक्षा-आधारित मॉक टेस्ट, तथ्यपरक प्रदर्शन विश्लेषण और विस्तृत समाधानों के साथ प्रत्येक प्रयास को सार्थक सुधार में बदलें।",
        },
        image: "/brand/page-heroes/test-series.webp",
        highlights: {
            en: ["Exam Pattern", "Deep Analytics", "Detailed Solutions"],
            hi: ["परीक्षा प्रारूप", "गहन विश्लेषण", "विस्तृत समाधान"],
        },
    },
    exams: {
        category: { en: "Competitive Examinations", hi: "प्रतियोगी परीक्षाएँ" },
        title: {
            en: "Plan Every Examination with Clarity",
            hi: "हर परीक्षा की तैयारी स्पष्ट रणनीति के साथ करें",
        },
        subtitle: {
            en: "Access reliable exam information, important dates, syllabus guidance, and relevant preparation resources in one academically organised destination.",
            hi: "विश्वसनीय परीक्षा जानकारी, महत्वपूर्ण तिथियाँ, पाठ्यक्रम मार्गदर्शन और उपयोगी तैयारी संसाधन एक सुव्यवस्थित शैक्षणिक मंच पर प्राप्त करें।",
        },
        image: "/brand/page-heroes/exams.webp",
        highlights: {
            en: ["Verified Updates", "Clear Roadmaps", "Focused Preparation"],
            hi: ["सत्यापित जानकारी", "स्पष्ट अध्ययन-योजना", "लक्षित तैयारी"],
        },
    },
    resources: {
        category: { en: "Open Learning Resources", hi: "मुक्त अध्ययन संसाधन" },
        title: {
            en: "Trusted Resources, Open to Every Learner",
            hi: "विश्वसनीय संसाधन, प्रत्येक विद्यार्थी के लिए सुलभ",
        },
        subtitle: {
            en: "Strengthen independent study with reliable syllabi, previous-year papers, current affairs, academic notes, and practical guidance—available when you need them.",
            hi: "विश्वसनीय पाठ्यक्रम, विगत-वर्ष प्रश्नपत्र, समसामयिकी, शैक्षणिक नोट्स और उपयोगी मार्गदर्शन से स्वाध्याय को सशक्त बनाएँ।",
        },
        image: "/brand/page-heroes/resources.webp",
        highlights: {
            en: ["Reliable Material", "Easy Access", "Independent Study"],
            hi: ["विश्वसनीय सामग्री", "सरल पहुँच", "सशक्त स्वाध्याय"],
        },
    },
    "e-learning": {
        category: { en: "Digital Education Solutions", hi: "डिजिटल शिक्षा समाधान" },
        title: {
            en: "Digital Learning Solutions, Designed for Impact",
            hi: "प्रभावी परिणामों के लिए विकसित डिजिटल शिक्षण समाधान",
        },
        subtitle: {
            en: "Build credible, accessible, and scalable learning experiences through academically grounded content, thoughtful technology, and dependable implementation.",
            hi: "शैक्षणिक रूप से सुदृढ़ सामग्री, सुविचारित तकनीक और विश्वसनीय क्रियान्वयन के माध्यम से प्रभावी, सुलभ और विस्तारयोग्य शिक्षण अनुभव विकसित करें।",
        },
        image: "/brand/page-heroes/e-learning.webp",
        highlights: {
            en: ["Academic Quality", "Scalable Technology", "Learner Centred"],
            hi: ["शैक्षणिक गुणवत्ता", "विस्तारयोग्य तकनीक", "विद्यार्थी-केंद्रित"],
        },
    },
};

const SERVICE_TITLES_HI: Record<string, string> = {
    "Website Development": "वेबसाइट विकास",
    "Academic Content": "शैक्षणिक सामग्री",
    "White Label Content": "व्हाइट-लेबल सामग्री",
    "Mobile App Development": "मोबाइल ऐप विकास",
    "Exam Management": "परीक्षा प्रबंधन",
    "Digital Content Creation": "डिजिटल सामग्री निर्माण",
    "Digital Marketing": "डिजिटल विपणन",
    "Managed Services": "प्रबंधित सेवाएँ",
};

export default function Breadcrumb({
    title,
    subtitle,
    category,
    isFree = false,
    image,
    paths = [],
    showSearch = true,
    searchPlaceholder,
    searchBtnText,
    stats,
    theme,
}: Props) {
    const { language } = useDraaLanguage();
    const isHindi = language === "hi";
    const pageContent = theme ? PAGE_CONTENT[theme] : null;
    const [searchQuery, setSearchQuery] = useState("");
    const [dynamicStats, setDynamicStats] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [userRes, examRes, pyqRes, syllabusRes, booksRes, coursesRes, testSeriesRes, bookCategoriesRes] = await Promise.all([
                    axios.get(`${url}/count/getAllStudents`).catch(() => null),
                    axios.get(`${url}/exams/all?limit=1`).catch(() => null),
                    axios.get(`${url}/pyq/all?limit=1`).catch(() => null),
                    axios.get(`${url}/syllabus/all?limit=1`).catch(() => null),
                    axios.get(`${url}/books/all?limit=1`).catch(() => null),
                    axios.get(`${url}/course/admin/courses?limit=1`).catch(() => null),
                    axios.get(`${url}/test-series/navigation/examinations`).catch(() => null),
                    axios.get(`${url}/books/categories/all`).catch(() => null)
                ]);

                const studentCount = userRes?.data?.userCount || 12000;
                const examCount = examRes?.data?.total || examRes?.data?.exams?.length || 100;
                const resourceCount = (pyqRes?.data?.total || 0) + (syllabusRes?.data?.total || 0) + 500;
                const bookCount = booksRes?.data?.total || booksRes?.data?.books?.length || 80;
                const courseCount = coursesRes?.data?.total || coursesRes?.data?.courses?.length || 50;

                // For test series count
                const testCatsData = testSeriesRes?.data?.data?.examinationCategories ||
                    testSeriesRes?.data?.examinationCategories ||
                    testSeriesRes?.data?.data ||
                    testSeriesRes?.data || [];
                const testSeriesCount = Array.isArray(testCatsData) ? testCatsData.length : 25;

                // For book categories count
                const bookCatsData = bookCategoriesRes?.data?.categories ||
                    bookCategoriesRes?.data?.data?.categories ||
                    bookCategoriesRes?.data || [];
                const bookCatsCount = Array.isArray(bookCatsData) ? bookCatsData.length : 10;

                setDynamicStats({
                    students: studentCount > 1000 ? `${(studentCount / 1000).toFixed(1)}k+` : studentCount,
                    resources: resourceCount > 1000 ? `${(resourceCount / 1000).toFixed(1)}k+` : resourceCount,
                    exams: examCount > 50 ? `${examCount}+` : examCount,
                    books: bookCount > 50 ? `${bookCount}+` : bookCount,
                    bookCategories: bookCatsCount > 5 ? `${bookCatsCount}+` : bookCatsCount,
                    courses: courseCount > 10 ? `${courseCount}+` : courseCount,
                    testSeries: testSeriesCount > 10 ? `${testSeriesCount}+` : testSeriesCount,
                    successRate: "98%"
                });
            } catch (err) {
                console.error("Error fetching breadcrumb stats:", err);
            }
        };

        fetchStats();
    }, []);

    // Context-aware defaults for stats
    const getStats = (): StatItem[] => {
        if (stats && stats.length > 0) return stats;

        const cat = (category || title || "").toLowerCase();

        // Use dynamic stats if available
        if (dynamicStats) {
            if (cat.includes("exam") || cat.includes("test")) {
                const isTestSeries = cat.includes("test");
                return [
                    { value: isTestSeries ? dynamicStats.testSeries : dynamicStats.exams, label: isTestSeries ? "Test Series" : "Active Exams" },
                    { value: isTestSeries ? "25+" : "25+", label: "Categories" },
                    { value: "100%", label: "Verified Data" }
                ];
            }
            if (cat.includes("course") || cat.includes("learn")) {
                return [
                    { value: dynamicStats.courses, label: "Premium Courses" },
                    { value: dynamicStats.students, label: "Total Students" },
                    { value: "4.8", label: "User Rating" }
                ];
            }
            if (cat.includes("book") || cat.includes("library") || cat.includes("read")) {
                return [
                    { value: dynamicStats.books, label: "Total Books" },
                    { value: dynamicStats.bookCategories, label: "Categories" },
                    { value: "100%", label: "Verified Data" }
                ];
            }
            // Global Default / Fallback for other categories
            return [
                { value: dynamicStats.students, label: "Happy Learners" },
                { value: dynamicStats.resources, label: "Resources" },
                { value: dynamicStats.successRate, label: "Success Rate" }
            ];
        }

        // Hardcoded Fallbacks (while loading)
        if (cat.includes("exam") || cat.includes("test")) {
            const isTestSeries = cat.includes("test");
            return [
                { value: isTestSeries ? "25+" : "7+", label: isTestSeries ? "Test Series" : "Active Exams" },
                { value: isTestSeries ? "12+" : "2+", label: "Categories" },
                { value: "100%", label: "Verified Data" }
            ];
        }
        if (cat.includes("book") || cat.includes("library")) {
            return [
                { value: "100+", label: "Total Books" },
                { value: "10+", label: "Categories" },
                { value: "100%", label: "Verified Data" }
            ];
        }

        return [
            { value: "12k+", label: "Happy Learners" },
            { value: "500+", label: "Resources" },
            { value: "98%", label: "Success Rate" }
        ];
    };

    const getSearchConfig = () => {
        const cat = (category || title ||"").toLowerCase();
        let placeholder = searchPlaceholder ||"Search for resources, books, exams & more...";
        let btnText = searchBtnText ||"Search Content";

        if (cat.includes("course")) {
            placeholder = searchPlaceholder ||"What do you want to learn?";
            btnText = searchBtnText ||"Explore Courses";
        } else if (cat.includes("book")) {
            placeholder = searchPlaceholder ||"Find your next read...";
            btnText = searchBtnText ||"Find Books";
        } else if (cat.includes("blog")) {
            placeholder = searchPlaceholder ||"Search articles...";
            btnText = searchBtnText ||"Search Blogs";
        }

        return { placeholder, btnText };
    };

    const { placeholder, btnText } = getSearchConfig();
    const currentStats = getStats();

    const getCategoryImage = () => {
        if (pageContent) return pageContent.image;
        if (image) return getImageUrl(image);
        return"/brand/page-heroes/courses.webp";
    };

    const displayTitle = pageContent
        ? theme === "e-learning"
            ? (isHindi ? SERVICE_TITLES_HI[title] || pageContent.title.hi : title)
            : pageContent.title[language]
        : title;
    const displaySubtitle = pageContent ? pageContent.subtitle[language] : subtitle;
    const displayCategory = pageContent ? pageContent.category[language] : category;
    const displayHighlights = pageContent
        ? pageContent.highlights[language]
        : (isHindi
            ? ["विश्वसनीय सामग्री", "विशेषज्ञ मार्गदर्शन", "बेहतर परिणाम"]
            : ["Trusted Content", "Expert Guidance", "Better Outcomes"]);
    const titleWords = displayTitle.trim().split(/\s+/);
    const accentWordCount = Math.min(2, titleWords.length);
    const titleLead = titleWords.slice(0, -accentWordCount).join(" ");
    const titleAccent = titleWords.slice(-accentWordCount).join(" ");

    const translateStatLabel = (label: string) => {
        if (!isHindi) return label;
        const labels: Record<string, string> = {
            "Happy Learners": "संतुष्ट विद्यार्थी",
            "Total Students": "कुल विद्यार्थी",
            "Resources": "अध्ययन संसाधन",
            "Success Rate": "सफलता दर",
            "Premium Courses": "प्रीमियम पाठ्यक्रम",
            "User Rating": "विद्यार्थी रेटिंग",
            "Total Books": "कुल पुस्तकें",
            "Categories": "श्रेणियाँ",
            "Verified Data": "सत्यापित जानकारी",
            "Test Series": "टेस्ट सीरीज़",
            "Active Exams": "सक्रिय परीक्षाएँ",
            "Aspirants": "अभ्यर्थी",
            "Free Info": "निःशुल्क जानकारी",
        };
        return labels[label] || label;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.dispatchEvent(new CustomEvent('global-search-trigger', {
                detail: { query: searchQuery }
            }));
        }
    };

    return (
        <section className={`sx-hero-breadcrumb ${theme ? `sx-page-${theme}` : ""}`}>
            <div className="sx-hero-mesh" />
            <div className="sx-hero-grain" />

            <div className="sx-hero-blob sx-blob-1" />
            <div className="sx-hero-blob sx-blob-2" />

            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-7">
                        <div className="sx-hero-content">
                            <nav className="sx-hero-nav">
                                <Link to="/" className="sx-nav-link">
                                    <Home size={14} /> {isHindi ? "मुखपृष्ठ" : "Home"}
                                </Link>
                                {category && (
                                    <>
                                        <span className="sx-nav-sep">/</span>
                                        <span className="sx-nav-text">{displayCategory}</span>
                                    </>
                                )}
                                {paths.map((p, i) => (
                                    <span key={i}>
                                        <span className="sx-nav-sep">/</span>
                                        {p.url ? (
                                            <Link to={p.url} className="sx-nav-link">{p.pathName}</Link>
                                        ) : (
                                            <span className="sx-nav-text">{p.pathName}</span>
                                        )}
                                    </span>
                                ))}
                            </nav>

                            <h1 className="sx-hero-title">
                                {titleLead && <>{titleLead}{" "}</>}
                                <span className="sx-title-gradient">{titleAccent}</span>
                            </h1>

                            <p className="sx-hero-subtitle">
                                {displaySubtitle || (isHindi
                                    ? "विशेषज्ञों द्वारा चयनित सामग्री के साथ अपनी अध्ययन यात्रा को सुदृढ़ करें और अपने शैक्षणिक लक्ष्यों की ओर आत्मविश्वास से आगे बढ़ें।"
                                    : `Discover carefully curated ${category || "resources"} that strengthen your learning journey and support meaningful academic progress.`)}
                            </p>



                            <div className="sx-hero-stats">
                                {currentStats.map((stat, index) => (
                                    <div key={index} style={{ display:'flex', alignItems:'center', gap:'40px' }}>
                                        <div className="sx-stat-box">
                                            <div className="sx-stat-val">{stat.value}</div>
                                            <div className="sx-stat-lab">{translateStatLabel(stat.label)}</div>
                                        </div>
                                        {index < currentStats.length - 1 && <div className="sx-stat-sep" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="sx-hero-visual">
                            <div className="sx-float-badge sx-badge-exams">
                                <span className="sx-badge-dot" /> {displayHighlights[0]}
                            </div>
                            <div className="sx-float-badge sx-badge-mocks">
                                <Zap size={14} className="sx-icon-green" /> {displayHighlights[1]}
                            </div>
                            <div className="sx-float-badge sx-badge-live">
                                <Play size={14} className="sx-icon-red" /> {displayHighlights[2]}
                            </div>

                            <div className="sx-visual-container">
                                <img
                                    src={getCategoryImage()}
                                    alt={isHindi ? `${displayCategory || "अध्ययन"} चित्रण` : `${displayCategory || "Learning"} illustration`}
                                    className="sx-hero-img"
                                />
                                <div className="sx-visual-accent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
