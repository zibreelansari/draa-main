import { connectDatabase, disconnectDatabase } from '../connection';
import { seedInstitutes } from './institutes.seeder';
import { seedCourses } from './courses.seeder';
import { seedDemoUsers } from './demo-users.seeder';

export async function runAllSeeders(): Promise<void> {
  console.log('[Seed] Starting database seeding...');
  await connectDatabase();
  await seedInstitutes();
  await seedCourses();
  await seedDemoUsers();
  console.log('[Seed] Database seeding completed successfully.');
}

// Allow direct execution: node dist/seeders/index.js
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seeders/index.ts') || process.argv[1]?.endsWith('seeders/index.js')) {
  runAllSeeders()
    .then(() => disconnectDatabase())
    .catch((err) => {
      console.error('[Seed] Seeding failed:', err);
      process.exit(1);
    });
}
