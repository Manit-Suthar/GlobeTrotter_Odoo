export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  language?: string;
  saved_destinations?: string[];
}

const MOCK_USER: UserProfile = {
  id: 'usr-1',
  name: 'Alex Traveler',
  email: 'alex@example.com',
  language: 'English',
  profile_image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  saved_destinations: ['city-1', 'city-2', 'city-4']
};

export const userService = {
  async getMe(): Promise<UserProfile> {
    return new Promise(resolve => setTimeout(() => resolve({ ...MOCK_USER }), 600));
  },
  
  async updateMe(data: Partial<UserProfile>): Promise<UserProfile> {
    return new Promise(resolve => {
       setTimeout(() => {
          Object.assign(MOCK_USER, data);
          resolve({ ...MOCK_USER });
       }, 600);
    });
  },

  async deleteAccount(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
};
