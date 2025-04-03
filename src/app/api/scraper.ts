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
  private readonly newsSources: Record<string, string>;

  constructor() {
    this.docsDir = path.join(process.cwd(), 'docs');
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.newsSources = {
      'McKinsey': 'https://www.mckinsey.com/insights',
      'Deloitte': 'https://www2.deloitte.com/us/en/insights/topics/digital-transformation.html',
      'Forbes Tech': 'https://www.forbes.com/technology/',
      'Wired': 'https://www.wired.com/tag/business/',
      'MIT Tech Review': 'https://www.technologyreview.com/',
      'Harvard Business Review': 'https://hbr.org/topic/technology',
      'TechCrunch': 'https://techcrunch.com',
      'VentureBeat': 'https://venturebeat.com'
    };
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

  private isLikelyHeadline(text: string): boolean {
    if (!text || text.length < 20 || text.length > 200) {
      return false;
    }

    const skipPhrases = ['subscribe', 'sign up', 'login', 'sign in', 'menu', 
                        'search', 'newsletter', 'download', 'follow us'];
    return !skipPhrases.some(phrase => text.toLowerCase().includes(phrase));
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

  private async fetchHeadlines(): Promise<Headline[]> {
    console.log('\nCollecting headlines from all sources...');
    const headlines: Headline[] = [];
    
    for (const siteName of Object.keys(this.newsSources)) {
      try {
        const sourceHeadlines = await this.scrapeSite(siteName);
        headlines.push(...sourceHeadlines);
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      } catch (error) {
        console.error(`Error with ${siteName}:`, error);
      }
    }

    console.log(`\nTotal headlines collected: ${headlines.length}`);
    if (headlines.length > 0) {
      console.log('\nSample headlines:');
      headlines.slice(0, 5).forEach(headline => {
        console.log(`- ${headline.title} (${headline.source})`);
      });
    }

    return headlines;
  }

  private formatHeadlinesForPrompt(headlines: Headline[]): string {
    return headlines.map(h => 
      `Source: ${h.source}\nHeadline: ${h.title}\n`
    ).join('\n');
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

  private parseAnalysis(analysisText: string): ReportSection[] {
    const sections: ReportSection[] = [];
    const sectionTitles = [
      'MAJOR TECHNOLOGY TRENDS',
      'BUSINESS IMPLICATIONS',
      'EMERGING OPPORTUNITIES'
    ];

    let currentSection: ReportSection | null = null;
    const lines = analysisText.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line is a section title
      const sectionTitle = sectionTitles.find(title => 
        trimmedLine.toUpperCase().includes(title)
      );
      
      if (sectionTitle) {
        // If we have a previous section, add it to the sections array
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start a new section
        currentSection = {
          title: sectionTitle,
          content: []
        };
      } else if (currentSection && trimmedLine) {
        // Add content to the current section
        if (trimmedLine.startsWith('•')) {
          currentSection.content.push(trimmedLine.substring(1).trim());
        } else {
          currentSection.content.push(trimmedLine);
        }
      }
    }
    
    // Add the last section if there is one
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  private createReport(headlines: Headline[], analysis: ReportSection[]): Report {
    const now = new Date();
    const dateStr = format(now, 'yyyyMMdd');
    
    return {
      id: `tech_business_report_${dateStr}`,
      date: now.toISOString(),
      headlines,
      sections: analysis,
      summary: `Tech Business Report for ${format(now, 'MMMM d, yyyy')}`
    };
  }

  private async saveReport(report: Report): Promise<void> {
    const html = this.generateHtmlReport(report);
    const filename = `${report.id}_latest.html`;
    const filePath = path.join(this.docsDir, filename);
    
    fs.writeFileSync(filePath, html);
    console.log(`Report saved to ${filePath}`);
  }

  private generateHtmlReport(report: Report): string {
    const date = new Date(report.date);
    const formattedDate = format(date, 'MMMM d, yyyy');
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.summary}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2 {
            color: #2c3e50;
          }
          .date {
            color: #7f8c8d;
            font-style: italic;
          }
          .headlines {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          .headline {
            margin-bottom: 10px;
          }
          .headline a {
            color: #3498db;
            text-decoration: none;
          }
          .headline a:hover {
            text-decoration: underline;
          }
          .source {
            font-size: 0.8em;
            color: #7f8c8d;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
          }
          .section-content {
            margin-left: 20px;
          }
          .section-content p {
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <h1>${report.summary}</h1>
        <p class="date">Generated on ${formattedDate}</p>
        
        <div class="headlines">
          <h2>Recent Headlines</h2>
          ${report.headlines.map(h => `
            <div class="headline">
              <a href="${h.url}" target="_blank">${h.title}</a>
              <div class="source">Source: ${h.source}</div>
            </div>
          `).join('')}
        </div>
        
        ${report.sections.map(section => `
          <div class="section">
            <h2 class="section-title">${section.title}</h2>
            <div class="section-content">
              ${section.content.map(content => `<p>${content}</p>`).join('')}
            </div>
          </div>
        `).join('')}
        
        <footer>
          <p>Generated by TEKSUM Insights</p>
        </footer>
      </body>
      </html>
    `;
  }
} 