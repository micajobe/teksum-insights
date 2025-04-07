'use client'

import { useState, useEffect } from 'react'

export default function RunScraper() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runScraper = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/run-scraper')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run scraper')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Run Tech Business Scraper</h1>
        
        <div className="mb-8">
          <button
            onClick={runScraper}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Running...' : 'Run Scraper'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h2 className="text-lg font-semibold text-green-700 mb-2">Success</h2>
            <p className="text-green-600 mb-4">{result.message}</p>
            
            <h3 className="font-medium mb-2">Reports Generated:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {result.reports.map((report: string) => (
                <li key={report} className="text-gray-700">{report}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h2 className="text-lg font-semibold mb-2">About the Scraper</h2>
          <p className="text-gray-700 mb-4">
            This scraper collects tech business news and generates reports. The reports are stored in the
            <code className="bg-gray-100 px-1 py-0.5 rounded">public/reports</code> directory.
          </p>
          <p className="text-gray-700">
            A cron job is configured to run this scraper daily at midnight. You can also manually trigger
            the scraper using the button above.
          </p>
        </div>
      </div>
    </div>
  )
} 