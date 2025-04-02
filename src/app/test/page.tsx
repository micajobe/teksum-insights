'use client';

import React, { useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setStatus('Generating report...');
    
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('Report generated successfully!');
        // Add a link to view the report
        const latestReport = 'tech_business_report_20250402_latest.html';
        // Use window.location.origin to get the current domain and port
        window.location.href = `${window.location.origin}/api/reports/${latestReport}`;
      } else {
        setStatus(`Error: ${data.error || 'Failed to generate report'}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to generate report'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            TEKSUM Insights Report Generator
          </h1>
          
          <button
            onClick={generateReport}
            disabled={loading}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          
          {status && (
            <div className="mt-4 text-sm text-gray-600">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 