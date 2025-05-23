import requests
from bs4 import BeautifulSoup
import openai
import os
from datetime import datetime
from typing import List, Dict, Tuple
from dotenv import load_dotenv
import time
import random
import webbrowser
import json
import re
import traceback
import shutil
from urllib.parse import urlparse

# Load environment variables
print("Loading environment variables...")
# Get the absolute path to the .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
print(f"Looking for .env file at: {env_path}")
print(f"File exists: {os.path.exists(env_path)}")

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        print("First line of .env file:", f.readline().strip())

load_dotenv(env_path)

# Set up OpenAI API key
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OpenAI API key not found in environment variables")

print(f"Raw API Key from env: {api_key[:20]}...")  # Debug output to see the actual key
openai.api_key = api_key

print(f"API Key loaded: {'Yes' if api_key else 'No'}")
print(f"OpenAI API Key set to: {openai.api_key[:20]}...")  # Debug output to verify OpenAI's key

class TechBusinessScraperAgent:
    def __init__(self, api_key: str):
        print("Initializing TechBusinessScraperAgent...")
        # Use the API key from environment variable
        openai.api_key = api_key
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
        """Format headlines for the prompt."""
        formatted_headlines = []
        for headline in headlines:
            source = headline.get('source', 'Unknown')
            title = headline.get('title', '')
            formatted_headlines.append(f"{title} ({source})")
        return "\n".join(formatted_headlines)

    def get_summary(self, headlines: List[Dict]) -> Tuple[str, str]:
        print("\nPreparing prompt for ChatGPT...")
        try:
            print("\nGenerating thematic analysis...")
            formatted_headlines = self._format_headlines_for_prompt(headlines)
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional technology and business analyst."},
                    {"role": "user", "content": self.generate_analysis_prompt(formatted_headlines)}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            thematic_analysis = response.choices[0].message['content'].strip()

            print("\nGenerating monetization strategies...")
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a business strategy consultant specializing in technology monetization."},
                    {"role": "user", "content": self.generate_monetization_prompt(thematic_analysis)}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            monetization_strategies = response.choices[0].message['content'].strip()

            return thematic_analysis, monetization_strategies
        except Exception as e:
            print(f"Error generating analysis: {str(e)}")
            traceback.print_exc()
            return "Error: Failed to generate summary.", ""

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
                --accent-color: #0017d3;
                --bg-color: #FFFFFF;
                --border-color: #E5E7EB;
                --hero-bg: linear-gradient(135deg, #A78BFA 0%, #0017d3 100%);
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
                font-size: min(16rem, 25vw);
                font-weight: 800;
                color: white;
                text-align: center;
                margin: 0;
                letter-spacing: -0.02em;
                width: 100%;
                position: relative;
                z-index: 2;
                text-shadow: 0 4px 12px rgba(0,0,0,0.15);
                line-height: 0.9;
                padding: 0 1rem;
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
                .hero {
                    min-height: 50vh;
                    padding: 1rem;
                }
                .hero-title {
                    font-size: min(8rem, 20vw);
                    line-height: 1;
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

            /* Archive section styles */
            .archive-section {
                margin-top: 4rem;
                padding-top: 2rem;
                border-top: 2px solid var(--border-color);
            }

            .archive-section h2 {
                font-family: 'Inter', sans-serif;
                font-size: 1.8rem;
                color: var(--accent-color);
                margin-bottom: 2rem;
                text-align: center;
            }

            .archive-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .archive-card {
                background: var(--secondary-color);
                border-radius: 12px;
                padding: 1.5rem;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .archive-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .archive-card a {
                text-decoration: none;
                color: var(--text-color);
            }

            .archive-date {
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                color: var(--accent-color);
                margin-bottom: 0.5rem;
            }

            .archive-title {
                font-family: 'Inter', sans-serif;
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            @media (max-width: 768px) {
                .archive-grid {
                    grid-template-columns: 1fr;
                }
            }

            .trends-grid {
                display: grid;
                grid-template-columns: 3fr 2fr;
                gap: 2rem;
                align-items: start;
            }

            .feature-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            @media (max-width: 768px) {
                .trends-grid {
                    grid-template-columns: 1fr;
                }
                
                .trends-image {
                    margin-top: 2rem;
                }
            }
        """

        html_template = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TEKSUM Insights</title>
            <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                {css_styles}
            </style>
        </head>
        <body>
            <div class="hero">
                <div class="hero-content">
                    <h1 class="hero-title">TEKSUM</h1>
                    <div class="hero-date">{datetime.now().strftime('%B %d, %Y')}</div>
                </div>
            </div>

            <div class="container">
                <div class="main-content">
                    <div class="summary-section">
                        {self.clean_markdown(summary)}
                    </div>
                    <aside class="headlines-sidebar">
                        <h2>Today's Headlines</h2>
                        {headlines_html}
                    </aside>
                </div>

                <div class="archive-section">
                    <h2>Previous Reports</h2>
                    <div class="archive-grid">
                        {self.get_archive_html()}
                    </div>
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
        """Save the report to a file and open it."""
        # Create docs directory if it doesn't exist
        os.makedirs('docs', exist_ok=True)
        
        # Generate filename with current date
        current_date = datetime.now().strftime('%Y%m%d')
        filename = f'tech_business_report_{current_date}_latest.html'
        filepath = os.path.join('docs', filename)
        
        # Save the report
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"\nReport saved to: {filepath}")

        # Create or update the index.html file
        self.update_index_html()

    def update_index_html(self) -> None:
        """Update the index.html file with links to all reports."""
        try:
            # Create docs directory if it doesn't exist
            os.makedirs('docs', exist_ok=True)
            
            # Get all report files
            reports = []
            if os.path.exists('docs'):
                for file in os.listdir('docs'):
                    if file.startswith('tech_business_report_') and file.endswith('.html'):
                        reports.append(file)
            
            # Sort reports by date (newest first)
            reports.sort(reverse=True)
            
            # Generate index.html content
            index_content = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Tech Business Reports</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    ul { list-style-type: none; padding: 0; }
                    li { margin: 10px 0; }
                    a { color: #0066cc; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <h1>Tech Business Reports</h1>
                <ul>
            """
            
            for report in reports:
                date_str = report.split('_')[2]  # Extract date from filename
                index_content += f'    <li><a href="{report}">{date_str} Report</a></li>\n'
            
            index_content += """
                </ul>
            </body>
            </html>
            """
            
            # Save index.html
            with open(os.path.join('docs', 'index.html'), 'w', encoding='utf-8') as f:
                f.write(index_content)
            
        except Exception as e:
            print(f"Error updating index.html: {str(e)}")
            traceback.print_exc()

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
        summary, monetization_strategies = self.get_summary(headlines)

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

    def get_archive_html(self) -> str:
        """Generate HTML for the archive section."""
        reports_dir = "docs"
        archive_html = ""
        
        print(f"\nLooking for reports in: {reports_dir}")
        if os.path.exists(reports_dir):
            # Get all report files except the latest
            report_files = [f for f in os.listdir(reports_dir) 
                          if f.startswith('tech_business_report_') 
                          and f.endswith('.html')
                          and not f.endswith('_latest.html')]
            
            print(f"Found {len(report_files)} report files: {report_files}")
            
            # Sort by date (newest first) and take the 5 most recent
            report_files.sort(reverse=True)
            report_files = report_files[:5]
            
            print(f"Using {len(report_files)} most recent reports: {report_files}")
            
            for report_file in report_files:
                try:
                    # Extract date from filename
                    # Split by underscore and get the date part (index 3)
                    date_str = report_file.split('_')[3]  # Gets '20250401'
                    date = datetime.strptime(date_str, '%Y%m%d')
                    formatted_date = date.strftime('%B %d, %Y')
                    
                    archive_html += f"""
                        <div class="archive-card">
                            <a href="{report_file}">
                                <div class="archive-date">{formatted_date}</div>
                                <div class="archive-title">Tech & Business Report</div>
                            </a>
                        </div>
                    """
                    print(f"Added archive card for: {report_file} ({formatted_date})")
                except Exception as e:
                    print(f"Error processing archive file {report_file}: {str(e)}")
                    continue
        else:
            print(f"Reports directory not found: {reports_dir}")
        
        return archive_html

    def generate_analysis_prompt(self, headlines: List[str]) -> str:
        headlines_text = "\n".join(headlines)
        return f"""
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

    def generate_monetization_prompt(self, thematic_analysis: str) -> str:
        return f"""
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