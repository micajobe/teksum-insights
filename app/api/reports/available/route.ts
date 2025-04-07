import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the reports directory path
const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports');
const REPORTS_LIST_FILE = path.join(REPORTS_DIR, 'available-reports.json');

export async function GET() {
  try {
    console.log('API route: Serving available reports list');
    
    // Check if the reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      console.error('Reports directory not found:', REPORTS_DIR);
      return NextResponse.json(
        { error: 'Reports directory not found' },
        { status: 404 }
      );
    }
    
    // Check if the available reports file exists
    if (!fs.existsSync(REPORTS_LIST_FILE)) {
      console.error('Available reports file not found:', REPORTS_LIST_FILE);
      return NextResponse.json(
        { error: 'Available reports file not found' },
        { status: 404 }
      );
    }
    
    // Read the available reports file
    const fileContents = fs.readFileSync(REPORTS_LIST_FILE, 'utf-8');
    const reports = JSON.parse(fileContents);
    
    // Validate that all reports in the list actually exist
    const validReports = reports.filter((report: string) => {
      const reportPath = path.join(REPORTS_DIR, report);
      const exists = fs.existsSync(reportPath);
      if (!exists) {
        console.warn(`Report listed in available-reports.json but file not found: ${report}`);
      }
      return exists;
    });
    
    // Return the available reports list
    return NextResponse.json(validReports);
  } catch (error) {
    console.error('Error serving available reports list:', error);
    return NextResponse.json(
      { error: 'Error serving available reports list' },
      { status: 500 }
    );
  }
} 