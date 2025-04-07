'use client';

import { useState, useEffect } from 'react';

export default function CheckReports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/check-reports');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">Reports Check</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Reports Directory Information</h2>
          
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Reports Directory:</span> {data?.reportsDir}</p>
            <p><span className="font-medium">Directory Exists:</span> {data?.directoryExists ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Number of Reports:</span> {data?.files?.length || 0}</p>
            
            {data?.files && data.files.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Available Reports:</h3>
                <ul className="list-disc pl-5">
                  {data.files.map((file: string, index: number) => (
                    <li key={index}>{file}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-4">
                <h3 className="font-medium mb-2">No Reports Available</h3>
                {data?.error && (
                  <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-medium text-red-700 mb-2">Error Details:</h4>
                    <p className="text-red-600">{data.error.message}</p>
                    {data.error.details && (
                      <div className="mt-2 text-xs text-red-500">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(data.error.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 