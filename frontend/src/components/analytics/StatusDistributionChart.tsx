import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { IJobStatusDistributionItem } from '@/services/analytics.service';

interface StatusDistributionChartProps {
  distribution: IJobStatusDistributionItem[];
}

const statusColorMap: Record<string, string> = {
  Saved: 'bg-slate-400',
  Applied: 'bg-blue-500',
  'Interview Scheduled': 'bg-amber-500',
  'Interview Completed': 'bg-indigo-500',
  'Offer Received': 'bg-emerald-500',
  Accepted: 'bg-teal-500',
  Rejected: 'bg-rose-500',
  Archived: 'bg-gray-400',
};

export function StatusDistributionChart({ distribution }: StatusDistributionChartProps) {
  const totalCount = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Job Status Distribution</CardTitle>
          <span className="text-xs text-muted-foreground font-semibold">{totalCount} total jobs</span>
        </div>
        <p className="text-xs text-muted-foreground">Current application pipeline volume breakdown</p>
      </CardHeader>

      <CardContent>
        {totalCount === 0 ? (
          <div className="flex items-center justify-center h-44 text-xs text-muted-foreground">
            No tracked jobs found in pipeline
          </div>
        ) : (
          <div className="space-y-4">
            {/* Multi-segment Horizontal Progress Bar */}
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
              {distribution.map((item) => {
                if (item.count === 0) return null;
                const width = `${Math.max(2, item.percentage)}%`;
                return (
                  <div
                    key={item.status}
                    className={`${statusColorMap[item.status] || 'bg-primary'} transition-all duration-500`}
                    style={{ width }}
                    title={`${item.status}: ${item.count} (${item.percentage}%)`}
                  />
                );
              })}
            </div>

            {/* Status Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {distribution.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-muted/20 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        statusColorMap[item.status] || 'bg-primary'
                      }`}
                    />
                    <span className="font-medium text-foreground truncate">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="font-bold text-foreground">{item.count}</span>
                    <span className="text-[10px] text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
