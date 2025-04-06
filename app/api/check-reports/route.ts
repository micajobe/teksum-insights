import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    console.log('Checking reports directory:', reportsDir);
    console.log('Directory exists:', fs.existsSync(reportsDir));
    
    let files: string[] = [];
    let error = null;
    
    if (fs.existsSync(reportsDir)) {
      files = fs.readdirSync(reportsDir)
        .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
        .sort((a, b) => b.localeCompare(a)); // Sort in descending order (newest first)
      
      console.log('Found files:', files);
    } else {
      error = {
        message: 'Reports directory not found',
        details: {
          reportsDir,
          directoryExists: false
        }
      };
    }
    
    return NextResponse.json({
      success: true,
      reportsDir,
      directoryExists: fs.existsSync(reportsDir),
      files,
      error
    });
  } catch (error) {
    console.error('Error checking reports:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    }, { status: 500 });
  }
} 