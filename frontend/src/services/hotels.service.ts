import { apiClient } from '../utils/api';

export interface Hotel {
  id: string;
  city_id: string;
  name: string;
  hotel_type?: string;
  price_per_night: number;
  rating?: number;
  budget_category?: string;
  nearby_area?: string;
  tags?: string;
  image_url?: string;
}

export const hotelsService = {
  getForCity: (cityId: string, budgetCategory?: string): Promise<Hotel[]> =>
    apiClient(`/cities/${cityId}/hotels${budgetCategory ? `?budget_category=${budgetCategory}` : ''}`),
};
