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
  async login(email: string, password: string):Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          resolve({ access_token: "mock-jwt-token-123", token_type: "bearer" });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  },

  async register(data: any): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.email && data.password && data.firstName) {
          resolve({
            id: "user-456",
            email: data.email,
            name: `${data.firstName} ${data.lastName}`.trim(),
          });
        } else {
          reject(new Error("Missing required fields"));
        }
      }, 1000);
    });
  }
};
