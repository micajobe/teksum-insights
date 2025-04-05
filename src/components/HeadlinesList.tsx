import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Headline } from '@/lib/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingCard, LoadingSkeleton } from '@/components/LoadingSpinner';

interface HeadlinesListProps {
  headlines: Headline[];
  title?: string;
  className?: string;
  maxItems?: number;
  isLoading?: boolean;
}

export function HeadlinesList({ 
  headlines, 
  title = "Latest Headlines", 
  className = "",
  maxItems,
  isLoading = false
}: HeadlinesListProps) {
  // Limit the number of headlines if maxItems is provided
  const displayedHeadlines = maxItems ? headlines.slice(0, maxItems) : headlines;
  
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="mb-6 text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title}
        </h2>
      )}
      
      {displayedHeadlines.length === 0 ? (
        <p className="text-gray-400">No headlines available.</p>
      ) : (
        <div className="space-y-4">
          {displayedHeadlines.map((headline, index) => (
            <div 
              key={index} 
              className="headline-card rounded-lg border border-gray-800/50 bg-gray-900/50 p-4 transition-all hover:border-purple-500/30 hover:bg-gray-900"
            >
              <div className="headline-source text-xs font-medium text-purple-400">
                {headline.source}
              </div>
              <a 
                href={headline.url} 
                className="headline-title mt-1 block text-sm font-medium text-white transition-colors hover:text-purple-300" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {headline.title}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 