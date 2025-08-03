import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
function loadEnvLocal() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    console.log('Reading from:', envPath);
    const envContent = readFileSync(envPath, 'utf8');
    console.log('File content length:', envContent.length);
    
    const lines = envContent.split('\n');
    console.log('Number of lines:', lines.length);
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      console.log(`Line ${index + 1}: "${trimmedLine}"`);
      
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
          console.log(`Set ${key} = ${value.substring(0, 20)}...`);
        }
      }
    });
    
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('VITE_SUPABASE_URL exists:', !!process.env.VITE_SUPABASE_URL);
    
  } catch (error) {
    console.error('Error loading .env.local:', error.message);
  }
}

loadEnvLocal();
