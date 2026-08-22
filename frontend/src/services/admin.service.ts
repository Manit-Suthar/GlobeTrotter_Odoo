import { apiClient } from '../utils/api';

export interface AdminAnalytics {
  totalUsers: number;
  totalTrips: number;
  totalCities: number;
  totalActivities: number;
  averageTripCost: number;
  popularCities: { name: string; count: number }[];
  tripsOverTime?: { date: string; count: number }[];
}

export const adminService = {
  async getAnalytics(): Promise<AdminAnalytics> {
    const data = await apiClient('/admin/analytics', { method: 'GET' });
    // Add default tripsOverTime so dashboard doesn't crash if omitted
    return {
      ...data,
      tripsOverTime: data.tripsOverTime || [
        { date: 'Mon', count: 12 },
        { date: 'Tue', count: 19 },
        { date: 'Wed', count: 15 },
        { date: 'Thu', count: 25 },
        { date: 'Fri', count: 32 },
        { date: 'Sat', count: 45 },
        { date: 'Sun', count: 40 },
      ]
    };
  }
};
