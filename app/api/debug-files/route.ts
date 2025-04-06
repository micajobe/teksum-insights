import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check the current working directory
    const cwd = process.cwd();
    
    // Check the public directory
    const publicDir = path.join(cwd, 'public');
    const publicDirExists = fs.existsSync(publicDir);
    let publicFiles: string[] = [];
    
    if (publicDirExists) {
      try {
        publicFiles = fs.readdirSync(publicDir);
      } catch (err) {
        console.error('Error reading public directory:', err);
      }
    }
    
    // Check the reports directory
    const reportsDir = path.join(cwd, 'public', 'reports');
    const reportsDirExists = fs.existsSync(reportsDir);
    let reportFiles: string[] = [];
    
    if (reportsDirExists) {
      try {
        reportFiles = fs.readdirSync(reportsDir);
      } catch (err) {
        console.error('Error reading reports directory:', err);
      }
    }
    
    // Check the available-reports.json file
    const availableReportsPath = path.join(reportsDir, 'available-reports.json');
    const availableReportsExists = fs.existsSync(availableReportsPath);
    let availableReportsContent = null;
    
    if (availableReportsExists) {
      try {
        const content = fs.readFileSync(availableReportsPath, 'utf-8');
        availableReportsContent = JSON.parse(content);
      } catch (err) {
        console.error('Error reading available-reports.json:', err);
      }
    }
    
    // Check the root directory
    const rootDir = '/';
    const rootDirExists = fs.existsSync(rootDir);
    let rootFiles: string[] = [];
    
    if (rootDirExists) {
      try {
        rootFiles = fs.readdirSync(rootDir);
      } catch (err) {
        console.error('Error reading root directory:', err);
      }
    }
    
    // Check the /var/task directory (Vercel serverless function environment)
    const varTaskDir = '/var/task';
    const varTaskDirExists = fs.existsSync(varTaskDir);
    let varTaskFiles: string[] = [];
    
    if (varTaskDirExists) {
      try {
        varTaskFiles = fs.readdirSync(varTaskDir);
      } catch (err) {
        console.error('Error reading /var/task directory:', err);
      }
    }
    
    // Check the /var/task/public directory
    const varTaskPublicDir = '/var/task/public';
    const varTaskPublicDirExists = fs.existsSync(varTaskPublicDir);
    let varTaskPublicFiles: string[] = [];
    
    if (varTaskPublicDirExists) {
      try {
        varTaskPublicFiles = fs.readdirSync(varTaskPublicDir);
      } catch (err) {
        console.error('Error reading /var/task/public directory:', err);
      }
    }
    
    // Check the /var/task/public/reports directory
    const varTaskReportsDir = '/var/task/public/reports';
    const varTaskReportsDirExists = fs.existsSync(varTaskReportsDir);
    let varTaskReportFiles: string[] = [];
    
    if (varTaskReportsDirExists) {
      try {
        varTaskReportFiles = fs.readdirSync(varTaskReportsDir);
      } catch (err) {
        console.error('Error reading /var/task/public/reports directory:', err);
      }
    }
    
    return NextResponse.json({
      cwd,
      publicDir,
      publicDirExists,
      publicFiles,
      reportsDir,
      reportsDirExists,
      reportFiles,
      availableReportsPath,
      availableReportsExists,
      availableReportsContent,
      rootDir,
      rootDirExists,
      rootFiles,
      varTaskDir,
      varTaskDirExists,
      varTaskFiles,
      varTaskPublicDir,
      varTaskPublicDirExists,
      varTaskPublicFiles,
      varTaskReportsDir,
      varTaskReportsDirExists,
      varTaskReportFiles
    });
  } catch (error) {
    console.error('Error in debug-files API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    }, { status: 500 });
  }
} 