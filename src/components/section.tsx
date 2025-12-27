'use client';

import { ReactNode } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function Section({
  title,
  children,
  className,
  scrollable = true,
}: SectionProps) {
  const scrollId = `scroll-${title
    .replace(/\s+/g, '-')
    .toLowerCase()}`;

  const scrollLeft = () => {
    const container = document.getElementById(scrollId);
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    const container = document.getElementById(scrollId);
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          {title}
        </h2>
      </div>

      {scrollable ? (
        <div className="relative">
          <div
            id={scrollId}
            className="overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex space-x-6 pb-4">
              {children}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </section>
  );
}
