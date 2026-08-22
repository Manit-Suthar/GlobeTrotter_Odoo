export interface TripActivity {
  id: string;
  activity_id: string;
  custom_name: string;
  scheduled_time?: string; // HH:mm
  scheduled_date?: string; // YYYY-MM-DD (to allow Day grouping if needed)
  cost_estimate: number;
  image_url?: string;
  category?: string;
  duration?: string;
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

// Global mock memory
let mockItineraries: Record<string, Itinerary> = {
  "trip-1": {
    trip_id: "trip-1",
    name: "Japan in Autumn",
    start_date: "2026-10-10",
    end_date: "2026-10-18",
    duration_days: 9,
    cover_image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    stops: [
      {
        id: "stop-1",
        city_id: "city-1",
        city_name: "Tokyo",
        country: "Japan",
        start_date: "2026-10-10",
        end_date: "2026-10-14",
        image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80",
        order_index: 0,
        activities: [
          {
            id: "act-1",
            activity_id: "act-1",
            custom_name: "Senso-ji Temple",
            scheduled_time: "10:00",
            scheduled_date: "2026-10-11",
            cost_estimate: 500,
            image_url: "https://images.unsplash.com/photo-1542051812871-75750865a585?auto=format&fit=crop&w=400&q=80",
            category: "Sightseeing",
            duration: "2 hours"
          },
          {
            id: "act-2",
            activity_id: "act-2",
            custom_name: "Shibuya Crossing",
            scheduled_time: "14:00",
            scheduled_date: "2026-10-11",
            cost_estimate: 0,
            image_url: "https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=400&q=80",
            category: "Explore",
            duration: "1 hour"
          }
        ]
      }
    ]
  }
};

export const itineraryService = {
  async getItinerary(tripId: string): Promise<Itinerary> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mockItineraries[tripId]) {
          resolve(JSON.parse(JSON.stringify(mockItineraries[tripId]))); // Deep copy
        } else {
          // If we don't have it, create an empty one based on tripId
          const newItinerary: Itinerary = {
            trip_id: tripId,
            name: "Your Trip",
            start_date: "2026-11-01",
            end_date: "2026-11-10",
            duration_days: 10,
            stops: []
          };
          mockItineraries[tripId] = newItinerary;
          resolve(JSON.parse(JSON.stringify(newItinerary)));
        }
      }, 600);
    });
  },

  async saveItinerary(itinerary: Itinerary): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockItineraries[itinerary.trip_id] = JSON.parse(JSON.stringify(itinerary));
        resolve();
      }, 800);
    });
  }
};
