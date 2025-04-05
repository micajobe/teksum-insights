import { Headline, Insight, Report } from '@/types'

export const sampleHeadlines: Headline[] = [
  {
    title: "OpenAI Announces GPT-5 Development",
    source: "TechCrunch",
    url: "https://techcrunch.com/2024/04/04/openai-gpt5"
  },
  {
    title: "Microsoft's AI Copilot Expands to More Enterprise Apps",
    source: "The Verge",
    url: "https://theverge.com/2024/4/4/microsoft-copilot-enterprise"
  },
  {
    title: "Quantum Computing Breakthrough Achieved",
    source: "Nature",
    url: "https://nature.com/articles/quantum-breakthrough"
  },
  {
    title: "Tesla Unveils New Battery Technology",
    source: "Reuters",
    url: "https://reuters.com/technology/tesla-battery"
  },
  {
    title: "Amazon's Project Kuiper Satellites Launch Successfully",
    source: "Space News",
    url: "https://spacenews.com/amazon-kuiper-launch"
  }
]

export const sampleInsights: Insight[] = [
  {
    category: "AI & Machine Learning",
    title: "Large Language Models Evolution",
    description: "The rapid advancement of LLMs is transforming how businesses interact with technology and data.",
    impact: "high"
  },
  {
    category: "Cloud Computing",
    title: "Edge Computing Adoption",
    description: "Companies are increasingly moving computing resources closer to data sources for improved performance.",
    impact: "medium"
  },
  {
    category: "Cybersecurity",
    title: "Zero Trust Architecture",
    description: "Organizations are implementing zero trust security models to protect against sophisticated threats.",
    impact: "high"
  },
  {
    category: "Sustainability",
    title: "Green Tech Innovation",
    description: "New technologies are emerging to help businesses reduce their environmental impact.",
    impact: "medium"
  },
  {
    category: "Digital Transformation",
    title: "Remote Work Evolution",
    description: "The future of work is becoming increasingly hybrid, requiring new tools and approaches.",
    impact: "high"
  }
]

export const sampleReport: Report = {
  id: "1",
  title: "Tech Business Report - April 4, 2024",
  description: "Latest insights on technology trends and business implications",
  date: "April 4, 2024",
  category: "Technology",
  content: `
    <div class="sections">
      <div class="section">
        <h2 class="section-title">Major Technology Trends</h2>
        <div class="section-content">
          <p>Artificial Intelligence and Machine Learning continue to dominate the technology landscape, with new developments in large language models and their applications in business processes.</p>
          <p>Edge Computing is gaining traction as organizations seek to process data closer to its source, reducing latency and improving real-time decision-making capabilities.</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Business Implications</h2>
        <div class="section-content">
          <p>Companies are increasingly investing in AI-powered solutions to automate workflows and enhance customer experiences.</p>
          <p>The shift towards edge computing is enabling new use cases in IoT, autonomous vehicles, and smart cities.</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Emerging Opportunities</h2>
        <div class="section-content">
          <p>The convergence of AI and edge computing presents new opportunities for innovative business models and services.</p>
          <p>Organizations that can effectively leverage these technologies will have a significant competitive advantage.</p>
        </div>
      </div>
    </div>
  `,
  insights: sampleInsights,
  headlines: sampleHeadlines
}

export const sampleReports: Report[] = [
  sampleReport,
  {
    ...sampleReport,
    id: "2",
    title: "Tech Business Report - April 3, 2024",
    date: "April 3, 2024"
  },
  {
    ...sampleReport,
    id: "3",
    title: "Tech Business Report - April 2, 2024",
    date: "April 2, 2024"
  }
] 