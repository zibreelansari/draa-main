import React, { createContext, useContext, useEffect, useState } from "react";

export type LanguageCode = "en" | "fr" | "ar" | "es" | "ne" | "bn" | "ru" | "de" | "id" | "zh";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flagIso: string;
  rtl?: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flagIso: "gb" },
  { code: "fr", name: "French", nativeName: "Français", flagIso: "fr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flagIso: "ae", rtl: true },
  { code: "es", name: "Spanish", nativeName: "Español", flagIso: "es" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", flagIso: "np" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flagIso: "bd" },
  { code: "ru", name: "Russian", nativeName: "Русский", flagIso: "ru" },
  { code: "de", name: "German", nativeName: "Deutsch", flagIso: "de" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flagIso: "id" },
  { code: "zh", name: "Chinese", nativeName: "中文 (简体)", flagIso: "cn" },
];

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    "nav.chooseIndia": "Choose India",
    "nav.planStudies": "Plan your Studies",
    "nav.freeResources": "Free Resources",
    "nav.courses": "Courses & Institutes",
    "nav.register": "Register",
    "nav.login": "Log in",
    "nav.studentReg": "Student Registration",
    "nav.instituteReg": "Institute Registration",
    "nav.studentLogin": "Student Login",
    "nav.instituteLogin": "Institute Login",
    "nav.adminLogin": "Admin Login",
    "hero.eyebrow": "DRAA STUDY IN INDIA",
    "hero.title": "Namaste, begin your educational journey in India",
    "hero.subtitle": "Access world-ranked universities, transparent tuition in USD, and scholarships up to 100%.",
    "hero.explore": "Explore Courses",
    "hero.apply": "Apply Now",
    "stats.institutes": "Institutes in India",
    "stats.courses": "Course opportunities",
    "roadmap.title": "Steps to study in India",
    "roadmap.eyebrow": "YOUR ROADMAP",
    "why.title": "Why Study in India?",
    "why.eyebrow": "DISCOVER THE DIFFERENCE",
    "events.title": "Step into your academic future.",
    "events.eyebrow": "EVENTS & WEBINARS",
    "events.cta": "Register interest",
  },
  fr: {
    "nav.chooseIndia": "Choisir l'Inde",
    "nav.planStudies": "Planifier vos Études",
    "nav.freeResources": "Ressources Gratuites",
    "nav.courses": "Cours & Instituts",
    "nav.register": "S'inscrire",
    "nav.login": "Connexion",
    "nav.studentReg": "Inscription Étudiant",
    "nav.instituteReg": "Inscription Institut",
    "nav.studentLogin": "Connexion Étudiant",
    "nav.instituteLogin": "Connexion Institut",
    "nav.adminLogin": "Connexion Admin",
    "hero.eyebrow": "DRAA ÉTUDIER EN INDE",
    "hero.title": "Namaste, commencez votre parcours éducatif en Inde",
    "hero.subtitle": "Accédez à des universités de renommée mondiale, frais de scolarité en USD et bourses jusqu'à 100%.",
    "hero.explore": "Explorer les Cours",
    "hero.apply": "Postuler Maintenant",
    "stats.institutes": "Instituts en Inde",
    "stats.courses": "Opportunités de cours",
    "roadmap.title": "Étapes pour étudier en Inde",
    "roadmap.eyebrow": "VOTRE FEUILLE DE ROUTE",
    "why.title": "Pourquoi Étudier en Inde ?",
    "why.eyebrow": "DÉCOUVREZ LA DIFFÉRENCE",
    "events.title": "Entrez dans votre avenir académique.",
    "events.eyebrow": "ÉVÉNEMENTS & WEBINAIRES",
    "events.cta": "S'inscrire d'intérêt",
  },
  ar: {
    "nav.chooseIndia": "اختر الهند",
    "nav.planStudies": "خطط لدراستك",
    "nav.freeResources": "مصادر مجانية",
    "nav.courses": "الدورات والمعاهد",
    "nav.register": "تسجيل جديد",
    "nav.login": "تسجيل الدخول",
    "nav.studentReg": "تسجيل الطلاب",
    "nav.instituteReg": "تسجيل المعاهد",
    "nav.studentLogin": "دخول الطلاب",
    "nav.instituteLogin": "دخول المعاهد",
    "nav.adminLogin": "دخول المشرف",
    "hero.eyebrow": "دراسة في الهند",
    "hero.title": "ناماستي، ابدأ رحلتك التعليمية في الهند",
    "hero.subtitle": "التحق بجامعات عالمية معتمدة ورسوم بالدولار الأمريكي ومنح دراسية تصل إلى 100٪.",
    "hero.explore": "استكشاف الدورات",
    "hero.apply": "قدم الآن",
    "stats.institutes": "معاهد في الهند",
    "stats.courses": "فرص دراسية متاحة",
    "roadmap.title": "خطوات الدراسة في الهند",
    "roadmap.eyebrow": "خارطة الطريق",
    "why.title": "لماذا الدراسة في الهند؟",
    "why.eyebrow": "اكتشف الفرق",
    "events.title": "ادخل إلى مستقبلك الأكاديمي.",
    "events.eyebrow": "الفعاليات والندوات",
    "events.cta": "تسجيل الاهتمام",
  },
  es: {
    "nav.chooseIndia": "Elegir India",
    "nav.planStudies": "Planificar Estudios",
    "nav.freeResources": "Recursos Gratuitos",
    "nav.courses": "Cursos e Institutos",
    "nav.register": "Registrarse",
    "nav.login": "Iniciar Sesión",
    "nav.studentReg": "Registro de Estudiantes",
    "nav.instituteReg": "Registro de Institutos",
    "nav.studentLogin": "Acceso Estudiante",
    "nav.instituteLogin": "Acceso Instituto",
    "nav.adminLogin": "Acceso Admin",
    "hero.eyebrow": "ESTUDIAR EN LA INDIA",
    "hero.title": "Namaste, comienza tu viaje educativo en la India",
    "hero.subtitle": "Accede a universidades de prestigio mundial, matrículas en USD y becas de hasta el 100%.",
    "hero.explore": "Explorar Cursos",
    "hero.apply": "Solicitar Ahora",
    "stats.institutes": "Institutos en la India",
    "stats.courses": "Oportunidades de cursos",
    "roadmap.title": "Pasos para estudiar en la India",
    "roadmap.eyebrow": "TU HOJA DE RUTA",
    "why.title": "¿Por qué estudiar en la India?",
    "why.eyebrow": "DESCUBRE LA DIFERENCIA",
    "events.title": "Da el paso hacia tu futuro académico.",
    "events.eyebrow": "EVENTOS Y WEBINARIOS",
    "events.cta": "Registrar interés",
  },
  ne: {
    "nav.chooseIndia": "भारत रोज्नुहोस्",
    "nav.planStudies": "अध्ययन योजना",
    "nav.freeResources": "निःशुल्क स्रोतहरू",
    "nav.courses": "पाठ्यक्रम र कलेजहरू",
    "nav.register": "दर्ता गर्नुहोस्",
    "nav.login": "लगइन",
    "nav.studentReg": "विद्यार्थी दर्ता",
    "nav.instituteReg": "संस्थान दर्ता",
    "nav.studentLogin": "विद्यार्थी लगइन",
    "nav.instituteLogin": "संस्थान लगइन",
    "nav.adminLogin": "प्रशासक लगइन",
    "hero.eyebrow": "भारतमा अध्ययन",
    "hero.title": "नमस्ते, भारतमा आफ्नो शैक्षिक यात्रा सुरु गर्नुहोस्",
    "hero.subtitle": "विश्व-स्तरीय विश्वविद्यालयहरू, डलरमा शुल्क, र १००% सम्मको छात्रवृत्ति पाउनुहोस्।",
    "hero.explore": "पाठ्यक्रमहरू हेर्नुहोस्",
    "hero.apply": "आवेदन दिनुहोस्",
    "stats.institutes": "भारतका संस्थानहरू",
    "stats.courses": "उपलब्ध पाठ्यक्रमहरू",
    "roadmap.title": "भारतमा अध्ययन गर्ने चरणहरू",
    "roadmap.eyebrow": "तपाईंको मार्गचित्र",
    "why.title": "भारतमा किन अध्ययन गर्ने?",
    "why.eyebrow": "फरक महसुस गर्नुहोस्",
    "events.title": "आफ्नो उज्ज्वल भविष्यतर्फ कदम चाल्नुहोस्।",
    "events.eyebrow": "कार्यक्रम तथा वेबिनार",
    "events.cta": "इच्छा दर्ता गर्नुहोस्",
  },
  bn: {
    "nav.chooseIndia": "ভারত বেছে নিন",
    "nav.planStudies": "পড়াশোনার পরিকল্পনা",
    "nav.freeResources": "বিনামূল্যে রিসোর্স",
    "nav.courses": "কোর্স ও ইনস্টিটিউট",
    "nav.register": "রেজিস্টার",
    "nav.login": "লগইন",
    "nav.studentReg": "শিক্ষার্থী রেজিস্ট্রেশন",
    "nav.instituteReg": "ইনস্টিটিউট রেজিস্ট্রেশন",
    "nav.studentLogin": "শিক্ষার্থী লগইন",
    "nav.instituteLogin": "ইনস্টিটিউট লগইন",
    "nav.adminLogin": "অ্যাডমিন লগইন",
    "hero.eyebrow": "ভারতে পড়াশোনা",
    "hero.title": "নমস্তে, ভারতে আপনার শিক্ষাজীবন শুরু করুন",
    "hero.subtitle": "শীর্ষস্থানীয় বিশ্ববিদ্যালয়, ডলারে সাশ্রয়ী টিউশন ফি এবং ১০০% পর্যন্ত স্কলারশিপ।",
    "hero.explore": "কোর্স দেখুন",
    "hero.apply": "আবেদন করুন",
    "stats.institutes": "ভারতের প্রতিষ্ঠানসমূহ",
    "stats.courses": "কোর্স সুযোগ",
    "roadmap.title": "ভারতে পড়ার ধাপসমূহ",
    "roadmap.eyebrow": "আপনার রোডম্যাপ",
    "why.title": "কেন ভারতে পড়াশোনা করবেন?",
    "why.eyebrow": "পার্থক্য দেখুন",
    "events.title": "আপনার শিক্ষাগত ভবিষ্যতের দিকে এগিয়ে যান।",
    "events.eyebrow": "ইভেন্ট এবং ওয়েবিনার",
    "events.cta": "আগ্রহ প্রকাশ করুন",
  },
  ru: {
    "nav.chooseIndia": "Выбрать Индию",
    "nav.planStudies": "План Обучения",
    "nav.freeResources": "Ресурсы",
    "nav.courses": "Курсы и Институты",
    "nav.register": "Регистрация",
    "nav.login": "Вход",
    "nav.studentReg": "Регистрация Студента",
    "nav.instituteReg": "Регистрация Института",
    "nav.studentLogin": "Вход Студента",
    "nav.instituteLogin": "Вход Института",
    "nav.adminLogin": "Вход Администратора",
    "hero.eyebrow": "ОБУЧЕНИЕ В ИНДИИ",
    "hero.title": "Намасте, начните свой образовательный путь в Индии",
    "hero.subtitle": "Ведущие университеты, прозрачная стоимость в долларах США и стипендии до 100%.",
    "hero.explore": "Смотреть Курсы",
    "hero.apply": "Подать Заявку",
    "stats.institutes": "Институтов в Индии",
    "stats.courses": "Учебных программ",
    "roadmap.title": "Шаги для учебы в Индии",
    "roadmap.eyebrow": "ВАШ ПЛАН",
    "why.title": "Почему Индия?",
    "why.eyebrow": "УЗНАЙТЕ БОЛЬШЕ",
    "events.title": "Шаг в ваше академическое будущее.",
    "events.eyebrow": "МЕРОПРИЯТИЯ И ВЕБИНАРЫ",
    "events.cta": "Зарегистрироваться",
  },
  de: {
    "nav.chooseIndia": "Indien Wählen",
    "nav.planStudies": "Studienplanung",
    "nav.freeResources": "Kostenlose Ressourcen",
    "nav.courses": "Kurse & Institute",
    "nav.register": "Registrieren",
    "nav.login": "Anmelden",
    "nav.studentReg": "Studenten-Registrierung",
    "nav.instituteReg": "Instituts-Registrierung",
    "nav.studentLogin": "Studenten-Login",
    "nav.instituteLogin": "Instituts-Login",
    "nav.adminLogin": "Admin-Login",
    "hero.eyebrow": "STUDIEREN IN INDIEN",
    "hero.title": "Namaste, beginnen Sie Ihre Bildungsreise in Indien",
    "hero.subtitle": "Weltweit anerkannte Universitäten, Studiengebühren in USD und Stipendien bis zu 100%.",
    "hero.explore": "Kurse Entdecken",
    "hero.apply": "Jetzt Bewerben",
    "stats.institutes": "Institute in Indien",
    "stats.courses": "Studienangebote",
    "roadmap.title": "Schritte zum Studium in Indien",
    "roadmap.eyebrow": "IHR FAHRPLAN",
    "why.title": "Warum in Indien studieren?",
    "why.eyebrow": "ENTDECKEN SIE DEN UNTERSCHIED",
    "events.title": "Starten Sie in Ihre akademische Zukunft.",
    "events.eyebrow": "EVENTS & WEBINARE",
    "events.cta": "Interesse bekunden",
  },
  id: {
    "nav.chooseIndia": "Pilih India",
    "nav.planStudies": "Rencanakan Studi",
    "nav.freeResources": "Sumber Gratis",
    "nav.courses": "Kursus & Institut",
    "nav.register": "Daftar",
    "nav.login": "Masuk",
    "nav.studentReg": "Pendaftaran Mahasiswa",
    "nav.instituteReg": "Pendaftaran Institut",
    "nav.studentLogin": "Login Mahasiswa",
    "nav.instituteLogin": "Login Institut",
    "nav.adminLogin": "Login Admin",
    "hero.eyebrow": "STUDI DI INDIA",
    "hero.title": "Namaste, mulai perjalanan pendidikan Anda di India",
    "hero.subtitle": "Akses universitas berperingkat dunia, biaya kuliah transparan dalam USD, dan beasiswa hingga 100%.",
    "hero.explore": "Jelajahi Kursus",
    "hero.apply": "Daftar Sekarang",
    "stats.institutes": "Institut di India",
    "stats.courses": "Pilihan Kursus",
    "roadmap.title": "Langkah studi di India",
    "roadmap.eyebrow": "PANDUAN ANDA",
    "why.title": "Mengapa Studi di India?",
    "why.eyebrow": "TEMUKAN PERBEDAANNYA",
    "events.title": "Langkah menuju masa depan akademis Anda.",
    "events.eyebrow": "ACARA & WEBINAR",
    "events.cta": "Daftar Minat",
  },
  zh: {
    "nav.chooseIndia": "选择印度",
    "nav.planStudies": "规划留学",
    "nav.freeResources": "免费资源",
    "nav.courses": "课程与院校",
    "nav.register": "注册账户",
    "nav.login": "登录系统",
    "nav.studentReg": "国际学生注册",
    "nav.instituteReg": "大学院校注册",
    "nav.studentLogin": "学生登录",
    "nav.instituteLogin": "院校登录",
    "nav.adminLogin": "管理员登录",
    "hero.eyebrow": "留学印度官方平台",
    "hero.title": "合十礼，开启您在印度的卓越留学之旅",
    "hero.subtitle": "申请世界知名大学，美元透明学费，最高可获100%全额奖学金支持。",
    "hero.explore": "浏览全部课程",
    "hero.apply": "立即申请",
    "stats.institutes": "印度认证高校",
    "stats.courses": "精选专业机会",
    "roadmap.title": "赴印留学六步指南",
    "roadmap.eyebrow": "留学路线图",
    "why.title": "为什么选择留学印度？",
    "why.eyebrow": "探索多元优势",
    "events.title": "迈向您的全球化学术未来",
    "events.eyebrow": "讲座与招生展会",
    "events.cta": "登记报名意向",
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  currentOption: LanguageOption;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  currentOption: LANGUAGES[0],
  t: (key, fallback) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("study_india_lang") as LanguageCode;
    return LANGUAGES.some((l) => l.code === saved) ? saved : "en";
  });

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem("study_india_lang", code);
    
    // Set document direction if RTL
    const opt = LANGUAGES.find((l) => l.code === code);
    if (opt?.rtl) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  };

  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) return langDict[key];
    if (translations.en[key]) return translations.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentOption, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
