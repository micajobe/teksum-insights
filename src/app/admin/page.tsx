import { ScraperTrigger } from '@/components/ScraperTrigger';

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Report Generation</h2>
          <ScraperTrigger />
        </section>
      </div>
    </div>
  );
} 