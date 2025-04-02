import React from 'react';
import Hero from '@/components/Hero';
import ReportList from '@/components/ReportList';
import { Report } from '@/lib/types';

async function getReports(): Promise<Report[]> {
  // TODO: Implement API call to fetch reports
  return [];
}

export default async function Home() {
  const reports = await getReports();
  const latestReport = reports[0];

  return (
    <main className="min-h-screen bg-background">
      <Hero date={latestReport?.date} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {latestReport && (
              <div className="bg-secondary rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">Latest Report</h2>
                <div className="space-y-6">
                  {latestReport.sections.map((section, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="text-xl font-semibold">{section.title}</h3>
                      <p className="text-gray-600">{section.analysis}</p>
                      {section.monetization && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Monetization Opportunities:</h4>
                          <ul className="list-disc list-inside space-y-2">
                            {section.monetization.map((item, i) => (
                              <li key={i} className="text-gray-600">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-secondary rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Today&apos;s Headlines</h2>
              <div className="space-y-4">
                {latestReport?.headlines.map((headline, index) => (
                  <a
                    key={index}
                    href={headline.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-background rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold mb-2">{headline.title}</h3>
                    <p className="text-sm text-gray-600">{headline.source}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Archive Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Previous Reports</h2>
          <ReportList reports={reports.slice(1)} />
        </div>
      </div>
    </main>
  );
} 