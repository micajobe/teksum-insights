'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<string>('Checking API...');
  const [reportStatus, setReportStatus] = useState<string>('Not checked');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [isTimeout, setIsTimeout] = useState<boolean>(false);

  useEffect(() => {
    checkApi();
  }, []);

  const checkApi = async () => {
    try {
      setApiStatus('Checking...');
      setError(null);
      setRawResponse('');
      setIsTimeout(false);
      
      const response = await fetch('/api/generate-report');
      const responseText = await response.text();
      setRawResponse(responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        setApiStatus(`API error: Invalid JSON response`);
        setError(`The API returned invalid JSON: ${responseText.substring(0, 100)}...`);
        return;
      }
      
      if (data.success) {
        setApiStatus('API is working');
        setDebugInfo(data.environment);
      } else {
        setApiStatus(`API error: ${data.error}`);
        setDebugInfo(data.environment);
        setError(data.error);
        
        // Check if this is a timeout error
        if (data.error && data.error.includes('timed out')) {
          setIsTimeout(true);
        }
      }
    } catch (error) {
      setApiStatus(`API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const generateReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setRawResponse('');
      setIsTimeout(false);
      setReportStatus('Generating report...');
      
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const responseText = await response.text();
      setRawResponse(responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        setReportStatus(`Error: Invalid JSON response`);
        setError(`The API returned invalid JSON: ${responseText.substring(0, 100)}...`);
        setIsLoading(false);
        return;
      }
      
      if (data.success) {
        setReportStatus('Report generated successfully');
        if (data.htmlContent) {
          setHtmlContent(data.htmlContent);
        }
        setDebugInfo(data.environment);
      } else {
        setReportStatus(`Error: ${data.error}`);
        setDebugInfo(data.environment);
        setError(data.error);
        
        // Check if this is a timeout error
        if (data.error && data.error.includes('timed out')) {
          setIsTimeout(true);
        }
      }
    } catch (error) {
      setReportStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">API Status</h2>
        <p>{apiStatus}</p>
        <button 
          onClick={checkApi}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Check API
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Report Status</h2>
        <p>{reportStatus}</p>
        <button 
          onClick={generateReport}
          disabled={isLoading}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      
      {isTimeout && (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Timeout Notice</h2>
          <p className="text-yellow-700">
            The report generation is taking too long and has timed out. This is likely due to the complexity of the operation.
            Consider breaking down the task into smaller steps or optimizing the scraper.
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {rawResponse && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Raw API Response</h2>
          <pre className="bg-gray-200 p-2 rounded overflow-auto max-h-60 text-xs">
            {rawResponse}
          </pre>
        </div>
      )}
      
      {htmlContent && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Report Preview</h2>
          <div 
            className="bg-white p-4 rounded border"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      )}
      
      {debugInfo && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <pre className="bg-gray-200 p-2 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 