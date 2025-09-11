import axios, { AxiosError } from 'axios';
import config from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
      
      if (token && !isLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    shopName: string;
    address: string;
    city: string;
    country: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Shops API
export const shopsAPI = {
  getAll: async () => {
    const response = await api.get('/shops');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/shops/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/shops', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/shops/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/shops/${id}`);
    return response.data;
  },

  updateSubscription: async (id: string, status: string) => {
    const response = await api.patch(`/shops/${id}/subscription`, { status });
    return response.data;
  },
};

// Screens API
export const screensAPI = {
  getByShop: async (shopId: string) => {
    const response = await api.get(`/screens/shop/${shopId}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/screens/${id}`);
    return response.data;
  },

  create: async (data: {
    shopId: number;
    name: string;
    location: string;
    deviceId?: string;
  }) => {
    const response = await api.post('/screens', data);
    return response.data;
  },

  update: async (id: string, data: { name: string; location: string }) => {
    const response = await api.put(`/screens/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/screens/${id}`);
    return response.data;
  },

  heartbeat: async (deviceId: string, data: any) => {
    const response = await api.post(`/screens/${deviceId}/heartbeat`, data);
    return response.data;
  },
};

export const contentAPI = {
  upload: async (formData: FormData) => {
    const response = await api.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/content');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/content/stats');
    return response.data;
  },

  review: async (id: number, data: { status: string; rejection_reason?: string }) => {
    const response = await api.patch(`/content/${id}/review`, data);
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  },
};

// Playlists API (for Milestone 2)
export const playlistsAPI = {
  getAll: async () => {
    const response = await api.get('/playlists');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/playlists', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  // Playlist items management
  addItem: async (playlistId: string, contentId: string, duration: number = 10) => {
    const response = await api.post(`/playlists/${playlistId}/items`, {
      content_id: contentId,
      duration
    });
    return response.data;
  },

  removeItem: async (playlistId: string, itemId: string) => {
    const response = await api.delete(`/playlists/${playlistId}/items/${itemId}`);
    return response.data;
  },

  reorderItems: async (playlistId: string, items: Array<{ id: string; position: number }>) => {
    const response = await api.put(`/playlists/${playlistId}/items/reorder`, { items });
    return response.data;
  },

  // Screen assignment
  assignToScreen: async (playlistId: string, screenId: string) => {
    const response = await api.post('/playlists/assign', {
      playlist_id: playlistId,
      screen_id: screenId
    });
    return response.data;
  },
};

// Postcode API
export const postcodeAPI = {
  lookup: async (postcode: string) => {
    const response = await api.get(`/postcode/lookup/${postcode}`);
    return response.data;
  },

  validate: async (postcode: string) => {
    const response = await api.post('/postcode/validate', { postcode });
    return response.data;
  },

  autocomplete: async (partial: string, limit?: number) => {
    const response = await api.get(`/postcode/autocomplete/${partial}`, {
      params: { limit }
    });
    return response.data;
  },
};

export default api;