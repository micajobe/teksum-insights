import fs from 'fs';
import path from 'path';
import { ScrapedReport, ScrapedHeadline, ScrapedInsight, ScrapedSection } from '@/types/scraper';
import { convertHtmlToReport } from './report-converter';
import { Report } from '@/types';

/**
 * Generates a report from scraper data
 * @param date The date of the report (YYYY-MM-DD)
 * @param headlines The headlines to include
 * @param sections The sections to include
 * @returns A structured report object
 */
export function generateReport(
  date: string,
  headlines: ScrapedHeadline[],
  sections: ScrapedSection[]
): ScrapedReport {
  // Format the date
  const reportDate = new Date(date);
  const formattedDate = reportDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Generate report ID (YYYYMMDD)
  const id = date.replace(/-/g, '');
  
  // Extract all tags
  const tags = new Set<string>();
  
  // Add tags from headlines
  headlines.forEach(headline => {
    if (headline.tags) {
      headline.tags.forEach(tag => tags.add(tag));
    }
  });
  
  // Add tags from sections
  sections.forEach(section => {
    section.insights.forEach(insight => {
      if (insight.tags) {
        insight.tags.forEach(tag => tags.add(tag));
      }
    });
  });
  
  return {
    id,
    title: `Tech Business Report - ${formattedDate}`,
    description: `Daily technology and business insights report for ${formattedDate}.`,
    date: formattedDate,
    category: 'Technology',
    sections,
    headlines,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
      source: 'scraper',
      tags: Array.from(tags)
    }
  };
}

/**
 * Saves a report to a JSON file
 * @param report The report to save
 * @param outputDir The directory to save to
 */
export function saveReport(report: ScrapedReport, outputDir: string): void {
  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save the report
  const filePath = path.join(outputDir, `${report.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  
  console.log(`Saved report to ${filePath}`);
}

/**
 * Converts an HTML report to a ScrapedReport
 * @param html The HTML content to convert
 * @param filename The source filename
 * @returns A ScrapedReport object
 */
export function convertHtmlToScrapedReport(html: string, filename: string): ScrapedReport {
  // Use the existing converter to get a Report object
  const report = convertHtmlToReport(html, filename);
  
  // Convert to ScrapedReport format
  return {
    id: report.id,
    title: report.title,
    description: report.description,
    date: report.date,
    category: report.category,
    sections: report.sections.map(section => ({
      title: section.title,
      content: section.content,
      insights: section.insights.map(insight => ({
        category: insight.category,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        tags: insight.tags || []
      })),
      order: section.order || 0
    })),
    headlines: report.headlines.map(headline => ({
      title: headline.title,
      source: headline.source,
      url: headline.url,
      date: headline.date || new Date().toISOString().split('T')[0],
      tags: headline.tags || []
    })),
    metadata: {
      generatedAt: report.metadata.generatedAt,
      version: report.metadata.version,
      source: report.metadata.source,
      tags: report.metadata.tags
    }
  };
}

/**
 * Converts all HTML reports in the docs directory to ScrapedReport format
 * @param outputDir The directory to save the reports to
 */
export function convertAllHtmlReports(outputDir: string): void {
  const docsDir = path.join(process.cwd(), 'docs');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all HTML files
  const files = fs.readdirSync(docsDir)
    .filter(file => file.startsWith('tech_business_report_') && file.endsWith('.html'))
    .filter(file => !file.includes('index.html'));
  
  // Convert each file
  files.forEach(file => {
    const html = fs.readFileSync(path.join(docsDir, file), 'utf-8');
    const report = convertHtmlToScrapedReport(html, file);
    
    // Save as JSON
    saveReport(report, outputDir);
  });
}

/**
 * Example function to demonstrate how to use the generator
 * This would be replaced with actual scraper logic
 */
export function generateExampleReport(): void {
  // Example headlines
  const headlines: ScrapedHeadline[] = [
    {
      title: "OpenAI's models 'memorized' copyrighted content, new study suggests",
      source: "techcrunch",
      url: "https://techcrunch.com/2025/04/04/openais-models-memorized-copyrighted-content-new-study-suggests/",
      date: "2025-04-04",
      tags: ["AI", "ethics", "copyright"]
    },
    {
      title: "Microsoft's Copilot can now browse the web and perform actions for you",
      source: "techcrunch",
      url: "https://techcrunch.com/2025/04/04/microsofts-copilot-can-now-browse-the-web-and-perform-actions-for-you/",
      date: "2025-04-04",
      tags: ["AI", "Microsoft", "productivity"]
    }
  ];
  
  // Example sections
  const sections: ScrapedSection[] = [
    {
      title: "MAJOR TECHNOLOGY TRENDS",
      content: "<p>• Summary of key technology developments:</p><p>- AI continues to evolve rapidly, with OpenAI's models demonstrating potential issues like memorizing copyrighted content, raising ethical and legal considerations.</p><p>- Microsoft enhances its Copilot with web browsing and action capabilities, showcasing the trend of AI tools becoming more integrated into daily workflows.</p>",
      insights: [
        {
          category: "MAJOR TECHNOLOGY TRENDS",
          title: "AI continues to evolve rapidly, with OpenAI's models demonstrating potential issues like memorizing copyrighted content",
          description: "AI continues to evolve rapidly, with OpenAI's models demonstrating potential issues like memorizing copyrighted content, raising ethical and legal considerations.",
          impact: "high",
          tags: ["AI", "ethics", "copyright"]
        }
      ],
      order: 0
    },
    {
      title: "BUSINESS IMPLICATIONS",
      content: "<p>• How these trends affect businesses:</p><p>- AI's advancement in tools like Microsoft's Copilot can increase productivity and efficiency in businesses, offering competitive advantages.</p><p>- The ethical challenges posed by AI models memorizing copyrighted content necessitate businesses to be vigilant about compliance and intellectual property rights.</p>",
      insights: [
        {
          category: "BUSINESS IMPLICATIONS",
          title: "AI's advancement in tools like Microsoft's Copilot can increase productivity and efficiency in businesses",
          description: "AI's advancement in tools like Microsoft's Copilot can increase productivity and efficiency in businesses, offering competitive advantages.",
          impact: "medium",
          tags: ["AI", "productivity", "business"]
        }
      ],
      order: 1
    }
  ];
  
  // Generate the report
  const report = generateReport("2025-04-04", headlines, sections);
  
  // Save the report
  const outputDir = path.join(process.cwd(), 'src/data/reports');
  saveReport(report, outputDir);
} 