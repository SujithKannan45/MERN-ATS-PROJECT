import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { IMonthlyMetric } from '@/services/analytics.service';

interface MonthlyTrendsChartProps {
  applications: IMonthlyMetric[];
  resumeUploads: IMonthlyMetric[];
}

export function MonthlyTrendsChart({ applications, resumeUploads }: MonthlyTrendsChartProps) {
  const [activeDataset, setActiveDataset] = React.useState<'both' | 'applications' | 'resumes'>('both');
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Merge unique months in chronological order
  const monthsMap = new Map<string, { month: string; applications: number; resumes: number }>();

  applications.forEach((item) => {
    monthsMap.set(item.month, {
      month: item.month,
      applications: item.count,
      resumes: 0,
    });
  });

  resumeUploads.forEach((item) => {
    const existing = monthsMap.get(item.month);
    if (existing) {
      existing.resumes = item.count;
    } else {
      monthsMap.set(item.month, {
        month: item.month,
        applications: 0,
        resumes: item.count,
      });
    }
  });

  const data = Array.from(monthsMap.values());
  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.applications, d.resumes))
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 gap-2">
        <div>
          <CardTitle className="text-base">Applications & Resumes Over Time</CardTitle>
          <p className="text-xs text-muted-foreground">Monthly application activity vs resume upload updates</p>
        </div>

        {/* Legend / Toggle Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs">
          <button
            onClick={() => setActiveDataset('both')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              activeDataset === 'both' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveDataset('applications')}
            className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeDataset === 'applications' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Applications
          </button>
          <button
            onClick={() => setActiveDataset('resumes')}
            className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeDataset === 'resumes' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Uploads
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-52 text-xs text-muted-foreground">
            No historical timeline activity recorded yet
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart SVG */}
            <div className="relative h-60 w-full pt-4">
              <div className="flex h-48 items-end gap-3 sm:gap-6 border-b border-border pb-1">
                {data.map((item, idx) => {
                  const appHeight = `${Math.min(100, (item.applications / maxVal) * 100)}%`;
                  const resHeight = `${Math.min(100, (item.resumes / maxVal) * 100)}%`;
                  const isHovered = hoveredIndex === idx;

                  return (
                    <div
                      key={item.month}
                      className="relative flex-1 flex items-end justify-center gap-1 sm:gap-2 h-full cursor-pointer group"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Tooltip on Hover */}
                      {isHovered && (
                        <div className="absolute -top-14 z-20 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-[11px] shadow-lg pointer-events-none">
                          <p className="font-bold text-popover-foreground">{item.month}</p>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>Apps: <strong className="text-blue-500">{item.applications}</strong></span>
                            <span>•</span>
                            <span>Resumes: <strong className="text-indigo-500">{item.resumes}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* Applications Bar */}
                      {(activeDataset === 'both' || activeDataset === 'applications') && (
                        <div
                          className="w-3 sm:w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                          style={{ height: appHeight }}
                        />
                      )}

                      {/* Resumes Bar */}
                      {(activeDataset === 'both' || activeDataset === 'resumes') && (
                        <div
                          className="w-3 sm:w-6 bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                          style={{ height: resHeight }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex gap-3 sm:gap-6 text-center text-[10px] text-muted-foreground pt-2">
                {data.map((item) => (
                  <div key={item.month} className="flex-1 truncate">
                    {item.month}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
