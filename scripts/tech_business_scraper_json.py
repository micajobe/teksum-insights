import os
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import openai
from dotenv import load_dotenv
import time
import random
import re
import traceback
import shutil
from urllib.parse import urlparse
from typing import List, Dict

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
print(f"Raw API Key from env: {api_key[:20]}...")

if not api_key:
    raise ValueError("OpenAI API key not found in environment variables")

# Convert project-specific key format to standard format if needed
if api_key.startswith('sk-proj-'):
    api_key = api_key.replace('sk-proj-', 'sk-', 1)
    print(f"Converted project-specific key to standard format")

openai.api_key = api_key
print(f"OpenAI API Key set to: {api_key[:20]}...")

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
        self.max_headlines = int(os.getenv('MAX_HEADLINES', 10))
        self.all_headlines = []

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

    def get_summary(self, headlines):
        try:
            # Prepare the prompt for ChatGPT
            prompt = f"""You are a strategic analyst with expertise in technology trends, business strategy, and industry analysis. 
            Based on these technology and business headlines, provide a comprehensive analysis in JSON format with the following structure:
            {{
                "major_technology_trends": {{
                    "summary": "A narrative summary of the major technology trends and their significance",
                    "key_insights": [
                        "Detailed insight 1 with explanation",
                        "Detailed insight 2 with explanation"
                    ],
                    "key_headlines": [
                        "Headline 1 with source and significance",
                        "Headline 2 with source and significance"
                    ]
                }},
                "business_impact_analysis": {{
                    "summary": "A narrative summary of the business implications and market impacts",
                    "key_insights": [
                        "Detailed business insight 1 with explanation",
                        "Detailed business insight 2 with explanation"
                    ],
                    "key_headlines": [
                        "Headline 1 with source and business significance",
                        "Headline 2 with source and business significance"
                    ]
                }},
                "industry_movements": {{
                    "summary": "A narrative summary of significant industry shifts and movements",
                    "key_insights": [
                        "Detailed industry movement 1 with explanation",
                        "Detailed industry movement 2 with explanation"
                    ],
                    "key_headlines": [
                        "Headline 1 with source and industry significance",
                        "Headline 2 with source and industry significance"
                    ]
                }},
                "emerging_technologies": {{
                    "summary": "A narrative summary of emerging technologies and their potential impact",
                    "key_insights": [
                        "Detailed technology insight 1 with explanation",
                        "Detailed technology insight 2 with explanation"
                    ],
                    "key_headlines": [
                        "Headline 1 with source and technology significance",
                        "Headline 2 with source and technology significance"
                    ]
                }},
                "strategic_takeaways": {{
                    "summary": "A narrative summary of key strategic implications and recommendations",
                    "key_insights": [
                        "Detailed strategic insight 1 with explanation",
                        "Detailed strategic insight 2 with explanation"
                    ],
                    "key_headlines": [
                        "Headline 1 with source and strategic significance",
                        "Headline 2 with source and strategic significance"
                    ]
                }},
                "business_opportunities": [
                    {{
                        "opportunity_name": "Name of the business opportunity",
                        "target_market": "Description of the target market",
                        "implementation_timeline": "Estimated timeline for implementation",
                        "required_resources": [
                            "List of required resources and expertise"
                        ],
                        "potential_roi_metrics": [
                            "Key metrics to measure success"
                        ],
                        "key_success_factors": [
                            "Critical factors for success"
                        ],
                        "risk_mitigation_strategies": [
                            "Strategies to mitigate potential risks"
                        ]
                    }}
                ]
            }}

            Headlines:
            {self._format_headlines_for_prompt(headlines)}

            For each section:
            1. Provide a comprehensive narrative summary that explains the significance and implications
            2. Include detailed insights with explanations of why they matter
            3. Reference specific headlines and explain their significance in the broader context
            4. Focus on actionable insights and strategic implications
            5. Consider both immediate and long-term impacts
            6. Analyze patterns and connections between different trends

            For the business_opportunities section:
            1. Identify 5-7 specific business opportunities based on the trends and insights
            2. For each opportunity, provide:
               - Clear target market definition
               - Realistic implementation timeline
               - Required resources and expertise
               - Specific ROI metrics
               - Key success factors
               - Risk mitigation strategies
            3. Focus on opportunities that are:
               - Immediately actionable
               - Have clear market potential
               - Leverage current technology trends
               - Address identified market needs

            Format the response as valid JSON with rich, detailed content in each section."""

            # Generate thematic analysis using the OpenAI API format for version 0.28.1
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a strategic analyst with expertise in technology trends, business strategy, and industry analysis. Provide detailed, narrative-rich analysis in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            # Parse the response as JSON
            analysis = json.loads(response.choices[0].message.content)
            return analysis

        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            traceback.print_exc()  # Print the full traceback for debugging
            return None

    def generate_report(self):
        # Collect headlines
        headlines = self.get_all_headlines()
        
        # Generate analysis
        analysis = self.get_summary(headlines)
        
        if not analysis:
            print("Failed to generate analysis")
            return None

        # Create the report data structure
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "headlines": headlines,
            "analysis": analysis
        }

        # Save as JSON file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"tech_business_report_{timestamp}.json"
        filepath = os.path.join("docs", filename)
        
        # Ensure docs directory exists
        os.makedirs("docs", exist_ok=True)
        
        with open(filepath, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\nReport saved to: {filepath}")
        return report_data

def main():
    try:
        agent = TechBusinessScraperAgent(os.getenv("OPENAI_API_KEY"))
        result = agent.generate_report()
        
        if result:
            print("\nTechnology and Business Insights Summary:")
            print("=======================================")
            print(json.dumps(result, indent=2))
        else:
            print("Error: Failed to generate summary.")
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    main() 