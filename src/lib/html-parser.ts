import * as cheerio from 'cheerio';
import { Headline } from '@/types';

/**
 * Extracts headlines from HTML content using Cheerio
 * @param html The HTML content to parse
 * @returns An array of Headline objects
 */
export function extractHeadlinesFromHtml(html: string): Headline[] {
  const $ = cheerio.load(html);
  const headlines: Headline[] = [];
  
  $('.headline').each((_, element) => {
    const title = $(element).find('h3').text().trim();
    const sourceElement = $(element).find('.source a');
    const source = sourceElement.text().trim();
    const url = sourceElement.attr('href') || '';
    
    if (title && source && url) {
      headlines.push({ title, source, url });
    }
  });
  
  return headlines;
}

/**
 * Extracts and cleans the main content from HTML
 * @param html The HTML content to parse
 * @returns The cleaned main content
 */
export function extractMainContent(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove unnecessary elements
  $('style, script, meta').remove();
  
  // Extract the main content from the sections class
  const mainContent = $('.sections').html() || '';
  
  return mainContent;
}

/**
 * Extracts metadata from HTML content
 * @param html The HTML content to parse
 * @returns An object containing title, description, and date
 */
export function extractMetadata(html: string): { 
  title: string; 
  description: string; 
  date: string;
} {
  const $ = cheerio.load(html);
  
  const title = $('h1').first().text().trim() || 'Tech Business Report';
  const description = $('h1').first().next('p').text().trim() || 'Daily technology and business insights report.';
  const date = $('.date').text().trim() || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return { title, description, date };
} 