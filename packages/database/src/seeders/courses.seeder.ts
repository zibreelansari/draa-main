import { Institute, Course } from '../models/index';

interface CourseSeed {
  instituteSlug: string;
  title: string;
  slug: string;
  discipline: string;
  level: string;
  durationMonths: number;
  tuitionFeeInr: number;
  mode: string;
  courseType: string;
  scholarshipAvailable: boolean;
  eligibility: string;
  startDate: string;
}

const courseSeedData: CourseSeed[] = [
  { instituteSlug: 'draa-institute-technology', title: 'Bachelor of Computer Science', slug: 'bachelor-computer-science', discipline: 'Engineering & Technology', level: 'UNDERGRADUATE', durationMonths: 48, tuitionFeeInr: 450000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Secondary education with Mathematics and programme-specific minimum results.', startDate: '2027-07-15' },
  { instituteSlug: 'draa-institute-technology', title: 'B.Tech in Artificial Intelligence & Machine Learning', slug: 'btech-artificial-intelligence', discipline: 'Engineering & Technology', level: 'UNDERGRADUATE', durationMonths: 48, tuitionFeeInr: 510000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Secondary education with Physics and Mathematics; additional entrance conditions may apply.', startDate: '2027-07-15' },
  { instituteSlug: 'draa-institute-technology', title: 'Master of Data Science', slug: 'master-data-science', discipline: 'Engineering & Technology', level: 'POSTGRADUATE', durationMonths: 24, tuitionFeeInr: 520000, mode: 'BLENDED', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Relevant bachelor\'s degree with quantitative or computing preparation.', startDate: '2027-08-01' },
  { instituteSlug: 'draa-institute-technology', title: 'PG Diploma in Cybersecurity', slug: 'pg-diploma-cybersecurity', discipline: 'Engineering & Technology', level: 'POSTGRADUATE', durationMonths: 12, tuitionFeeInr: 240000, mode: 'BLENDED', courseType: 'SKILL_BASED', scholarshipAvailable: false, eligibility: 'Bachelor\'s degree; foundational computing knowledge is recommended.', startDate: '2027-01-15' },
  { instituteSlug: 'draa-institute-technology', title: 'Certificate in Web Development', slug: 'certificate-web-development', discipline: 'Computer Applications', level: 'CERTIFICATE', durationMonths: 6, tuitionFeeInr: 85000, mode: 'ONLINE', courseType: 'SKILL_BASED', scholarshipAvailable: false, eligibility: 'Secondary education and basic computer literacy.', startDate: '2027-02-01' },
  { instituteSlug: 'draa-institute-technology', title: 'Certificate in Mobile App Development', slug: 'certificate-mobile-app-development', discipline: 'Computer Applications', level: 'CERTIFICATE', durationMonths: 6, tuitionFeeInr: 95000, mode: 'BLENDED', courseType: 'SKILL_BASED', scholarshipAvailable: false, eligibility: 'Secondary education; prior coding experience is helpful but not mandatory.', startDate: '2027-02-01' },
  { instituteSlug: 'draa-school-management', title: 'Master of Business Administration', slug: 'master-business-administration', discipline: 'Management', level: 'POSTGRADUATE', durationMonths: 24, tuitionFeeInr: 600000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Recognised bachelor\'s degree; institution-specific selection requirements apply.', startDate: '2027-07-10' },
  { instituteSlug: 'draa-school-management', title: 'Master of Public Policy', slug: 'master-public-policy', discipline: 'Law & Public Policy', level: 'POSTGRADUATE', durationMonths: 24, tuitionFeeInr: 420000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Recognised bachelor\'s degree and statement of purpose.', startDate: '2027-07-10' },
  { instituteSlug: 'draa-school-management', title: 'Diploma in Digital Marketing', slug: 'diploma-digital-marketing', discipline: 'Management', level: 'CERTIFICATE', durationMonths: 9, tuitionFeeInr: 120000, mode: 'ONLINE', courseType: 'SKILL_BASED', scholarshipAvailable: false, eligibility: 'Secondary education; suitable for early-career learners and professionals.', startDate: '2027-03-01' },
  { instituteSlug: 'draa-university-liberal-studies', title: 'Bachelor of Liberal Arts', slug: 'bachelor-liberal-arts', discipline: 'Arts & Humanities', level: 'UNDERGRADUATE', durationMonths: 36, tuitionFeeInr: 330000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Recognised secondary education with institution-specific minimum results.', startDate: '2027-07-20' },
  { instituteSlug: 'draa-university-liberal-studies', title: 'Bachelor of Laws', slug: 'bachelor-laws', discipline: 'Law & Public Policy', level: 'UNDERGRADUATE', durationMonths: 60, tuitionFeeInr: 480000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: false, eligibility: 'Recognised secondary education; professional recognition conditions must be checked separately.', startDate: '2027-07-20' },
  { instituteSlug: 'draa-university-liberal-studies', title: 'Bachelor of Hospitality Management', slug: 'bachelor-hospitality-management', discipline: 'Hospitality & Tourism', level: 'UNDERGRADUATE', durationMonths: 36, tuitionFeeInr: 360000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Recognised secondary education and programme-specific language requirements.', startDate: '2027-07-20' },
  { instituteSlug: 'draa-college-life-sciences', title: 'M.Sc. Biotechnology', slug: 'msc-biotechnology', discipline: 'Sciences', level: 'POSTGRADUATE', durationMonths: 24, tuitionFeeInr: 390000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Relevant life-science bachelor\'s degree with laboratory preparation.', startDate: '2027-08-05' },
  { instituteSlug: 'draa-college-life-sciences', title: 'Bachelor of Nursing', slug: 'bachelor-nursing', discipline: 'Allied Health', level: 'UNDERGRADUATE', durationMonths: 48, tuitionFeeInr: 440000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: false, eligibility: 'Secondary education with relevant science subjects; regulatory conditions apply.', startDate: '2027-08-05' },
  { instituteSlug: 'draa-agriculture-sustainability', title: 'B.Sc. Agriculture', slug: 'bsc-agriculture', discipline: 'Agriculture', level: 'UNDERGRADUATE', durationMonths: 48, tuitionFeeInr: 350000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Secondary education with relevant science or agriculture subjects.', startDate: '2027-07-25' },
  { instituteSlug: 'draa-agriculture-sustainability', title: 'PhD in Sustainable Agriculture', slug: 'phd-sustainable-agriculture', discipline: 'Agriculture', level: 'DOCTORAL', durationMonths: 36, tuitionFeeInr: 480000, mode: 'OFFLINE', courseType: 'REGULAR', scholarshipAvailable: true, eligibility: 'Relevant postgraduate degree, research proposal and supervisor alignment.', startDate: '2027-01-10' },
  { instituteSlug: 'draa-indian-knowledge-systems', title: 'Certificate in Yoga Studies', slug: 'certificate-yoga-studies', discipline: 'Yoga & Wellness', level: 'CERTIFICATE', durationMonths: 6, tuitionFeeInr: 70000, mode: 'BLENDED', courseType: 'SHORT_TERM', scholarshipAvailable: false, eligibility: 'Open to eligible adult learners; health declarations may be required.', startDate: '2027-02-15' },
  { instituteSlug: 'draa-indian-knowledge-systems', title: 'Certificate in Buddhist Studies', slug: 'certificate-buddhist-studies', discipline: 'Indian Knowledge Systems', level: 'CERTIFICATE', durationMonths: 6, tuitionFeeInr: 65000, mode: 'ONLINE', courseType: 'SHORT_TERM', scholarshipAvailable: false, eligibility: 'Open to eligible adult learners with suitable language proficiency.', startDate: '2027-02-15' },
];

export async function seedCourses(): Promise<void> {
  // Build a slug → _id map for institutes
  const institutes = await Institute.find({}, { slug: 1 }).lean();
  const slugToId = new Map(institutes.map((i) => [i.slug, i._id]));

  for (const data of courseSeedData) {
    const instituteId = slugToId.get(data.instituteSlug);
    if (!instituteId) {
      console.warn(`[Seed] Institute "${data.instituteSlug}" not found, skipping course "${data.title}"`);
      continue;
    }

    const { instituteSlug, ...courseData } = data;
    await Course.updateOne(
      { slug: courseData.slug },
      { $set: { ...courseData, instituteId } },
      { upsert: true }
    );
  }
  console.log(`[Seed] ${courseSeedData.length} courses seeded.`);
}
