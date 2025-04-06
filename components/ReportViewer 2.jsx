import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ReportViewer = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestReport = async () => {
      try {
        setLoading(true);
        // In production, this would be an API endpoint
        // For now, we'll use a static JSON file
        const response = await fetch('/api/latest-report');
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }
        const data = await response.json();
        setReport(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReport();
  }, []);

  const formatDate = (timestamp) => {
    try {
      return format(new Date(timestamp), 'MMMM d, yyyy h:mm a');
    } catch (e) {
      return timestamp;
    }
  };

  const findHeadlineUrl = (headlineText) => {
    if (!report || !report.headlines) return null;
    const headline = report.headlines.find(h => h.title === headlineText);
    return headline ? headline.url : null;
  };

  const Section = ({ title, content }) => {
    if (!content) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">{title}</h2>
        
        {typeof content === 'object' && !Array.isArray(content) ? (
          <div className="space-y-4">
            {Object.entries(content).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h3>
                {typeof value === 'object' ? (
                  <Section title="" content={value} />
                ) : (
                  <p className="text-gray-600">{value}</p>
                )}
              </div>
            ))}
          </div>
        ) : Array.isArray(content) ? (
          <div className="space-y-4">
            {content.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                {typeof item === 'object' ? (
                  <Section title="" content={item} />
                ) : (
                  <div className="text-gray-600">
                    <p>• {item}</p>
                    {findHeadlineUrl(item) && (
                      <a 
                        href={findHeadlineUrl(item)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                      >
                        Read more →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">{content}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">No data: </strong>
        <span className="block sm:inline">No report data available.</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Technology and Business Insights Report</h1>
        <p className="text-gray-600">Generated on: {formatDate(report.timestamp)}</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Section title="Major Technology Trends" content={report.analysis.major_technology_trends} />
        <Section title="Business Impact Analysis" content={report.analysis.business_impact_analysis} />
        <Section title="Industry Movements" content={report.analysis.industry_movements} />
        <Section title="Emerging Technologies" content={report.analysis.emerging_technologies} />
        <Section title="Strategic Takeaways" content={report.analysis.strategic_takeaways} />
        <Section title="Business Opportunities" content={report.analysis.business_opportunities} />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Headlines Summary</h2>
          <div className="space-y-4">
            {report.headlines.map((headline, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-700">{headline.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">{headline.source}</span>
                  <a 
                    href={headline.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Read article →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer; 