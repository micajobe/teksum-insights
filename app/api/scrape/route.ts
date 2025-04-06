import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Check for API key in headers
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Get the date from the request body or use today's date
    const body = await request.json();
    const date = body.date || new Date().toISOString().split('T')[0];
    
    // Set up the command to run the Python script
    const projectRoot = process.cwd();
    const scriptPath = path.join(projectRoot, 'scripts', 'tech_business_scraper_json.py');
    
    console.log('Project root:', projectRoot);
    console.log('Script path:', scriptPath);
    
    // Run the Python script with quoted path and correct working directory
    const { stdout, stderr } = await execAsync(`cd "${projectRoot}" && python3 "${scriptPath}"`, {
      cwd: projectRoot
    });
    
    if (stderr) {
      console.error('Error from Python script:', stderr);
      return NextResponse.json(
        { success: false, error: stderr },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Report generated for ${date}`,
      output: stdout 
    });
  } catch (error: any) {
    console.error('Error running scraper:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.stderr || error.stdout || 'No additional details available'
      },
      { status: 500 }
    );
  }
} 