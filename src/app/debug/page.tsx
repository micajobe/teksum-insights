'use client';

import React, { useState, useEffect } from 'react';

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<string>('Checking API...');
  const [reportStatus, setReportStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);

  useEffect(() => {
    // Check if the API endpoint is available
    const checkApi = async () => {
      try {
        const response = await fetch('/api/generate-report');
        const data = await response.json();
        setApiStatus(`API Status: ${data.message || 'Unknown'}`);
        setDebugInfo(data);
      } catch (error) {
        console.error('Error checking API:', error);
        setApiStatus(`API Error: ${error instanceof Error ? error.message : 'Failed to connect to API'}`);
      }
    };
    
    checkApi();
  }, []);

  const checkReport = async () => {
    setLoading(true);
    setReportStatus('Checking report...');
    setReportContent(null);
    
    try {
      // First check if the report exists using the check endpoint
      const checkResponse = await fetch('/api/reports/check?filename=tech_business_report_20250402_latest.html');
      const checkData = await checkResponse.json();
      
      console.log('Report check data:', checkData);
      
      if (checkData.exists) {
        setReportStatus(`Report Status: Found (${checkData.size} bytes, modified ${new Date(checkData.modified).toLocaleString()})`);
        
        // Now try to fetch the actual report content
        try {
          const reportResponse = await fetch('/api/reports/tech_business_report_20250402_latest.html');
          const reportData = await reportResponse.json();
          console.log('Report data:', reportData);
          
          if (reportData.error) {
            setReportStatus(`Report Error: ${reportData.error}`);
            setDebugInfo(reportData);
          } else {
            setReportStatus(`Report Status: Found (${reportData.content.length} bytes)`);
            setDebugInfo(reportData);
            
            // Display content preview
            if (reportData.content) {
              setReportContent(reportData.content.substring(0, 500) + (reportData.content.length > 500 ? '...' : ''));
            }
          }
        } catch (reportError) {
          console.error('Error fetching report content:', reportError);
          setReportStatus(`Report Status: Found but error fetching content: ${reportError instanceof Error ? reportError.message : 'Unknown error'}`);
        }
      } else {
        setReportStatus(`Report Status: Not found (${checkData.error || 'Unknown error'})`);
      }
      
      setDebugInfo(checkData);
    } catch (error) {
      console.error('Error checking report:', error);
      setReportStatus(`Report Error: ${error instanceof Error ? error.message : 'Failed to check report'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setReportStatus('Generating report...');
    setReportContent(null);
    
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
        setReportStatus('Report generated successfully!');
        setDebugInfo(data);
      } else {
        setReportStatus(`Error: ${data.error || 'Failed to generate report'}`);
        setDebugInfo(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setReportStatus(`Error: ${error instanceof Error ? error.message : 'Failed to generate report'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            TEKSUM Insights Debug Page
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">API Status</h2>
              <p className="text-sm text-gray-600">{apiStatus}</p>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Report Status</h2>
              <p className="text-sm text-gray-600">{reportStatus}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={checkReport}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Check Report
            </button>
            
            <button
              onClick={generateReport}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Generate Report
            </button>
          </div>
          
          {debugInfo && (
            <div className="bg-white p-4 rounded shadow text-left overflow-auto max-h-96 mb-8">
              <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          {reportContent && (
            <div className="bg-white p-4 rounded shadow text-left overflow-auto max-h-96">
              <h2 className="text-xl font-semibold mb-2">Report Content Preview</h2>
              <div className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {reportContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 