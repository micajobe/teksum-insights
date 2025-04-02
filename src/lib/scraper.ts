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

        2. BUSINESS IMPACT ANALYSIS:
        • Key business insights and their potential impact
        • Most relevant headline and why

        3. INDUSTRY MOVEMENTS:
        • Notable strategic shifts or industry changes
        • Supporting headline and why

        4. EMERGING TECHNOLOGIES:
        • New technologies or innovations mentioned
        • Key innovation headline and why

        5. STRATEGIC TAKEAWAYS:
        • Important business strategy lessons
        • Strategic insight headline and why

        For each section, focus on identifying clear patterns and their implications for the tech and business landscape.
      `;
      
      console.log('\nGenerating thematic analysis...');
      const analysisResponse = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional technology and business analyst." },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      
      if (!analysisResponse.choices?.[0]?.message?.content) {
        console.error('Error: Empty response from ChatGPT for thematic analysis');
        return [];
      }
      
      const thematicAnalysis = analysisResponse.choices[0].message.content;
      
      // Get monetization strategies
      const monetizationPrompt = `
        Based on the following technology and business analysis, suggest specific monetization strategies:

        ${thematicAnalysis}

        Please provide 3 detailed monetization strategies for each section above. For each strategy include:
        - Target market
        - Implementation timeline
        - Required resources
        - Potential ROI metrics
        - Key success factors
        - Risk mitigation strategies

        Format as:

        MONETIZATION STRATEGIES:
        [Section Name]:
        1. [Strategy Name]
           • Details...
        2. [Strategy Name]
           • Details...
        3. [Strategy Name]
           • Details...

        Focus on practical, actionable strategies that can be implemented within 6-12 months.
      `;
      
      console.log('\nGenerating monetization strategies...');
      const monetizationResponse = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a business strategy consultant specializing in technology monetization." },
          { role: "user", content: monetizationPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      
      if (!monetizationResponse.choices?.[0]?.message?.content) {
        console.error('Error: Empty response from ChatGPT for monetization strategies');
        return this.parseAnalysis(thematicAnalysis);
      }
      
      const monetizationStrategies = monetizationResponse.choices[0].message.content;
      const completeAnalysis = `${thematicAnalysis}\n\n${monetizationStrategies}`;
      
      console.log('Analysis generated successfully!');
      return this.parseAnalysis(completeAnalysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
      return [];
    }
  }

  private parseAnalysis(text: string): ReportSection[] {
    const sections: ReportSection[] = [];
    let currentSection: ReportSection | null = null;
    
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine.match(/^\d+\./)) {
        const title = trimmedLine.split('.')[1].split(':')[0].trim();
        currentSection = {
          title,
          analysis: [],
          monetization: []
        };
        sections.push(currentSection);
      } else if (trimmedLine === 'MONETIZATION STRATEGIES:') {
        // Skip the header
        continue;
      } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        const content = trimmedLine.substring(1).trim();
        if (currentSection) {
          if (trimmedLine.includes('MONETIZATION STRATEGIES')) {
            currentSection.monetization.push(content);
          } else {
            currentSection.analysis.push(content);
          }
        }
      }
    }
    
    return sections;
  }

  private createReport(headlines: Headline[], sections: ReportSection[]): Report {
    const date = format(new Date(), 'yyyyMMdd');
    return {
      id: date,
      date,
      headlines,
      sections,
      generatedAt: new Date().toISOString()
    };
  }

  private async saveReport(report: Report): Promise<void> {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const filename = `tech_business_report_${timestamp}.html`;
    const latestFilename = `tech_business_report_${report.date}_latest.html`;

    // Remove any existing latest report for today
    const existingLatest = fs.readdirSync(this.docsDir)
      .find(file => file.startsWith(`tech_business_report_${report.date}_`));
    if (existingLatest) {
      fs.unlinkSync(path.join(this.docsDir, existingLatest));
    }

    // Save new report
    const html = this.generateHtml(report);
    fs.writeFileSync(path.join(this.docsDir, filename), html);
    fs.writeFileSync(path.join(this.docsDir, latestFilename), html);
  }

  private generateHtml(report: Report): string {
    const headlinesHtml = report.headlines.map(headline => `
      <div class="headline-card">
        <div class="headline-source">${headline.source}</div>
        <a href="${headline.url}" class="headline-title ${headline.url === '#' ? 'no-link' : ''}" target="_blank" rel="noopener noreferrer">
          ${headline.title}
          ${headline.url === '#' ? ' <span class="no-link-indicator">(No link available)</span>' : ''}
        </a>
      </div>
    `).join('');

    const sectionsHtml = report.sections.map(section => `
      <div class="section">
        <h3>${section.title}</h3>
        <div class="section-content">
          ${section.analysis.map(point => `<p class="bullet">${point}</p>`).join('')}
          ${section.monetization.length ? `
            <div class="monetization-strategy">
              <h4>Monetization Strategies</h4>
              ${section.monetization.map(strategy => `<p class="strategy-item">${strategy}</p>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TEKSUM Insights</title>
        <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary-color: #A78BFA;
            --secondary-color: #F3F0FF;
            --text-color: #1a1a1a;
            --accent-color: #0017d3;
            --bg-color: #FFFFFF;
            --border-color: #E5E7EB;
            --hero-bg: linear-gradient(135deg, #A78BFA 0%, #0017d3 100%);
          }

          body {
            font-family: 'Libre Baskerville', Georgia, serif;
            line-height: 1.8;
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
          }

          .hero {
            background: var(--hero-bg);
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
            padding: 2rem;
          }

          .hero-title {
            font-family: 'Inter', sans-serif;
            font-size: min(16rem, 25vw);
            font-weight: 800;
            color: white;
            text-align: center;
            margin: 0;
            letter-spacing: -0.02em;
            width: 100%;
            position: relative;
            z-index: 2;
            text-shadow: 0 4px 12px rgba(0,0,0,0.15);
            line-height: 0.9;
            padding: 0 1rem;
          }

          .hero-date {
            font-family: 'Inter', sans-serif;
            font-size: 1.2rem;
            color: white;
            margin-top: 1rem;
            opacity: 0.9;
            position: relative;
            z-index: 2;
          }

          .container {
            max-width: 1140px;
            margin: 0 auto;
            padding: 0 1rem;
          }

          .main-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 3rem;
            margin: 2rem 0;
          }

          .section {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
          }

          .section h3 {
            font-family: 'Inter', sans-serif;
            font-size: 1.4rem;
            color: var(--accent-color);
            margin: 0 0 1rem 0;
            font-weight: 600;
          }

          .section-content {
            margin-left: 1rem;
          }

          .bullet {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
            position: relative;
          }

          .bullet:before {
            content: '•';
            position: absolute;
            left: 0.5rem;
            color: var(--accent-color);
          }

          .monetization-strategy {
            background: var(--secondary-color);
            padding: 1.5rem;
            margin-top: 2rem;
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
          }

          .monetization-strategy h4 {
            font-family: 'Inter', sans-serif;
            color: var(--accent-color);
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            font-weight: 600;
          }

          .strategy-item {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
            position: relative;
          }

          .strategy-item:before {
            content: '💡';
            position: absolute;
            left: 0;
            top: 0;
          }

          .headlines-sidebar {
            font-family: 'Inter', sans-serif;
          }

          .headlines-sidebar h2 {
            font-size: 1.2rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--primary-color);
          }

          .headline-card {
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
            transition: background-color 0.2s ease;
          }

          .headline-card:hover {
            background-color: var(--secondary-color);
            padding-left: 1rem;
            margin-left: -1rem;
            padding-right: 1rem;
            margin-right: -1rem;
          }

          .headline-source {
            font-size: 0.8rem;
            color: var(--primary-color);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
          }

          .headline-title {
            font-size: 0.95rem;
            line-height: 1.4;
            color: var(--text-color);
            text-decoration: none;
            display: block;
            transition: color 0.2s ease;
          }

          .headline-title:hover {
            color: var(--accent-color);
          }

          .no-link {
            color: #666;
            cursor: not-allowed;
          }

          .no-link-indicator {
            font-size: 0.8rem;
            color: #999;
            font-style: italic;
          }

          .footer {
            text-align: center;
            margin: 4rem 0;
            padding-top: 2rem;
            border-top: 2px solid var(--border-color);
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            color: #666;
          }

          @media (max-width: 768px) {
            .main-content {
              grid-template-columns: 1fr;
            }
            .hero {
              min-height: 50vh;
              padding: 1rem;
            }
            .hero-title {
              font-size: min(8rem, 20vw);
              line-height: 1;
            }
          }
        </style>
      </head>
      <body>
        <div class="hero">
          <div class="hero-content">
            <h1 class="hero-title">TEKSUM</h1>
            <div class="hero-date">${format(new Date(), 'MMMM d, yyyy')}</div>
          </div>
        </div>

        <div class="container">
          <div class="main-content">
            <div class="summary-section">
              ${sectionsHtml}
            </div>
            <aside class="headlines-sidebar">
              <h2>Today's Headlines</h2>
              ${headlinesHtml}
            </aside>
          </div>

          <footer class="footer">
            <p>Generated by TechBusinessScraper on ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }
} 