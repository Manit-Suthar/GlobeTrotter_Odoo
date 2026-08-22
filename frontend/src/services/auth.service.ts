import { apiClient } from '../utils/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: any): Promise<User> {
    // Frontend signup sends firstName and lastName, but backend expects name.
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    return apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: fullName || 'New User',
      }),
    });
  },

  async logout(): Promise<void> {
    return apiClient('/auth/logout', { method: 'POST' });
  },

  async getCurrentUser(): Promise<User> {
    return apiClient('/auth/me');
  }
};
