/* eslint-disable no-undef */
const { exec } = require('child_process');

console.log('Testing sample data seeder...');

exec('npx tsx src/utils/data/sampleDataSeeder.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('Sample data seeding completed successfully!');
});
