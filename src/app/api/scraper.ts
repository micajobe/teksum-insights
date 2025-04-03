import { Report, Headline, ReportSection } from './types';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScraperResult {
  success: boolean;
  error?: string;
  data?: {
    report?: Report;
    headlines?: Headline[];
  };
}

export class TechBusinessScraper {
  private readonly docsDir: string;
  private readonly openai: OpenAI;
  private readonly newsSources: Record<string, string> = {
    'TechCrunch': 'https://techcrunch.com',
    'VentureBeat': 'https://venturebeat.com',
    'McKinsey': 'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights'
  };

  constructor() {
    // Initialize OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Set up the directory for saving reports
    this.docsDir = path.join(process.cwd(), 'docs');
    console.log('Docs directory:', this.docsDir);
    
    // Create the docs directory if it doesn't exist
    if (!fs.existsSync(this.docsDir)) {
      console.log('Creating docs directory...');
      try {
        fs.mkdirSync(this.docsDir, { recursive: true });
        console.log('Docs directory created successfully');
      } catch (error) {
        console.error('Error creating docs directory:', error);
        // Continue anyway, as the directory might already exist in production
      }
    }
  }

  async run(): Promise<ScraperResult> {
    try {
      console.log('Starting report generation...');
      const headlines = await this.fetchHeadlines();
      
      if (!headlines.length) {
        return {
          success: false,
          error: 'No headlines were collected'
        };
      }

      const analysis = await this.analyzeHeadlines(headlines);
      if (!analysis) {
        return {
          success: false,
          error: 'Failed to analyze headlines'
        };
      }

      const report = this.createReport(headlines, analysis);
      await this.saveReport(report);
      
      return {
        success: true,
        data: {
          report,
          headlines
        }
      };
    } catch (error) {
      console.error('Error in scraper run:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  private async fetchHeadlines(): Promise<Headline[]> {
    console.log('Fetching headlines from news sources...');
    const allHeadlines: Headline[] = [];
    
    // Use Promise.all to fetch from all sources concurrently
    const sourcePromises = Object.keys(this.newsSources).map(siteName => 
      this.scrapeSite(siteName)
        .catch(error => {
          console.error(`Error scraping ${siteName}:`, error);
          return [];
        })
    );
    
    const results = await Promise.all(sourcePromises);
    
    // Flatten the results
    results.forEach(headlines => {
      allHeadlines.push(...headlines);
    });
    
    console.log(`Total headlines collected: ${allHeadlines.length}`);
    if (allHeadlines.length > 0) {
      console.log('Sample headlines:');
      allHeadlines.slice(0, 5).forEach(h => console.log(`- ${h.title} (${h.source})`));
    }
    
    return allHeadlines;
  }

  private async scrapeSite(siteName: string): Promise<Headline[]> {
    console.log(`\nAttempting to scrape ${siteName}...`);
    try {
      const response = await fetch(this.newsSources[siteName], {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        console.log(`${siteName} status code: ${response.status}`);
        return [];
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const articles: Headline[] = [];
      
      $('h1, h2, h3').each((i, element) => {
        const text = $(element).text().trim();
        
        if (this.isLikelyHeadline(text)) {
          let url = '#';
          const link = $(element).closest('a').length ? 
            $(element).closest('a') : 
            $(element).find('a').first() || $(element).next('a').first();
          
          if (link.length && link.attr('href')) {
            url = link.attr('href') || '#';
            if (url.startsWith('/')) {
              const baseUrl = new URL(this.newsSources[siteName]).origin;
              url = `${baseUrl}${url}`;
            } else if (!url.startsWith('http')) {
              url = `${this.newsSources[siteName].replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
            }
          }
          
          if (!articles.some(h => h.title === text)) {
            articles.push({
              title: text,
              source: siteName,
              url
            });
            console.log(`Added headline from ${siteName}: ${text.substring(0, 100)}...`);
          }
        }
      });
      
      return articles.slice(0, 5);
    } catch (error) {
      console.error(`Error scraping ${siteName}:`, error);
      return [];
    }
  }

  private isLikelyHeadline(text: string): boolean {
    // Filter out navigation items, footers, etc.
    if (text.length < 10 || text.length > 200) return false;
    if (text.toLowerCase().includes('menu') || text.toLowerCase().includes('search')) return false;
    if (text.match(/^\d+\.\s+/)) return false; // Numbered lists
    return true;
  }

  private formatHeadlinesForPrompt(headlines: Headline[]): string {
    return headlines.map(h => `- ${h.title} (${h.source})`).join('\n');
  }

  private async analyzeHeadlines(headlines: Headline[]): Promise<ReportSection[]> {
    if (!headlines.length) {
      return [];
    }

    try {
      const headlinesText = this.formatHeadlinesForPrompt(headlines);
      
      const analysisPrompt = `
        Analyze these tech and business headlines and provide a structured summary:

        ${headlinesText}

        Please provide a comprehensive analysis in the following format:

        1. MAJOR TECHNOLOGY TRENDS:
        • Summary of key technology developments
        • Most significant headline and why

        2. BUSINESS IMPLICATIONS:
        • How these trends affect businesses
        • Strategic recommendations

        3. EMERGING OPPORTUNITIES:
        • New market opportunities
        • Potential risks to watch

        Keep each section concise but informative. Focus on actionable insights.
      `;

      console.log('Sending analysis prompt to OpenAI...');
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a tech business analyst providing insights on technology trends." },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const analysisText = completion.choices[0].message.content || '';
      console.log('Received analysis from OpenAI');

      return this.parseAnalysis(analysisText);
    } catch (error) {
      console.error('Error analyzing headlines:', error);
      return [];
    }
  }

  private parseAnalysis(text: string): ReportSection[] {
    const sections: ReportSection[] = [];
    const lines = text.split('\n');
    
    let currentSection: ReportSection | null = null;
    let currentContent: string[] = [];
    
    for (const line of lines) {
      // Check if this is a section header
      if (line.match(/^\d+\.\s+[A-Z\s]+:/) || line.match(/^[A-Z\s]+:/)) {
        // Save the previous section if it exists
        if (currentSection) {
          currentSection.content = currentContent;
          sections.push(currentSection);
        }
        
        // Start a new section
        const title = line.replace(/^\d+\.\s+/, '').replace(':', '').trim();
        currentSection = { title, content: [] };
        currentContent = [];
      } else if (currentSection && line.trim()) {
        // Add content to the current section
        currentContent.push(line.trim());
      }
    }
    
    // Add the last section
    if (currentSection) {
      currentSection.content = currentContent;
      sections.push(currentSection);
    }
    
    return sections;
  }

  private createReport(headlines: Headline[], sections: ReportSection[]): Report {
    const now = new Date();
    const id = format(now, 'yyyyMMdd_HHmmss');
    
    return {
      id,
      date: format(now, 'yyyy-MM-dd'),
      headlines,
      sections,
      summary: sections.map(s => s.title).join(', ')
    };
  }

  private async saveReport(report: Report): Promise<void> {
    try {
      // Create the HTML content
      const htmlContent = this.generateHtmlReport(report);
      
      // Save the report to a file
      const filename = `tech_business_report_${report.id}.html`;
      const latestFilename = 'tech_business_report_latest.html';
      const filePath = path.join(this.docsDir, filename);
      const latestFilePath = path.join(this.docsDir, latestFilename);
      
      console.log(`Saving report to ${filePath}`);
      fs.writeFileSync(filePath, htmlContent);
      
      // Also save as the latest version
      console.log(`Saving latest report to ${latestFilePath}`);
      fs.writeFileSync(latestFilePath, htmlContent);
      
      console.log('Report saved successfully');
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  private generateHtmlReport(report: Report): string {
    const sectionsHtml = report.sections.map(section => `
      <div class="section">
        <h2>${section.title}</h2>
        <div class="content">
          ${section.content.map(item => `<p>${item}</p>`).join('\n')}
        </div>
      </div>
    `).join('\n');
    
    const headlinesHtml = report.headlines.map(headline => `
      <div class="headline">
        <h3>${headline.title}</h3>
        <p class="source">Source: <a href="${headline.url}" target="_blank">${headline.source}</a></p>
      </div>
    `).join('\n');
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tech Business Report - ${report.date}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .section {
            margin-bottom: 30px;
          }
          .headlines {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .headline {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f5f5f5;
          }
          .source {
            font-size: 0.9em;
            color: #666;
          }
          a {
            color: #3498db;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tech Business Report</h1>
          <p>Generated on ${report.date}</p>
        </div>
        
        <div class="sections">
          ${sectionsHtml}
        </div>
        
        <div class="headlines">
          <h2>Headlines Analyzed</h2>
          ${headlinesHtml}
        </div>
      </body>
      </html>
    `;
  }
} 