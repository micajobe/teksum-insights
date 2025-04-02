import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  context: { params: { filename: string } }
) {
  try {
    const { filename } = await context.params;
    // Get the absolute path to the docs directory
    const docsDir = path.join(process.cwd(), 'docs');
    const filePath = path.join(docsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');

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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 