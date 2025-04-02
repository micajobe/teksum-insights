'use client';

import React from 'react';
import { format } from 'date-fns';

interface HeroProps {
  date?: Date;
}

export default function Hero({ date = new Date() }: HeroProps) {
  return (
    <div className="relative min-h-[70vh] flex flex-col justify-center items-center bg-gradient-to-br from-primary to-accent overflow-hidden p-8">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="font-gela text-[min(16rem,25vw)] font-extrabold text-white leading-[0.9] tracking-tight">
          TEKSUM
        </h1>
        <div className="mt-4 text-white/90 text-xl font-inter">
          {format(date, 'MMMM d, yyyy')}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[10%] left-[10%] w-32 h-32 bg-white/10 rounded-lg transform -rotate-15 animate-float" />
        <div className="absolute top-[20%] right-[15%] w-32 h-32 bg-white/10 rounded-lg transform rotate-10 animate-float-delayed" />
        <div className="absolute bottom-[15%] left-[20%] w-32 h-32 bg-white/10 rounded-lg transform rotate-5 animate-float-more-delayed" />
        <div className="absolute bottom-[25%] right-[25%] w-32 h-32 bg-white/10 rounded-lg transform -rotate-8 animate-float-most-delayed" />
      </div>
    </div>
  );
} 