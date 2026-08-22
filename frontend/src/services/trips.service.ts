export interface TripSummary {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  cover_image?: string;
  cities: string[];
  estimated_cost?: number;
}

const mockTrips: TripSummary[] = [
  {
    id: 'trip-1',
    name: 'Japan Adventure',
    start_date: '2026-09-12',
    end_date: '2026-09-19',
    description: 'Exploring the beauty of Japan.',
    cover_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    cities: ['Tokyo', 'Kyoto', 'Osaka'],
    estimated_cost: 115000,
  },
  {
    id: 'trip-2',
    name: 'European Summer',
    start_date: '2026-06-20',
    end_date: '2026-07-05',
    cover_image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    cities: ['Paris', 'Rome', 'Barcelona'],
    estimated_cost: 250000,
  }
];

export const tripsService = {
  async getTrips(): Promise<TripSummary[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTrips), 1000);
    });
  },

  async createTrip(data: { name: string; start_date: string; end_date: string; description?: string; cover_image?: string }): Promise<TripSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTrip: TripSummary = {
          id: `trip-${Date.now()}`,
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description,
          cover_image: data.cover_image,
          cities: [],
          estimated_cost: 0
        };
        mockTrips.unshift(newTrip);
        resolve(newTrip);
      }, 1500); // Simulate network latency
    });
  }
};
