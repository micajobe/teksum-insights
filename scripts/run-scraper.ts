import { config } from 'dotenv';
import { resolve } from 'path';
import { runDailyScraper } from '../src/lib/scraper';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('Starting scraper...');

// Run the scraper for today's date
runDailyScraper()
  .then(() => {
    console.log('Scraper completed successfully!');
  })
  .catch((error) => {
    console.error('Error running scraper:', error);
    process.exit(1);
  }); 