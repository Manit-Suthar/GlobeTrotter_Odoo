import { apiClient } from '../utils/api';

export interface TripIntent {
  title: string;
  start_date?: string;
  end_date?: string;
  trip_duration_days?: number;
  travel_interests: string[];
  preferred_travel_style?: string;
  pace?: string;
  budget_preference?: string;
  estimated_budget_range?: string;
  suggested_timeline: string[];
  destinations: string[];
  additional_constraints: string[];
  summary?: string;
}

export interface AutoCreatedTrip {
  trip_id: string;
  name: string;
  start_date: string;
  end_date: string;
  stops_created: number;
  activities_created: number;
  hotels_selected: number;
  summary?: string;
  intent: TripIntent;
}

export const aiService = {
  // Describe a trip once; the backend plans it and saves the whole itinerary.
  createTripFromPrompt: (data: {
    title?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    cover_image?: string;
  }): Promise<AutoCreatedTrip> =>
    apiClient('/ai/create-trip', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
