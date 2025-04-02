'use client';

import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('');

  useEffect(() => {
    // Check if the API endpoint is available
    const checkApi = async () => {
      try {
        const response = await fetch('/api/generate-report');
        const data = await response.json();
        setApiStatus(`API Status: ${data.message || 'Unknown'}`);
      } catch (error) {
        console.error('Error checking API:', error);
        setApiStatus(`API Error: ${error instanceof Error ? error.message : 'Failed to connect to API'}`);
      }
    };
    
    checkApi();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    setStatus('Generating report...');
    
    try {
      console.log('Sending request to /api/generate-report');
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
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
          
          {apiStatus && (
            <div className="mb-4 p-2 bg-gray-200 rounded">
              {apiStatus}
            </div>
          )}
          
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