import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { Report, ReportSection, Headline, Insight } from '@/types';

/**
 * Converts an HTML report to a structured JSON format
 * @param html The HTML content to convert
 * @param filename The source filename
 * @returns A structured Report object
 */
export function convertHtmlToReport(html: string, filename: string): Report {
  const $ = cheerio.load(html);
  
  // Extract date from filename
  const dateMatch = filename.match(/\d{8}/);
  const dateStr = dateMatch ? dateMatch[0] : '';
  const date = new Date(
    parseInt(dateStr.substring(0, 4)),
    parseInt(dateStr.substring(4, 6)) - 1,
    parseInt(dateStr.substring(6, 8))
  );
  
  // Extract sections
  const sections: ReportSection[] = [];
  $('.section').each((index, element) => {
    const title = $(element).find('h2').text().trim();
    const content = $(element).find('.content').html() || '';
    
    // Extract insights from bullet points
    const insights: Insight[] = [];
    $(element).find('p').each((_, p) => {
      const text = $(p).text().trim();
      if (text.startsWith('-')) {
        const description = text.substring(1).trim();
        insights.push({
          category: title,
          title: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
          description,
          impact: determineImpact(title),
          tags: extractTags(description)
        });
      }
    });
    
    sections.push({
      title,
      content,
      insights,
      order: index
    });
  });
  
  // Extract headlines
  const headlines: Headline[] = [];
  $('.headline').each((_, element) => {
    const title = $(element).find('h3').text().trim();
    const sourceElement = $(element).find('.source a');
    const source = sourceElement.text().trim();
    const url = sourceElement.attr('href') || '';
    
    if (title && source && url) {
      headlines.push({
        title,
        source,
        url,
        date: date.toISOString(),
        summary: extractSummary(title, sections)
      });
    }
  });
  
  return {
    id: generateReportId(filename),
    title: $('h1').first().text().trim() || 'Tech Business Report',
    description: $('h1').first().next('p').text().trim() || 'Daily technology and business insights report.',
    date: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    category: 'Technology',
    sections,
    headlines,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
      source: filename,
      tags: extractReportTags(sections, headlines)
    }
  };
}

/**
 * Determines the impact level of an insight based on its category
 */
function determineImpact(category: string): 'high' | 'medium' | 'low' {
  if (category.includes('MAJOR') || category.includes('EMERGING')) {
    return 'high';
  } else if (category.includes('BUSINESS')) {
    return 'medium';
  }
  return 'low';
}

/**
 * Extracts tags from text content
 */
function extractTags(text: string): string[] {
  const tags = new Set<string>();
  
  // Extract technology terms
  const techTerms = ['AI', 'ML', 'blockchain', 'cloud', 'IoT', '5G', 'quantum'];
  techTerms.forEach(term => {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      tags.add(term);
    }
  });
  
  // Extract business terms
  const businessTerms = ['startup', 'enterprise', 'market', 'investment', 'revenue'];
  businessTerms.forEach(term => {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      tags.add(term);
    }
  });
  
  return Array.from(tags);
}

/**
 * Extracts a summary for a headline based on related content
 */
function extractSummary(headline: string, sections: ReportSection[]): string {
  // Find the most relevant section based on keyword matching
  const relevantSection = sections.find(section => 
    section.content.toLowerCase().includes(headline.toLowerCase())
  );
  
  if (relevantSection) {
    // Find the first bullet point that mentions the headline
    const bulletPoint = relevantSection.content.match(/<p>[-•](.*?)<\/p>/);
    if (bulletPoint) {
      return bulletPoint[1].trim();
    }
  }
  
  return '';
}

/**
 * Generates a unique ID for a report based on its filename
 */
function generateReportId(filename: string): string {
  const dateMatch = filename.match(/\d{8}/);
  if (dateMatch) {
    return dateMatch[0];
  }
  return Date.now().toString();
}

/**
 * Extracts tags for the entire report
 */
function extractReportTags(sections: ReportSection[], headlines: Headline[]): string[] {
  const tags = new Set<string>();
  
  // Add tags from sections
  sections.forEach(section => {
    section.insights.forEach(insight => {
      if (insight.tags) {
        insight.tags.forEach(tag => tags.add(tag));
      }
    });
  });
  
  // Add tags from headlines
  headlines.forEach(headline => {
    if (headline.summary) {
      extractTags(headline.summary).forEach(tag => tags.add(tag));
    }
  });
  
  return Array.from(tags);
}

/**
 * Converts all HTML reports in the docs directory to JSON format
 */
export function convertAllReports(): void {
  const docsDir = path.join(process.cwd(), 'docs');
  const dataDir = path.join(process.cwd(), 'src/data/reports');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Get all HTML files
  const files = fs.readdirSync(docsDir)
    .filter(file => file.startsWith('tech_business_report_') && file.endsWith('.html'))
    .filter(file => !file.includes('index.html'));
  
  // Convert each file
  files.forEach(file => {
    const html = fs.readFileSync(path.join(docsDir, file), 'utf-8');
    const report = convertHtmlToReport(html, file);
    
    // Save as JSON
    const jsonPath = path.join(dataDir, `${report.id}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  });
} 