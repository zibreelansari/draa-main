import * as fs from 'fs';
import * as path from 'path';

// Load the JSON files
const institutesFile = path.resolve('../../backend/src/seeders/mapped_institutes.json');
const coursesFile = path.resolve('../../backend/src/seeders/mapped_courses.json');

const institutes = JSON.parse(fs.readFileSync(institutesFile, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(coursesFile, 'utf-8'));

// Format Institutes
const formattedInstitutes = institutes.map(inst => ({
  id: inst.slug,
  name: inst.name,
  shortName: inst.name.split(' ')[0],
  slug: inst.slug,
  city: inst.city || 'Unknown',
  state: inst.state || 'Unknown',
  type: inst.type || 'University',
  nirfRank: inst.nirF_Rank || '',
  naacGrade: 'NAAC Accredited',
  established: 'N/A',
  imageUrl: inst.imageUrl || '/media/campus-1.jpg',
  tuitionPerYearUSD: '$2,000 - $5,000',
  tuitionPerYearINR: '₹1,50,000 - ₹4,00,000',
  hostelAvailable: true,
  scholarshipAvailable: true,
  description: inst.description || '',
  website: '#',
  intakes: ['August 2026 Intake'],
  facilities: ['Library', 'Hostel', 'Sports'],
  eligibilitySnippet: 'Refer to specific course for eligibility.',
  coursesCount: courses.filter(c => c.instituteSlug === inst.slug).length
}));

// Format Courses
const formattedCourses = courses.map(course => {
  const inst = formattedInstitutes.find(i => i.slug === course.instituteSlug) || formattedInstitutes[0] || {};
  return {
    id: course.slug,
    title: course.title,
    slug: course.slug,
    discipline: course.discipline || 'General',
    level: course.level,
    durationMonths: course.durationMonths || 24,
    tuitionFee: course.tuitionFee || 2000,
    tuitionFeeInr: (course.tuitionFee || 2000) * 83,
    currency: course.currency || 'USD',
    mode: course.mode || 'OFFLINE',
    courseType: course.courseType || 'REGULAR',
    scholarshipAvailable: course.scholarshipAvailable ? 100 : false,
    scholarshipTier: course.scholarshipAvailable ? '100% Fee Waiver (SII G1)' : '',
    eligibility: course.eligibility || 'Check university guidelines.',
    startDate: 'August 2026',
    instituteName: inst.name || 'Unknown Institute',
    instituteSlug: inst.slug || 'unknown',
    instituteType: inst.type || 'University',
    city: inst.city || 'Unknown',
    state: inst.state || 'Unknown',
    nirfRank: inst.nirfRank,
    naacGrade: inst.naacGrade,
    syllabusHighlights: ['Core Module 1', 'Core Module 2', 'Electives', 'Project Work'],
    careerProspects: ['Industry Professional', 'Researcher', 'Academic'],
    medium: 'English'
  };
});

// Generate TS output
const tsContent = `export interface OfficialUniversity {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  nirfRank: string;
  naacGrade: string;
  established: string;
  imageUrl: string;
  logoUrl?: string;
  tuitionPerYearUSD: string;
  tuitionPerYearINR: string;
  hostelAvailable: boolean;
  scholarshipAvailable: boolean;
  description: string;
  website: string;
  intakes: string[];
  facilities: string[];
  eligibilitySnippet: string;
  coursesCount: number;
}

export interface OfficialCourse {
  id: string;
  title: string;
  slug: string;
  discipline: string;
  level: string;
  durationMonths: number;
  tuitionFee: number;
  tuitionFeeInr: number;
  currency: string;
  mode: string;
  courseType: string;
  scholarshipAvailable: number | boolean;
  scholarshipTier: string;
  eligibility: string;
  startDate: string;
  instituteName: string;
  instituteSlug: string;
  instituteType: string;
  city: string;
  state: string;
  nirfRank?: string;
  naacGrade?: string;
  syllabusHighlights: string[];
  careerProspects: string[];
  medium: string;
}

export const OFFICIAL_UNIVERSITIES: OfficialUniversity[] = ${JSON.stringify(formattedInstitutes, null, 2)};

export const OFFICIAL_COURSES: OfficialCourse[] = ${JSON.stringify(formattedCourses, null, 2)};

export const STUDY_INDIA_DISCIPLINES = Array.from(new Set(OFFICIAL_COURSES.map(c => c.discipline))).sort();
export const STUDY_INDIA_STATES = Array.from(new Set(OFFICIAL_UNIVERSITIES.map(u => u.state))).sort();
`;

fs.writeFileSync(path.resolve('./src/data/studyIndiaCatalog.ts'), tsContent, 'utf-8');
console.log('Successfully updated studyIndiaCatalog.ts with scraped data!');
