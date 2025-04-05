export interface Headline {
  title: string
  source: string
  url: string
  date?: string
  summary?: string
  tags?: string[]
}

export interface Insight {
  category: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  relatedHeadlines?: string[] // IDs of related headlines
  tags?: string[]
}

export interface ReportSection {
  title: string
  content: string
  insights: Insight[]
  order: number
}

export interface Report {
  id: string
  title: string
  description: string
  date: string
  category: string
  sections: ReportSection[]
  headlines: Headline[]
  metadata: {
    generatedAt: string
    version: string
    source: string
    tags: string[]
  }
} 