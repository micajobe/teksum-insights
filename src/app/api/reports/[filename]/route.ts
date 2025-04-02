import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  context: { params: { filename: string } }
) {
  try {
    const { filename } = context.params;
    console.log('Requested filename:', filename);
    
    // Get the absolute path to the docs directory
    const docsDir = path.join(process.cwd(), 'docs');
    console.log('Docs directory:', docsDir);
    
    // Check if docs directory exists
    if (!fs.existsSync(docsDir)) {
      console.error('Docs directory does not exist:', docsDir);
      return NextResponse.json(
        { 
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

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log('File content length:', content.length);

    // Return the HTML content with appropriate headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error serving report:', error);
    return NextResponse.json(
      { 
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