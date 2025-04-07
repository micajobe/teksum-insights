from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import subprocess
from pathlib import Path

# Add the scripts directory to the Python path
scripts_dir = Path(__file__).parent.parent.parent.parent / 'scripts'
sys.path.append(str(scripts_dir))

# Import the scraper module
from tech_business_scraper import main as run_scraper

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Run the scraper
            run_scraper()
            
            # Get the list of reports
            reports_dir = Path(__file__).parent.parent.parent.parent / 'public' / 'reports'
            reports = [f for f in os.listdir(reports_dir) if f.endswith('.json') and f != 'available-reports.json']
            reports.sort(reverse=True)  # Sort in descending order (newest first)
            
            # Return the list of reports
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'message': 'Scraper completed successfully',
                'reports': reports
            }).encode())
        except Exception as e:
            # Return the error
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': str(e)
            }).encode()) 