export type ResourceNotification = {
  title: string;
  organisation: string;
  category: "Admissions" | "Scholarships" | "Events" | "Guidance";
  location: string;
  date: string;
  status: string;
  summary: string;
  points: string[];
};

export const notifications: ResourceNotification[] = [
  {
    title: "International student application window — 2027 intake",
    organisation: "DRAA Admissions Desk",
    category: "Admissions",
    location: "Partner institutes across India",
    date: "20 Aug 2026",
    status: "Applications opening",
    summary: "A planning notice for students preparing undergraduate and postgraduate applications for the 2027 academic intake.",
    points: ["Start document verification early", "Shortlist programmes by eligibility", "Confirm dates with the chosen institute"],
  },
  {
    title: "Merit-support opportunities for international applicants",
    organisation: "DRAA Student Guidance",
    category: "Scholarships",
    location: "Multiple institutions",
    date: "18 Aug 2026",
    status: "Guidance updated",
    summary: "A consolidated advisory on institution-led fee support, merit awards and the documents commonly requested.",
    points: ["Awards differ by institution", "Academic records may be required", "Review renewal conditions carefully"],
  },
  {
    title: "Live orientation: planning your study journey in India",
    organisation: "DRAA Student Services",
    category: "Events",
    location: "Online session",
    date: "16 Aug 2026",
    status: "Registration open",
    summary: "An introductory session covering programme discovery, applications, arrival planning and student support.",
    points: ["Open to prospective students", "Includes a question session", "Registration confirmation by email"],
  },
  {
    title: "Academic document preparation advisory",
    organisation: "DRAA Application Support",
    category: "Guidance",
    location: "Student resource centre",
    date: "12 Aug 2026",
    status: "New checklist",
    summary: "A practical checklist for preparing transcripts, identification documents and translated academic records.",
    points: ["Use clear, complete scans", "Keep names consistent", "Retain original documents"],
  },
  {
    title: "Short-term and skill programme discovery update",
    organisation: "DRAA Programme Team",
    category: "Admissions",
    location: "Selected partner institutes",
    date: "08 Aug 2026",
    status: "Catalogue refreshed",
    summary: "New professional, certificate and short-duration learning options have been added to the programme catalogue.",
    points: ["Compare course duration", "Check delivery format", "Review entry requirements"],
  },
  {
    title: "Pre-departure guidance sessions announced",
    organisation: "DRAA International Support",
    category: "Events",
    location: "Online and New Delhi",
    date: "04 Aug 2026",
    status: "Schedule available",
    summary: "Focused sessions for admitted students on travel preparation, documents, wellbeing and settling into campus life.",
    points: ["For offer holders", "Bring your questions", "Session notes shared afterwards"],
  },
];

export const educationalBlogs = [
  { title: "How to compare higher-education programmes in India", category: "Programme planning", date: "19 Aug 2026", readTime: "7 min read", image: "/media/resources/campus-collaboration.jpg", alt: "University students comparing notes together on a campus lawn", excerpt: "A practical framework for comparing curriculum, learning format, academic fit and future pathways—not just course titles." },
  { title: "Understanding undergraduate, postgraduate and doctoral pathways", category: "Indian education", date: "14 Aug 2026", readTime: "6 min read", image: "/media/resources/group-study.jpg", alt: "A diverse group of university students collaborating around a study table", excerpt: "Learn how the major qualification levels differ and what to check before building your academic progression plan." },
  { title: "Build a realistic study and living budget", category: "Student life", date: "09 Aug 2026", readTime: "8 min read", image: "/media/resources/library-learning.jpg", imagePosition: "center 82%", alt: "Students studying together in a bright university library", excerpt: "Plan for tuition, housing, transport, daily living and an emergency reserve with a clearer cost checklist." },
  { title: "Your academic document checklist, explained", category: "Applications", date: "02 Aug 2026", readTime: "5 min read", image: "/media/resources/digital-study.jpg", alt: "Two students reviewing academic work on laptops in a library", excerpt: "Understand the common documents requested during applications and how to prepare readable, consistent records." },
  { title: "Choosing a study city that matches your goals", category: "Student life", date: "27 Jul 2026", readTime: "7 min read", image: "/media/resources/library-mentoring.jpg", alt: "Two university students discussing notes beside library bookshelves", excerpt: "Consider academic clusters, climate, transport, community, living costs and the everyday experience around campus." },
  { title: "Received an offer letter? Review these details first", category: "Admissions", date: "21 Jul 2026", readTime: "6 min read", image: "/media/resources/graduate-campus.jpg", imagePosition: "center 55%", alt: "A graduate standing outside on a university campus", excerpt: "A student-friendly guide to programme details, fee schedules, conditions, deadlines and official contact points." },
];

export const recordedVideos = [
  { title: "Inside a diverse university classroom", category: "Campus learning", duration: "00:08", image: "/media/resources/group-study.jpg", video: "/media/resources/classroom-focus.mp4", description: "A short view of focused, multicultural classroom learning and the everyday academic environment.", source: "https://www.pexels.com/video/college-students-in-class-8196806/", credit: "Video by Yan Krukau on Pexels" },
  { title: "Focused study and independent learning", category: "Student experience", duration: "00:15", image: "/media/resources/library-mentoring.jpg", video: "/media/resources/classroom-study.mp4", description: "Students working with books and laptops in a calm learning environment.", source: "https://www.pexels.com/video/students-busy-studying-5676139/", credit: "Video by Ivan S on Pexels" },
  { title: "Student research and peer collaboration", category: "Research culture", duration: "00:10", image: "/media/resources/campus-collaboration.jpg", video: "/media/resources/campus-research.mp4", description: "A campus moment showing students exchanging ideas and working together on research.", source: "https://www.pexels.com/video/students-doing-research-7971020/", credit: "Video by George Pak on Pexels" },
  { title: "Digital learning in a university library", category: "Digital study", duration: "00:17", image: "/media/resources/digital-study.jpg", video: "/media/resources/digital-learning.mp4", description: "Students using laptops together in a bright shared study space.", source: "https://www.pexels.com/video/students-using-laptops-7777997/", credit: "Video by Mikhail Nilov on Pexels" },
];
