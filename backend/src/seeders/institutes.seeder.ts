import { Institute } from '../models/index';

const instituteSeedData = [
  {
    name: 'DRAA Institute of Technology',
    slug: 'draa-institute-technology',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Technology',
    description: 'Demonstration institution profile for engineering, computing and applied research.',
    imageUrl: '/media/university-building.jpg',
  },
  {
    name: 'DRAA School of Management',
    slug: 'draa-school-management',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'Management',
    description: 'Demonstration institution profile for business, public policy and leadership programmes.',
    imageUrl: '/media/campus-students.jpg',
  },
  {
    name: 'DRAA University of Liberal Studies',
    slug: 'draa-university-liberal-studies',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'Multidisciplinary',
    description: 'Demonstration institution profile for humanities, sciences and interdisciplinary learning.',
    imageUrl: '/media/books-library.jpg',
  },
  {
    name: 'DRAA College of Life Sciences',
    slug: 'draa-college-life-sciences',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Health & Sciences',
    description: 'Demonstration institution profile for health, biotechnology and life-science pathways.',
    imageUrl: '/media/campus-students.jpg',
  },
  {
    name: 'DRAA Institute of Agriculture & Sustainability',
    slug: 'draa-agriculture-sustainability',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    type: 'Agriculture',
    description: 'Demonstration institution profile for agriculture, food systems and sustainability.',
    imageUrl: '/media/university-building.jpg',
  },
  {
    name: 'DRAA Centre for Indian Knowledge Systems',
    slug: 'draa-indian-knowledge-systems',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'Specialist',
    description: 'Demonstration institution profile for yoga, Buddhist studies, languages and cultural learning.',
    imageUrl: '/media/books-library.jpg',
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
