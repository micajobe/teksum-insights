/**
 * Types for the scraper output
 */

export interface ScrapedHeadline {
  title: string
  source: string
  url: string
  date: string
  summary?: string
  tags?: string[]
}

export interface ScrapedInsight {
  category: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  relatedHeadlines?: string[] // IDs of related headlines
  tags?: string[]
}

export interface ScrapedSection {
  title: string
  content: string
  insights: ScrapedInsight[]
  order: number
}

export interface ScrapedReport {
  id: string // YYYYMMDD format
  title: string
  description: string
  date: string
  category: string
  sections: ScrapedSection[]
  headlines: ScrapedHeadline[]
  metadata: {
    generatedAt: string
    version: string
    source: string
    tags: string[]
  }
} 