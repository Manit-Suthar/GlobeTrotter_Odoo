import { apiClient } from '../utils/api';

export interface TripActivity {
  id: string;
  activity_id: string;
  custom_name: string;
  scheduled_time?: string; // HH:mm
  scheduled_date?: string; // YYYY-MM-DD
  cost_estimate: number;
  image_url?: string;
  category?: string;
  duration?: string;
  notes?: string;
}

export interface TripStop {
  id: string;
  city_id: string;
  city_name: string;
  country: string;
  start_date: string;
  end_date: string;
  image_url?: string;
  order_index: number;
  activities: TripActivity[];
}

export interface Itinerary {
  trip_id: string;
  name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  cover_image?: string;
  stops: TripStop[];
}

export const itineraryService = {
  async getItinerary(tripId: string): Promise<Itinerary> {
    const raw = await apiClient(`/trips/${tripId}/itinerary`, { method: 'GET' });
    const trip = await apiClient(`/trips/${tripId}`, { method: 'GET' }); // need trip details
    
    // Map backend format to frontend format
    const duration = trip.start_date && trip.end_date 
      ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))
      : 1;

    return {
      trip_id: raw.trip_id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      duration_days: duration,
      cover_image: trip.cover_photo,
      stops: raw.stops.map((stop: any) => ({
        id: stop.id,
        city_id: stop.city_id,
        city_name: stop.city_id, // we don't have city details joined in MVP backend easily, frontend needs a mapper or we just put the UUID
        country: '',
        start_date: stop.start_date,
        end_date: stop.end_date,
        order_index: stop.order_index,
        activities: stop.activities.map((act: any) => ({
          id: act.id,
          activity_id: act.activity_id || act.id,
          custom_name: act.custom_name,
          scheduled_time: act.scheduled_time, // will need ISO formatting adjustments later
          cost_estimate: act.cost_estimate,
          notes: act.notes,
        }))
      }))
    };
  },

  async saveItinerary(itinerary: Itinerary): Promise<Itinerary> {
    const payload = {
      stops: itinerary.stops.map(stop => ({
        city_id: stop.city_id,
        start_date: stop.start_date,
        end_date: stop.end_date,
        order_index: stop.order_index,
        activities: stop.activities.map(act => ({
          activity_id: act.activity_id.startsWith('sys-') ? null : act.activity_id,
          custom_name: act.custom_name,
          scheduled_time: act.scheduled_time ? `${act.scheduled_date || itinerary.start_date}T${act.scheduled_time}:00Z` : null,
          cost_estimate: act.cost_estimate,
          notes: act.notes || null,
        }))
      }))
    };

    await apiClient(`/trips/${itinerary.trip_id}/itinerary/bulk`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return this.getItinerary(itinerary.trip_id);
  }
};
