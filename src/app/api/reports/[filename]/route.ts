import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    console.log('GET request to /api/reports/[filename]');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Is Vercel:', !!process.env.VERCEL);
    console.log('Vercel Environment:', process.env.VERCEL_ENV);
    console.log('Vercel Region:', process.env.VERCEL_REGION);
    console.log('Filename:', params.filename);

    // Check if docs directory exists
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      console.error('Docs directory does not exist');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Docs directory does not exist',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV,
            region: process.env.VERCEL_REGION,
            cwd: process.cwd(),
            docsDir,
          }
        },
        { status: 404 }
      );
    }

    // Check if file exists
    const filePath = path.join(docsDir, params.filename);
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return NextResponse.json(
        { 
          success: false, 
          error: 'File not found',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV,
            region: process.env.VERCEL_REGION,
            cwd: process.cwd(),
            docsDir,
            filePath,
          }
        },
        { status: 404 }
      );
    }

    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log('File content length:', content.length);

    // Check if content is HTML
    const isHtml = content.trim().toLowerCase().startsWith('<!doctype html') || 
                  content.trim().toLowerCase().startsWith('<html');

    if (isHtml) {
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Return JSON response
    return NextResponse.json({
      success: true,
      content,
      contentType: 'text/plain',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
        cwd: process.cwd(),
        docsDir,
        filePath,
      }
    });
  } catch (error) {
    console.error('Error in GET /api/reports/[filename]:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
          vercelEnv: process.env.VERCEL_ENV,
          region: process.env.VERCEL_REGION,
          cwd: process.cwd(),
        }
      },
      { status: 500 }
    );
  }
} 