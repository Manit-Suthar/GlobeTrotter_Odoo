import { apiClient } from '../utils/api';

export const aiService = {
  async getTripSuggestions(prompt: string): Promise<string> {
    const data = await apiClient('/ai/trip-suggestions', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    return data.suggestions;
  }
};
