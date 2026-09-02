import {
  IDashboardOverviewResponse,
  IDashboardChartsResponse,
} from '../dtos/analytics.dto.js';

export interface IAnalyticsService {
  getDashboardOverview(userId: string): Promise<IDashboardOverviewResponse>;
  getDashboardCharts(userId: string): Promise<IDashboardChartsResponse>;
}
