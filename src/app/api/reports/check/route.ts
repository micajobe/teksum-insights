import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'tech_business_report_20250402_latest.html';
    
    console.log('Checking for report:', filename);
    
    // Get the absolute path to the docs directory
    const docsDir = path.join(process.cwd(), 'docs');
    console.log('Docs directory:', docsDir);
    
    // Check if docs directory exists
    if (!fs.existsSync(docsDir)) {
      console.error('Docs directory does not exist:', docsDir);
      return NextResponse.json(
        { 
          exists: false,
          error: 'Reports directory not found',
          path: docsDir,
          environment: {
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
            cwd: process.cwd(),
          }
        },
        { status: 404 }
      );
    }
    
    const filePath = path.join(docsDir, filename);
    console.log('File path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      
      // List available files in the docs directory
      const files = fs.readdirSync(docsDir);
      console.log('Available files:', files);
      
      return NextResponse.json(
        { 
          exists: false,
          error: 'Report not found',
          requestedFile: filename,
          availableFiles: files,
          path: filePath,
          environment: {
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
          }
        },
        { status: 404 }
      );
    }

    // File exists, get its stats
    const stats = fs.statSync(filePath);
    
    return NextResponse.json({
      exists: true,
      filename,
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
      }
    });
  } catch (error) {
    console.error('Error checking report:', error);
    return NextResponse.json(
      { 
        exists: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
          cwd: process.cwd(),
        }
      },
      { status: 500 }
    );
  }
} 