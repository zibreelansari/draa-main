import { Institute } from '../models/index';

const instituteSeedData = [
  {
    name: 'DRAA Institute of Technology & AI',
    slug: 'draa-institute-technology',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Technology',
    description: 'Premier national institution for Artificial Intelligence, Computing, Robotics and Advanced Engineering research. NIRF Top 10, NAAC A++ accredited.',
    imageUrl: '/media/university-building.jpg',
  },
  {
    name: 'DRAA School of Global Management',
    slug: 'draa-school-management',
    city: 'New Delhi',
    state: 'Delhi NCR',
    type: 'Management',
    description: 'World-ranked business school offering MBA, FinTech, Global Supply Chain and Leadership programmes with Fortune 500 corporate linkages.',
    imageUrl: '/media/campus-students.jpg',
  },
  {
    name: 'DRAA University of Liberal Studies & Law',
    slug: 'draa-university-liberal-studies',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'Multidisciplinary',
    description: 'Centre of academic excellence for International Law, Economics, Humanities and Interdisciplinary Social Sciences.',
    imageUrl: '/media/books-library.jpg',
  },
  {
    name: 'DRAA College of Life Sciences & Medicine',
    slug: 'draa-college-life-sciences',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Health & Sciences',
    description: 'Leading research institute for Biotechnology, Genomics, Pharmacy, Allied Health and Clinical Sciences.',
    imageUrl: '/media/campus-students.jpg',
  },
  {
    name: 'DRAA Institute of Agriculture & Sustainability',
    slug: 'draa-agriculture-sustainability',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    type: 'Agriculture',
    description: 'Pioneering agricultural technology, food security systems, organic farming and climate resilience research.',
    imageUrl: '/media/university-building.jpg',
  },
  {
    name: 'DRAA Centre for Indian Knowledge Systems & Yoga',
    slug: 'draa-indian-knowledge-systems',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'Specialist',
    description: 'Internationally recognized faculty for Yoga therapy, Vedic mathematics, Buddhist philosophy and classical Sanskrit heritage.',
    imageUrl: '/media/books-library.jpg',
  },
  {
    name: 'National Institute of Design & Digital Arts',
    slug: 'national-institute-design',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Design & Media',
    description: 'Premier creative academy specializing in UI/UX Architecture, 3D Animation, VFX, Industrial Product Design and Fashion Tech.',
    imageUrl: '/media/university-building.jpg',
  },
];

export async function seedInstitutes(): Promise<void> {
  for (const data of instituteSeedData) {
    await Institute.updateOne(
      { slug: data.slug },
      { $set: data },
      { upsert: true }
    );
  }
  console.log(`[Seed] ${instituteSeedData.length} institutes seeded.`);
}
