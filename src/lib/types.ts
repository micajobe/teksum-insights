export interface Headline {
  title: string;
  source: string;
  url: string;
}

export interface ReportSection {
  title: string;
  analysis: string[];
  monetization: string[];
}

export interface Report {
  id: string;
  date: string;
  headlines: Headline[];
  sections: ReportSection[];
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 