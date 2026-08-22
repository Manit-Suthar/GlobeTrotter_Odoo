import { apiClient } from '../utils/api';

export interface City {
  id: string;
  name: string;
  country: string;
  popularity?: string;
  cost_index?: string;
  image_url?: string;
}

export const citiesService = {
  async getCities(): Promise<City[]> {
    return apiClient('/cities', { method: 'GET' });
  }
};
