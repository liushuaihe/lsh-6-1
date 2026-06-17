import type { 
  User, 
  Achievement, 
  ReviewLog,
  LoginRequest, 
  LoginResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  AchievementQuery,
  PaginatedResponse,
  ReviewRequest,
  StatisticsQuery,
  YearlyStatistics,
  MemberStatistics,
  TypeStatistics
} from '../../shared/types.js';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function setToken(token: string): void {
  localStorage.setItem('token', token);
}

function removeToken(): void {
  localStorage.removeItem('token');
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('未授权，请重新登录');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `请求失败: ${response.status}`);
  }

  if (response.headers.get('Content-Type')?.includes('application/vnd.openxmlformats')) {
    return response.arrayBuffer() as unknown as T;
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: LoginRequest): Promise<LoginResponse> =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getCurrentUser: (): Promise<User> =>
      request('/auth/me', { method: 'GET' }),

    logout: (): Promise<{ message: string }> =>
      request('/auth/logout', { method: 'POST' }),

    changePassword: (oldPassword: string, newPassword: string): Promise<{ message: string }> =>
      request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      }),
  },

  users: {
    getAll: (): Promise<User[]> =>
      request('/users', { method: 'GET' }),

    getActive: (): Promise<User[]> =>
      request('/users/active', { method: 'GET' }),

    getById: (id: string): Promise<User> =>
      request(`/users/${id}`, { method: 'GET' }),

    create: (data: CreateUserRequest): Promise<User> =>
      request('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateUserRequest): Promise<User> =>
      request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<{ message: string }> =>
      request(`/users/${id}`, { method: 'DELETE' }),

    toggleActive: (id: string): Promise<User> =>
      request(`/users/${id}/toggle`, { method: 'PATCH' }),
  },

  achievements: {
    getAll: (query: AchievementQuery): Promise<PaginatedResponse<Achievement>> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      return request(`/achievements?${params.toString()}`, { method: 'GET' });
    },

    getById: (id: string): Promise<Achievement> =>
      request(`/achievements/${id}`, { method: 'GET' }),

    getStats: (): Promise<{ total: number; pending: number; approved: number; rejected: number; draft: number }> =>
      request('/achievements/stats', { method: 'GET' }),

    create: (data: CreateAchievementRequest): Promise<Achievement> =>
      request('/achievements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateAchievementRequest): Promise<Achievement> =>
      request(`/achievements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<{ message: string }> =>
      request(`/achievements/${id}`, { method: 'DELETE' }),

    submitForReview: (id: string): Promise<Achievement> =>
      request(`/achievements/${id}/submit`, { method: 'POST' }),
  },

  reviews: {
    getPending: (): Promise<Achievement[]> =>
      request('/reviews/pending', { method: 'GET' }),

    getHistory: (achievementId: string): Promise<ReviewLog[]> =>
      request(`/reviews/history/${achievementId}`, { method: 'GET' }),

    review: (id: string, data: ReviewRequest): Promise<Achievement> =>
      request(`/reviews/${id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  statistics: {
    getDashboard: (): Promise<{
      totalApproved: number;
      pendingReview: number;
      currentYearCount: number;
      growthRate: number;
      paperCount: number;
      patentCount: number;
      projectCount: number;
    }> => request('/statistics/dashboard', { method: 'GET' }),

    getYearly: (query: StatisticsQuery): Promise<YearlyStatistics[]> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      return request(`/statistics/yearly?${params.toString()}`, { method: 'GET' });
    },

    getMembers: (query: StatisticsQuery): Promise<MemberStatistics[]> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      return request(`/statistics/members?${params.toString()}`, { method: 'GET' });
    },

    getTypes: (query: StatisticsQuery): Promise<TypeStatistics[]> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      return request(`/statistics/types?${params.toString()}`, { method: 'GET' });
    },

    exportExcel: (query: AchievementQuery): Promise<ArrayBuffer> => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      return request(`/statistics/export/excel?${params.toString()}`, { 
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
    },
  },

  setToken,
  removeToken,
  getToken,
};
