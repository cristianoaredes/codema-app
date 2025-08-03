import { readFileSync } from 'fs';
import { join } from 'path';
import { seedSampleData } from './sampleDataSeeder.js';

// Load environment variables from .env.local
function loadEnvLocal() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
    
    console.log('✅ Loaded environment variables from .env.local');
  } catch (error) {
    console.warn('⚠️  Could not load .env.local file:', error.message);
  }
}

async function testSeeder() {
  // Load environment variables first
  loadEnvLocal();
  
  console.log('Testing sample data seeder...');
  try {
    await seedSampleData();
    console.log('Sample data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}

testSeeder();
