'use client';

import { useState, useEffect } from 'react';

export default function CheckFiles() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/check-files');
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
      <h1 className="text-2xl font-bold mb-6">File System Check</h1>
      
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
          <h2 className="text-xl font-semibold mb-4">File System Information</h2>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-2">Public Directory</h3>
              <p><span className="font-medium">Path:</span> {data?.publicDir}</p>
              <p><span className="font-medium">Exists:</span> {data?.publicDirExists ? 'Yes' : 'No'}</p>
              
              {data?.publicFiles && data.publicFiles.length > 0 ? (
                <div className="mt-2">
                  <h4 className="font-medium mb-1">Files:</h4>
                  <ul className="list-disc pl-5">
                    {data.publicFiles.map((file: string, index: number) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-gray-500">No files found</p>
              )}
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-2">Reports Directory</h3>
              <p><span className="font-medium">Path:</span> {data?.reportsDir}</p>
              <p><span className="font-medium">Exists:</span> {data?.reportsDirExists ? 'Yes' : 'No'}</p>
              
              {data?.reportFiles && data.reportFiles.length > 0 ? (
                <div className="mt-2">
                  <h4 className="font-medium mb-1">Files:</h4>
                  <ul className="list-disc pl-5">
                    {data.reportFiles.map((file: string, index: number) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-gray-500">No files found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 