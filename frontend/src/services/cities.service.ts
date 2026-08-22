export interface City {
  id: string;
  name: string;
  country: string;
  popularity?: string;
  cost_index?: string;
  image_url?: string;
}

const mockCities: City[] = [
  {
    id: 'city-1',
    name: 'Tokyo',
    country: 'Japan',
    popularity: 'Very Popular',
    cost_index: 'Medium Cost',
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'city-2',
    name: 'Bali',
    country: 'Indonesia',
    popularity: 'Trending',
    cost_index: 'Low Cost',
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'city-3',
    name: 'Dubai',
    country: 'UAE',
    popularity: 'Popular',
    cost_index: 'High Cost',
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'city-4',
    name: 'Paris',
    country: 'France',
    popularity: 'Classic',
    cost_index: 'High Cost',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
  }
];

export const citiesService = {
  async getCities(): Promise<City[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCities), 800);
    });
  }
};
