export interface ExamCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ExamSection {
  name: string;
  questions: number;
  marks: number;
}

export interface ExamPhase {
  name: string;
  duration?: number;
  totalQuestions?: number;
  totalMarks?: number;
  sections?: ExamSection[];
}

export interface Exam {
  _id: string;
  name: string;
  slug: string;
  categoryId: ExamCategory | string;
  examLevel?: string;
  mode?: string;
  status?:"ACTIVE" |"INACTIVE";
  description?: string;

  eligibility?: {
    ageMin?: number;
    ageMax?: number;
    education?: string;
  };

  importantDates?: {
    notificationDate?: string;
    applicationStart?: string;
    applicationEnd?: string;
    examDate?: string;
    resultDate?: string;
  };

  phases?: ExamPhase[];

  seo?: {
    seo_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };

  createdAt?: string;
}
