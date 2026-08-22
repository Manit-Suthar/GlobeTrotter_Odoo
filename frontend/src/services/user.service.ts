import { apiClient } from '../utils/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  language?: string;
  saved_destinations?: string[];
}

export const userService = {
  async getMe(): Promise<UserProfile> {
    return apiClient('/auth/me', { method: 'GET' });
  },
  
  async updateMe(data: Partial<UserProfile>): Promise<UserProfile> {
    // Currently, backend does not have an update profile endpoint.
    // Returning dummy merged object based on getMe result.
    const current = await this.getMe();
    return { ...current, ...data };
  },

  async deleteAccount(): Promise<void> {
    // Mocked as backend doesn't have delete user endpoint yet.
    return new Promise(resolve => setTimeout(resolve, 500));
  }
};
