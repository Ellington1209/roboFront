import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

export const authService = {
  // POST - Login
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // POST - Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignora erros no logout
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // GET - Verificar autenticação
  checkAuth: async (): Promise<boolean> => {
    try {
      await api.get('/auth/me');
      return true;
    } catch {
      return false;
    }
  },

  // Obter token do localStorage
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Obter usuário do localStorage
  getUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Verificar se está autenticado
  isAuthenticated: (): boolean => {
    return !!authService.getToken() && !!authService.getUser();
  },
};

