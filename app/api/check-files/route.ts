import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check the public directory
    const publicDir = path.join(process.cwd(), 'public');
    console.log('Public directory:', publicDir);
    console.log('Public directory exists:', fs.existsSync(publicDir));
    
    // Check the reports directory
    const reportsDir = path.join(publicDir, 'reports');
    console.log('Reports directory:', reportsDir);
    console.log('Reports directory exists:', fs.existsSync(reportsDir));
    
    // List all files in the public directory
    const publicFiles = fs.existsSync(publicDir) 
      ? fs.readdirSync(publicDir) 
      : [];
    
    // List all files in the reports directory
    const reportFiles = fs.existsSync(reportsDir) 
      ? fs.readdirSync(reportsDir) 
      : [];
    
    return NextResponse.json({
      success: true,
      publicDir,
      publicDirExists: fs.existsSync(publicDir),
      publicFiles,
      reportsDir,
      reportsDirExists: fs.existsSync(reportsDir),
      reportFiles
    });
  } catch (error) {
    console.error('Error checking files:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    }, { status: 500 });
  }
} 