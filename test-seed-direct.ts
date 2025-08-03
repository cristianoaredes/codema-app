import { SampleDataSeeder } from './src/utils/data/sampleDataSeeder';

async function testSeeder() {
  console.log('Testing sample data seeder...');
  try {
    await SampleDataSeeder.seedSampleData();
    console.log('Sample data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}

testSeeder();
