#!/usr/bin/env python3
import json
import os
from datetime import datetime
from pathlib import Path
import sys

def find_latest_report():
    """Find the most recent report in the docs directory."""
    docs_dir = Path("docs")
    if not docs_dir.exists():
        print("Error: docs directory not found")
        sys.exit(1)
    
    reports = list(docs_dir.glob("tech_business_report_*.json"))
    if not reports:
        print("Error: No reports found in docs directory")
        sys.exit(1)
    
    # Sort by modification time and get the most recent
    latest_report = max(reports, key=lambda x: x.stat().st_mtime)
    return latest_report

def format_timestamp(timestamp_str):
    """Format the timestamp in a readable format."""
    try:
        dt = datetime.fromisoformat(timestamp_str)
        return dt.strftime("%B %d, %Y at %I:%M %p")
    except:
        return timestamp_str

def print_section(title, content, indent=0):
    """Print a section with proper formatting."""
    indent_str = "  " * indent
    print(f"\n{indent_str}{'=' * (80 - len(indent_str))}")
    print(f"{indent_str}{title}")
    print(f"{indent_str}{'=' * (80 - len(indent_str))}")
    
    if isinstance(content, dict):
        for key, value in content.items():
            if isinstance(value, (dict, list)):
                print(f"\n{indent_str}{key.replace('_', ' ').title()}:")
                print_section("", value, indent + 1)
            else:
                print(f"{indent_str}{key.replace('_', ' ').title()}: {value}")
    elif isinstance(content, list):
        for item in content:
            if isinstance(item, (dict, list)):
                print_section("", item, indent + 1)
            else:
                print(f"{indent_str}• {item}")

def display_report(report_path):
    """Display the report in a clean, organized format."""
    try:
        with open(report_path, 'r') as f:
            report = json.load(f)
        
        print("\nTECHNOLOGY AND BUSINESS INSIGHTS REPORT")
        print("=" * 80)
        print(f"Generated on: {format_timestamp(report['timestamp'])}")
        
        # Display Analysis Sections
        analysis = report['analysis']
        
        # Major Technology Trends
        print_section("MAJOR TECHNOLOGY TRENDS", analysis['major_technology_trends'])
        
        # Business Impact Analysis
        print_section("BUSINESS IMPACT ANALYSIS", analysis['business_impact_analysis'])
        
        # Industry Movements
        print_section("INDUSTRY MOVEMENTS", analysis['industry_movements'])
        
        # Emerging Technologies
        print_section("EMERGING TECHNOLOGIES", analysis['emerging_technologies'])
        
        # Strategic Takeaways
        print_section("STRATEGIC TAKEAWAYS", analysis['strategic_takeaways'])
        
        # Business Opportunities
        print_section("BUSINESS OPPORTUNITIES", analysis['business_opportunities'])
        
        # Display Headlines Summary
        print_section("HEADLINES SUMMARY", {
            "total_headlines": len(report['headlines']),
            "sources": list(set(h['source'] for h in report['headlines']))
        })
        
    except Exception as e:
        print(f"Error displaying report: {str(e)}")
        sys.exit(1)

def main():
    latest_report = find_latest_report()
    print(f"Displaying report: {latest_report.name}")
    display_report(latest_report)

if __name__ == "__main__":
    main() 