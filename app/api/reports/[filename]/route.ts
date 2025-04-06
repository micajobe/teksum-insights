import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the reports directory path
const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports');

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    console.log('API route: Serving report:', filename);
    
    // Check if the reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      console.error('Reports directory not found:', REPORTS_DIR);
      return NextResponse.json(
        { error: 'Reports directory not found' },
        { status: 404 }
      );
    }
    
    // Check if the requested report exists
    const filePath = path.join(REPORTS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error('Report file not found:', filePath);
      return NextResponse.json(
        { error: 'Report file not found' },
        { status: 404 }
      );
    }
    
    // Read the report file
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContents);
    
    // Return the report data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error serving report:', error);
    return NextResponse.json(
      { error: 'Error serving report' },
      { status: 500 }
    );
  }
} 