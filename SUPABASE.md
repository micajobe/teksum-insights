# Supabase Integration

This document outlines how to set up and use the Supabase integration for the Teksum Insights application.

## Setup

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Create a table called `reports` with the following schema:
   - `id` (uuid, primary key)
   - `filename` (text, unique)
   - `data` (jsonb)
   - `timestamp` (timestamp with time zone)
4. Get your Supabase URL and anon key from the project settings
5. Create a `.env.local` file in the root of the project with the following content:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_USE_SUPABASE=false
   ```
6. Set `NEXT_PUBLIC_USE_SUPABASE=true` to enable Supabase integration

## Migration

To migrate existing reports to Supabase, run:

```bash
npm run migrate-to-supabase
```

This will:
1. Read all reports from the `public/reports` directory
2. Upload them to the Supabase `reports` table
3. Log the results of the migration

## Usage

The application is designed to work with both the file system and Supabase. When Supabase is enabled, it will:

1. Try to fetch reports from Supabase first
2. Fall back to the file system if Supabase is not configured or if a report is not found

This allows for a gradual migration to Supabase without breaking the existing functionality.

## API Routes

The following API routes have been updated to use Supabase when enabled:

- `/api/reports/available` - Returns a list of available reports
- `/api/reports/[filename]` - Returns a specific report

## Troubleshooting

If you encounter issues with the Supabase integration:

1. Check that your Supabase URL and anon key are correct
2. Verify that the `reports` table exists and has the correct schema
3. Check the browser console and server logs for error messages
4. Set `NEXT_PUBLIC_USE_SUPABASE=false` to fall back to the file system 