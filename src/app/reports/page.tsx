import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReportsArchive } from '@/components/ReportsArchive';
import { getAllReports } from '@/lib/report-loader';

export default async function ReportsPage() {
  const reports = await getAllReports();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tech Business Reports</h1>
      
      <ErrorBoundary>
        <ReportsArchive reports={reports} />
      </ErrorBoundary>
    </div>
  );
} 