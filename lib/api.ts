import axios, { AxiosError } from 'axios'
import config from './config'

// Create axios instance with default config
const api = axios.create({
  baseURL: `${config.api.baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const isLoginPage =
        typeof window !== 'undefined' && window.location.pathname === '/login'

      if (token && !isLoginPage) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    role: string
    shopName: string
    shopType: string
    address: string
    postcode: string
    city: string
    county?: string
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  registerWithPhoto: async (formData: FormData) => {
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  verify: async () => {
    const response = await api.get('/auth/verify')
    return response.data
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },
}

// Shops API
export const shopsAPI = {
  getAll: async () => {
    const response = await api.get('/shops')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/shops/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/shops', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/shops/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/shops/${id}`)
    return response.data
  },

  updateSubscription: async (id: string, status: string) => {
    const response = await api.patch(`/shops/${id}/subscription`, { status })
    return response.data
  },
}

// Screens API
export const screensAPI = {
  getTypes: async () => {
    const response = await api.get('/screens/types')
    return response.data
  },

  getByShop: async (shopId: string) => {
    const response = await api.get(`/screens/shop/${shopId}`)
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/screens/${id}`)
    return response.data
  },

  create: async (data: {
    shopId: number
    name: string
    location: string
    deviceId?: string
    screenTypeId?: number
  }) => {
    const response = await api.post('/screens', data)
    return response.data
  },

  update: async (id: string, data: { name: string; location: string }) => {
    const response = await api.put(`/screens/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/screens/${id}`)
    return response.data
  },

  heartbeat: async (deviceId: string, data: any) => {
    const response = await api.post(`/screens/${deviceId}/heartbeat`, data)
    return response.data
  },
}

export const contentAPI = {
  upload: async (
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ) => {
    const response = await api.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for large video files
      onUploadProgress: onUploadProgress,
    })
    return response.data
  },

  uploadByDesigner: async (
    designerId: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ) => {
    const response = await api.post(
      `/content/upload/designer/${designerId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for large video files
        onUploadProgress: onUploadProgress,
      }
    )
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/content')
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/content/stats')
    return response.data
  },

  review: async (
    id: number,
    data: { status: string; rejection_reason?: string }
  ) => {
    const response = await api.patch(`/content/${id}/review`, data)
    return response.data
  },

  delete: async (id: number | string) => {
    const response = await api.delete(`/content/${id}`)
    return response.data
  },

  // Designer-specific functions
  startDesign: async (contentId: number) => {
    const response = await api.patch(`/content/${contentId}/start-design`)
    return response.data
  },

  uploadDesign: async (
    contentId: number,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ) => {
    const response = await api.post(
      `/content/${contentId}/upload-design`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for large video files
        onUploadProgress: onUploadProgress,
      }
    )
    console.log('upload design response', response)
    return response.data
  },

  publish: async (contentId: number) => {
    const response = await api.patch(`/content/${contentId}/publish`)
    return response.data
  },
}

// Screen Requests API
export const screenRequestsAPI = {
  // Shop owner endpoints
  create: async (data: {
    screenName: string
    location: string
    screenTypeId: number
  }) => {
    const response = await api.post('/screen-requests', data)
    return response.data
  },
  getShopRequests: async () => {
    const response = await api.get('/screen-requests/shop')
    return response.data
  },
  cancel: async (requestId: number) => {
    const response = await api.post(`/screen-requests/${requestId}/cancel`)
    return response.data
  },

  // Admin endpoints
  getAll: async (status?: string) => {
    const params = status ? { params: { status } } : {}
    const response = await api.get('/screen-requests/admin', params)
    return response.data
  },
  approve: async (requestId: number, deviceId: string) => {
    const response = await api.post(`/screen-requests/${requestId}/approve`, {
      deviceId,
    })
    return response.data
  },
  reject: async (requestId: number, reason: string) => {
    const response = await api.post(`/screen-requests/${requestId}/reject`, {
      reason,
    })
    return response.data
  },
  processExpired: async () => {
    const response = await api.post('/screen-requests/process-expired')
    return response.data
  },
}

// Playlists API (for Milestone 2)
export const playlistsAPI = {
  getAll: async () => {
    const response = await api.get('/playlists')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/playlists/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/playlists', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/playlists/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/playlists/${id}`)
    return response.data
  },

  // Playlist items management
  addItem: async (
    playlistId: string,
    contentId: string,
    duration: number = 10
  ) => {
    const response = await api.post(`/playlists/${playlistId}/items`, {
      content_id: contentId,
      duration,
    })
    return response.data
  },

  removeItem: async (playlistId: string, itemId: string) => {
    const response = await api.delete(
      `/playlists/${playlistId}/items/${itemId}`
    )
    return response.data
  },

  reorderItems: async (
    playlistId: string,
    items: Array<{ id: string; position: number }>
  ) => {
    const response = await api.put(`/playlists/${playlistId}/items/reorder`, {
      items,
    })
    return response.data
  },

  // Screen assignment
  assignToScreen: async (playlistId: string, screenId: string) => {
    const response = await api.post('/playlists/assign', {
      playlist_id: playlistId,
      screen_id: screenId,
    })
    return response.data
  },
}

// Postcode API
export const postcodeAPI = {
  lookup: async (postcode: string) => {
    const response = await api.get(`/postcode/lookup/${postcode}`)
    return response.data
  },

  validate: async (postcode: string) => {
    const response = await api.post('/postcode/validate', { postcode })
    return response.data
  },

  getAddresses: async (postcode: string) => {
    const response = await api.get(`/postcode/addresses/${postcode}`)
    return response.data
  },

  autocomplete: async (partial: string, limit?: number) => {
    const response = await api.get(`/postcode/autocomplete/${partial}`, {
      params: { limit },
    })
    return response.data
  },
}

// Billing API
export const billingAPI = {
  getShopBilling: async (shopId: string) => {
    const response = await api.get(`/billing/shops/${shopId}`)
    return response.data
  },

  generateInvoice: async (shopId: string, month: number, year: number) => {
    const response = await api.post(
      `/billing/shops/${shopId}/generate-invoice`,
      {
        month,
        year,
      }
    )
    return response.data
  },

  downloadInvoicePDF: async (invoiceId: string) => {
    const response = await api.get(`/billing/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  updatePaymentStatus: async (
    billId: string,
    data: {
      status: string
      payment_method?: string
      payment_reference?: string
      payment_date?: string
    }
  ) => {
    const response = await api.patch(`/billing/bills/${billId}/payment`, data)
    return response.data
  },

  getUnpaidBills: async () => {
    const response = await api.get('/billing/unpaid')
    return response.data
  },

  getAllBills: async (params?: {
    status?: string
    shopId?: string
    month?: number
    year?: number
  }) => {
    const response = await api.get('/billing/all', { params })
    return response.data
  },

  getOverdueBills: async () => {
    const response = await api.get('/billing/overdue')
    return response.data
  },
}

// Admin API
export const adminAPI = {
  getPricingSettings: async () => {
    const response = await api.get('/admin/pricing-settings')
    return response.data
  },

  updatePricingSetting: async (key: string, value: string) => {
    const response = await api.put(`/admin/pricing-settings/${key}`, { value })
    return response.data
  },

  getScreenTypes: async () => {
    const response = await api.get('/admin/screen-types')
    return response.data
  },

  createScreenType: async (data: {
    name: string
    size_inches: number
    monthly_price: number
  }) => {
    const response = await api.post('/admin/screen-types', data)
    return response.data
  },

  updateScreenType: async (id: number, data: any) => {
    const response = await api.put(`/admin/screen-types/${id}`, data)
    return response.data
  },

  deleteScreenType: async (id: number) => {
    const response = await api.delete(`/admin/screen-types/${id}`)
    return response.data
  },
}

// Payment API
export const paymentAPI = {
  createPaymentIntent: async (billId: string) => {
    const response = await api.post('/payment/create-intent', { billId })
    return response.data
  },

  confirmPayment: async (
    billId: string,
    data: {
      payment_method: string
      payment_reference: string
    }
  ) => {
    const response = await api.post('/payment/manual', {
      billId,
      ...data,
      amount: 0, // Will be fetched from bill
      payment_date: new Date().toISOString(),
    })
    return response.data
  },

  getPaymentMethods: async () => {
    const response = await api.get('/payment/methods')
    return response.data
  },
}

// Design API
export const designAPI = {
  getPendingContent: async () => {
    const response = await api.get('/design/pending-content')
    return response.data
  },
}

// Ad Preferences API
export const adPreferencesAPI = {
  getCategories: async () => {
    const response = await api.get('/ad-preferences/categories')
    return response.data
  },

  getPreferences: async (shopId: string) => {
    const response = await api.get(`/ad-preferences/${shopId}`)
    return response.data
  },

  updatePreferences: async (
    shopId: string,
    data: {
      allowOutsideAds: boolean
      blockedAdCategories: string[]
    }
  ) => {
    const response = await api.put(`/ad-preferences/${shopId}`, data)
    return response.data
  },
}

// Promotion Types
export const promotionTypesAPI = {
  getAll: async () => {
    const response = await api.get('/promotion-types')
    return response.data
  },
}

export default api
