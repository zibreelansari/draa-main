import React, { useEffect, useState, useCallback } from "react";
import { Drawer, Collapse, Badge, Modal, Input, Dropdown, Avatar, Divider, Typography } from "antd";
import { useAuthModal } from "../../components/register/auth/AuthModalContext";
import {
  Menu,
  SearchIcon,
  User,
  ShoppingCart,
  ChevronDown,
  BookOpen,
  Layers,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Book,
  Bookmark,
  FileText,
  Library,
  Notebook,
  Compass,
  DraftingCompass,
  Globe,
  Languages,
  Award,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  Users,
  X,
  Home,
  Clock,
  Star,
  Flame,
  Crown,
  ChevronRight,
  Monitor,
  Package,
  Smartphone,
  ClipboardCheck,
  Video,
  Megaphone,
  ShieldCheck,
  Newspaper,
  Brain,
  Sparkles,
  Bell,
  Pencil,
  ClipboardList,
  Trophy,
  Building2,
  Landmark,
  Train,
  ShieldAlert,
  Cross,
  Scale,
  MoreHorizontal,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import url, { getImageUrl } from "../../url";
import { getAuthHeaders, getStoredUser, isAuthenticated, getCartKey } from "../../utils/global_auth";
import useDraaLanguage from "../../hooks/useDraaLanguage";
import "./HeaderOne.css";
import debounce from "lodash/debounce";
const { Panel } = Collapse;
const { Search } = Input;
const { Text } = Typography;

interface HeaderOneProps {
  brand?: 'default' | 'draa';
  language?: 'en' | 'hi';
  onLanguageChange?: (language: 'en' | 'hi') => void;
}

interface RecentSearchItem {
  id?: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  type?: string;
  url?: string;
  isTerm: boolean;
}

const renderExamIcon = (examName: string, index: number) => {
  const name = (examName || '').toUpperCase();
  if (name.includes('SBI')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#00a5ec" />
        <circle cx="12" cy="17.5" r="2.5" fill="white" />
        <rect x="11.25" y="17.5" width="1.5" height="4.5" fill="white" />
      </svg>
    );
  }
  if (name.includes('IBPS')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0b79be" />
        <path d="M6 18 L12 6 L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
        <path d="M9 18 L12 11 L15 18" fill="white" opacity="0.7" />
      </svg>
    );
  }
  if (name.includes('LIC')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#ffef00" />
        <circle cx="12" cy="9" r="2" fill="#e31e24" />
        <path d="M7 14 C 9 10, 15 10, 17 14" stroke="#003594" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M9 17 C 10.5 15, 13.5 15, 15 17" stroke="#003594" strokeWidth="2.0" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  if (name.includes('RBI')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#cca625" />
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="white" strokeWidth="0.8" />
        <path d="M11 7 L11 15 M9 8 L11 9 M13 8 L11 9 M9 10 L11 11 M13 10 L11 11 M9 12 L11 12 M13 12 L11 12" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12 15 C14 15, 16 16, 17 17 L7 17 C8 16, 10 15, 12 15 Z" fill="white" />
      </svg>
    );
  }
  if (name.includes('NICL')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#6a3093" />
        <text x="12" y="16.5" fontSize="8" fontFamily="sans-serif" fontWeight="900" fill="white" textAnchor="middle">NICL</text>
      </svg>
    );
  }
  if (name.includes('NIACL')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#003399" />
        <path d="M7 10 L12 7 L17 10 L17 14 C17 17, 12 19, 12 19 C12 19, 7 17, 7 14 Z" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name.includes('BOB') || name.includes('BARODA')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#ff6600" />
        <text x="12" y="17" fontSize="13" fontFamily="sans-serif" fontWeight="900" fill="white" textAnchor="middle">B</text>
      </svg>
    );
  }
  if (name.includes('CANARA')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <polygon points="4,19 14,5 18,19" fill="#0054A6" />
        <polygon points="9,19 14,10 20,19" fill="#FFD200" opacity="0.9" />
      </svg>
    );
  }
  if (name.includes('DENA')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#e35e26" />
        <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  if (name.includes('ECGC')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#005691" />
        <path d="M4 14 C 7 11, 11 11, 14 14 C 17 17, 20 17, 20 14" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M4 17 C 7 14, 11 14, 14 17 C 17 20, 20 20, 20 17" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
      </svg>
    );
  }
  if (name.includes('ESIC')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#a62125" />
        <path d="M12 7 L12 16 M9 10 L12 11 M15 10 L12 11 M8 13 L12 14 M16 13 L12 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes('GIC')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#1b365d" />
        <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M12 5 L12 19 M5 12 L19 12" stroke="white" strokeWidth="1" opacity="0.5" />
      </svg>
    );
  }
  if (name.includes('IDBI')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#008751" />
        <polygon points="12,5 19,12 16,12 16,19 8,19 8,12 5,12" fill="white" />
      </svg>
    );
  }
  if (name.includes('INDIAN BANK')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#024789" />
        <circle cx="12" cy="10" r="3" fill="none" stroke="#f68b1e" strokeWidth="1.5" />
        <circle cx="9.5" cy="13.5" r="3" fill="none" stroke="#f68b1e" strokeWidth="1.5" />
        <circle cx="14.5" cy="13.5" r="3" fill="none" stroke="#f68b1e" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name.includes('IPPB')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#5c2d91" />
        <path d="M4 8 C 8 4, 16 4, 20 8" stroke="#ffc629" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <text x="12" y="17.5" fontSize="8" fontFamily="sans-serif" fontWeight="900" fill="white" textAnchor="middle">IPPB</text>
      </svg>
    );
  }
  if (name.includes('LAKSHMI') || name.includes('LVB')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#d9251c" />
        <circle cx="12" cy="12" r="6" fill="#fecb00" />
      </svg>
    );
  }
  if (name.includes('NAINITAL')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#bf1e2e" />
        <circle cx="12" cy="12" r="7" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name.includes('SEBI')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0072ce" />
        <path d="M6 8 L18 8 M6 12 L18 12 M6 16 L18 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes('NABARD')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#2e7d32" />
        <path d="M12 6 C 15 9, 15 15, 12 18 C 9 15, 9 9, 12 6 Z" fill="#81c784" />
      </svg>
    );
  }
  if (name.includes('SSC')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#d35400" />
        <text x="12" y="16" fontSize="9" fontFamily="sans-serif" fontWeight="900" fill="white" textAnchor="middle">SSC</text>
      </svg>
    );
  }
  if (name.includes('RRB') || name.includes('RAILWAY') || name.includes('RPF')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#c0392b" />
        <path d="M7 6 L17 6 L19 14 L5 14 Z" fill="white" />
        <circle cx="8" cy="18" r="1.5" fill="white" />
        <circle cx="16" cy="18" r="1.5" fill="white" />
      </svg>
    );
  }
  if (name.includes('UPSC') || name.includes('CIVIL')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#1e3799" />
        <polygon points="12,4 15,10 21,11 17,15 18,21 12,18 6,21 7,15 3,11 9,10" fill="#f6b93b" />
      </svg>
    );
  }
  if (name.includes('AFCAT') || name.includes('DEFENCE') || name.includes('ARMY') || name.includes('NAVY') || name.includes('AIRFORCE')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#0c2461" />
        <path d="M12 4 L16 12 L12 20 L8 12 Z" fill="#eb2f06" />
      </svg>
    );
  }
  if (name.includes('CTET') || name.includes('TEACHING') || name.includes('UGC') || name.includes('KVS') || name.includes('NVS') || name.includes('REET')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#f39c12" />
        <path d="M5 8 L12 5 L19 8 L12 11 Z" fill="white" />
        <path d="M7 11.5 L7 16 C7 16, 12 19, 17 16 L17 11.5" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name.includes('GATE') || name.includes('ENGINEERING')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#60a3bc" />
        <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="2.5" />
        <path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12" stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  if (name.includes('CAT') || name.includes('MBA') || name.includes('XAT') || name.includes('SNAP') || name.includes('CMAT')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#8e44ad" />
        <path d="M6 18 L10 12 L14 15 L18 8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes('CLAT') || name.includes('LAW') || name.includes('JUDICIARY') || name.includes('PCS-J')) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#2c3e50" />
        <path d="M12 4 L12 18 M7 9 L17 9 M6 14 L8 14 M16 14 L18 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // General fallback
  const EXAM_COLORS = [
    'linear-gradient(135deg, #e74c3c, #c0392b)',
    'linear-gradient(135deg, #3498db, #2980b9)',
    'linear-gradient(135deg, #2ecc71, #27ae60)',
    'linear-gradient(135deg, #9b59b6, #8e44ad)',
    'linear-gradient(135deg, #f39c12, #d68910)',
    'linear-gradient(135deg, #1abc9c, #16a085)',
    'linear-gradient(135deg, #e67e22, #d35400)',
    'linear-gradient(135deg, #34495e, #2c3e50)',
  ];
  return (
    <div className="exam-card-icon-placeholder" style={{ background: EXAM_COLORS[index % EXAM_COLORS.length] }}>
      {examName.substring(0, 2).toUpperCase()}
    </div>
  );
};

const DEMO_BOOK_CATEGORIES = [
  { _id: 'demo-it', name: 'IT', nameHi: 'सूचना प्रौद्योगिकी' },
  { _id: 'demo-bank', name: 'Bank', nameHi: 'बैंकिंग' },
  { _id: 'demo-police', name: 'Police', nameHi: 'पुलिस' },
  { _id: 'demo-railway', name: 'Railway', nameHi: 'रेलवे' },
  { _id: 'demo-teacher', name: 'Teacher', nameHi: 'शिक्षण' },
  { _id: 'demo-government', name: 'Government', nameHi: 'सरकारी परीक्षाएँ' },
  { _id: 'demo-academic', name: 'Academic', nameHi: 'शैक्षणिक' },
  { _id: 'demo-school', name: 'School', nameHi: 'विद्यालय' },
];

const DEMO_BOOKS = [
  {
    _id: 'demo-uppcs-pyq',
    isDemo: true,
    title: 'UPPCS Previous-Year Questions (Hindi) 2015–2025',
    titleHi: 'UPPCS विगत-वर्ष प्रश्नपत्र (हिंदी) 2015–2025',
    author: 'DRAA Exam Press',
    authorHi: 'DRAA परीक्षा प्रकाशन',
    digitalPrice: 499,
    category: { name: 'Government' },
    demoCategoryIds: ['demo-government', 'demo-railway'],
    demoCover: { code: 'UPPCS', subject: 'PYQ', year: '2015–25', theme: 'navy' },
  },
  {
    _id: 'demo-up-police-constable',
    isDemo: true,
    title: 'UP Police Constable 2026',
    titleHi: 'उत्तर प्रदेश पुलिस कांस्टेबल 2026',
    author: 'DRAA Exam Press',
    authorHi: 'DRAA परीक्षा प्रकाशन',
    digitalPrice: 599,
    category: { name: 'Police' },
    demoCategoryIds: ['demo-police'],
    demoCover: { code: 'UP', subject: 'POLICE', year: '2026', theme: 'red' },
  },
  {
    _id: 'demo-opsc-oas',
    isDemo: true,
    title: 'OPSC 2026 – OPSC/OAS Complete Guide',
    titleHi: 'OPSC 2026 – OPSC/OAS संपूर्ण मार्गदर्शिका',
    author: 'DRAA Exam Press',
    authorHi: 'DRAA परीक्षा प्रकाशन',
    digitalPrice: 325,
    category: { name: 'Government' },
    demoCategoryIds: ['demo-government'],
    demoCover: { code: 'OPSC', subject: 'OAS', year: '2026', theme: 'teal' },
  },
  {
    _id: 'demo-computer-competitive-exams',
    isDemo: true,
    title: 'Computer Book for SSC, Banking, CTET, CSAT & Competitive Exams',
    titleHi: 'SSC, बैंकिंग, CTET, CSAT एवं प्रतियोगी परीक्षाओं हेतु कंप्यूटर',
    author: 'DRAA Editorial Team',
    authorHi: 'DRAA संपादकीय मंडल',
    digitalPrice: 249,
    category: { name: 'IT' },
    demoCategoryIds: ['demo-it', 'demo-bank'],
    demoCover: { code: 'COMP', subject: 'COMPUTER', year: 'EXAMS', theme: 'violet' },
  },
  {
    _id: 'demo-ethics-integrity',
    isDemo: true,
    title: 'Ethics, Integrity & Aptitude – Second Edition 2026',
    titleHi: 'नीतिशास्त्र, सत्यनिष्ठा एवं अभिरुचि – द्वितीय संस्करण 2026',
    author: 'Anand & Anand',
    authorHi: 'आनंद एवं आनंद',
    digitalPrice: 399,
    category: { name: 'Government' },
    demoCategoryIds: ['demo-government'],
    demoCover: { code: 'ETHICS', subject: 'INTEGRITY', year: '2nd ED.', theme: 'ochre' },
  },
  {
    _id: 'demo-ugc-net-paper-one',
    isDemo: true,
    title: 'UGC NET Paper 1: Teaching & Research Aptitude, 2nd Edition',
    titleHi: 'UGC NET पेपर 1: शिक्षण एवं शोध अभिरुचि, द्वितीय संस्करण',
    author: 'Anand & Anand',
    authorHi: 'आनंद एवं आनंद',
    digitalPrice: 499,
    category: { name: 'Teacher' },
    demoCategoryIds: ['demo-teacher'],
    demoCover: { code: 'UGC', subject: 'NET', year: 'PAPER 1', theme: 'indigo' },
  },
  {
    _id: 'demo-cuet-geography',
    isDemo: true,
    title: 'CUET UG Geography',
    titleHi: 'CUET UG भूगोल',
    author: 'DRAA Editorial Team',
    authorHi: 'DRAA संपादकीय मंडल',
    digitalPrice: 199,
    category: { name: 'Academic' },
    demoCategoryIds: ['demo-academic'],
    demoCover: { code: 'CUET', subject: 'GEOGRAPHY', year: 'UG', theme: 'green' },
  },
  {
    _id: 'demo-cuet-political-science',
    isDemo: true,
    title: 'CUET UG Political Science 2026',
    titleHi: 'CUET UG राजनीति विज्ञान 2026',
    author: 'DRAA Editorial Team',
    authorHi: 'DRAA संपादकीय मंडल',
    digitalPrice: 199,
    category: { name: 'Academic' },
    demoCategoryIds: ['demo-academic', 'demo-school'],
    demoCover: { code: 'CUET', subject: 'POL. SCI.', year: '2026', theme: 'orange' },
  },
];

export default function HeaderOne({
  brand = 'draa',
  language,
  onLanguageChange,
}: HeaderOneProps) {
  const storedLanguage = useDraaLanguage();
  const activeLanguage = language ?? storedLanguage.language;
  const changeLanguage = onLanguageChange ?? storedLanguage.setLanguage;
  const isDraa = brand === 'draa';
  const isHindi = activeLanguage === 'hi';
  const hindiLabels: Record<string, string> = {
    "All Courses": "सभी पाठ्यक्रम",
    "Courses": "पाठ्यक्रम",
    "All Books": "सभी पुस्तकें",
    "Books": "पुस्तकें",
    "Best Sellers": "सर्वाधिक लोकप्रिय",
    "New Arrivals": "नई पुस्तकें",
    "Sample PDFs": "नमूना पीडीएफ",
    "View all books": "सभी पुस्तकें देखें",
    "Top Books for your Dream Success": "आपके लक्ष्य की सफलता के लिए श्रेष्ठ पुस्तकें",
    "Preparation": "तैयारी",
    "All Test Series": "सभी टेस्ट सीरीज़",
    "Popular Test Series": "लोकप्रिय टेस्ट सीरीज़",
    "View All Test Series": "सभी टेस्ट सीरीज़ देखें",
    "All Exams": "सभी परीक्षाएँ",
    "Exams": "परीक्षाएँ",
    "All Services": "सभी सेवाएँ",
    "E-Learning Services": "ई-लर्निंग सेवाएँ",
    "End-to-End E-Learning Solutions": "सम्पूर्ण ई-लर्निंग समाधान",
    "Web & App Development": "वेब और ऐप विकास",
    "Content Services": "सामग्री सेवाएँ",
    "Business Solutions": "व्यावसायिक समाधान",
    "Website Development": "वेबसाइट विकास",
    "Mobile App Development": "मोबाइल ऐप विकास",
    "Academic Content": "शैक्षणिक सामग्री",
    "White Label Content": "व्हाइट-लेबल सामग्री",
    "Digital Content Creation": "डिजिटल सामग्री निर्माण",
    "Exam Management": "परीक्षा प्रबंधन",
    "Digital Marketing": "डिजिटल विपणन",
    "Managed Services": "प्रबंधित सेवाएँ",
    "Custom LMS & Portals": "अनुकूलित एलएमएस और पोर्टल",
    "iOS & Android Apps": "आईओएस और एंड्रॉइड ऐप",
    "Specialized Exam Content": "विशेषज्ञ परीक्षा सामग्री",
    "Rebrandable Courses": "आपके ब्रांड के अनुरूप पाठ्यक्रम",
    "Multimedia & Animations": "मल्टीमीडिया और एनीमेशन",
    "Testing & Proctoring": "परीक्षण और निगरानी",
    "Ed-Tech Promotion": "एड-टेक प्रचार",
    "Business-in-a-Box": "सम्पूर्ण व्यावसायिक समाधान",
    "All Resources": "सभी संसाधन",
    "Free Resources": "निःशुल्क संसाधन",
    "Jobs & Syllabus": "नौकरियाँ और पाठ्यक्रम",
    "Study Materials": "अध्ययन सामग्री",
    "Media & Blogs": "मीडिया और लेख",
    "Government Updates": "सरकारी सूचनाएँ",
    "Notifications": "अधिसूचनाएँ",
    "Jobs & Admission Notifications": "नौकरी और प्रवेश अधिसूचनाएँ",
    "Exam Syllabus": "परीक्षा पाठ्यक्रम",
    "Current Affairs": "समसामयिकी",
    "Previous Year Papers": "विगत-वर्ष प्रश्नपत्र",
    "Educational Blogs": "शैक्षणिक लेख",
    "Recorded Videos": "रिकॉर्डेड वीडियो",
    "Latest government job updates": "नवीनतम सरकारी नौकरी सूचनाएँ",
    "Detailed syllabus for all exams": "सभी परीक्षाओं का विस्तृत पाठ्यक्रम",
    "Daily & monthly updates": "दैनिक और मासिक समसामयिकी",
    "Solve real exam papers": "वास्तविक परीक्षा प्रश्नपत्रों का अभ्यास",
    "Tips, tricks & strategies": "अध्ययन सुझाव और रणनीतियाँ",
    "High-quality video lectures": "उच्च-गुणवत्ता वाले वीडियो व्याख्यान",
    "View All Resources": "सभी संसाधन देखें",
    "Home": "मुखपृष्ठ",
    "Meet Our Team": "हमारी टीम से मिलें",
    "Dashboard": "डैशबोर्ड",
    "Logout": "लॉग आउट",
    "Jobs": "नौकरियाँ",
    "Updates": "नवीनतम जानकारी",
    "Banking": "बैंकिंग",
    "Railway": "रेलवे",
    "Teaching": "शिक्षण",
    "Defence": "रक्षा",
    "Civil Services": "सिविल सेवाएँ",
    "No books available in this category.": "इस श्रेणी में अभी कोई पुस्तक उपलब्ध नहीं है।",
    "Empowering Your": "आपकी",
    "No test series available.": "अभी कोई टेस्ट सीरीज़ उपलब्ध नहीं है।",
    "Comprehensive tests designed as per latest syllabus and exam pattern.": "नवीनतम पाठ्यक्रम और परीक्षा प्रारूप पर आधारित व्यापक टेस्ट।",
    "Latest Exam Pattern": "नवीनतम परीक्षा प्रारूप",
    "Based on updated syllabus": "अद्यतन पाठ्यक्रम पर आधारित",
    "Detailed Solutions": "विस्तृत समाधान",
    "Step-by-step explanations": "चरणबद्ध व्याख्या",
    "Performance Analysis": "प्रदर्शन विश्लेषण",
    "Track your progress in detail": "अपनी प्रगति का विस्तृत आकलन",
    "No exams available in this category.": "इस श्रेणी में अभी कोई परीक्षा उपलब्ध नहीं है।",
    "Scalable. Secure. Student-centric.": "विस्तारयोग्य। सुरक्षित। विद्यार्थी-केंद्रित।",
    "No services available.": "अभी कोई सेवा उपलब्ध नहीं है।",
    "Need Custom LMS?": "अनुकूलित एलएमएस चाहिए?",
    "Tailored solutions to match your unique needs.": "आपकी विशिष्ट आवश्यकताओं के अनुरूप समाधान।",
    "Stay Updated!": "सदैव अद्यतन रहें!",
    "View All Notifications →": "सभी अधिसूचनाएँ देखें →",
    "No resources in this category.": "इस श्रेणी में अभी कोई संसाधन उपलब्ध नहीं है।",
    "TRENDING RESOURCE": "लोकप्रिय संसाधन",
    "Daily Current Affairs": "दैनिक समसामयिकी",
    "Free Exam Material": "निःशुल्क परीक्षा सामग्री",
    "Read Now": "अभी पढ़ें",
    "View All": "सभी देखें",
    "View All Exams": "सभी परीक्षाएँ देखें",
    "View All Services": "सभी सेवाएँ देखें",
  };
  const t = (value?: string) => {
    if (!value || !isHindi) return value || "";
    return hindiLabels[value.trim()] || value;
  };
  const [loginUser, setLoginUser] = useState<any>({});
  const [courseCategories, setCourseCategories] = useState<any[]>([]);
  const [bookCategories, setBookCategories] = useState<any[]>([]);
  const [testSeriesCategories, setTestSeriesCategories] = useState<any[]>([]);
  const [examCategories, setExamCategories] = useState<any[]>([]);
  const [examSections, setExamSections] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeExamCat, setActiveExamCat] = useState<string>('all');
  const { openAuthModal } = useAuthModal();
  const [activeCourseCat, setActiveCourseCat] = useState<string>('all');
  const [activeBookCat, setActiveBookCat] = useState<string>('all');
  const [activeFreeCat, setActiveFreeCat] = useState<string>('all');
  const [activeElearningCat, setActiveElearningCat] = useState<string>('all');
  const [activeTestCat, setActiveTestCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* ===================== ROLE DETECTION (FIXED) ===================== */
  const getUserRole = (user: any) => {
    if (!user) return "GUEST";

    //  PRIMARY: backend role (authoritative)
    if (user.role) {
      const role = String(user.role).toLowerCase();
      if (role === "admin") return "ADMIN";
      if (role === "teacher") return "TEACHER";
      if (role === "student") return "STUDENT";
    }

    //  Legacy fallback (kept for safety)
    if (user?.A_email || user?.A_name) return "ADMIN";
    if (user?.T_email || user?.T_name || user?.temail) return "TEACHER";
    if (user?.email) return "STUDENT";

    return "GUEST";
  };

  /* ===================== DASHBOARD REDIRECTION (FIXED) ===================== */
  const handleDashboardAccess = () => {
    const role = getUserRole(loginUser);

    if (role === "ADMIN") {
      Swal.fire({
        icon: "warning",
        title: "Admin Account Detected",
        text: "You are logged in as an Admin.",
        confirmButtonText: "Go to Admin Dashboard",
        confirmButtonColor: "var(--primary)"
      }).then(() => {
        navigate("/admin-dashboard");
      });
      return;
    }

    if (role === "TEACHER") {
      Swal.fire({
        icon: "info",
        title: "Teacher Account Detected",
        text: "Redirecting to Teacher Dashboard.",
        confirmButtonText: "Go to Teacher Dashboard",
        confirmButtonColor: "var(--primary)"
      }).then(() => {
        navigate("/teacher-dashboard");
      });
      return;
    }

    if (role === "STUDENT") {
      navigate("/student-dashboard");
      return;
    }

    navigate("/student-login");
  };

  /* ===================== SAFE NAVIGATION ===================== */
  const safeNavigate = useCallback(
    (path: string) => {
      if (location.pathname === path) return;
      navigate(path);
      setActiveMenu(null);
      setMobileMenuVisible(false);
    },
    [navigate, location.pathname]
  );

  /* ===================== LOAD USER ===================== */
  const loadUser = useCallback(() => {
    const user = getStoredUser();
    if (!user) {
      setLoginUser({});
      const cart = JSON.parse(
        localStorage.getItem(getCartKey()) || "[]"
      );
      setCartCount(cart.length);
      return;
    }

    setLoginUser(user);

    const cart = JSON.parse(
      localStorage.getItem(getCartKey()) || "[]"
    );
    setCartCount(cart.length);
  }, []);

  useEffect(() => {
    loadUser();
  }, [location.pathname, loadUser]);

  // Listen for login/logout events from other components
  useEffect(() => {
    window.addEventListener("auth-updated", loadUser);
    window.addEventListener("cart-updated", loadUser);
    return () => {
      window.removeEventListener("auth-updated", loadUser);
      window.removeEventListener("cart-updated", loadUser);
    };
  }, [loadUser]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ===================== FETCH MENU DATA ===================== */
  useEffect(() => {
    fetch(`${url}/course/categories?active=true`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => setCourseCategories(d.data?.categories || []));

    fetch(`${url}/books/categories/all`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => setBookCategories(d.categories || []));

    fetch(`${url}/test-series/navigation/examinations?limit=0`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d =>
        setTestSeriesCategories(d.data?.examinationCategories || d.examinationCategories || [])
      );

    fetch(`${url}/exam-categories/all`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => setExamCategories(d.categories || []));

    fetch(`${url}/course/allCourses`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        const courses = d.data?.courses || d.data || [];
        setAllCourses(courses);
      })
      .catch(() => { });

    fetch(`${url}/books/approved?page=1&limit=80`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        const books = d.books || d.data?.books || [];
        setAllBooks(books);
      })
      .catch(() => { });

    fetch(`${url}/exams/all?limit=500`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => setExamSections(d.exams || []));
  }, []);

  /* ===================== LOGOUT ===================== */
  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      showCancelButton: true,
      confirmButtonColor: "var(--primary)"
    }).then(r => {
      if (r.isConfirmed) {
        localStorage.clear();
        window.location.reload();
      }
    });
  };

  /* ===================== SMART SEARCH ===================== */
  const fetchSearchResults = async (value: string) => {
    if (!value.trim()) {
      setSearchResults([]);
      setTypeCounts({});
      setSearchTotal(0);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await fetch(`${url}/search/global?q=${encodeURIComponent(value.trim())}&limit=20`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        // Exclude test-series  we only show exam-topics page
        const results = (data.data?.results || []).filter((r: any) => r.type !== "test-series");
        const counts: Record<string, number> = {};
        results.forEach((r: any) => { counts[r.type] = (counts[r.type] || 0) + 1; });
        setSearchResults(results);
        setTypeCounts(counts);
        setSearchTotal(results.length);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const goToDeepSearch = (query: string) => {
    if (!query.trim()) return;
    const newItem: RecentSearchItem = {
      title: query.trim(),
      isTerm: true
    };
    const updated = [newItem, ...recentSearches.filter((s: any) => s.title !== newItem.title)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("draa_recent_searches", JSON.stringify(updated));
    setSearchVisible(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const fetchTrending = async () => {
    setTrendingLoading(true);
    try {
      const res = await fetch(`${url}/search/trending`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setTrendingSearches(data.data || []);
    } catch { } finally { setTrendingLoading(false); }
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("draa_recent_searches");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(item => {
            if (typeof item === 'string') {
              return { title: item, isTerm: true };
            }
            return item;
          });
          setRecentSearches(normalized);
        }
      } catch { }
    }
  }, []);

  // Sync search from external components (e.g. Breadcrumb)
  useEffect(() => {
    const handleGlobalSearchTrigger = (e: any) => {
      const { query } = e.detail;
      if (query) {
        setSearchVisible(true);
        setSearchQuery(query);
        fetchSearchResults(query);
      }
    };

    window.addEventListener('global-search-trigger', handleGlobalSearchTrigger);
    return () => window.removeEventListener('global-search-trigger', handleGlobalSearchTrigger);
  }, []);

  const handleSearchResultClick = (result: any) => {
    if (!result.url) return;
    const newItem: RecentSearchItem = {
      id: result._id || result.id || Math.random().toString(),
      title: result.plainTitle || result.title || "",
      subtitle: result.category || getTypeLabel(result.type) || "",
      thumbnail: result.thumbnail || "",
      type: result.type,
      url: result.url,
      isTerm: false
    };
    const updated = [newItem, ...recentSearches.filter((s: any) => s.title !== newItem.title)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("draa_recent_searches", JSON.stringify(updated));
    setSearchVisible(false);
    setSearchQuery("");
    setSearchResults([]);
    setFocusedIndex(-1);
    safeNavigate(result.url);
  };

  const handleDeleteRecentSearch = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s.title !== item.title);
    setRecentSearches(updated);
    localStorage.setItem("draa_recent_searches", JSON.stringify(updated));
  };

  const handleTrendingClick = (title: string) => {
    setSearchQuery(title);
    fetchSearchResults(title);
  };

  const handleRecentClick = (item: any) => {
    if (item.isTerm) {
      setSearchQuery(item.title);
      fetchSearchResults(item.title);
    } else if (item.url) {
      setSearchVisible(false);
      setSearchQuery("");
      setSearchResults([]);
      setFocusedIndex(-1);
      safeNavigate(item.url);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchSearchResults(value);
    }, 300),
    []
  );

  // Open search  load trending
  const openSearch = () => {
    setSearchVisible(true);
    setSelectedType("all");
    setFocusedIndex(-1);
    fetchTrending();
    // Auto-focus input after modal opens
    setTimeout(() => searchInputRef.current?.focus(), 80);
  };

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && searchVisible) {
        setSearchVisible(false);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedType("all");
        setFocusedIndex(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchVisible]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchVisible(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ===================== MEGA MENU HELPERS ===================== */
  const EXAM_COLORS = [
    'linear-gradient(135deg, #e74c3c, #c0392b)',
    'linear-gradient(135deg, #3498db, #2980b9)',
    'linear-gradient(135deg, #2ecc71, #27ae60)',
    'linear-gradient(135deg, #9b59b6, #8e44ad)',
    'linear-gradient(135deg, #f39c12, #d68910)',
    'linear-gradient(135deg, #1abc9c, #16a085)',
    'linear-gradient(135deg, #e67e22, #d35400)',
    'linear-gradient(135deg, #34495e, #2c3e50)',
  ];
  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      course: '#52c41a', book: '#fa8c16', 'test-series': '#eb2f96',
      examination: '#722ed1', subject: '#13c2c2', topic: '#eb2f96',
      pyq: '#faad14', syllabus: '#52c41a', blog: '#13c2c2',
      'current-affair': '#1890ff', job: '#faad14', category: '#9b6118',
      teacher: '#eb2f96', exam: '#722ed1',
    };
    return map[type] || '#1890ff';
  };
  const getTypeBg = (type: string) => {
    const map: Record<string, string> = {
      course: '#f6ffed', book: '#fff7e6', 'test-series': '#fff0f6',
      examination: '#f9f0ff', subject: '#e6fffb', topic: '#fff0f6',
      pyq: '#fffbe6', syllabus: '#f6ffed', blog: '#e6fffb',
      'current-affair': '#e6f7ff', job: '#fffbe6', category: '#f0f5ff',
      teacher: '#fff0f6', exam: '#f9f0ff',
    };
    return map[type] || '#e6f7ff';
  };
  const getTypeBorder = (type: string) => {
    const map: Record<string, string> = {
      course: '#b7eb8f', book: '#ffd591', 'test-series': '#ffadd6',
      examination: '#d3adf7', subject: '#87e8de', topic: '#ffadd6',
      pyq: '#ffe58f', syllabus: '#b7eb8f', blog: '#87e8de',
      'current-affair': '#91d5ff', job: '#ffe58f', category: '#adc6ff',
      teacher: '#ffadd6', exam: '#d3adf7',
    };
    return map[type] || '#91d5ff';
  };
  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      course: 'Course', book: 'Book', 'test-series': 'Test Series',
      examination: 'Exam', subject: 'Subject', topic: 'Topic',
      pyq: 'PYQ', syllabus: 'Syllabus', blog: 'Blog',
      'current-affair': 'Current Affair', job: 'Notifications', category: 'Category',
      teacher: 'Teacher', exam: 'Exam',
    };
    return map[type] || type;
  };
  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      course: <BookOpen size={18} />, book: <BookOpen size={18} />,
      'test-series': <Layers size={18} />, examination: <GraduationCap size={18} />,
      subject: <GraduationCap size={18} />, topic: <Layers size={18} />,
      pyq: <BookOpen size={18} />, syllabus: <BookOpen size={18} />,
      blog: <BookOpen size={18} />, 'current-affair': <BookOpen size={18} />,
      job: <Briefcase size={18} />, category: <Layers size={18} />,
      teacher: <User size={18} />, exam: <GraduationCap size={18} />,
    };
    return icons[type] || <SearchIcon size={18} />;
  };

  const BOOK_ICONS_POOL = [
    <BookOpen size={20} color="white" />,
    <Book size={20} color="white" />,
    <Bookmark size={20} color="white" />,
    <FileText size={20} color="white" />,
    <Library size={20} color="white" />,
    <Notebook size={20} color="white" />,
    <Compass size={20} color="white" />,
    <DraftingCompass size={20} color="white" />,
    <Globe size={20} color="white" />,
    <Languages size={20} color="white" />
  ];

  const EXAM_ICONS_POOL = [
    <GraduationCap size={20} color="white" />,
    <Briefcase size={20} color="white" />,
    <Award size={20} color="white" />,
    <Target size={20} color="white" />,
    <TrendingUp size={20} color="white" />,
    <CheckCircle size={20} color="white" />,
    <Zap size={20} color="white" />,
    <Users size={20} color="white" />
  ];

  const EXAM_CAT_COLORS = [
    '#bd7b20', '#e74c3c', '#3498db', '#2ecc71',
    '#9b59b6', '#f39c12', '#1abc9c', '#e67e22',
  ];

  const getExamCategoryMeta = (name: string, index: number) => {
    const n = (name || '').toLowerCase().trim();
    if (n.includes('ssc')) {
      return { icon: <Award size={15} />, bg: '#fee2e2', color: '#ef4444' };
    }
    if (n.includes('bank') || n.includes('insurance')) {
      return { icon: <Landmark size={15} />, bg: '#dbeafe', color: '#2563eb' };
    }
    if (n.includes('teach')) {
      return { icon: <GraduationCap size={15} />, bg: '#dcfce7', color: '#16a34a' };
    }
    if (n.includes('rail')) {
      return { icon: <Train size={15} />, bg: '#fee2e2', color: '#dc2626' };
    }
    if (n.includes('defenc') || n.includes('defense')) {
      return { icon: <ShieldCheck size={15} />, bg: '#ecfccb', color: '#65a30d' };
    }
    if (n.includes('state') || n.includes('govt') || n.includes('civil') || n.includes('regulatory') || n.includes('bihar') || n.includes('haryana') || n.includes('up') || n.includes('mp') || n.includes('jk') || n.includes('punjab') || n.includes('karnataka')) {
      return { icon: <Building2 size={15} />, bg: '#f3e8ff', color: '#9333ea' };
    }
    if (n.includes('police')) {
      return { icon: <ShieldAlert size={15} />, bg: '#fef3c7', color: '#d97706' };
    }
    if (n.includes('engg') || n.includes('engineer')) {
      return { icon: <DraftingCompass size={15} />, bg: '#e0f2fe', color: '#0284c7' };
    }
    if (n.includes('nurs') || n.includes('medical') || n.includes('health')) {
      return { icon: <Cross size={15} />, bg: '#ccfbf1', color: '#0d9488' };
    }
    if (n.includes('law') || n.includes('judic')) {
      return { icon: <Scale size={15} />, bg: '#fef3c7', color: '#b45309' };
    }
    if (n.includes('mba') || n.includes('management')) {
      return { icon: <TrendingUp size={15} />, bg: '#f3e8ff', color: '#7e22ce' };
    }
    if (n.includes('other')) {
      return { icon: <MoreHorizontal size={15} />, bg: '#f1f5f9', color: '#475569' };
    }

    const PALETTE = [
      { bg: '#fee2e2', color: '#ef4444', icon: <Award size={15} /> },
      { bg: '#dbeafe', color: '#2563eb', icon: <Landmark size={15} /> },
      { bg: '#dcfce7', color: '#16a34a', icon: <GraduationCap size={15} /> },
      { bg: '#fee2e2', color: '#dc2626', icon: <Train size={15} /> },
      { bg: '#ecfccb', color: '#65a30d', icon: <ShieldCheck size={15} /> },
      { bg: '#f3e8ff', color: '#9333ea', icon: <Building2 size={15} /> },
      { bg: '#fef3c7', color: '#d97706', icon: <ShieldAlert size={15} /> },
      { bg: '#e0f2fe', color: '#0284c7', icon: <DraftingCompass size={15} /> },
    ];
    return PALETTE[index % PALETTE.length];
  };

  /* Default exam categories matching screenshot */
  const DEFAULT_EXAM_CATEGORIES = [
    { id: 'ssc', name: 'SSC Exams', color: '#ef4444', count: 12 },
    { id: 'banking', name: 'Banking Exams', color: '#2563eb', count: 15 },
    { id: 'teaching', name: 'Teaching Exams', color: '#16a34a', count: 8 },
    { id: 'railways', name: 'Railways Exams', color: '#dc2626', count: 28 },
    { id: 'defence', name: 'Defence Exams', color: '#65a30d', count: 10 },
    { id: 'state-govt', name: 'State Govt. Exams', color: '#9333ea', count: 18 },
    { id: 'police', name: 'Police Exams', color: '#d97706', count: 14 },
    { id: 'engineering', name: 'Engineering Exams', color: '#0284c7', count: 12 },
    { id: 'nursing', name: 'Nursing Exams', color: '#0d9488', count: 6 },
    { id: 'law', name: 'Law Exams', color: '#b45309', count: 5 },
    { id: 'mba', name: 'MBA Entrance', color: '#7e22ce', count: 7 },
    { id: 'other', name: 'Other Exams', color: '#475569', count: 9 },
  ];

  /* Default popular exams matching screenshot */
  const DEFAULT_POPULAR_EXAMS = [
    { id: 'rrb-ntpc', name: 'RRB NTPC', slug: 'rrb-ntpc', catSlug: 'railways', examImage: '' },
    { id: 'rrb-alp', name: 'RRB ALP', slug: 'rrb-alp', catSlug: 'railways', examImage: '' },
    { id: 'rrb-group-d', name: 'RRB Group D', slug: 'rrb-group-d', catSlug: 'railways', examImage: '' },
    { id: 'rrb-technician', name: 'RRB Technician', slug: 'rrb-technician', catSlug: 'railways', examImage: '' },
    { id: 'rrb-je', name: 'RRB JE', slug: 'rrb-je', catSlug: 'railways', examImage: '' },
    { id: 'rpf-constable', name: 'RPF Constable', slug: 'rpf-constable', catSlug: 'railways', examImage: '' },
    { id: 'rpf-si', name: 'RPF SI', slug: 'rpf-si', catSlug: 'railways', examImage: '' },
    { id: 'rrb-paramedical', name: 'RRB Paramedical', slug: 'rrb-paramedical', catSlug: 'railways', examImage: '' },
    { id: 'railway-tc', name: 'Railway TC', slug: 'railway-tc', catSlug: 'railways', examImage: '' },
    { id: 'railway-guard', name: 'Railway Guard', slug: 'railway-guard', catSlug: 'railways', examImage: '' },
    { id: 'railway-goods-guard', name: 'Railway Goods Guard', slug: 'railway-goods-guard', catSlug: 'railways', examImage: '' },
    { id: 'railway-pharmacist', name: 'Railway Pharmacist', slug: 'railway-pharmacist', catSlug: 'railways', examImage: '' },
    { id: 'railway-asm', name: 'Railway ASM', slug: 'railway-asm', catSlug: 'railways', examImage: '' },
    { id: 'railway-ticket-collector', name: 'Railway Ticket Collector', slug: 'railway-ticket-collector', catSlug: 'railways', examImage: '' },
    { id: 'railway-tte', name: 'Railway TTE', slug: 'railway-tte', catSlug: 'railways', examImage: '' },
    { id: 'rrb-junior-translator', name: 'RRB Junior Translator', slug: 'rrb-junior-translator', catSlug: 'railways', examImage: '' },
    { id: 'railway-stenographer', name: 'Railway Stenographer', slug: 'railway-stenographer', catSlug: 'railways', examImage: '' },
    { id: 'railway-prt', name: 'Railway PRT', slug: 'railway-prt', catSlug: 'railways', examImage: '' },
    { id: 'rrb-je-ce', name: 'RRB JE CE', slug: 'rrb-je-ce', catSlug: 'railways', examImage: '' },
    { id: 'rrb-je-ee', name: 'RRB JE EE', slug: 'rrb-je-ee', catSlug: 'railways', examImage: '' },
    { id: 'rrb-je-ec', name: 'RRB JE EC', slug: 'rrb-je-ec', catSlug: 'railways', examImage: '' },
    { id: 'rrb-je-me', name: 'RRB JE ME', slug: 'rrb-je-me', catSlug: 'railways', examImage: '' },
    { id: 'rrb-je-it', name: 'RRB JE IT', slug: 'rrb-je-it', catSlug: 'railways', examImage: '' },
    { id: 'rrb-cma', name: 'RRB CMA', slug: 'rrb-cma', catSlug: 'railways', examImage: '' },
    { id: 'rrb-ministerial', name: 'RRB Ministerial', slug: 'rrb-ministerial', catSlug: 'railways', examImage: '' },
    { id: 'dfccil-executive', name: 'DFCCIL Executive', slug: 'dfccil-executive', catSlug: 'railways', examImage: '' },
    { id: 'dfccil-mts', name: 'DFCCIL MTS', slug: 'dfccil-mts', catSlug: 'railways', examImage: '' },
    { id: 'dfccil-jr-exec', name: 'DFCCIL Junior Executive', slug: 'dfccil-jr-exec', catSlug: 'railways', examImage: '' },
    { id: 'dmrc-cra', name: 'DMRC CRA', slug: 'dmrc-cra', catSlug: 'railways', examImage: '' },
    { id: 'ssc-cgl', name: 'SSC CGL', slug: 'ssc-cgl', catSlug: 'ssc', examImage: '' },
    { id: 'ssc-chsl', name: 'SSC CHSL', slug: 'ssc-chsl', catSlug: 'ssc', examImage: '' },
    { id: 'sbipo', name: 'SBI PO', slug: 'sbi-po', catSlug: 'banking', examImage: '' },
    { id: 'sbiclerk', name: 'SBI Clerk', slug: 'sbi-clerk', catSlug: 'banking', examImage: '' },
  ];

  /* Category exam mapping helper */
  const getExamsForCategory = (catId: string) => {
    const allExams = examSections.length > 0 ? examSections : DEFAULT_POPULAR_EXAMS;
    if (catId === 'all') return allExams;

    if (examCategories.length > 0) {
      const cat = examCategories.find((c: any) => c._id === catId);
      if (cat) {
        return allExams.filter((e: any) => {
          const examCatId = typeof e.categoryId === 'object' ? (e.categoryId?._id || e.categoryId?.id) : e.categoryId;
          return String(examCatId) === String(cat._id);
        });
      }
    }

    return allExams.filter((e: any) => {
      const examCatId = typeof e.categoryId === 'object' ? (e.categoryId?._id || e.categoryId?.id) : e.categoryId;
      return String(examCatId) === String(catId) || e.catSlug === catId;
    });
  };

  const getSidebarCategories = () => {
    const allExams = examSections.length > 0 ? examSections : DEFAULT_POPULAR_EXAMS;
    if (examCategories.length > 0) {
      return examCategories.map((cat: any, i: number) => {
        const examCount = allExams.filter((e: any) => {
          const examCatId = typeof e.categoryId === 'object' ? (e.categoryId?._id || e.categoryId?.id) : e.categoryId;
          return String(examCatId) === String(cat._id);
        }).length;
        return {
          id: cat._id,
          name: cat.name,
          slug: cat._id,
          color: EXAM_CAT_COLORS[i % EXAM_CAT_COLORS.length],
          count: examCount,
        };
      });
    }
    return DEFAULT_EXAM_CATEGORIES.map((cat: any, i: number) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.id,
      color: cat.color || EXAM_CAT_COLORS[i % EXAM_CAT_COLORS.length],
      count: cat.count || 0,
    }));
  };

  /* Courses sidebar categories  match course.course_category (string) with cat.name */
  const getCourseSidebarCats = () => {
    if (courseCategories.length > 0) {
      return courseCategories.slice(0, 8).map((cat: any, i: number) => {
        const count = allCourses.filter((c: any) => {
          const courseCat = (c.course_category || '').toLowerCase().trim();
          return courseCat === (cat.name || '').toLowerCase().trim();
        }).length;
        return {
          id: cat._id,
          name: cat.name,
          slug: cat._id,
          color: EXAM_CAT_COLORS[i % EXAM_CAT_COLORS.length],
          count,
        };
      });
    }
    return [];
  };

  /* Courses filtered by category  course.course_category is a string */
  const getCoursesForCat = (catId: string) => {
    if (catId === 'all') return allCourses.slice(0, 8);
    const cat = courseCategories.find((c: any) => c._id === catId);
    if (!cat) return [];
    return allCourses.filter((c: any) => {
      const courseCat = (c.course_category || '').toLowerCase().trim();
      return courseCat === (cat.name || '').toLowerCase().trim();
    }).slice(0, 8);
  };

  /* Use bilingual demo books only when the local database has no books yet. */
  const booksForMenu = allBooks.length > 0 ? allBooks : DEMO_BOOKS;
  const categoriesForBookMenu = allBooks.length > 0 ? bookCategories : DEMO_BOOK_CATEGORIES;

  const getLocalizedBookCategory = (cat: any) =>
    isHindi && cat?.nameHi ? cat.nameHi : t(cat?.name || '');

  const getLocalizedBookTitle = (book: any) =>
    isHindi && book?.isDemo && book?.titleHi ? book.titleHi : book?.title || '';

  const getLocalizedBookAuthor = (book: any) =>
    isHindi && book?.isDemo && book?.authorHi
      ? book.authorHi
      : book?.author || (isHindi ? 'DRAA संपादकीय मंडल' : 'DRAA Editorial Team');

  /* Books sidebar categories  book.category is { name: string } after normalization */
  const getBookSidebarCats = () => {
    if (categoriesForBookMenu.length > 0) {
      return categoriesForBookMenu.slice(0, 8).map((cat: any, i: number) => {
        const catName = (cat.name || '').toLowerCase().trim();
        const count = booksForMenu.filter((b: any) => {
          if (b.isDemo) return b.demoCategoryIds?.includes(cat._id);
          const bCatName = (b.category?.name || b.category || '').toLowerCase().trim();
          return bCatName === catName;
        }).length;
        return {
          id: cat._id,
          name: cat.name,
          nameHi: cat.nameHi,
          slug: cat._id,
          color: EXAM_CAT_COLORS[i % EXAM_CAT_COLORS.length],
          count,
        };
      });
    }
    return [];
  };

  /* Books filtered by category  book.category is { name: string } */
  const getBooksForCat = (catId: string) => {
    if (catId === 'all') return booksForMenu.slice(0, 8);
    const cat = categoriesForBookMenu.find((c: any) => c._id === catId);
    if (!cat) return [];
    const catName = (cat.name || '').toLowerCase().trim();
    return booksForMenu.filter((b: any) => {
      if (b.isDemo) return b.demoCategoryIds?.includes(catId);
      const bCatName = (b.category?.name || b.category || '').toLowerCase().trim();
      return bCatName === catName;
    }).slice(0, 8);
  };

  const getBookMinPrice = (book: any) => {
    const prices = [];
    if (book.digitalPrice && book.digitalPrice > 0) prices.push(book.digitalPrice);
    if (book.physicalPrice && book.physicalPrice > 0) prices.push(book.physicalPrice);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  /* Helper group mappings and items for E-learning Services */
  const elearningServices = [
    { title: "Website Development", path: "/e-learning/website-development", desc: "Custom LMS & Portals", icon: Monitor, cat: "web-app" },
    { title: "Mobile App Development", path: "/e-learning/mobile-app-development", desc: "iOS & Android Apps", icon: Smartphone, cat: "web-app" },
    { title: "Academic Content", path: "/e-learning/academic-content", desc: "Specialized Exam Content", icon: FileText, cat: "content" },
    { title: "White Label Content", path: "/e-learning/white-label-content", desc: "Rebrandable Courses", icon: Package, cat: "content" },
    { title: "Digital Content Creation", path: "/e-learning/digital-content-creation", desc: "Multimedia & Animations", icon: Video, cat: "content" },
    { title: "Exam Management", path: "/e-learning/exam-management", desc: "Testing & Proctoring", icon: ClipboardCheck, cat: "business" },
    { title: "Digital Marketing", path: "/e-learning/digital-marketing", desc: "Ed-Tech Promotion", icon: Megaphone, cat: "business" },
    { title: "Managed Services", path: "/e-learning/managed-services", desc: "Business-in-a-Box", icon: ShieldCheck, cat: "business" },
  ];

  const getElearningSidebarCats = () => [
    { id: "web-app", name: "Web & App Development", count: elearningServices.filter(s => s.cat === "web-app").length },
    { id: "content", name: "Content Services", count: elearningServices.filter(s => s.cat === "content").length },
    { id: "business", name: "Business Solutions", count: elearningServices.filter(s => s.cat === "business").length },
  ];

  const getElearningServicesForCat = (catId: string) => {
    if (catId === 'all') return elearningServices;
    return elearningServices.filter(s => s.cat === catId);
  };

  /* Helper group mappings and items for Free Resources */
  const freeResourcesItems = [
    { title: "Notifications", path: "/jobs-notifications", desc: "Latest government job updates", icon: Bell, cat: "jobs-syllabus", bg: "#ede9fe", color: "#66735b" },
    { title: "Exam Syllabus", path: "/syllabus", desc: "Detailed syllabus for all exams", icon: FileText, cat: "jobs-syllabus", bg: "#dbeafe", color: "#2563eb" },
    { title: "Current Affairs", path: "/current-affairs", desc: "Daily & monthly updates", icon: Newspaper, cat: "study", bg: "#dcfce7", color: "#16a34a" },
    { title: "Previous Year Papers", path: "/previous-year-questions", desc: "Solve real exam papers", icon: Brain, cat: "study", bg: "#ffedd5", color: "#ea580c" },
    { title: "Educational Blogs", path: "/grid-blog", desc: "Tips, tricks & strategies", icon: BookOpen, cat: "media-blogs", bg: "#fce7f3", color: "#db2777" },
    { title: "Recorded Videos", path: "/recorded-videos", desc: "High-quality video lectures", icon: Video, cat: "media-blogs", bg: "#ccfbf1", color: "#0d9488" },
  ];

  const getFreeResourcesSidebarCats = () => [
    { id: "jobs-syllabus", name: "Jobs & Syllabus", count: freeResourcesItems.filter(r => r.cat === "jobs-syllabus").length },
    { id: "study", name: "Study Materials", count: freeResourcesItems.filter(r => r.cat === "study").length },
    { id: "media-blogs", name: "Media & Blogs", count: freeResourcesItems.filter(r => r.cat === "media-blogs").length },
    { id: "govt", name: "Government Updates", count: 0 },
  ];

  const getFreeResourcesForCat = (catId: string) => {
    if (catId === 'all') return freeResourcesItems;
    if (catId === 'govt') return freeResourcesItems.filter(r => r.cat === 'jobs-syllabus');
    return freeResourcesItems.filter(r => r.cat === catId);
  };

  /* Helper group mappings and items for Test Series */
  const getTestSidebarCats = () => {
    if (testSeriesCategories.length > 0) {
      return testSeriesCategories.map((cat: any) => ({
        id: cat._id,
        name: cat.name || `${cat.code || ''} ${cat.year || ''}`.trim(),
        count: cat.statistics?.totalTestSeries || 1
      }));
    }
    return [];
  };

  const getTestSeriesForCat = (catId: string) => {
    if (catId === 'all') return testSeriesCategories;
    return testSeriesCategories.filter((t: any) => {
      const examCatId = typeof t.categoryId === 'object' ? (t.categoryId?._id || t.categoryId?.id) : (t.categoryId || t._id);
      return String(examCatId) === String(catId);
    });
  };

  const menuCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavMouseEnter = (menu: string) => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }
    setActiveMenu(menu);
  };

  const handleMenuMouseLeave = () => {
    menuCloseTimer.current = setTimeout(() => {
      setActiveMenu(null);
    }, 80);
  };

  const handleMegaMouseEnter = () => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }
  };
  return (
    <>
      <header className={`ed-header ${isScrolled ? 'scrolled' : ''} ${isDraa ? 'draa-header' : ''}`}>
        {/* Tier 1: Top Bar */}
        <div className="header-top">
          <div className="header-top-container">
            {isDraa ? (
              <button
                type="button"
                className="draa-brand-lockup"
                aria-label="Draa home"
                onClick={() => safeNavigate("/")}
              >
                <img src="/brand/draa-mark.png" className="draa-brand-mark" alt="" />
                <span className="draa-brand-word">DRAA</span>
              </button>
            ) : (
              <img src="/brand/draa-mark.png" className="logo" alt="Myedudocs" onClick={() => safeNavigate("/")} />
            )}

            {isDraa && (
              <div className="draa-language-switch" role="group" aria-label="Choose language">
                <button
                  type="button"
                  className={activeLanguage === 'en' ? 'active' : ''}
                  onClick={() => changeLanguage('en')}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={activeLanguage === 'hi' ? 'active' : ''}
                  onClick={() => changeLanguage('hi')}
                >
                  हिं
                </button>
              </div>
            )}

            <div className={`header-search-container ${searchVisible ? 'search-active' : ''}`} ref={searchContainerRef}>
              {searchVisible ? (
                <button
                  className="header-search-back-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchVisible(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 4px 0 0' }}
                >
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <SearchIcon size={18} className="h-search-icon" />
              )}
              <input
                type="text"
                ref={searchInputRef}
                placeholder={isHindi ? "परीक्षा, कोर्स, किताबें और अधिक खोजें..." : "Search for Exams, Courses, Books & More..."}
                value={searchQuery}
                onFocus={openSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setSelectedType("all");
                  setFocusedIndex(-1);
                  if (!searchVisible) setSearchVisible(true);
                  debouncedSearch(val);
                }}
                onKeyDown={(e) => {
                  const filtered = searchResults.filter(r => selectedType === "all" || r.type === selectedType);
                  if (e.key === 'Enter') {
                    if (focusedIndex >= 0 && filtered[focusedIndex]) {
                      handleSearchResultClick(filtered[focusedIndex]);
                    } else if (searchQuery.trim()) {
                      goToDeepSearch(searchQuery);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!searchVisible) setSearchVisible(true);
                    setFocusedIndex(prev => Math.min(prev + 1, filtered.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setFocusedIndex(prev => Math.max(prev - 1, -1));
                  } else if (e.key === 'Escape') {
                    setSearchVisible(false);
                  }
                }}
              />
              {searchQuery ? (
                <button
                  className="header-clear-input"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    setSearchResults([]);
                    setTypeCounts({});
                    setSearchTotal(0);
                  }}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="header-search-kbd">
                  <kbd>Ctrl</kbd><kbd>K</kbd>
                </span>
              )}

              {/* Autocomplete Dropdown overlay directly under the search bar */}
              {searchVisible && (
                <div className="search-dropdown-overlay" onClick={(e) => e.stopPropagation()}>
                  {/* Results State */}
                  {searchQuery && !searchLoading && searchResults.filter(r => selectedType === "all" || r.type === selectedType).length > 0 && (
                    <>
                      {/* Type Filter Pills */}
                      {Object.keys(typeCounts).filter(([, c]) => (c as any) > 0).length > 0 && (
                        <div className="gs-type-pills">
                          <div
                            className={`gs-type-pill ${selectedType === "all" ? 'active' : ''}`}
                            onClick={() => setSelectedType("all")}
                          >
                            All ({searchTotal})
                          </div>
                          {Object.entries(typeCounts).filter(([, c]) => (c as number) > 0).map(([type, count]) => (
                            <div
                              key={type}
                              className={`gs-type-pill ${selectedType === type ? 'active' : ''}`}
                              onClick={() => setSelectedType(type)}
                              style={selectedType === type ? {} : {
                                borderColor: getTypeBorder(type),
                                color: getTypeColor(type),
                                background: getTypeBg(type),
                              }}
                            >
                              {getTypeLabel(type)} ({count})
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="gs-results-list">
                        {searchResults
                          .filter(r => selectedType === "all" || r.type === selectedType)
                          .slice(0, 5) // Limit to top 5 results for compact height
                          .map((result, idx) => (
                            <div
                              key={result._id}
                              className={`gs-result-card${focusedIndex === idx ? ' gs-result-card--focused' : ''}`}
                              onClick={() => handleSearchResultClick(result)}
                              onMouseEnter={() => setFocusedIndex(idx)}
                            >
                              <div className="gs-result-thumb" style={{ background: getTypeBg(result.type), borderColor: getTypeBorder(result.type) }}>
                                {result.thumbnail ? (
                                  <img src={getImageUrl(result.thumbnail)} alt={result.plainTitle || "Thumbnail"} />
                                ) : (
                                  <span style={{ color: getTypeColor(result.type) }}>{getTypeIcon(result.type)}</span>
                                )}
                                <div className="gs-play-overlay" style={{ background: `linear-gradient(135deg, ${getTypeColor(result.type)}, ${getTypeColor(result.type)}dd)` }}>
                                  <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                </div>
                              </div>
                              <div className="gs-result-body">
                                <div className="gs-result-title-row">
                                  <span className="gs-result-title" dangerouslySetInnerHTML={{ __html: result.plainTitle || result.title || "" }} />
                                  {result.price !== undefined && (
                                    <div className="gs-result-price">
                                      <span className="gs-sale-price" style={{ color: getTypeColor(result.type) }}>
                                        {result.price === 0 ? 'FREE' : `₹${result.price}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="gs-result-meta">
                                  <span className="gs-result-type-badge" style={{ background: getTypeBg(result.type), borderColor: getTypeBorder(result.type), color: getTypeColor(result.type) }}>
                                    {getTypeLabel(result.type)}
                                  </span>
                                  {result.category && <span className="gs-result-category">{result.category}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* View All Footer */}
                      <div className="gs-view-all-footer" onClick={() => goToDeepSearch(searchQuery)}>
                        <SearchIcon size={13} />
                            <span>{isHindi ? "सभी परिणाम देखें" : "View all results for"} <strong>"{searchQuery}"</strong></span>
                        <ArrowRight size={13} />
                      </div>
                    </>
                  )}

                  {/* Loading State */}
                  {searchLoading && (
                    <div className="gs-loading-compact" style={{ textAlign: 'center', padding: '20px 0' }}>
                          <span className="gs-loading-dots">{isHindi ? "सभी संसाधनों में खोज जारी है..." : "Searching all resources..."}</span>
                    </div>
                  )}

                  {/* Empty Result State */}
                  {!searchLoading && searchQuery && searchResults.length === 0 && (
                    <div className="gs-empty-state-compact" style={{ textAlign: 'center', padding: '20px 10px' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#111827' }}>
                            {isHindi ? `"${searchQuery}" के लिए कोई परिणाम नहीं मिला` : `No results found for "${searchQuery}"`}
                          </p>
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>Try different keywords or look below.</p>
                    </div>
                  )}

                  {/* Welcome State (Empty Query) */}
                  {!searchQuery && (
                    <div className="gs-welcome-compact" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="gs-section-compact">
                          <div className="gs-section-head-compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Recent Searches</span>
                            <button className="gs-clear-btn" onClick={() => { setRecentSearches([]); localStorage.removeItem("draa_recent_searches"); }}>Clear all</button>
                          </div>
                          <div className="gs-recent-spotify-list-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {recentSearches.map((s: any, i) => (
                              <div key={i} className="gs-recent-spotify-item-vertical" onClick={() => handleRecentClick(s)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}>
                                <div className="gs-recent-item-thumb-wrap-vertical" style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                  {s.isTerm ? (
                                    <div style={{ background: '#f3f4f6', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: '#6b7280' }}><Clock size={13} /></div>
                                  ) : s.thumbnail ? (
                                    <img src={getImageUrl(s.thumbnail)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={s.title || s.plainTitle || "Thumbnail"} />
                                  ) : (
                                    <div style={{ background: getTypeBg(s.type), color: getTypeColor(s.type), width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{getTypeIcon(s.type)}</div>
                                  )}
                                </div>
                                <div className="gs-recent-item-body-vertical" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</span>
                                  <span style={{ fontSize: '10.5px', color: '#6b7280' }}>
                                    {s.isTerm ? 'Search query' : `${getTypeLabel(s.type)}`}
                                  </span>
                                </div>
                                <button
                                  className="gs-recent-item-remove-vertical"
                                  onClick={(e) => handleDeleteRecentSearch(e, s)}
                                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trending */}
                      <div className="gs-section-compact">
                        <div className="gs-section-head-compact" style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={12} /> Trending</span>
                        </div>
                        <div className="gs-tag-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {trendingSearches.slice(0, 5).map((t, i) => (
                            <div key={i} className="gs-tag gs-tag-trending" onClick={() => handleTrendingClick(t.title)} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer' }}>
                              <Flame size={10} style={{ marginRight: '2px' }} /> {t.title}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Browse Categories */}
                      <div className="gs-section-compact">
                        <div className="gs-section-head-compact" style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}><Crown size={12} /> Browse Categories</span>
                        </div>
                        <div className="gs-category-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {[
                            { icon: <BookOpen size={24} />, label: 'Courses', bg: '#27856a', path: '/courses' },
                            { icon: <Book size={24} />, label: 'Books', bg: '#1e3264', path: '/all-books' },
                            { icon: <Layers size={24} />, label: 'Test Series', bg: '#8d67ab', path: '/online-test-series' },
                            { icon: <GraduationCap size={24} />, label: 'Exams', bg: '#e8115b', path: '/test-series/examinations' },
                            { icon: <Briefcase size={24} />, label: 'Jobs', bg: '#148a08', path: '/jobs-notifications' },
                            { icon: <TrendingUp size={24} />, label: 'Updates', bg: '#ba5d07', path: '/ca' },
                          ].map(cat => (
                            <div key={cat.path} className="gs-cat-card" style={{ background: cat.bg, height: '64px', minHeight: '64px', aspectRatio: 'unset', padding: '10px 12px' }} onClick={() => { setSearchVisible(false); navigate(cat.path); }}>
                              <span className="gs-cat-label" style={{ fontSize: '13px' }}>{t(cat.label)}</span>
                              <div className="gs-cat-icon" style={{ fontSize: '32px', width: '48px', height: '48px', bottom: '-8px', right: '-8px' }}>{cat.icon}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="actions">
              <SearchIcon className="icon mobile-search-trigger" onClick={openSearch} />
              <div className="header-app-badges">
                <div className="play-store-badge" onClick={() => window.open('https://play.google.com/store/apps', '_blank')}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
                </div>
                <button
                  className="header-teams-btn"
                  onClick={() => safeNavigate("/teams")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #bd7b20 0%, #00d2fe 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0 18px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    height: "38px",
                    boxShadow: "0 4px 12px rgba(91, 108, 255, 0.15)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(91, 108, 255, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(91, 108, 255, 0.15)";
                  }}
                >
                  <Users size={16} fill="none" stroke="currentColor" />
                  <span>{isHindi ? 'हमारी टीम' : 'Meet Our Team'}</span>
                </button>
              </div>

              {(!isAuthenticated() || getUserRole(loginUser) === "STUDENT") && (
                <Badge count={cartCount} size="small" offset={[2, 2]} style={{ marginRight: 15 }}>
                  <ShoppingCart className="icon" onClick={() => safeNavigate("/cart")} />
                </Badge>
              )}

              {!isAuthenticated() && (
                <button className="login-btn desktop-login" onClick={() => openAuthModal("student")}>
                  {isHindi ? 'लॉगिन / साइन अप' : 'Login / Signup'}
                </button>
              )}

              {(loginUser?.id || loginUser?._id || loginUser?.token) && (
                <div className="header-user-profile">
                  <Dropdown
                    overlayStyle={{ zIndex: 12000 }}
                    menu={{
                      items: [
                        {
                          key: "user-info", label: (
                            <div style={{ padding: '4px 8px', borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
                              <Text strong style={{ display: 'block' }}>
                                {getUserRole(loginUser) === "ADMIN" ? "EduDocs Admin" : (loginUser?.name || loginUser?.T_name || loginUser?.A_name || loginUser?.tname || 'User')}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>{getUserRole(loginUser)}</Text>
                            </div>
                          ), disabled: true
                        },
                        { key: "d", label: t("Dashboard"), onClick: handleDashboardAccess },
                        { key: "l", label: t("Logout"), onClick: handleLogout }
                      ]
                    }}
                    trigger={['click']}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <span className="header-user-name">
                        {getUserRole(loginUser) === "ADMIN" ? "EduDocs Admin" : (loginUser?.name || loginUser?.T_name || loginUser?.tname || "User")}
                      </span>
                      <Avatar
                        src={getImageUrl(loginUser?.profile || loginUser?.T_profile || loginUser?.A_profile || loginUser?.tprofile)}
                        className="avatar-pointer"
                        style={{ backgroundColor: 'var(--primary)', border: '2px solid rgba(255,255,255,0.2)' }}
                      >
                        {(!loginUser?.profile && !loginUser?.T_profile && !loginUser?.A_profile && !loginUser?.tprofile) && (
                          (getUserRole(loginUser) === "ADMIN" ? "E" : (loginUser?.name || loginUser?.T_name || loginUser?.A_name || loginUser?.tname || 'U')).charAt(0).toUpperCase()
                        )}
                      </Avatar>
                    </div>
                  </Dropdown>
                </div>
              )}

              <Menu className="icon mobile-icon" onClick={() => setMobileMenuVisible(true)} />
            </div>
          </div>
          {/* Mobile Search Bar Row (Mobile only) */}
          <div className="mobile-search-row">
            <div className="mobile-search-bar" onClick={openSearch}>
              <SearchIcon size={16} className="mobile-search-bar-icon" />
              <span>{isHindi ? 'परीक्षा, कोर्स, किताबें और अधिक खोजें...' : 'Search for Exams, Courses, Books & More...'}</span>
            </div>
          </div>
        </div>

        {/* Tier 2: Bottom Navigation Bar */}
        <div className="header-bottom">
          <div className="header-bottom-container" onMouseLeave={handleMenuMouseLeave}>
            <nav className="nav">
              <span className={location.pathname === "/" ? "active" : ""} onClick={() => safeNavigate("/")}>
                {isHindi ? 'होम' : 'Home'}
              </span>

              <span
                onMouseEnter={() => handleNavMouseEnter("courses")}
                className={
                  location.pathname.startsWith("/courses") || location.pathname.startsWith("/course-details")
                    ? "active-trigger"
                    : activeMenu === "courses" ? "active-trigger" : ""
                }
                onClick={() => safeNavigate("/courses")}
              >
                {isHindi ? 'कोर्स' : 'Courses'} <ChevronDown size={14} />
              </span>

              <span
                onMouseEnter={() => handleNavMouseEnter("books")}
                className={
                  location.pathname.startsWith("/all-books") || location.pathname.startsWith("/book-details") || location.pathname.startsWith("/books")
                    ? "active-trigger"
                    : activeMenu === "books" ? "active-trigger" : ""
                }
              >
                {isHindi ? 'किताबें' : 'Books'} <ChevronDown size={14} />
              </span>

              <span
                onMouseEnter={() => handleNavMouseEnter("test")}
                className={
                  location.pathname.startsWith("/online-test-series") || location.pathname.startsWith("/exam-topics")
                    ? "active-trigger"
                    : activeMenu === "test" ? "active-trigger" : ""
                }
              >
                {isHindi ? 'टेस्ट सीरीज़' : 'Test Series'} <ChevronDown size={14} />
              </span>

              <span
                onMouseEnter={() => handleNavMouseEnter("exams")}
                className={
                  location.pathname.startsWith("/exams") || location.pathname.startsWith("/exam-sections") || location.pathname.startsWith("/exams-page")
                    ? "active-trigger"
                    : activeMenu === "exams" ? "active-trigger" : ""
                }
              >
                Exams <ChevronDown size={14} />
              </span>

              <span
                onMouseEnter={() => handleNavMouseEnter("free-resources")}
                className={
                  location.pathname.startsWith("/free-resources") || location.pathname.startsWith("/jobs-notifications") ||
                    location.pathname.startsWith("/syllabus") || location.pathname.startsWith("/current-affairs") ||
                    location.pathname.startsWith("/previous-year-questions") || location.pathname.startsWith("/grid-blog") ||
                    location.pathname.startsWith("/recorded-videos") || activeMenu === "free-resources"
                    ? "active-trigger" : ""
                }
              >
                {isHindi ? 'मुफ़्त संसाधन' : 'Free Resources'} <ChevronDown size={14} />
              </span>

              {/* <span onClick={() => safeNavigate("/jobs-notifications")} className={location.pathname ==="/jobs-notifications" ?"active" :""}>
                Notifications
              </span> */}

              {/* <span onClick={() => safeNavigate("/grid-blog")}>Blogs</span>
              <span onClick={() => safeNavigate("/contact")}>Contact</span> */}
              <span
                onMouseEnter={() => handleNavMouseEnter("elearning")}
                className={
                  location.pathname.startsWith("/e-learning")
                    ? "active-trigger"
                    : activeMenu === "elearning" ? "active-trigger" : ""
                }
              >
                {isHindi ? 'ई-लर्निंग' : 'E-Learning'} <ChevronDown size={14} />
              </span>
            </nav>

            {/* Premium Mega Menu (Desktop Only) anchored to the bottom tier */}
            {activeMenu && (
              <div className="mega-menu-container" onMouseEnter={handleMegaMouseEnter} onMouseLeave={handleMenuMouseLeave}>
                <div className="mega-content">

                  {/* Courses Mega Menu */}
                  {activeMenu === "courses" && (
                    <div className="exam-mega-wrapper">
                      {/* Sidebar */}
                      <div className="exam-sidebar">
                        <div className="exam-sidebar-list">
                          <div
                            className={`exam-sidebar-item ${activeCourseCat === 'all' ? 'active' : ''}`}
                            onMouseEnter={() => setActiveCourseCat('all')}
                            onClick={() => {
                              setActiveCourseCat('all');
                              safeNavigate("/courses");
                            }}
                          >
                              <span className="exam-sidebar-label">{t("All Courses")}</span>
                            <ChevronRight size={14} className="exam-sidebar-arrow" />
                          </div>
                          {getCourseSidebarCats().map((cat: any, i: number) => (
                            <div
                              key={cat.id}
                              className={`exam-sidebar-item ${activeCourseCat === cat.id ? 'active' : ''}`}
                              onMouseEnter={() => setActiveCourseCat(cat.id)}
                              onClick={() => setActiveCourseCat(cat.id)}
                            >
                               <span className="exam-sidebar-label">{t(cat.name)}</span>
                              <ChevronRight size={14} className="exam-sidebar-arrow" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Cards */}
                      <div className="exam-cards-panel">
                        <div className="exam-cards-header">
                          <span className="exam-cards-title">{t("Courses")}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="exam-cards-count">
                              {activeCourseCat === 'all'
                                ? allCourses.length
                                : allCourses.filter(c => (c.course_category || '').toLowerCase().trim() === (courseCategories.find(cat => cat._id === activeCourseCat)?.name || '').toLowerCase().trim()).length
                              } {isHindi ? "पाठ्यक्रम" : "courses"}
                            </span>
                            <span
                              className="view-all-link"
                              style={{
                                fontSize: '13px',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onClick={() => safeNavigate("/courses")}
                            >
                              {t("View All")} <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                        <div className="exam-cards-grid">
                          {getCoursesForCat(activeCourseCat).map((course: any, i: number) => (
                            <div
                              key={course._id || course.id}
                              className="exam-card"
                              onClick={() => safeNavigate(`/course-details/${course._id || course.id}`)}
                            >
                              <div className="exam-card-icon">
                                {course.coverphoto ? (
                                  <img src={getImageUrl(course.coverphoto)} alt={course.title} />
                                ) : (
                                  renderExamIcon(course.title, i)
                                )}
                              </div>
                              <div className="exam-card-info">
                                <h4 className="exam-card-name">{course.title}</h4>
                                {course.teacher?.name && <p className="exam-card-org">{course.teacher.name}</p>}
                              </div>
                              <ChevronRight size={12} className="exam-card-arrow" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Books Mega Menu */}
                  {activeMenu === "books" && (
                    <div className="exam-mega-wrapper books-mega-wrapper">
                      {/* Left Sidebar */}
                      <div className="exam-sidebar books-sidebar">
                        <div className="exam-sidebar-list books-sidebar-list">
                          <div
                            className={`exam-sidebar-item books-sidebar-item ${activeBookCat === 'all' ? 'active' : ''}`}
                            onMouseEnter={() => setActiveBookCat('all')}
                            onClick={() => { setActiveBookCat('all'); safeNavigate("/all-books"); }}
                          >
                            <span className="books-sidebar-icon"><BookOpen size={16} /></span>
                             <span className="exam-sidebar-label">{t("All Books")}</span>
                            <ChevronRight size={14} className="exam-sidebar-arrow" />
                          </div>
                          {getBookSidebarCats().map((cat: any) => {
                            const BOOK_CAT_ICONS: Record<string, React.ReactNode> = {
                              'it': <Monitor size={16} />,
                              'bank': <Layers size={16} />,
                              'police': <ShieldCheck size={16} />,
                              'railway': <Bookmark size={16} />,
                              'teacher': <GraduationCap size={16} />,
                              'government': <Award size={16} />,
                              'academic': <Brain size={16} />,
                              'school': <Book size={16} />,
                            };
                            const slug = (cat.name || '').toLowerCase().trim();
                            const icon = BOOK_CAT_ICONS[slug] || <FileText size={16} />;
                            return (
                              <div
                                key={cat.id}
                                className={`exam-sidebar-item books-sidebar-item ${activeBookCat === cat.id ? 'active' : ''}`}
                                onMouseEnter={() => setActiveBookCat(cat.id)}
                                onClick={() => setActiveBookCat(cat.id)}
                              >
                                <span className="books-sidebar-icon">{icon}</span>
                                 <span className="exam-sidebar-label">{getLocalizedBookCategory(cat)}</span>
                                <ChevronRight size={14} className="exam-sidebar-arrow" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Center Panel — Book List (2-col) */}
                      <div className="books-center-panel">
                        <div className="books-center-header">
                          <div className="books-center-header-left">
                            {(() => {
                              if (activeBookCat === 'all') return <BookOpen size={18} className="books-center-header-icon" />;
                              const activeCat = categoriesForBookMenu.find((c: any) => c._id === activeBookCat);
                              const slug = (activeCat?.name || '').toLowerCase().trim();
                              const CAT_HEADER_ICONS: Record<string, React.ReactNode> = {
                                'it': <Monitor size={18} className="books-center-header-icon" />,
                                'bank': <Layers size={18} className="books-center-header-icon" />,
                                'police': <ShieldCheck size={18} className="books-center-header-icon" />,
                                'railway': <Bookmark size={18} className="books-center-header-icon" />,
                                'teacher': <GraduationCap size={18} className="books-center-header-icon" />,
                                'government': <Award size={18} className="books-center-header-icon" />,
                                'academic': <Brain size={18} className="books-center-header-icon" />,
                                'school': <Book size={18} className="books-center-header-icon" />,
                              };
                              return CAT_HEADER_ICONS[slug] || <FileText size={18} className="books-center-header-icon" />;
                            })()}
                            <span className="books-center-title">
                              {activeBookCat === 'all'
                                ? t("All Books")
                                : `${getLocalizedBookCategory(categoriesForBookMenu.find((c: any) => c._id === activeBookCat))} ${t("Books")}`}
                            </span>
                          </div>
                          <span className="books-center-view-all" onClick={() => safeNavigate("/all-books")}>
                            {t("View All")} <ChevronRight size={14} />
                          </span>
                        </div>
                        {getBooksForCat(activeBookCat).length > 0 ? (
                          <div className="books-new-grid">
                            {getBooksForCat(activeBookCat).slice(0, 8).map((book: any) => {
                              const minPrice = getBookMinPrice(book);
                              const bookTitle = getLocalizedBookTitle(book);
                              return (
                                <div
                                  key={book._id || book.id}
                                  className="books-new-card"
                                  onClick={() => safeNavigate(book.isDemo ? '/all-books' : `/book-details/${book._id || book.id}`)}
                                >
                                  <div className="books-new-card-cover">
                                    {book.coverImage ? (
                                      <img src={getImageUrl(book.coverImage)} alt={bookTitle} />
                                    ) : book.demoCover ? (
                                      <div className={`demo-book-cover demo-book-cover--${book.demoCover.theme}`}>
                                        <span className="demo-book-cover-code">{book.demoCover.code}</span>
                                        <strong>{book.demoCover.subject}</strong>
                                        <span className="demo-book-cover-year">{book.demoCover.year}</span>
                                      </div>
                                    ) : (
                                      <div className="books-new-card-placeholder">
                                        {bookTitle.substring(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div className="books-new-card-info">
                                    <h4 className="books-new-card-title">{bookTitle}</h4>
                                    <p className="books-new-card-author">
                                      {isHindi ? 'लेखक: ' : 'By '}{getLocalizedBookAuthor(book)}
                                    </p>
                                    {minPrice !== null && <p className="books-new-card-price">₹{minPrice}</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                            <div className="books-mega-empty"><p>{t("No books available in this category.")}</p></div>
                        )}
                      </div>

                      {/* Right Quick-Links + Promo Panel */}
                      <div className="books-right-panel">
                        <div className="books-right-links">
                          <div className="books-right-link-item" onClick={() => safeNavigate("/all-books?filter=bestsellers")}>
                            <span className="books-right-link-icon books-right-link-icon--gold"><Crown size={16} /></span>
                            <span className="books-right-link-label">{t("Best Sellers")}</span>
                            <ChevronRight size={14} className="books-right-link-arrow" />
                          </div>
                          <div className="books-right-link-item" onClick={() => safeNavigate("/all-books?filter=new")}>
                            <span className="books-right-link-icon books-right-link-icon--blue"><Sparkles size={16} /></span>
                            <span className="books-right-link-label">{t("New Arrivals")}</span>
                            <ChevronRight size={14} className="books-right-link-arrow" />
                          </div>
                          <div className="books-right-link-item" onClick={() => safeNavigate("/all-books?filter=sample")}>
                            <span className="books-right-link-icon books-right-link-icon--green"><FileText size={16} /></span>
                            <span className="books-right-link-label">{t("Sample PDFs")}</span>
                            <ChevronRight size={14} className="books-right-link-arrow" />
                          </div>
                          <div className="books-right-link-item" onClick={() => safeNavigate("/all-books")}>
                            <span className="books-right-link-icon books-right-link-icon--purple"><Library size={16} /></span>
                            <span className="books-right-link-label">{t("View all books")}</span>
                            <ChevronRight size={14} className="books-right-link-arrow" />
                          </div>
                        </div>
                        <div className="books-right-promo">
                          <p className="books-right-promo-sub">{t("Empowering Your")}</p>
                          <p className="books-right-promo-title">{t("Preparation")}</p>
                          <p className="books-right-promo-desc">{t("Top Books for your Dream Success")}</p>
                          <div className="books-right-promo-illustration">
                            <div className="books-promo-emoji">🎓</div>
                            <div className="books-promo-stack">
                              <div className="promo-book promo-book-1"></div>
                              <div className="promo-book promo-book-2"></div>
                              <div className="promo-book promo-book-3"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Series Mega Menu */}
                  {activeMenu === "test" && (
                    <div className="exam-mega-wrapper test-mega-wrapper">

                      {/* Left Sidebar — list of test series names */}
                      <div className="ts-sidebar-col">
                        <div className="ts-sidebar-items">
                          <div
                            className={`ts-sidebar-item ${activeTestCat === 'all' ? 'active' : ''}`}
                            onMouseEnter={() => setActiveTestCat('all')}
                            onClick={() => { setActiveTestCat('all'); safeNavigate("/online-test-series"); }}
                          >
                            <span className="ts-sidebar-icon-wrap ts-icon-blue"><ClipboardList size={15} /></span>
                            <span className="ts-sidebar-label">{t("All Test Series")}</span>
                            <ChevronRight size={13} className="ts-sidebar-arrow" />
                          </div>
                          {getTestSidebarCats().slice(0, 7).map((cat: any, i: number) => (
                            <div
                              key={cat.id}
                              className={`ts-sidebar-item ${activeTestCat === cat.id ? 'active' : ''}`}
                              onMouseEnter={() => setActiveTestCat(cat.id)}
                              onClick={() => setActiveTestCat(cat.id)}
                            >
                              <span className="ts-sidebar-icon-wrap ts-icon-default">
                                <div style={{ width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {renderExamIcon(cat.name, i)}
                                </div>
                              </span>
                              <span className="ts-sidebar-label" title={cat.name}>{t(cat.name)}</span>
                              <ChevronRight size={13} className="ts-sidebar-arrow" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Center Panel — Popular Test Series Grid */}
                      <div className="ts-center-panel">
                        <div className="ts-center-header">
                          <div className="ts-center-header-left">
                            <span className="ts-center-header-icon"><Trophy size={16} /></span>
                            <span className="ts-center-title">{t("Popular Test Series")}</span>
                          </div>
                          <span className="ts-center-view-all" onClick={() => safeNavigate("/online-test-series")}>
                            {t("View All Test Series")} <ArrowRight size={14} />
                          </span>
                        </div>

                        {getTestSeriesForCat(activeTestCat).length > 0 ? (
                          <div className="ts-new-grid">
                            {getTestSeriesForCat(activeTestCat).slice(0, 6).map((t: any, i: number) => {
                              const TS_PASTEL_BG = [
                                '#fff7e6', '#e8f4ff', '#f0fdf4', '#fdf4ff', '#fff0f0', '#f0f9ff',
                              ];
                              const ratings = [4.8, 4.7, 4.8, 4.6, 4.7, 4.6];
                              return (
                                <div
                                  key={t._id}
                                  className="ts-new-card"
                                  onClick={() => safeNavigate(`/exam-topics/${t._id}`)}
                                >
                                  <div className="ts-new-card-icon" style={{ background: TS_PASTEL_BG[i % TS_PASTEL_BG.length] }}>
                                    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {renderExamIcon(t.name || t.code, i)}
                                    </div>
                                  </div>
                                  <div className="ts-new-card-info">
                                    <h4 className="ts-new-card-name">{t.name || t.code}</h4>
                                    <div className="ts-new-card-meta">
                                      <span className="ts-new-card-count">
                                        <FileText size={11} /> {t.statistics?.totalTestSeries || 0}+ Tests
                                      </span>
                                      <span className="ts-new-card-rating">
                                        <Star size={11} fill="#fbbf24" color="#fbbf24" /> {ratings[i % ratings.length]}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight size={15} className="ts-new-card-arrow" />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                            <div className="books-mega-empty"><p>{t("No test series available.")}</p></div>
                        )}
                      </div>

                      {/* Right Featured Panel */}
                      {getTestSeriesForCat(activeTestCat).length > 0 && (() => {
                        const featured = getTestSeriesForCat(activeTestCat)[0];
                        return (
                          <div className="ts-right-panel">
                            <div className="ts-right-featured">
                              <div className="ts-right-badge"><Star size={11} fill="#fbbf24" color="#fbbf24" /> FEATURED SERIES</div>
                              <div className="ts-right-icon-wrap">
                                <div className="ts-right-icon">
                                  <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {renderExamIcon(featured.name || featured.code, 0)}
                                  </div>
                                </div>
                                <span className="ts-right-icon-tag"><Star size={10} fill="#fbbf24" color="#fbbf24" /> Featured</span>
                              </div>
                              <h4 className="ts-right-title">{featured.name || featured.code}</h4>
                              <p className="ts-right-desc">{t("Comprehensive tests designed as per latest syllabus and exam pattern.")}</p>
                              <ul className="ts-right-features">
                                <li>
                                  <span className="ts-feat-icon"><FileText size={13} /></span>
                                <div><strong>{t("Latest Exam Pattern")}</strong><span>{t("Based on updated syllabus")}</span></div>
                                </li>
                                <li>
                                  <span className="ts-feat-icon"><Pencil size={13} /></span>
                                <div><strong>{t("Detailed Solutions")}</strong><span>{t("Step-by-step explanations")}</span></div>
                                </li>
                                <li>
                                  <span className="ts-feat-icon"><Target size={13} /></span>
                                <div><strong>{t("Performance Analysis")}</strong><span>{t("Track your progress in detail")}</span></div>
                                </li>
                              </ul>
                              <button
                                className="ts-right-btn-primary"
                                onClick={() => safeNavigate(`/exam-topics/${featured._id}`)}
                              >
                                Explore Series <ArrowRight size={14} />
                              </button>
                              <button
                                className="ts-right-btn-secondary"
                                onClick={() => safeNavigate(`/exam-topics/${featured._id}`)}
                              >
                                View Sample Test
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  )}

                  {/* Exams Mega Menu — DITTO DESIGN */}
                  {activeMenu === "exams" && (
                    <div className="exam-mega-wrapper exams-new-wrapper">
                      {/* Left Sidebar */}
                      <div className="ex-sidebar-col">
                        <div className="ex-sidebar-items">
                          {/* All Exams Top Highlighted Item */}
                          <div
                            className={`ex-sidebar-item ex-sidebar-all ${activeExamCat === 'all' ? 'active' : ''}`}
                            onMouseEnter={() => setActiveExamCat('all')}
                            onClick={() => {
                              setActiveExamCat('all');
                              safeNavigate("/exams-page");
                            }}
                          >
                            <span className="ex-sidebar-icon-all">
                              <GraduationCap size={16} color="#ffffff" />
                            </span>
                            <span className="ex-sidebar-label">{t("All Exams")}</span>
                            <ChevronRight size={14} className="ex-sidebar-arrow" />
                          </div>

                          {/* Categories */}
                          {getSidebarCategories().map((cat: any, i: number) => {
                            const meta = getExamCategoryMeta(cat.name, i);
                            return (
                              <div
                                key={cat.id}
                                className={`ex-sidebar-item ${activeExamCat === cat.id ? 'active' : ''}`}
                                onMouseEnter={() => setActiveExamCat(cat.id)}
                                onClick={() => setActiveExamCat(cat.id)}
                              >
                                <span
                                  className="ex-sidebar-icon-wrap"
                                  style={{ background: meta.bg, color: meta.color }}
                                >
                                  {meta.icon}
                                </span>
                                <span className="ex-sidebar-label">{t(cat.name)}</span>
                                <ChevronRight size={14} className="ex-sidebar-arrow" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Main Center Panel */}
                      <div className="ex-main-panel">
                        <div className="ex-main-header">
                          <div className="ex-main-header-left">
                            <h3 className="ex-main-title">
                              {activeExamCat === 'all'
                                ? 'All Exams'
                                : t(getSidebarCategories().find((c: any) => c.id === activeExamCat)?.name || 'Exams')}
                            </h3>
                            <span className="ex-main-subtitle">
                              {getExamsForCategory(activeExamCat).length} Exams Available
                            </span>
                          </div>
                          <button
                            className="ex-view-all-btn"
                            onClick={() => safeNavigate("/exams-page")}
                          >
                            {t("View All Exams")} <ArrowRight size={14} />
                          </button>
                        </div>

                        {getExamsForCategory(activeExamCat).length > 0 ? (
                          <div className="hdr-ex-cards-grid">
                            {getExamsForCategory(activeExamCat).map((exam: any, i: number) => (
                              <div
                                key={exam._id || exam.id}
                                className="hdr-ex-card"
                                onClick={() => safeNavigate(exam.slug ? `/exams/${exam.slug}` : `/exam-sections`)}
                              >
                                <div className="hdr-ex-card-content">
                                  <div className="hdr-ex-card-icon-wrap">
                                    {exam.examImage ? (
                                      <img
                                        src={getImageUrl(exam.examImage)}
                                        alt={exam.name}
                                        className="hdr-ex-card-icon-img"
                                        onError={(e) => {
                                          const target = e.target as HTMLElement;
                                          target.style.display = 'none';
                                          if (target.parentElement) {
                                            const fallback = target.parentElement.querySelector('.hdr-ex-card-icon-render') as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className="hdr-ex-card-icon-render"
                                      style={{ display: exam.examImage ? 'none' : 'flex' }}
                                    >
                                      {renderExamIcon(exam.name, i)}
                                    </div>
                                  </div>
                                  <h4 className="hdr-ex-card-name" title={exam.name}>
                                    {exam.name}
                                  </h4>
                                </div>
                                <ChevronRight size={14} className="hdr-ex-card-arrow" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="books-mega-empty">
                              <p>{t("No exams available in this category.")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* E-Learning Mega Menu */}
                  {activeMenu === "elearning" && (
                    <div className="exam-mega-wrapper elearning-mega-wrapper">

                      {/* Left Sidebar */}
                      <div className="elearning-sidebar-col">
                        <div className="elearning-sidebar-items">
                          <div
                            className={`el-sidebar-item ${activeElearningCat === 'all' ? 'active' : ''}`}
                            onMouseEnter={() => setActiveElearningCat('all')}
                            onClick={() => { setActiveElearningCat('all'); safeNavigate("/e-learning/website-development"); }}
                          >
                            <span className="el-sidebar-icon-wrap el-icon-purple">
                              <Layers size={16} />
                            </span>
                            <span className="el-sidebar-label">{t("All Services")}</span>
                            <ChevronRight size={13} className="el-sidebar-arrow" />
                          </div>
                          {getElearningSidebarCats().map((cat: any) => {
                            const EL_ICONS: Record<string, React.ReactNode> = {
                              'web-app': <Monitor size={16} />,
                              'content': <FileText size={16} />,
                              'business': <Briefcase size={16} />,
                            };
                            return (
                              <div
                                key={cat.id}
                                className={`el-sidebar-item ${activeElearningCat === cat.id ? 'active' : ''}`}
                                onMouseEnter={() => setActiveElearningCat(cat.id)}
                                onClick={() => setActiveElearningCat(cat.id)}
                              >
                                <span className="el-sidebar-icon-wrap el-icon-default">
                                  {EL_ICONS[cat.id] || <Layers size={16} />}
                                </span>
                                <span className="el-sidebar-label">{t(cat.name)}</span>
                                <ChevronRight size={13} className="el-sidebar-arrow" />
                              </div>
                            );
                          })}
                        </div>
                        {/* Bottom Promo Card in Sidebar */}
                        <div className="el-sidebar-promo">
                          <div className="el-sidebar-promo-sparkle">✦</div>
                          <div className="el-sidebar-promo-text">
                            <p className="el-sidebar-promo-title">{isHindi ? <>सम्पूर्ण<br />ई-लर्निंग समाधान</> : <>End-to-End<br />E-Learning Solutions</>}</p>
                            <p className="el-sidebar-promo-sub">{t("Scalable. Secure. Student-centric.")}</p>
                          </div>
                          <div className="el-sidebar-promo-illustration">
                            <span className="el-promo-cap">🎓</span>
                          </div>
                        </div>
                      </div>

                      {/* Center Panel — Services Grid */}
                      <div className="elearning-center-panel">
                        <div className="elearning-center-header">
                          <div className="elearning-center-header-left">
                            <span className="elearning-center-header-icon-wrap"><Bookmark size={16} /></span>
                            <span className="elearning-center-title">{t("E-Learning Services")}</span>
                          </div>
                          <span className="elearning-center-view-all" onClick={() => safeNavigate("/e-learning/website-development")}>
                            {t("View All Services")} <ChevronRight size={14} />
                          </span>
                        </div>

                        {getElearningServicesForCat(activeElearningCat).length > 0 ? (
                          <div className="elearning-new-grid">
                            {getElearningServicesForCat(activeElearningCat).map((item: any, i: number) => {
                              const ItemIcon = item.icon;
                              const EL_CARD_COLORS = [
                                { bg: 'linear-gradient(135deg, #66735b, #5b21b6)', shadow: 'rgba(124,58,237,0.25)' },
                                { bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', shadow: 'rgba(37,99,235,0.25)' },
                                { bg: 'linear-gradient(135deg, #16a34a, #15803d)', shadow: 'rgba(22,163,74,0.25)' },
                                { bg: 'linear-gradient(135deg, #ea580c, #c2410c)', shadow: 'rgba(234,88,12,0.25)' },
                                { bg: 'linear-gradient(135deg, #dc2626, #b91c1c)', shadow: 'rgba(220,38,38,0.25)' },
                                { bg: 'linear-gradient(135deg, #0891b2, #0e7490)', shadow: 'rgba(8,145,178,0.25)' },
                                { bg: 'linear-gradient(135deg, #d97706, #b45309)', shadow: 'rgba(217,119,6,0.25)' },
                                { bg: 'linear-gradient(135deg, #1e3a5f, #1e40af)', shadow: 'rgba(30,58,95,0.25)' },
                              ];
                              const color = EL_CARD_COLORS[i % EL_CARD_COLORS.length];
                              return (
                                <div
                                  key={item.path}
                                  className="elearning-new-card"
                                  onClick={() => safeNavigate(item.path)}
                                >
                                  <div className="elearning-new-card-icon" style={{ background: color.bg, boxShadow: `0 4px 12px ${color.shadow}` }}>
                                    <ItemIcon size={22} color="white" />
                                  </div>
                                  <div className="elearning-new-card-info">
                                    <h4 className="elearning-new-card-name">{t(item.title)}</h4>
                                    <p className="elearning-new-card-desc">{t(item.desc)}</p>
                                  </div>
                                  <ChevronRight size={16} className="elearning-new-card-arrow" />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                            <div className="books-mega-empty"><p>{t("No services available.")}</p></div>
                        )}
                      </div>

                      {/* Right CTA Panel */}
                      <div className="elearning-right-panel">
                        <div className="elearning-right-cta">
                          <div className="elearning-right-cta-icon-wrap">
                            <div className="elearning-right-cta-icon">
                              <GraduationCap size={36} color="var(--primary)" />
                              <span className="elearning-cta-sparkle">✦</span>
                            </div>
                          </div>
                          <h4 className="elearning-right-cta-title">{t("Need Custom LMS?")}</h4>
                          <p className="elearning-right-cta-subtitle">{t("Tailored solutions to match your unique needs.")}</p>
                          <ul className="elearning-right-cta-list">
                            <li><CheckCircle size={13} /> Custom portals &amp; themes</li>
                            <li><CheckCircle size={13} /> Advanced analytics</li>
                            <li><CheckCircle size={13} /> Secure &amp; scalable</li>
                            <li><CheckCircle size={13} /> Dedicated support</li>
                          </ul>
                          <button
                            className="elearning-right-cta-btn-primary"
                            onClick={() => safeNavigate("/contact")}
                          >
                            Get Free Consultation <ArrowRight size={14} />
                          </button>
                          <button
                            className="elearning-right-cta-btn-secondary"
                            onClick={() => safeNavigate("/e-learning/website-development")}
                          >
                            Explore Case Studies <span style={{ fontSize: '14px' }}>↗</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Free Resources Mega Menu */}
                  {activeMenu === "free-resources" && (
                    <div className="exam-mega-wrapper free-resources-mega-wrapper">

                      {/* Left Sidebar */}
                      <div className="fr-sidebar-col">
                        <div className="fr-sidebar-items">
                          <div
                            className={`fr-sidebar-item ${activeFreeCat === 'all' ? 'active' : ''}`}
                            onMouseEnter={() => setActiveFreeCat('all')}
                            onClick={() => { setActiveFreeCat('all'); safeNavigate("/free-resources"); }}
                          >
                            <span className="fr-sidebar-icon-wrap fr-icon-purple"><Layers size={16} /></span>
                            <span className="fr-sidebar-label">{t("All Resources")}</span>
                            <ChevronRight size={13} className="fr-sidebar-arrow" />
                          </div>
                          {getFreeResourcesSidebarCats().map((cat: any) => {
                            const FR_ICONS: Record<string, React.ReactNode> = {
                              'jobs-syllabus': <Briefcase size={16} />,
                              'study':         <BookOpen size={16} />,
                              'media-blogs':   <Pencil size={16} />,
                              'govt':          <Building2 size={16} />,
                            };
                            return (
                              <div
                                key={cat.id}
                                className={`fr-sidebar-item ${activeFreeCat === cat.id ? 'active' : ''}`}
                                onMouseEnter={() => setActiveFreeCat(cat.id)}
                                onClick={() => setActiveFreeCat(cat.id)}
                              >
                                <span className="fr-sidebar-icon-wrap fr-icon-default">
                                  {FR_ICONS[cat.id] || <FileText size={16} />}
                                </span>
                                <span className="fr-sidebar-label">{t(cat.name)}</span>
                                <ChevronRight size={13} className="fr-sidebar-arrow" />
                              </div>
                            );
                          })}
                        </div>
                        {/* Bottom Stay Updated promo */}
                        <div className="fr-sidebar-promo" onClick={() => safeNavigate("/jobs-notifications")}>
                          <div className="fr-sidebar-promo-icon"><Bell size={18} /></div>
                          <div className="fr-sidebar-promo-body">
                          <p className="fr-sidebar-promo-title">{t("Stay Updated!")}</p>
                          <p className="fr-sidebar-promo-desc">
                            {isHindi ? <>नवीनतम परीक्षा <strong>अधिसूचनाएँ</strong> और सरकारी नौकरी सूचनाएँ प्राप्त करें।</> : <>Get the latest exam <strong>notifications</strong> and government job updates.</>}
                          </p>
                          <span className="fr-sidebar-promo-link">{t("View All Notifications →")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Center Panel — Resource Grid */}
                      <div className="fr-center-panel">
                        <div className="fr-center-header">
                          <div className="fr-center-header-left">
                            <span className="fr-center-header-icon-wrap"><BookOpen size={16} /></span>
                            <span className="fr-center-title">{t("Free Resources")}</span>
                          </div>
                          <div className="fr-center-header-right">
                          <span className="fr-center-count">{getFreeResourcesForCat(activeFreeCat).length} {isHindi ? "संसाधन" : "resources"}</span>
                            <span className="fr-center-view-all" onClick={() => safeNavigate("/free-resources")}>
                            {t("View All")} <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>

                        {getFreeResourcesForCat(activeFreeCat).length > 0 ? (
                          <div className="fr-new-grid">
                            {getFreeResourcesForCat(activeFreeCat).map((item: any) => {
                              const ItemIcon = item.icon;
                              return (
                                <div
                                  key={item.path}
                                  className="fr-new-card"
                                  onClick={() => safeNavigate(item.path)}
                                >
                                  <div className="fr-new-card-icon" style={{ background: item.bg, color: item.color }}>
                                    <ItemIcon size={22} color={item.color} />
                                  </div>
                                  <div className="fr-new-card-info">
                                    <h4 className="fr-new-card-name">{t(item.title)}</h4>
                                    <p className="fr-new-card-desc">{t(item.desc)}</p>
                                  </div>
                                  <ChevronRight size={16} className="fr-new-card-arrow" />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                            <div className="books-mega-empty"><p>{t("No resources in this category.")}</p></div>
                        )}
                      </div>

                      {/* Right Featured Panel */}
                      <div className="fr-right-panel">
                        <div className="fr-right-featured" onClick={() => safeNavigate("/current-affairs")}>
                          <div className="fr-right-badge">{t("TRENDING RESOURCE")}</div>
                          <div className="fr-right-icon-wrap">
                            <BookOpen size={40} color="#ff9f43" strokeWidth={1.5} />
                          </div>
                          <h4 className="fr-right-title">{t("Daily Current Affairs")}</h4>
                          <p className="fr-right-subtitle">{t("Free Exam Material")}</p>
                          <p className="fr-right-desc">
                            {isHindi ? "हमारी चयनित दैनिक समसामयिकी के साथ राष्ट्रीय और अंतरराष्ट्रीय घटनाक्रमों से अद्यतन रहें।" : "Keep track of national & international updates with our curated daily current affairs."}
                          </p>
                          <div className="fr-right-actions">
                            <button className="fr-right-btn-outline"><FileText size={13} /> FREE PDF</button>
                          <button className="fr-right-btn-fill" onClick={() => safeNavigate("/current-affairs")}>{t("Read Now")} <ArrowRight size={13} /></button>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar (Responsive Menu) */}
      <Drawer
        title={isDraa ? (
          <div className="draa-brand-lockup draa-brand-lockup-mobile">
            <img src="/brand/draa-mark.png" className="draa-brand-mark" alt="" />
            <span className="draa-brand-word">DRAA</span>
          </div>
        ) : (
          <img src="/brand/draa-mark.png" style={{ height: '32px' }} alt="Myedudocs" />
        )}
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={300}
        zIndex={2000005}
        className="mobile-drawer-premium"
      >
        <div className="mobile-nav-content">
          {/* {isAuthenticated() && (
            <div className="mobile-account-section" style={{ marginBottom:'20px', padding:'0 15px' }}>
              <div style={{ fontSize:'12px', fontWeight: 800, color:'#8c8c8c', marginBottom:'10px', letterSpacing:'1px' }}>MY ACCOUNT</div>
              <div className="mobile-link" onClick={() => { handleDashboardAccess(); setMobileMenuVisible(false); }} style={{ fontWeight: 700, color:'var(--primary)' }}> Dashboard</div>
              <div className="mobile-link" onClick={() => {
                const sid = loginUser?.id || loginUser?._id;
                if (sid) safeNavigate(`/v2/student/my-test-series/${sid}`);
                else safeNavigate("/v2/student-dashboard");
                setMobileMenuVisible(false);
              }} style={{ fontWeight: 700, color:'var(--primary)' }}> My Test Series</div>
              <Divider style={{ margin:'15px 0' }} />
            </div>
          )} */}
          <Collapse ghost accordion expandIconPosition="end">
            <Panel header={<span className="m-header"><BookOpen size={18} /> {t("Courses")}</span>} key="courses">
              {courseCategories.map((courseCategory: any) => (
                <div
                  key={courseCategory._id}
                  className="mobile-link"
                  onClick={() => safeNavigate(`/courses/category/${encodeURIComponent(courseCategory.name || courseCategory._id)}`)}
                >
                  <ChevronRight size={14} className="m-link-arrow" /> {t(courseCategory.name)}
                </div>
              ))}
              <div className="mobile-link view-all-mobile" onClick={() => safeNavigate("/courses")}>
                {t("All Courses")}
              </div>
            </Panel>

            <Panel header={<span className="m-header"><Book size={18} /> {t("Books")}</span>} key="books">
              {categoriesForBookMenu.map((b: any) => (
                <div
                  key={b._id}
                  className="mobile-link"
                  onClick={() => safeNavigate(allBooks.length > 0 ? `/books/category/${b.slug || b._id}` : '/all-books')}
                >
                  <ChevronRight size={14} className="m-link-arrow" /> {getLocalizedBookCategory(b)}
                </div>
              ))}
              <div className="mobile-link view-all-mobile" onClick={() => safeNavigate("/all-books")}>{isHindi ? "सभी पुस्तकें देखें" : "View All Books"}</div>
            </Panel>

            <Panel header={<span className="m-header"><Layers size={18} /> {t("All Test Series")}</span>} key="test">
              {testSeriesCategories.map(t => (
                <div key={t._id} className="mobile-link" onClick={() => safeNavigate(`/exam-topics/${t._id}`)}>
                  <ChevronRight size={14} className="m-link-arrow" /> {t.code} {t.year}
                </div>
              ))}
              <div className="mobile-link view-all-mobile" onClick={() => safeNavigate("/online-test-series")}>{t("View All Test Series")}</div>
            </Panel>

            <Panel header={<span className="m-header"><GraduationCap size={18} /> {t("Exams")}</span>} key="exams">
              {examCategories.map((cat: any) => (
                <div key={cat._id} className="mobile-link" onClick={() => safeNavigate(`/exam-sections?category=${cat._id}`)}>
                  <ChevronRight size={14} className="m-link-arrow" /> {t(cat.name)}
                </div>
              ))}
              <div className="mobile-link view-all-mobile" onClick={() => safeNavigate("/exam-sections")}>{isHindi ? "सभी परीक्षाएँ देखें" : "View All Exams"}</div>
            </Panel>

            <Panel header={<span className="m-header"><Monitor size={18} /> {isHindi ? "ई-लर्निंग" : "E-Learning"}</span>} key="elearning">
              {[
                { title: "Website Development", path: "/e-learning/website-development", icon: <Monitor size={16} /> },
                { title: "Academic Content", path: "/e-learning/academic-content", icon: <FileText size={16} /> },
                { title: "White Label Content", path: "/e-learning/white-label-content", icon: <Package size={16} /> },
                { title: "Mobile App Development", path: "/e-learning/mobile-app-development", icon: <Smartphone size={16} /> },
                { title: "Exam Management", path: "/e-learning/exam-management", icon: <ClipboardCheck size={16} /> },
                { title: "Digital Content Creation", path: "/e-learning/digital-content-creation", icon: <Video size={16} /> },
                { title: "Digital Marketing", path: "/e-learning/digital-marketing", icon: <Megaphone size={16} /> },
                { title: "Managed Services", path: "/e-learning/managed-services", icon: <ShieldCheck size={16} /> },
              ].map(item => (
                <div key={item.path} className="mobile-link" onClick={() => safeNavigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ChevronRight size={14} className="m-link-arrow" /> {t(item.title)}
                </div>
              ))}
            </Panel>

            <Panel header={<span className="m-header"><Sparkles size={18} /> {t("Free Resources")}</span>} key="free-resources">
              {[
                { title: "Jobs & Admission Notifications", path: "/jobs-notifications", icon: <Briefcase size={16} /> },
                { title: "Exam Syllabus", path: "/syllabus", icon: <FileText size={16} /> },
                { title: "Current Affairs", path: "/current-affairs", icon: <Newspaper size={16} /> },
                { title: "Previous Year Papers", path: "/previous-year-questions", icon: <Brain size={16} /> },
                { title: "Educational Blogs", path: "/grid-blog", icon: <BookOpen size={16} /> },
                { title: "Recorded Videos", path: "/recorded-videos", icon: <Video size={16} /> },
              ].map(item => (
                <div key={item.path} className="mobile-link" onClick={() => safeNavigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ChevronRight size={14} className="m-link-arrow" /> {t(item.title)}
                </div>
              ))}
              <div className="mobile-link view-all-mobile" onClick={() => safeNavigate("/free-resources")}>{t("View All Resources")}</div>
            </Panel>
          </Collapse>

          <div className="mobile-static-links">
            <div className="mobile-link-main" onClick={() => { safeNavigate("/"); setMobileMenuVisible(false); }}>
              <Home size={18} />
              <span>{t("Home")}</span>
            </div>
            <div className="mobile-link-main" onClick={() => { safeNavigate("/teams"); setMobileMenuVisible(false); }}>
              <Users size={18} />
              <span>{t("Meet Our Team")}</span>
            </div>
          </div>

          {/* Login / Sign Up */}

          {!loginUser?.id && (
            <button className="login-btn mobile-full-btn" onClick={() => openAuthModal("student")}>
              {isHindi ? "लॉग इन / साइन अप" : "Login / Sign Up"}
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
}
