import * as React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { IAtsScoreTrendItem } from '@/services/analytics.service';

interface AtsScoreTrendChartProps {
  trend: IAtsScoreTrendItem[];
}

export function AtsScoreTrendChart({ trend }: AtsScoreTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<IAtsScoreTrendItem | null>(null);

  if (trend.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ATS Score Progression</CardTitle>
          <p className="text-xs text-muted-foreground">Historical trajectory across resume audits</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-muted-foreground">
            <Sparkles className="h-6 w-6 text-muted-foreground/40 mb-2" />
            <p>No ATS evaluations recorded yet.</p>
            <p className="text-[11px] opacity-80">Run an AI audit to see your optimization score curve.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // SVG dimensions
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const points = trend.map((item, index) => {
    const x =
      trend.length === 1
        ? width / 2
        : paddingX + (index / (trend.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (item.score / 100) * (height - paddingY * 2);
    return { ...item, x, y };
  });

  const pathD =
    points.length === 1
      ? `M ${points[0].x} ${points[0].y}`
      : points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  const areaD =
    points.length === 1
      ? ''
      : `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${
          height - paddingY
        } Z`;

  const latestScore = trend[trend.length - 1]?.score ?? 0;
  const firstScore = trend[0]?.score ?? 0;
  const scoreDiff = latestScore - firstScore;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">ATS Score Progression</CardTitle>
          <p className="text-xs text-muted-foreground">Trajectory across your AI resume scans</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={`flex items-center gap-1 ${
              scoreDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} pts
          </span>
          <span className="text-muted-foreground font-normal">overall</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative w-full">
          {/* Active Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-1 right-2 z-20 rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md">
              <span className="font-bold text-popover-foreground">{hoveredPoint.score}% Match</span>
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                {hoveredPoint.targetJobTitle || 'General Scan'} •{' '}
                {new Date(hoveredPoint.date).toLocaleDateString()}
              </p>
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Guide Lines */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={width - paddingX}
              y2={paddingY}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-border"
            />
            <line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-border"
            />
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="currentColor"
              className="text-border"
            />

            {/* Labels */}
            <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" className="text-[10px] fill-muted-foreground">
              100%
            </text>
            <text x={paddingX - 10} y={height / 2 + 4} textAnchor="end" className="text-[10px] fill-muted-foreground">
              50%
            </text>
            <text x={paddingX - 10} y={height - paddingY + 4} textAnchor="end" className="text-[10px] fill-muted-foreground">
              0%
            </text>

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#scoreAreaGradient)" />}

            {/* Line Path */}
            <path
              d={pathD}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Circles */}
            {points.map((p, idx) => (
              <g
                key={p.id || idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  className="fill-background stroke-indigo-600 stroke-[3] hover:r-8 transition-all"
                />
              </g>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
