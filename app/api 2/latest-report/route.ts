import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
// Use require instead of import for cheerio to avoid ESM issues
const cheerio = require('cheerio');

export async function GET() {
  try {
    // Get the docs directory path
    const docsDir = path.join(process.cwd(), 'docs');
    
    // Read all files in the docs directory
    const files = fs.readdirSync(docsDir);
    
    // Filter for report files (both JSON and HTML)
    const reportFiles = files.filter(file => 
      file.startsWith('tech_business_report_') && 
      (file.endsWith('.json') || file.endsWith('.html'))
    );
    
    if (reportFiles.length === 0) {
      return NextResponse.json(
        { error: 'No report files found' },
        { status: 404 }
      );
    }
    
    // Sort files by name (which includes timestamp) in descending order
    // to get the most recent file
    reportFiles.sort().reverse();
    const latestFile = reportFiles[0];
    const filePath = path.join(docsDir, latestFile);
    
    // If it's a JSON file, read and return it directly
    if (latestFile.endsWith('.json')) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return NextResponse.json(JSON.parse(fileContent));
    }
    
    // If it's an HTML file, parse it and convert to JSON
    if (latestFile.endsWith('.html')) {
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      const $ = cheerio.load(htmlContent);
      
      // Extract data from HTML using cheerio
      const reportData = {
        timestamp: $('title').text().match(/\d{4}-\d{2}-\d{2}/)?.[0] || new Date().toISOString(),
        headlines: [] as Array<{ title: string; source: string; url: string | undefined }>,
        analysis: {
          major_technology_trends: {
            summary: $('.section:contains("Technology Trends")').find('p').first().text() || '',
            key_insights: $('.section:contains("Technology Trends")').find('ul li').map(function(this: any) { return $(this).text(); }).get(),
            key_headlines: [] as string[]
          },
          business_impact_analysis: {
            summary: $('.section:contains("Business Impact")').find('p').first().text() || '',
            key_insights: $('.section:contains("Business Impact")').find('ul li').map(function(this: any) { return $(this).text(); }).get(),
            key_headlines: [] as string[]
          },
          industry_movements: {
            summary: $('.section:contains("Industry Movements")').find('p').first().text() || '',
            key_insights: $('.section:contains("Industry Movements")').find('ul li').map(function(this: any) { return $(this).text(); }).get(),
            key_headlines: [] as string[]
          }
        }
      };
      
      // Extract headlines
      $('.headline').each(function(this: any) {
        const title = $(this).find('h3').text();
        const source = $(this).find('.source').text();
        const url = $(this).find('a').attr('href');
        if (title) {
          reportData.headlines.push({ title, source, url });
        }
      });
      
      return NextResponse.json(reportData);
    }
    
    return NextResponse.json(
      { error: 'Unsupported file format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching latest report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest report' },
      { status: 500 }
    );
  }
} 