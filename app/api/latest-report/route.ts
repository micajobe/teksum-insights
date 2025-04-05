import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the docs directory path
    const docsDir = path.join(process.cwd(), 'docs');
    
    // Read all files in the docs directory
    const files = fs.readdirSync(docsDir);
    
    // Filter for JSON files that match our report pattern
    const jsonFiles = files.filter(file => 
      file.startsWith('tech_business_report_') && 
      file.endsWith('.json')
    );
    
    if (jsonFiles.length === 0) {
      return NextResponse.json(
        { error: 'No report files found' },
        { status: 404 }
      );
    }
    
    // Sort files by name (which includes timestamp) in descending order
    // to get the most recent file
    jsonFiles.sort().reverse();
    const latestFile = jsonFiles[0];
    
    // Read the latest file
    const filePath = path.join(docsDir, latestFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const reportData = JSON.parse(fileContent);
    
    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error fetching latest report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest report' },
      { status: 500 }
    );
  }
} 