import { Institute, Course } from '../models/index';
import * as fs from 'fs';
import * as path from 'path';

export async function seedCourses(): Promise<void> {
  let courseSeedData: any[] = [];
  try {
    const dataPath = path.join(__dirname, 'mapped_courses.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    courseSeedData = JSON.parse(rawData);
  } catch (error) {
    console.warn('[Seed] Could not read mapped_courses.json, falling back to empty.');
  }

  if (courseSeedData.length === 0) {
    return;
  }

  let seededCount = 0;
  for (const data of courseSeedData) {
    const institute = await Institute.findOne({ slug: data.instituteSlug });
    if (!institute) {
      // Skipping quietly for missing institutes
      continue;
    }

    await Course.updateOne(
      { slug: data.slug },
      {
        $set: {
          instituteId: institute._id,
          title: data.title,
          slug: data.slug,
          discipline: data.discipline,
          level: data.level,
          durationMonths: data.durationMonths,
          tuitionFee: data.tuitionFee,
          currency: data.currency || 'USD',
          mode: data.mode,
          courseType: data.courseType,
          scholarshipAvailable: data.scholarshipAvailable,
          eligibility: data.eligibility,
          status: 'PUBLISHED',
        },
      },
      { upsert: true }
    );
    seededCount++;
  }
  console.log(`[Seed] ${seededCount} courses seeded.`);
}
