export interface AdminAnalytics {
  totalUsers: number;
  totalTrips: number;
  totalCities: number;
  totalActivities: number;
  averageTripCost: number;
  popularCities: { name: string; count: number }[];
  tripsOverTime: { date: string; count: number }[];
}

const MOCK_ANALYTICS: AdminAnalytics = {
  totalUsers: 1450,
  totalTrips: 3200,
  totalCities: 840,
  totalActivities: 12500,
  averageTripCost: 45000,
  popularCities: [
    { name: 'Tokyo', count: 450 },
    { name: 'Paris', count: 420 },
    { name: 'Bali', count: 380 },
    { name: 'Dubai', count: 310 },
    { name: 'Rome', count: 290 }
  ],
  tripsOverTime: [
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 19 },
    { date: 'Wed', count: 15 },
    { date: 'Thu', count: 25 },
    { date: 'Fri', count: 32 },
    { date: 'Sat', count: 45 },
    { date: 'Sun', count: 40 },
  ]
};

export const adminService = {
  async getAnalytics(): Promise<AdminAnalytics> {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_ANALYTICS), 800));
  }
};
