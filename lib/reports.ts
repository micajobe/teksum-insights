import { getReportsFromSupabase } from './supabase'

/**
 * Gets the list of available report filenames from Supabase
 * @returns Promise<string[]> Array of report filenames
 */
export async function getAvailableReports(): Promise<string[]> {
  try {
    console.log('Getting available reports from Supabase')
    const reports = await getReportsFromSupabase();
    return reports.map(report => report.filename || '');
  } catch (error) {
    console.error('Error getting available reports:', error)
    return []
  }
} 