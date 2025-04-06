import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These environment variables will need to be set in your .env.local file
// and in your Vercel project settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseKey;
}

// Helper function to get reports from Supabase
export async function getReportsFromSupabase() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Falling back to file system.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching reports from Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching reports from Supabase:', error);
    return null;
  }
}

// Helper function to get a specific report from Supabase
export async function getReportFromSupabase(filename: string) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Falling back to file system.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('filename', filename)
      .single();

    if (error) {
      console.error(`Error fetching report ${filename} from Supabase:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Exception fetching report ${filename} from Supabase:`, error);
    return null;
  }
} 