import { apiClient } from '../utils/api';
import { citiesService, type City } from './cities.service';
import type { Hotel } from './hotels.service';

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
  hotel_id?: string | null;
  hotel?: Hotel | null;
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

const formatDurationLabel = (minutes?: number | null): string | undefined => {
  if (!minutes) return undefined;
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr${hours === 1 ? '' : 's'}` : `${hours.toFixed(1)} hrs`;
};

// Backend returns an ISO datetime; the cards render a plain HH:mm clock value.
const toClockTime = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().slice(11, 16);
};

const toDateOnly = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
};

export const itineraryService = {
  async getItinerary(tripId: string): Promise<Itinerary> {
    const [raw, trip, cities] = await Promise.all([
      apiClient(`/trips/${tripId}/itinerary`, { method: 'GET' }),
      apiClient(`/trips/${tripId}`, { method: 'GET' }),
      citiesService.getCities().catch(() => [] as City[]),
    ]);
    const cityById = new Map(cities.map((c: City) => [c.id, c]));

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
        city_name: cityById.get(stop.city_id)?.name ?? 'Unknown city',
        country: cityById.get(stop.city_id)?.country ?? '',
        image_url: cityById.get(stop.city_id)?.image_url,
        start_date: stop.start_date,
        end_date: stop.end_date,
        order_index: stop.order_index,
        hotel_id: stop.hotel_id ?? null,
        hotel: stop.hotel ?? null,
        activities: stop.activities.map((act: any) => ({
          id: act.id,
          activity_id: act.activity_id || act.id,
          custom_name: act.custom_name,
          scheduled_time: toClockTime(act.scheduled_time),
          scheduled_date: toDateOnly(act.scheduled_time),
          cost_estimate: act.cost_estimate,
          category: act.category,
          image_url: act.image_url,
          duration: formatDurationLabel(act.duration_minutes),
          notes: act.notes,
        }))
      }))
    };
  },

  async saveItinerary(itinerary: Itinerary): Promise<Itinerary> {
    const payload = {
      stops: itinerary.stops.map(stop => ({
        city_id: stop.city_id,
        hotel_id: stop.hotel_id || null,
        start_date: stop.start_date,
        end_date: stop.end_date,
        order_index: stop.order_index,
        activities: stop.activities.map(act => ({
          activity_id: act.activity_id.startsWith('sys-') ? null : act.activity_id,
          custom_name: act.custom_name,
          scheduled_time: act.scheduled_time ? `${act.scheduled_date || stop.start_date}T${act.scheduled_time}:00Z` : null,
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
  },

  // Appends a single catalog activity to an existing saved stop.
  async addActivityToStop(
    stopId: string,
    activity: { activity_id: string; custom_name: string; cost_estimate: number; scheduled_date?: string; scheduled_time?: string }
  ): Promise<void> {
    const date = activity.scheduled_date || new Date().toISOString().slice(0, 10);
    const time = activity.scheduled_time || '10:00';
    await apiClient(`/stops/${stopId}/activities`, {
      method: 'POST',
      body: JSON.stringify({
        activity_id: activity.activity_id,
        custom_name: activity.custom_name,
        scheduled_time: `${date}T${time}:00Z`,
        cost_estimate: activity.cost_estimate,
      }),
    });
  }
};
