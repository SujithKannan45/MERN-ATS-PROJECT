import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ISkillFrequency } from '@/services/analytics.service';

interface SkillsFrequencyChartProps {
  topSkills: ISkillFrequency[];
  missingSkills: ISkillFrequency[];
}

export function SkillsFrequencyChart({ topSkills, missingSkills }: SkillsFrequencyChartProps) {
  const [tab, setTab] = React.useState<'missing' | 'in-demand'>('missing');

  const activeList = tab === 'missing' ? missingSkills : topSkills;
  const maxVal = Math.max(1, ...activeList.map((s) => s.count));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 gap-2">
        <div>
          <CardTitle className="text-base">Skill Market Intelligence</CardTitle>
          <p className="text-xs text-muted-foreground">Extracted from your tracked roles and Gemini AI gap scans</p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg text-xs">
          <button
            onClick={() => setTab('missing')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              tab === 'missing'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Missing Skills ({missingSkills.length})
          </button>
          <button
            onClick={() => setTab('in-demand')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              tab === 'in-demand'
                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Top Required ({topSkills.length})
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {activeList.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-xs text-muted-foreground text-center">
            No {tab === 'missing' ? 'missing skills' : 'required skills'} logged yet. Run AI audits to populate skill gaps.
          </div>
        ) : (
          <div className="space-y-3">
            {activeList.slice(0, 8).map((item) => {
              const width = `${Math.min(100, (item.count / maxVal) * 100)}%`;

              return (
                <div key={item.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.skill}</span>
                    <span className="text-muted-foreground font-medium">
                      {item.count} {item.count === 1 ? 'job' : 'jobs'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        tab === 'missing'
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
