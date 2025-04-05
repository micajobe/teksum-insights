import fs from 'fs';
import path from 'path';
import { Report } from '@/types';

/**
 * Gets all report files from the data directory
 * @returns An array of report file paths
 */
export function getReportFiles(): string[] {
  const dataDir = path.join(process.cwd(), 'src/data/reports');
  
  // Check if data directory exists
  if (!fs.existsSync(dataDir)) {
    console.error('Reports data directory not found');
    return [];
  }
  
  // Get all JSON files
  const files = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.json'));
  
  // Sort by date (newest first)
  files.sort((a, b) => {
    const dateA = a.replace('.json', '');
    const dateB = b.replace('.json', '');
    return dateB.localeCompare(dateA);
  });
  
  return files;
}

/**
 * Gets a report by its ID
 * @param id The report ID
 * @returns The report object or null if not found
 */
export function getReportById(id: string): Report | null {
  const dataDir = path.join(process.cwd(), 'src/data/reports');
  const filePath = path.join(dataDir, `${id}.json`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Report file not found: ${filePath}`);
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as Report;
  } catch (error) {
    console.error(`Error reading report file: ${error}`);
    return null;
  }
}

/**
 * Gets all reports
 * @returns An array of report objects
 */
export function getAllReports(): Report[] {
  const files = getReportFiles();
  
  return files.map(file => {
    const id = file.replace('.json', '');
    return getReportById(id);
  }).filter(Boolean) as Report[];
}

/**
 * Gets the latest report
 * @returns The latest report object or null if not found
 */
export function getLatestReport(): Report | null {
  const files = getReportFiles();
  
  if (files.length === 0) {
    return null;
  }
  
  const latestFile = files[0];
  const id = latestFile.replace('.json', '');
  
  return getReportById(id);
} 