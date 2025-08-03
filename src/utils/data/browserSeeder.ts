// Browser-safe seeder interface that doesn't import node-client
// This prevents multiple Supabase client instances in the browser

export const BrowserSampleDataSeeder = {
  async seedAllData() {
    // In browser environment, we can't use the node client with service role key
    // This would need to be handled differently, perhaps through an API endpoint
    throw new Error('Data seeding from browser is not supported. Please use the Node.js seeder script directly.');
  },
  
  async clearAllData() {
    // In browser environment, we can't use the node client with service role key
    // This would need to be handled differently, perhaps through an API endpoint
    throw new Error('Data clearing from browser is not supported. Please use the Node.js seeder script directly.');
  }
};

// For browser environments, we export a safe version that doesn't create multiple clients
export const SampleDataSeeder = BrowserSampleDataSeeder;
