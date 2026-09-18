import { Institute } from '../models/index';
import * as fs from 'fs';
import * as path from 'path';

export async function seedInstitutes(): Promise<void> {
  let instituteSeedData: any[] = [];
  try {
    const dataPath = path.join(__dirname, 'mapped_institutes.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    instituteSeedData = JSON.parse(rawData);
  } catch (error) {
    console.warn('[Seed] Could not read mapped_institutes.json, falling back to empty.');
  }

  if (instituteSeedData.length === 0) {
    return;
  }

  for (const data of instituteSeedData) {
    await Institute.updateOne(
      { slug: data.slug },
      { $set: data },
      { upsert: true }
    );
  }
  console.log(`[Seed] ${instituteSeedData.length} institutes seeded.`);
}
