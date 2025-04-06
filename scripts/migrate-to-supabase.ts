import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the reports directory
const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports');

// Function to read the available reports
async function getAvailableReports(): Promise<string[]> {
  try {
    const availableReportsPath = path.join(REPORTS_DIR, 'available-reports.json');
    
    if (!fs.existsSync(availableReportsPath)) {
      console.error('Available reports file not found:', availableReportsPath);
      return [];
    }
    
    const fileContents = fs.readFileSync(availableReportsPath, 'utf-8');
    const reports = JSON.parse(fileContents);
    
    return reports;
  } catch (error) {
    console.error('Error reading available reports:', error);
    return [];
  }
}

// Function to migrate a report to Supabase
async function migrateReport(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(REPORTS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Report file not found: ${filePath}`);
      return false;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContents);
    
    // Insert the report into Supabase
    const { error } = await supabase
      .from('reports')
      .upsert({
        filename,
        data,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    
    if (error) {
      console.error(`Error migrating report ${filename}:`, error);
      return false;
    }
    
    console.log(`Successfully migrated report ${filename}`);
    return true;
  } catch (error) {
    console.error(`Error migrating report ${filename}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting migration to Supabase...');
  
  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }
  
  // Get available reports
  const reports = await getAvailableReports();
  console.log(`Found ${reports.length} reports to migrate`);
  
  // Migrate each report
  let successCount = 0;
  let failureCount = 0;
  
  for (const report of reports) {
    const success = await migrateReport(report);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log(`Migration complete. Successfully migrated ${successCount} reports, failed to migrate ${failureCount} reports.`);
}

// Run the main function
main().catch(console.error); 