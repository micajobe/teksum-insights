'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Report } from '@/lib/types';

interface ReportCardProps {
  report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <Link 
      href={`/reports/${report.id}`}
      className="block bg-secondary rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="font-inter text-sm text-accent mb-2">
        {format(new Date(report.date), 'MMMM d, yyyy')}
      </div>
      <div className="font-inter text-lg font-semibold">
        Tech & Business Report
      </div>
      <div className="mt-4 text-sm text-gray-600">
        {report.headlines.length} headlines analyzed
      </div>
    </Link>
  );
} 