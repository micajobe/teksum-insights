import requests
from bs4 import BeautifulSoup
from openai import OpenAI
import os
from datetime import datetime
from typing import List, Dict
from dotenv import load_dotenv
import time
import random
import webbrowser
import json
import re
import traceback
import openai
import shutil
from urllib.parse import urlparse

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

class TechBusinessScraperAgent:
    def __init__(self, api_key: str):
        print("Initializing TechBusinessScraperAgent...")
        self.client = OpenAI(api_key=api_key)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        self.news_sources = {
            'McKinsey': 'https://www.mckinsey.com/insights',
            'Deloitte': 'https://www2.deloitte.com/us/en/insights/topics/digital-transformation.html',
            'Forbes Tech': 'https://www.forbes.com/technology/',
            'Wired': 'https://www.wired.com/tag/business/',
            'MIT Tech Review': 'https://www.technologyreview.com/',
            'Harvard Business Review': 'https://hbr.org/topic/technology',
            'TechCrunch': 'https://techcrunch.com',
            'VentureBeat': 'https://venturebeat.com'
        }

    def is_likely_headline(self, text: str) -> bool:
        """Check if the text is likely a headline."""
        # Headlines are usually 20-200 characters and don't end with common file extensions
        if not text or len(text) < 20 or len(text) > 200:
            return False
        
        # Skip navigation items and common non-headline text
        skip_phrases = ['subscribe', 'sign up', 'login', 'sign in', 'menu', 
                       'search', 'newsletter', 'download', 'follow us']
        if any(phrase in text.lower() for phrase in skip_phrases):
            return False
            
        return True

    def scrape_site(self, site_name: str) -> List[Dict]:
        """Scrape headlines from a site using heading tags."""
        print(f"\nAttempting to scrape {site_name}...")
        try:
            response = requests.get(
                self.news_sources[site_name], 
                headers=self.headers, 
                timeout=10
            )
            print(f"{site_name} status code: {response.status_code}")
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                articles = []
                
                # Find all h1, h2, and h3 tags that are within links or find nearby links
                headlines = soup.find_all(['h1', 'h2', 'h3'])
                print(f"Found {len(headlines)} potential headlines in {site_name}")
                
                base_url = self.news_sources[site_name]
                
                for headline in headlines:
                    # Get text and clean it up
                    text = headline.get_text(strip=True)
                    
                    # Check if it's likely a headline
                    if self.is_likely_headline(text):
                        # First try to find a parent link
                        link = headline.find_parent('a')
                        if not link:
                            # If no parent link, look for the nearest link
                            link = headline.find('a') or headline.find_next('a')
                        
                        url = None
                        if link and link.get('href'):
                            url = link.get('href')
                            # Handle relative URLs
                            if url.startswith('/'):
                                # Extract base domain
                                parsed_uri = urlparse(base_url)
                                domain = '{uri.scheme}://{uri.netloc}'.format(uri=parsed_uri)
                                url = domain + url
                            elif not url.startswith(('http://', 'https://')):
                                url = base_url.rstrip('/') + '/' + url.lstrip('/')
                        
                        # Avoid duplicates
                        if text not in [h['title'] for h in articles]:
                            articles.append({
                                'title': text,
                                'source': site_name,
                                'url': url if url else '#'  # Use '#' as fallback
                            })
                            print(f"Added headline from {site_name}: {text[:100]}...")
                
                # Return top 5 headlines
                return articles[:5]
            
            return []
            
        except Exception as e:
            print(f"Error scraping {site_name}: {str(e)}")
            return []

    def get_all_headlines(self) -> List[Dict]:
        """Collect headlines from all sources."""
        print("\nCollecting headlines from all sources...")
        headlines = []
        
        for site_name in self.news_sources.keys():
            try:
                source_headlines = self.scrape_site(site_name)
                headlines.extend(source_headlines)
                # Add a small delay between requests
                time.sleep(random.uniform(1, 3))
            except Exception as e:
                print(f"Error with {site_name}: {str(e)}")

        print(f"\nTotal headlines collected: {len(headlines)}")
        if headlines:
            print("\nSample headlines:")
            for headline in headlines[:5]:
                print(f"- {headline['title']} ({headline['source']})")
        return headlines

    def _format_headlines_for_prompt(self, headlines: List[Dict]) -> str:
        """Format headlines for the ChatGPT prompt."""
        formatted_headlines = []
        for headline in headlines:
            formatted_headlines.append(f"Source: {headline['source']}\nHeadline: {headline['title']}\n")
        return "\n".join(formatted_headlines)

    def get_summary(self, headlines: List[Dict]) -> str:
        """Generate a thematic summary of the headlines using ChatGPT."""
        try:
            headlines_text = self._format_headlines_for_prompt(headlines)
            
            analysis_prompt = f"""
            Analyze these tech and business headlines and provide a structured summary:

            {headlines_text}

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
            """
            
            print("\nGenerating thematic analysis...")
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional technology and business analyst."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            if not response.choices or not response.choices[0].message:
                print("Error: Empty response from ChatGPT for thematic analysis")
                return None
                
            thematic_analysis = response.choices[0].message.content
            
            # Now get monetization strategies based on the analysis
            monetization_prompt = f"""
            Based on the following technology and business analysis, suggest specific monetization strategies:

            {thematic_analysis}

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
            """
            
            print("\nGenerating monetization strategies...")
            monetization_response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a business strategy consultant specializing in technology monetization."},
                    {"role": "user", "content": monetization_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            if not monetization_response.choices or not monetization_response.choices[0].message:
                print("Error: Empty response from ChatGPT for monetization strategies")
                return thematic_analysis  # Return just the thematic analysis if monetization fails
                
            monetization_strategies = monetization_response.choices[0].message.content
            
            # Combine both analyses
            complete_analysis = f"{thematic_analysis}\n\n{monetization_strategies}"
            
            print("Analysis generated successfully!")
            return complete_analysis
                
        except Exception as e:
            print(f"Error generating analysis: {str(e)}")
            traceback.print_exc()
            return None

    def clean_markdown(self, text: str) -> str:
        """Clean markdown formatting and structure the text."""
        sections = {}
        current_section = None
        current_title = None
        
        # Split text into lines and process each line
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Handle main section headers
            if line.startswith(('1.', '2.', '3.', '4.', '5.')):
                title = line.split('.', 1)[1].strip().split(':', 1)[0]
                current_title = title
                if current_title not in sections:
                    sections[current_title] = {
                        'analysis': [],
                        'monetization': []
                    }
                current_section = 'analysis'
            
            # Handle monetization strategies section
            elif 'MONETIZATION STRATEGIES' in line:
                current_section = 'monetization'
            
            # Handle bullet points
            elif line.startswith('•') or line.startswith('-'):
                if current_title and current_section:
                    content = line[1:].strip()  # Remove the bullet
                    content = content.replace('•', '').strip()  # Remove any additional bullets
                    sections[current_title][current_section].append(content)
        
        # Generate HTML
        html_output = ""
        for title, content in sections.items():
            if content['analysis'] or content['monetization']:
                html_output += f"""
                    <div class="section">
                        <h3>{title}</h3>
                        <div class="section-content">
                """
                
                # Add analysis content
                for point in content['analysis']:
                    html_output += f'<p class="bullet">{point}</p>'
                
                # Add monetization strategies if they exist
                if content['monetization']:
                    html_output += """
                        <div class="monetization-strategy">
                            <h4>Monetization Strategies</h4>
                    """
                    for strategy in content['monetization']:
                        html_output += f'<p class="strategy-item">{strategy}</p>'
                    html_output += "</div>"
                
                html_output += """
                        </div>
                    </div>
                """
        
        return html_output

    def generate_html(self, headlines: List[Dict], summary: str) -> str:
        """Generate a beautifully styled HTML report."""
        # Create headlines HTML first
        headlines_html = ""
        for headline in headlines:
            url = headline.get('url', '#')
            link_class = 'headline-title' if url != '#' else 'headline-title no-link'
            headlines_html += f"""
                <div class="headline-card">
                    <div class="headline-source">{headline['source']}</div>
                    <a href="{url}" class="{link_class}" target="_blank" rel="noopener noreferrer">
                        {headline['title']}
                        {'' if url != '#' else ' <span class="no-link-indicator">(No link available)</span>'}
                    </a>
                </div>
            """

        css_styles = """
            @font-face {
                font-family: 'GelaTrialVF';
                src: url('GelaTrialVF.ttf') format('truetype');
                font-weight: 100 900;
                font-style: normal;
                font-display: swap;
            }

            :root {
                --primary-color: #A78BFA;
                --secondary-color: #F3F0FF;
                --text-color: #1a1a1a;
                --accent-color: #7C3AED;
                --bg-color: #FFFFFF;
                --border-color: #E5E7EB;
                --hero-bg: linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%);
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
                font-family: 'GelaTrialVF', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 16rem;
                font-weight: 800;
                color: white;
                text-align: center;
                margin: 0;
                letter-spacing: -0.02em;
                width: 80%;
                position: relative;
                z-index: 2;
                text-shadow: 0 4px 12px rgba(0,0,0,0.15);
                line-height: 0.9;
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

            .floating-images {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                opacity: 0.2;
            }

            .floating-image {
                position: absolute;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                animation: float 20s infinite ease-in-out;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                25% { transform: translateY(-20px) rotate(5deg); }
                75% { transform: translateY(20px) rotate(-5deg); }
            }

            .container {
                max-width: 1140px;
                margin: 0 auto;
                padding: 0 1rem;
            }

            .header {
                text-align: center;
                padding: 3rem 0;
                border-bottom: 2px solid var(--border-color);
                margin-bottom: 2rem;
            }

            .header h1 {
                font-size: 3.5rem;
                margin: 0;
                font-weight: 700;
                letter-spacing: -0.02em;
            }

            .date {
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                color: #666;
                margin-top: 1rem;
            }

            .main-content {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 3rem;
                margin: 2rem 0;
            }

            .summary-section {
                font-size: 1.1rem;
                line-height: 1.8;
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
        """

        html_template = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TEKSUM - Tech & Business Insights</title>
            <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                {css_styles}
            </style>
        </head>
        <body>
            <div class="hero">
                <h1 class="hero-title">TEKSUM</h1>
                <div class="hero-date">{datetime.now().strftime('%B %d, %Y')}</div>
                <div class="floating-images">
                    <div class="floating-image" style="top: 10%; left: 10%; transform: rotate(-15deg);"></div>
                    <div class="floating-image" style="top: 20%; right: 15%; transform: rotate(10deg);"></div>
                    <div class="floating-image" style="bottom: 15%; left: 20%; transform: rotate(5deg);"></div>
                    <div class="floating-image" style="bottom: 25%; right: 25%; transform: rotate(-8deg);"></div>
                </div>
            </div>

            <div class="container">
                <div class="main-content">
                    <main class="summary-section">
                        {self.clean_markdown(summary)}
                    </main>

                    <aside class="headlines-sidebar">
                        <h2>Latest Headlines</h2>
                        {headlines_html}
                    </aside>
                </div>

                <footer class="footer">
                    <p>Generated by TechBusinessScraperAgent on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </footer>
            </div>
        </body>
        </html>
        """

        return html_template

    def save_and_open_report(self, html_content: str) -> None:
        """Save the HTML report and open it in the default browser."""
        reports_dir = "tech_business_reports"
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)

        # Copy the font file if it exists in the current directory
        font_source = "GelaTrialVF.ttf"
        if os.path.exists(font_source):
            shutil.copy2(font_source, os.path.join(reports_dir, "GelaTrialVF.ttf"))

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{reports_dir}/tech_business_report_{timestamp}.html"
        
        with open(filename, "w", encoding="utf-8") as f:
            f.write(html_content)

        webbrowser.open('file://' + os.path.abspath(filename))

    def summarize_insights(self) -> dict:
        """Use ChatGPT to summarize tech and business insights."""
        print("\nGetting headlines for summarization...")
        headlines = self.get_all_headlines()
        
        if not headlines:
            return {
                "success": False,
                "summary": "Unable to fetch headlines. Please check the error messages above.",
                "file_path": None
            }

        print("\nPreparing prompt for ChatGPT...")
        summary = self.get_summary(headlines)

        if summary:
            # Generate HTML and save
            html_content = self.generate_html(headlines, summary)
            
            # Save HTML file
            self.save_and_open_report(html_content)
            
            return {
                "success": True,
                "summary": summary,
                "file_path": None
            }
        else:
            return {
                "success": False,
                "summary": "Unable to generate summary. Please check the error messages above.",
                "file_path": None
            }

def main():
    try:
        agent = TechBusinessScraperAgent(os.getenv("OPENAI_API_KEY"))
        result = agent.summarize_insights()
        
        if result["success"]:
            print("\nTechnology and Business Insights Summary:")
            print("=======================================")
            print(result["summary"])
            
            if result["file_path"]:
                print(f"\nSummary has been saved to: {result['file_path']}")
        else:
            print("Error: Failed to generate summary.")
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    main() 