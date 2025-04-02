import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // Get the absolute path to the docs directory
    const docsDir = path.join(process.cwd(), 'docs');
    const filePath = path.join(docsDir, params.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');

    // Return the file with proper headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error serving report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 