export interface University {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  city: string;
  state: string;
  type: "Central University" | "State University" | "Deemed University" | "Institute of National Importance" | "Private University";
  nirfRank?: string;
  naacGrade: string;
  established: string;
  campusImage: string;
  logo: string;
  tuitionPerYearUSD: string;
  tuitionPerYearINR: string;
  hostelAvailable: boolean;
  scholarshipAvailable: boolean;
  popularCourses: string[];
  description: string;
  website: string;
  intakes: string[];
  facilities: string[];
  eligibilitySnippet: string;
}

export interface Discipline {
  id: string;
  name: string;
  title: string;
  slug: string;
  iconName: string;
  description: string;
  degreeLevels: string[];
  popularCourses: string[];
  avgTuitionUSD: string;
  careerPaths: string[];
  image: string;
}

export interface Course {
  id: string;
  name: string;
  university: string;
  universityId: string;
  state: string;
  level: "Undergraduate" | "Postgraduate" | "PhD" | "AYUSH";
  duration: string;
  stream: string;
  annualFeeUSD: string;
  annualFeeINR: string;
  eligibility: string;
  specializations: string[];
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  type: "Merit Waiver" | "Regional Grant" | "Specialized Award";
  discount: string;
  eligibility: string;
  coverage: string;
  deadline: string;
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  tagline: string;
  avgLivingCostUSD: string;
  climate: string;
  image: string;
  universitiesCount: string;
  description: string;
  highlights: string[];
}

export interface Testimonial {
  name: string;
  country: string;
  course: string;
  university: string;
  image: string;
  quote: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  mode: "Virtual (Online)" | "In-Person";
  venue: string;
  category: "Webinar" | "Virtual Fair" | "Counselling Session";
  description: string;
}

export const UNIVERSITIES: University[] = [
  {
    id: "delhi-university",
    name: "University of Delhi",
    shortName: "DU",
    slug: "university-of-delhi",
    city: "New Delhi",
    state: "Delhi",
    type: "Central University",
    nirfRank: "NIRF #11 (Overall)",
    naacGrade: "NAAC A++",
    established: "1922",
    campusImage: "/media/university-building.jpg",
    logo: "/brand/draa-mark.png",
    tuitionPerYearUSD: "$2,200 – $4,500",
    tuitionPerYearINR: "₹1,80,000 – ₹3,80,000",
    hostelAvailable: true,
    scholarshipAvailable: true,
    popularCourses: ["B.Sc Computer Science", "BA (Hons) Economics", "B.Com (Hons)", "MBA", "MA International Relations"],
    description: "Premier multidisciplinary collegiate research university offering internationally acclaimed undergraduate, postgraduate, and doctoral curricula.",
    website: "https://du.ac.in",
    intakes: ["August 2026 Intake", "January 2027 Intake"],
    facilities: ["International Student Hostel", "Central Library (1.5M Books)", "Sports Complex", "High-Speed Wi-Fi Campus", "Health Centre"],
    eligibilitySnippet: "Minimum 60% in 10+2 / High School for UG; 55% in Bachelor's for PG."
  },
  {
    id: "iisc-bengaluru",
    name: "Indian Institute of Science",
    shortName: "IISc",
    slug: "iisc-bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Institute of National Importance",
    nirfRank: "NIRF #1 (University)",
    naacGrade: "Institute of Eminence",
    established: "1909",
    campusImage: "/media/campus-students.jpg",
    logo: "/brand/draa-mark.png",
    tuitionPerYearUSD: "$3,500 – $7,000",
    tuitionPerYearINR: "₹2,90,000 – ₹5,80,000",
    hostelAvailable: true,
    scholarshipAvailable: true,
    popularCourses: ["M.Tech Artificial Intelligence", "B.Tech Mathematics & Computing", "Ph.D. Computational Sciences", "M.Sc Life Sciences"],
    description: "India's highest-ranked research institution for advanced scientific research, quantum technology, computing, and high-impact doctoral programmes.",
    website: "https://iisc.ac.in",
    intakes: ["August 2026 Intake"],
    facilities: ["Supercomputing Centre", "Advanced Research Labs", "Single Occupancy Hostels", "Gymkhana Sports", "Innovation Incubator"],
    eligibilitySnippet: "Relevant Science/Engineering degree with first-class honors (65%+ or equivalent GPA)."
  },
  {
    id: "jnu-delhi",
    name: "Jawaharlal Nehru University",
    shortName: "JNU",
    slug: "jawaharlal-nehru-university",
    city: "New Delhi",
    state: "Delhi",
    type: "Central University",
    nirfRank: "NIRF #2 (University)",
    naacGrade: "NAAC A++",
    established: "1969",
    campusImage: "/media/books-library.jpg",
    logo: "/brand/draa-mark.png",
    tuitionPerYearUSD: "$1,800 – $3,500",
    tuitionPerYearINR: "₹1,50,000 – ₹2,90,000",
    hostelAvailable: true,
    scholarshipAvailable: true,
    popularCourses: ["MA International Relations", "BA Foreign Languages", "M.Sc Biotechnology", "Ph.D. Social Sciences"],
    description: "World-renowned public research university known for its intellectual rigor, diplomatic studies, foreign languages, and liberal arts.",
    website: "https://jnu.ac.in",
    intakes: ["August 2026 Intake"],
    facilities: ["1,000 Acre Green Campus", "24/7 Central Library", "International Guest House", "Open Air Theatre", "Cafeterias"],
    eligibilitySnippet: "Minimum 50% in qualifying secondary/undergraduate examination."
  },
  {
    id: "manipal-university",
    name: "Manipal Academy of Higher Education",
    shortName: "MAHE",
    slug: "manipal-academy-of-higher-education",
    city: "Manipal",
    state: "Karnataka",
    type: "Deemed University",
    nirfRank: "NIRF Top 6 (University)",
    naacGrade: "NAAC A++ • Institute of Eminence",
    established: "1953",
    campusImage: "/media/study-india-campus.png",
    logo: "/brand/draa-mark.png",
    tuitionPerYearUSD: "$4,200 – $9,500",
    tuitionPerYearINR: "₹3,50,000 – ₹7,90,000",
    hostelAvailable: true,
    scholarshipAvailable: true,
    popularCourses: ["B.Tech Computer Science", "B.Pharm", "B.Des Product Design", "MBA Global", "B.Arch Architecture"],
    description: "A world-class university township hosting students from over 60 countries across comprehensive multidisciplinary faculties.",
    website: "https://manipal.edu",
    intakes: ["July 2026 Intake", "September 2026 Intake"],
    facilities: ["Marena Multi-Sport Complex", "Simulation Labs", "Air-Conditioned Hostels", "Global Food Courts", "Innovation Center"],
    eligibilitySnippet: "Passed 10+2 with Physics, Chemistry, Maths/Biology (55%+ marks)."
  },
  {
    id: "anna-university",
    name: "Anna University",
    shortName: "Anna Univ",
    slug: "anna-university",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "State University",
    nirfRank: "NIRF Top 13 (Engineering)",
    naacGrade: "NAAC A++",
    established: "1978",
    campusImage: "/media/campus-students.jpg",
    logo: "/brand/draa-mark.png",
    tuitionPerYearUSD: "$2,400 – $5,000",
    tuitionPerYearINR: "₹2,00,000 – ₹4,20,000",
    hostelAvailable: true,
    scholarshipAvailable: true,
    popularCourses: ["B.E. Mechanical Engineering", "B.Tech Information Technology", "M.E. Structural Engineering", "MBA"],
    description: "South India's flagship engineering and technological university with extensive industry partnerships in automotive and software sectors.",
    website: "https://annauniv.edu",
    intakes: ["August 2026 Intake"],
    facilities: ["Industrial CAD/CAM Labs", "NRI/Foreign Students Hostel", "Ramanujan Computing Centre", "Sports Stadium"],
    eligibilitySnippet: "Mathematics, Physics, Chemistry in High School with 60%+ aggregate."
  },
  {
    id: "ashoka-university",
    name: "Ashoka University",
    shortName: "Ashoka",
    slug: "ashoka-university",
    city: "Sonipat (NCR)",
    state: "Haryana",
    type: "Private University",
    nirfRank: "Top Ranked Liberal Arts",
    naacGrade: "UGC Recognised",
    established: "2014",
    campusImage: "/media/university-building.jpg",
    logo: "/brand/draa-mark.png",
    tuitionPerYearUSD: "$7,500 – $12,000",
    tuitionPerYearINR: "₹6,20,000 – ₹9,90,000",
    hostelAvailable: true,
    scholarshipAvailable: true,
    popularCourses: ["B.Sc (Hons) Computer Science", "BA (Hons) Economics", "BA (Hons) Psychology", "Young India Fellowship"],
    description: "Pioneer in world-class liberal arts and interdisciplinary sciences, offering Ivy-League style seminar teaching in modern residential campuses.",
    website: "https://ashoka.edu.in",
    intakes: ["August 2026 Intake"],
    facilities: ["100% Residential Campus", "Trivedi Science Centre", "Performing Arts Black Box", "Olympic Standard Pool"],
    eligibilitySnippet: "Holistic admissions review: Academic transcripts, essay, and online interview."
  }
];

export const DISCIPLINES: Discipline[] = [
  {
    id: "engineering",
    name: "Engineering & Technology",
    title: "Engineering & Technology",
    slug: "engineering-technology",
    iconName: "Cpu",
    description: "Cutting-edge B.Tech and M.Tech programmes in Artificial Intelligence, Computer Science, Robotics, Mechanical, Civil, and Aerospace.",
    degreeLevels: ["B.Tech (4 Years)", "M.Tech (2 Years)", "Ph.D."],
    popularCourses: ["Computer Science & Engineering", "Artificial Intelligence & Data Science", "Mechanical & Mechatronics", "Civil & Environmental"],
    avgTuitionUSD: "$2,500 – $6,500 / year",
    careerPaths: ["Software Architect", "AI Engineer", "Robotics Specialist", "Structural Consultant"],
    image: "/media/campus-students.jpg"
  },
  {
    id: "management",
    name: "Management & Business",
    title: "Management & Business Administration",
    slug: "management-business",
    iconName: "Briefcase",
    description: "Globally accredited BBA and MBA programmes focused on international trade, financial markets, analytics, supply chain, and entrepreneurship.",
    degreeLevels: ["BBA (3 Years)", "MBA (2 Years)", "Executive PGDM"],
    popularCourses: ["MBA International Business", "BBA Finance & Analytics", "MBA Marketing Strategy", "Supply Chain Management"],
    avgTuitionUSD: "$3,000 – $9,000 / year",
    careerPaths: ["Management Consultant", "Investment Banker", "Product Manager", "Global Operations Director"],
    image: "/media/university-building.jpg"
  },
  {
    id: "science",
    name: "Science & Research",
    title: "Pure & Applied Sciences",
    slug: "science-mathematics",
    iconName: "BookOpen",
    description: "High-impact research degrees in Physics, Chemistry, Mathematics, Computational Biology, Data Analytics, and Environmental Sciences.",
    degreeLevels: ["B.Sc (3-4 Years)", "M.Sc (2 Years)", "Integrated Ph.D."],
    popularCourses: ["B.Sc (Hons) Mathematics", "M.Sc Data Science", "M.Sc Biotechnology", "M.Sc Physics"],
    avgTuitionUSD: "$1,800 – $4,500 / year",
    careerPaths: ["Research Scientist", "Quantitative Analyst", "Biotechnologist", "Data Modeler"],
    image: "/media/books-library.jpg"
  },
  {
    id: "humanities",
    name: "Humanities & Social Sci.",
    title: "Humanities, Social Sciences & Law",
    slug: "humanities-social-sciences-law",
    iconName: "Globe",
    description: "Rich exploration of international relations, economics, political science, literature, history, and integrated BA-LLB legal education.",
    degreeLevels: ["BA (3-4 Years)", "MA (2 Years)", "BA-LLB (5 Years)", "LLM"],
    popularCourses: ["BA (Hons) Economics", "BA (Hons) International Relations", "BA-LLB Integrated", "MA Public Policy"],
    avgTuitionUSD: "$1,800 – $5,000 / year",
    careerPaths: ["Policy Analyst", "Diplomatic Envoy", "Corporate Lawyer", "Economic Consultant"],
    image: "/media/study-india-campus.png"
  },
  {
    id: "healthcare",
    name: "Healthcare & Pharmacy",
    title: "Healthcare, Pharmacy & Nursing",
    slug: "healthcare-pharmacy",
    iconName: "HeartPulse",
    description: "Globally aligned healthcare education in Pharmacy, Public Health, Physiotherapy, Medical Laboratory Technology, and Clinical Research.",
    degreeLevels: ["B.Pharm (4 Years)", "M.Pharm (2 Years)", "Master of Public Health (MPH)", "B.Sc Nursing"],
    popularCourses: ["Bachelor of Pharmacy (B.Pharm)", "Master of Public Health", "M.Sc Clinical Research", "B.P.T Physiotherapy"],
    avgTuitionUSD: "$2,800 – $7,000 / year",
    careerPaths: ["Clinical Pharmacist", "Public Health Officer", "Pharmaceutical QA Lead", "Hospital Administrator"],
    image: "/media/campus-students.jpg"
  },
  {
    id: "ayush",
    name: "Yoga & AYUSH",
    title: "Yoga & Indian Knowledge Systems (AYUSH)",
    slug: "yoga-indian-knowledge-systems",
    iconName: "Sparkles",
    description: "Authentic, traditional degrees in Classical Yogic Science, Ayurvedic Lifestyle, Naturopathy, Sanskrit literature, and Holistic Wellness.",
    degreeLevels: ["B.Sc Yogic Science (3 Years)", "M.Sc Yoga Therapy (2 Years)", "PG Diploma Ayurveda"],
    popularCourses: ["B.Sc Yoga & Holistic Health", "M.Sc Yogic Science", "Diploma in Ayurvedic Wellness", "Certificate in Vedic Studies"],
    avgTuitionUSD: "$1,500 – $3,500 / year",
    careerPaths: ["Certified Yoga Master", "Wellness Director", "Holistic Therapist", "Mindfulness Researcher"],
    image: "/media/books-library.jpg"
  }
];

export const COURSES: Course[] = [
  {
    id: "du-cs-ug",
    name: "B.Sc (Hons) Computer Science",
    university: "University of Delhi",
    universityId: "delhi-university",
    state: "Delhi",
    level: "Undergraduate",
    duration: "3 - 4 Years",
    stream: "Engineering",
    annualFeeUSD: "$2,400 / year",
    annualFeeINR: "₹2,00,000 / year",
    eligibility: "60% aggregate in 10+2 with Mathematics",
    specializations: ["Artificial Intelligence", "Data Structures", "Web Development", "Machine Learning"]
  },
  {
    id: "iisc-ai-pg",
    name: "M.Tech in Artificial Intelligence",
    university: "Indian Institute of Science",
    universityId: "iisc-bengaluru",
    state: "Karnataka",
    level: "Postgraduate",
    duration: "2 Years",
    stream: "Engineering",
    annualFeeUSD: "$3,800 / year",
    annualFeeINR: "₹3,15,000 / year",
    eligibility: "Bachelor's in CS / IT / Engineering (65%+)",
    specializations: ["Deep Learning", "Computer Vision", "Natural Language Processing", "Autonomous Systems"]
  },
  {
    id: "manipal-mba",
    name: "MBA in International Business",
    university: "Manipal Academy of Higher Education",
    universityId: "manipal-university",
    state: "Karnataka",
    level: "Postgraduate",
    duration: "2 Years",
    stream: "Management",
    annualFeeUSD: "$5,500 / year",
    annualFeeINR: "₹4,50,000 / year",
    eligibility: "Bachelor's in any discipline (50%+)",
    specializations: ["Global Supply Chain", "Fintech", "Marketing Analytics", "Trade Economics"]
  },
  {
    id: "jnu-ir-ma",
    name: "MA in International Relations & Politics",
    university: "Jawaharlal Nehru University",
    universityId: "jnu-delhi",
    state: "Delhi",
    level: "Postgraduate",
    duration: "2 Years",
    stream: "Humanities",
    annualFeeUSD: "$1,800 / year",
    annualFeeINR: "₹1,50,000 / year",
    eligibility: "Bachelor's degree with 50% marks",
    specializations: ["Diplomacy", "Geopolitics", "Public Policy", "Global Security"]
  },
  {
    id: "anna-btech-it",
    name: "B.Tech Information Technology",
    university: "Anna University",
    universityId: "anna-university",
    state: "Tamil Nadu",
    level: "Undergraduate",
    duration: "4 Years",
    stream: "Engineering",
    annualFeeUSD: "$2,800 / year",
    annualFeeINR: "₹2,30,000 / year",
    eligibility: "10+2 with Physics, Chemistry, Maths (60%+)",
    specializations: ["Cloud Computing", "Cyber Security", "Full Stack Development", "IoT"]
  },
  {
    id: "ashoka-economics-ug",
    name: "BA (Hons) Economics & Finance",
    university: "Ashoka University",
    universityId: "ashoka-university",
    state: "Haryana",
    level: "Undergraduate",
    duration: "3 - 4 Years",
    stream: "Management",
    annualFeeUSD: "$8,500 / year",
    annualFeeINR: "₹7,00,000 / year",
    eligibility: "High school completion with Mathematics",
    specializations: ["Econometrics", "Macroeconomic Policy", "Behavioral Economics", "Corporate Finance"]
  },
  {
    id: "du-yoga-ayush",
    name: "B.Sc Yogic Science & Holistic Wellness",
    university: "University of Delhi",
    universityId: "delhi-university",
    state: "Delhi",
    level: "AYUSH",
    duration: "3 Years",
    stream: "AYUSH",
    annualFeeUSD: "$1,600 / year",
    annualFeeINR: "₹1,30,000 / year",
    eligibility: "High School Diploma / 10+2 in any stream",
    specializations: ["Classical Hatha Yoga", "Ayurvedic Nutrition", "Yoga Therapy", "Meditation Science"]
  }
];

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sii-merit-waiver-100",
    name: "Study in India 100% Tuition Fee Waiver",
    provider: "Partner University Merit Scheme",
    type: "Merit Waiver",
    discount: "100% Tuition Exemption",
    eligibility: "International students scoring 85%+ or Top 10th percentile in qualifying exams.",
    coverage: "Covers 100% of academic tuition fees for the standard duration of the degree.",
    deadline: "30 June 2026"
  },
  {
    id: "sii-merit-waiver-50",
    name: "Study in India 50% Tuition Fee Concession",
    provider: "Consortium of Accredited Campuses",
    type: "Merit Waiver",
    discount: "50% Tuition Reduction",
    eligibility: "International students scoring 70% – 84% in secondary/undergraduate exams.",
    coverage: "Reduces annual tuition fees by 50% across selected degree streams.",
    deadline: "15 July 2026"
  },
  {
    id: "women-in-tech-grant",
    name: "Global Women in STEM Scholarship",
    provider: "DRAA Technical Education Partners",
    type: "Specialized Award",
    discount: "Up to $3,000 / Year",
    eligibility: "Female international applicants admitted into B.Tech, M.Tech, or AI degrees.",
    coverage: "Direct financial credit towards annual tuition and campus hostel fees.",
    deadline: "31 July 2026"
  }
];

export const CITIES: CityInfo[] = [
  {
    id: "delhi-ncr",
    name: "New Delhi & NCR",
    state: "Delhi NCR",
    tagline: "The Capital & Heart of Indian Academia",
    avgLivingCostUSD: "$300 – $500 / month",
    climate: "Subtropical (Pleasant Winters, Sunny Summers)",
    image: "/media/university-building.jpg",
    universitiesCount: "25+ Top Universities",
    description: "New Delhi is a vibrant cosmopolitan metropolis offering unmatched academic resources, central research libraries, cultural diplomacy centers, and rapid metro connectivity.",
    highlights: ["Historic Heritage Monuments", "National Research Libraries", "World-Class Metro Network", "Diplomatic Community Hubs"]
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    tagline: "Silicon Valley of Asia & Technology Capital",
    avgLivingCostUSD: "$350 – $550 / month",
    climate: "Pleasant & Moderate Year-Round",
    image: "/media/campus-students.jpg",
    universitiesCount: "30+ Universities & Tech Hubs",
    description: "Home to hundreds of global R&D centers, IT giants, and biotech startups. Students in Bengaluru enjoy pleasant weather and direct exposure to modern tech innovation.",
    highlights: ["Global Tech Ecosystem", "Vibrant Student Cafes", "Pleasant Climate", "Startup Incubators"]
  },
  {
    id: "mumbai-pune",
    name: "Mumbai & Pune",
    state: "Maharashtra",
    tagline: "Financial Capital & The Oxford of the East",
    avgLivingCostUSD: "$350 – $600 / month",
    climate: "Coastal Tropical / Mild Pleasant in Pune",
    image: "/media/study-india-campus.png",
    universitiesCount: "40+ Higher Education Campuses",
    description: "The economic powerhouse of India combined with Pune's historic student town atmosphere, hosting tens of thousands of international students each year.",
    highlights: ["Financial Headquarters", "Cosmopolitan Culture", "Leading Management Schools", "Coastal Promenades"]
  },
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    tagline: "Cultural Capital & Industrial/Healthcare Hub",
    avgLivingCostUSD: "$250 – $400 / month",
    climate: "Warm Coastal Climate",
    image: "/media/books-library.jpg",
    universitiesCount: "20+ Premier Institutes",
    description: "Renowned for its high safety standards, world-class healthcare, classical arts festivals, and prominent automotive manufacturing corridors.",
    highlights: ["Safest Metro City", "Premier Engineering Institutes", "Golden Beaches", "Healthcare Hub"]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Fatima Al-Mansoor",
    country: "United Arab Emirates",
    course: "B.Tech Artificial Intelligence",
    university: "University of Delhi",
    image: "/media/campus-students.jpg",
    quote: "Studying in India provided me with high-caliber technical training and research exposure that was completely in English, at a third of the tuition cost in the West."
  },
  {
    name: "Bishal Shrestha",
    country: "Nepal",
    course: "MBA in International Business",
    university: "Manipal Academy of Higher Education",
    image: "/media/study-india-campus.png",
    quote: "The campus infrastructure, international student hostel, and career placement mentorship were beyond my expectations. India is truly a global study hub."
  },
  {
    name: "Kwame Mensah",
    country: "Ghana",
    course: "M.Sc Computational Data Science",
    university: "Indian Institute of Science",
    image: "/media/university-building.jpg",
    quote: "The professors here are world-renowned researchers. The laboratory access and practical coding challenges prepare you directly for global tech roles."
  }
];

export const EVENTS: EventItem[] = [
  {
    id: "event-1",
    title: "Study in India 2026-27 Virtual Admissions Masterclass",
    date: "28 August 2026",
    time: "4:00 PM IST (GMT +5:30)",
    mode: "Virtual (Online)",
    venue: "Live Online (Zoom / YouTube Live)",
    category: "Webinar",
    description: "Direct walk-through of the 5-step application process, fee waiver eligibility, certified documentation, and student visa guidance."
  },
  {
    id: "event-2",
    title: "Engineering & Computer Science International Expo",
    date: "12 September 2026",
    time: "2:00 PM – 7:00 PM IST",
    mode: "Virtual (Online)",
    venue: "Interactive Virtual Auditorium",
    category: "Virtual Fair",
    description: "Meet deans and admission directors from 20+ top accredited engineering universities in India. Spot provisional admission assessments available."
  },
  {
    id: "event-3",
    title: "Student Visa (S-Visa) & e-FRRO Documentation Workshop",
    date: "25 September 2026",
    time: "5:30 PM IST",
    mode: "Virtual (Online)",
    venue: "Live Interactive Session",
    category: "Counselling Session",
    description: "Everything international applicants need to prepare for embassy appointments, financial proof, police clearance, and campus onboarding."
  }
];

export const FAQS = [
  {
    q: "Is the medium of instruction in Indian Universities English?",
    a: "Yes, 100% of undergraduate, postgraduate, and research degree programmes in accredited Indian universities are taught, examined, and published in English.",
    question: "Is the medium of instruction in Indian Universities English?",
    answer: "Yes, 100% of undergraduate, postgraduate, and research degree programmes in accredited Indian universities are taught, examined, and published in English."
  },
  {
    q: "How does the 5-step Study in India application process work?",
    a: "Step 1: Register on the Student Portal. Step 2: Search & select your desired course and university. Step 3: Submit your application and academic transcripts. Step 4: Receive your Offer Letter and Fee Concession. Step 5: Apply for your Indian Student Visa and travel.",
    question: "How does the 5-step Study in India application process work?",
    answer: "Step 1: Register on the Student Portal. Step 2: Search & select your desired course and university. Step 3: Submit your application and academic transcripts. Step 4: Receive your Offer Letter and Fee Concession. Step 5: Apply for your Indian Student Visa and travel."
  },
  {
    q: "What are the average living and hostel expenses?",
    a: "On-campus university hostels with meal plans typically range from $1,500 to $2,500 per academic year, making living expenses in India among the most affordable in the world.",
    question: "What are the average living and hostel expenses?",
    answer: "On-campus university hostels with meal plans typically range from $1,500 to $2,500 per academic year, making living expenses in India among the most affordable in the world."
  },
  {
    q: "How do I apply for an Indian Student Visa (S-Visa)?",
    a: "Once you receive your official Provisional Admission Letter from your chosen university, you can apply for the Indian Student Visa at the nearest Indian Embassy/Consulate or via the official online visa portal.",
    question: "How do I apply for an Indian Student Visa (S-Visa)?",
    answer: "Once you receive your official Provisional Admission Letter from your chosen university, you can apply for the Indian Student Visa at the nearest Indian Embassy/Consulate or via the official online visa portal."
  },
  {
    q: "Are Indian university degrees recognised worldwide?",
    a: "Yes, degrees granted by universities recognised by the University Grants Commission (UGC) and Association of Indian Universities (AIU) are globally recognized for higher education and international employment.",
    question: "Are Indian university degrees recognised worldwide?",
    answer: "Yes, degrees granted by universities recognised by the University Grants Commission (UGC) and Association of Indian Universities (AIU) are globally recognized for higher education and international employment."
  }
];
