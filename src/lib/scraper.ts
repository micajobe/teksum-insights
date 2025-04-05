import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import OpenAI from 'openai';
import { ScrapedReport, ScrapedHeadline, ScrapedInsight, ScrapedSection } from '@/types/scraper';
import { generateReport, saveReport } from './report-generator';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Scrapes headlines from a source
 * @param source The source to scrape from
 * @returns An array of ScrapedHeadline objects
 */
export async function scrapeHeadlines(source: string): Promise<ScrapedHeadline[]> {
  try {
    // For TechCrunch, we'll use their RSS feed
    if (source === 'techcrunch') {
      const response = await axios.get('https://techcrunch.com/feed/');
      const $ = cheerio.load(response.data, { xmlMode: true });
      
      const headlines: ScrapedHeadline[] = [];
      
      $('item').each((_, element) => {
        const title = $(element).find('title').text().trim();
        const url = $(element).find('link').text().trim();
        const pubDate = $(element).find('pubDate').text().trim();
        const date = new Date(pubDate).toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Extract tags from categories
        const tags: string[] = [];
        $(element).find('category').each((_, category) => {
          tags.push($(category).text().trim());
        });
        
        headlines.push({
          title,
          source: 'techcrunch',
          url,
          date,
          tags
        });
      });
      
      return headlines;
    }
    
    // For other sources, we would implement specific scraping logic
    // For now, return example data
    return [
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
  } catch (error) {
    console.error('Error scraping headlines:', error);
    // Return example data as fallback
    return [
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
  }
}

/**
 * Generates insights from headlines using ChatGPT
 * @param headlines The headlines to generate insights from
 * @returns An array of ScrapedSection objects
 */
export async function generateInsightsFromHeadlines(headlines: ScrapedHeadline[]): Promise<ScrapedSection[]> {
  try {
    // Format headlines for the prompt
    const headlinesText = headlines.map(h => `- ${h.title} (${h.source})`).join('\n');
    
    // Create a prompt for ChatGPT
    const prompt = `
You are a technology business analyst. Based on the following headlines, generate a comprehensive technology business report with the following sections:

1. MAJOR TECHNOLOGY TRENDS
2. BUSINESS IMPLICATIONS
3. EMERGING OPPORTUNITIES

For each section, provide:
- A brief summary of key points
- 2-3 bullet points with detailed analysis
- Identify the impact level (high, medium, low) for each insight
- Suggest relevant tags for each insight

Headlines:
${headlinesText}

Format your response as JSON with the following structure:
{
  "sections": [
    {
      "title": "SECTION_TITLE",
      "content": "HTML formatted content with bullet points",
      "insights": [
        {
          "category": "SECTION_TITLE",
          "title": "Insight title",
          "description": "Detailed description",
          "impact": "high|medium|low",
          "tags": ["tag1", "tag2"]
        }
      ],
      "order": 0
    }
  ]
}
`;

    // Call ChatGPT API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a technology business analyst who creates structured reports." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from ChatGPT');
    }
    
    const result = JSON.parse(content);
    return result.sections;
  } catch (error) {
    console.error('Error generating insights:', error);
    // Return example data as fallback
    return [
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
  }
}

/**
 * Runs the scraper and generates a report
 * @param date The date of the report (YYYY-MM-DD)
 * @returns The generated report
 */
export async function runScraper(date: string): Promise<ScrapedReport> {
  console.log(`Running scraper for date: ${date}`);
  
  // Scrape headlines
  const headlines = await scrapeHeadlines('techcrunch');
  
  // Generate insights
  const sections = await generateInsightsFromHeadlines(headlines);
  
  // Generate report
  const report = generateReport(date, headlines, sections);
  
  return report;
}

/**
 * Runs the scraper and saves the report to a JSON file
 * @param date The date of the report (YYYY-MM-DD)
 * @param outputDir The directory to save the report to
 */
export async function runScraperAndSave(date: string, outputDir: string): Promise<void> {
  console.log(`Running scraper for date: ${date}`);
  
  // Run scraper
  const report = await runScraper(date);
  
  // Save report
  saveReport(report, outputDir);
  
  console.log(`Report saved to ${outputDir}/${report.id}.json`);
}

/**
 * Runs the scraper for today's date
 */
export async function runDailyScraper(): Promise<void> {
  const today = new Date();
  const date = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const outputDir = path.join(process.cwd(), 'src/data/reports');
  
  await runScraperAndSave(date, outputDir);
} 