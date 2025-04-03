export interface Headline {
  title: string;
  source: string;
  url: string;
}

export interface ReportSection {
  title: string;
  content: string[];
}

export interface Report {
  id: string;
  date: string;
  headlines: Headline[];
  sections: ReportSection[];
  summary: string;
} 