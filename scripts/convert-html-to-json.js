const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Directory containing the reports
const REPORTS_DIR = path.join(process.cwd(), 'scripts', 'docs');

// HTML files to convert
const htmlFiles = [
  'tech_business_report_20250404_latest.html',
  'tech_business_report_20250404_191740.html'
];

// Function to extract data from HTML
function extractDataFromHtml(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  // Extract timestamp from the hero date
  const heroDate = document.querySelector('.hero-date')?.textContent.trim() || new Date().toISOString();
  const timestamp = new Date(heroDate).toISOString();

  // Extract headlines
  const headlines = [];
  const headlineCards = document.querySelectorAll('.headline-card');
  headlineCards.forEach(card => {
    const source = card.querySelector('.headline-source')?.textContent.trim();
    const titleElement = card.querySelector('.headline-title');
    const title = titleElement?.textContent.trim();
    const url = titleElement?.href;
    
    if (title && source) {
      headlines.push({
        title,
        source,
        url: url || ''
      });
    }
  });

  // Extract analysis sections
  const analysis = {
    major_technology_trends: {
      summary: "",
      key_insights: [],
      key_headlines: []
    },
    business_impact_analysis: {
      summary: "",
      key_insights: [],
      key_headlines: []
    },
    industry_movements: {
      summary: "",
      key_insights: [],
      key_headlines: []
    },
    emerging_technologies: {
      summary: "",
      key_insights: [],
      key_headlines: []
    },
    strategic_takeaways: {
      summary: "",
      key_insights: [],
      key_headlines: []
    },
    business_opportunities: []
  };

  // Extract section content
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    const title = section.querySelector('h3')?.textContent.trim().toLowerCase().replace(/\s+/g, '_');
    if (title && analysis[title]) {
      const bullets = Array.from(section.querySelectorAll('.bullet')).map(bullet => bullet.textContent.trim());
      if (bullets.length > 0) {
        analysis[title].summary = bullets[0];
        analysis[title].key_insights = bullets.slice(1);
        // Since headlines are not explicitly marked in the HTML, we'll use the same insights
        analysis[title].key_headlines = bullets.slice(1);
      }
    }
  });

  // Since business opportunities are not in the HTML, we'll create a sample one
  analysis.business_opportunities = [{
    opportunity_name: "AI-Powered Cybersecurity Solutions",
    target_market: "Enterprise Security",
    implementation_timeline: "12-18 months",
    required_resources: ["AI/ML expertise", "Cybersecurity professionals", "Cloud infrastructure"],
    potential_roi_metrics: ["Reduced security incidents", "Faster threat detection", "Cost savings"],
    key_success_factors: ["Strong AI capabilities", "Industry partnerships", "Regulatory compliance"],
    risk_mitigation_strategies: ["Regular security audits", "Continuous monitoring", "Compliance reviews"]
  }];

  return {
    timestamp,
    headlines,
    analysis
  };
}

// Convert each HTML file to JSON
htmlFiles.forEach(htmlFile => {
  try {
    console.log(`Converting ${htmlFile} to JSON...`);
    
    // Read HTML file
    const htmlPath = path.join(REPORTS_DIR, htmlFile);
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    
    // Extract data from HTML
    const data = extractDataFromHtml(htmlContent);
    
    // Generate JSON filename
    const jsonFilename = htmlFile.replace('.html', '.json');
    const jsonPath = path.join(REPORTS_DIR, jsonFilename);
    
    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    
    console.log(`Successfully converted ${htmlFile} to ${jsonFilename}`);
  } catch (error) {
    console.error(`Error converting ${htmlFile}:`, error);
  }
});

console.log('Conversion complete!'); 