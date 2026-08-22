import { apiClient } from '../utils/api';

export interface CatalogActivity {
  id: string;
  city_id: string;
  city: string;
  name: string;
  description?: string;
  category?: string;
  default_cost: number;
  default_duration_minutes: number;
  rating?: number;
  image_url?: string;
  tags?: string;
}

export const activitiesService = {
  getActivities: (): Promise<CatalogActivity[]> => apiClient('/activities'),
  getForCity: (cityId: string): Promise<CatalogActivity[]> => apiClient(`/cities/${cityId}/activities`),
};
