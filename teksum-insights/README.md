# TEKSUM Insights

A modern web application that generates and displays daily tech and business insights reports.

## Features

- Daily automated report generation
- Modern React-based UI with Next.js
- Responsive design with Tailwind CSS
- Archive of historical reports
- API endpoints for report generation and retrieval

## Tech Stack

- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS
- Vercel for deployment and cron jobs

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/teksum-insights.git
cd teksum-insights
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your environment variables:
```env
# Add your environment variables here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in your Vercel project settings
4. Deploy!

The cron job is configured to run daily at midnight UTC to generate new reports.

## Project Structure

```
teksum-insights/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-report/
│   │   │   └── reports/
│   │   └── page.tsx
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── ReportCard.tsx
│   │   └── ReportList.tsx
│   └── lib/
│       ├── scraper.ts
│       └── types.ts
├── public/
├── docs/
├── package.json
├── tsconfig.json
└── vercel.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 