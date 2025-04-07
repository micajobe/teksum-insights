# Protected Files

The following files contain working display code and should **NOT** be modified without explicit approval:

## Core Display Components
- `app/page.tsx` - Main dashboard page
- `components/opportunity-card.tsx` - Business opportunity card component
- `lib/types.ts` - Core type definitions

## Why These Files Are Protected
These files contain the working display logic that has been verified to function correctly. Modifying these files could break the application's UI and user experience.

## How to Work with Protected Files
1. If you need to make changes to these files, create a new branch from `main`
2. Document your changes thoroughly
3. Get explicit approval before merging changes to these files

## Working on the Scraper
When working on the scraper functionality, focus on:
- `scripts/tech_business_scraper.py`
- `app/api/scrape/route.py`
- `app/api/run-scraper/route.ts`
- `src/lib/scraper.ts`
- `src/lib/report-generator.ts`

These files are safe to modify as part of the scraper implementation. 