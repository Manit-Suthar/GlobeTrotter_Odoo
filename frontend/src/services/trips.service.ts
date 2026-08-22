import { apiClient } from '../utils/api';

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

export const tripsService = {
  async getTrips(): Promise<TripSummary[]> {
    const rawTrips = await apiClient('/trips', { method: 'GET' });
    // Map backend TripRead to TripSummary
    return rawTrips.map((trip: any) => ({
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      description: trip.description,
      cover_image: trip.cover_photo,
      cities: [], // Populate if backend supports it later
      estimated_cost: 0
    }));
  },

  async createTrip(data: { name: string; start_date: string; end_date: string; description?: string; cover_image?: string }): Promise<TripSummary> {
    const trip = await apiClient('/trips', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        description: data.description,
        cover_photo: data.cover_image,
      }),
    });
    return {
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      description: trip.description,
      cover_image: trip.cover_photo,
      cities: [],
      estimated_cost: 0
    };
  }
};
