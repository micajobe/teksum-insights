export interface Headline {
  title: string
  source: string
  url: string
}

export interface TechnologyTrend {
  summary: string
  key_insights: string[]
  key_headlines: string[]
}

export interface BusinessOpportunity {
  opportunity_name: string
  target_market: string
  implementation_timeline: string
  required_resources: string[]
  potential_roi_metrics: string[]
  key_success_factors: string[]
  risk_mitigation_strategies: string[]
}

export interface ReportAnalysis {
  major_technology_trends: TechnologyTrend
  business_impact_analysis: TechnologyTrend
  industry_movements: TechnologyTrend
  emerging_technologies: TechnologyTrend
  strategic_takeaways: TechnologyTrend
  business_opportunities: BusinessOpportunity[]
}

export interface ReportData {
  timestamp: string
  headlines: Headline[]
  analysis: ReportAnalysis
}

