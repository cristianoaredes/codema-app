// Data utilities - browser-safe exports
export * from './browserSeeder';

// Note: The actual sampleDataSeeder.ts with node-client should only be used in Node.js environments
// to avoid creating multiple Supabase client instances in the browser 