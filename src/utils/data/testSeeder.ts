#!/usr/bin/env ts-node

import { seedSampleData } from './sampleDataSeeder';

async function testSeeder() {
  console.log('Testing sample data seeder...');
  try {
    await seedSampleData();
    console.log('Sample data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}

testSeeder();
