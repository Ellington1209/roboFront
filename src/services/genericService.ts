import api from './api';

// Service genérico para operações CRUD
export const genericService = {
  // GET - Buscar todos
  getAll: async <T>(endpoint: string): Promise<T[]> => {
    const response = await api.get<T[]>(endpoint);
    return response.data;
  },

  // GET - Buscar por ID
  getById: async <T>(endpoint: string, id: string): Promise<T> => {
    const response = await api.get<T>(`${endpoint}/${id}`);
    return response.data;
  },

  // POST - Criar
  create: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  },

  // PUT - Atualizar
  update: async <T>(endpoint: string, id: string, data: unknown): Promise<T> => {
    const response = await api.put<T>(`${endpoint}/${id}`, data);
    return response.data;
  },

  // DELETE - Deletar
  delete: async (endpoint: string, id: string): Promise<void> => {
    await api.delete(`${endpoint}/${id}`);
  },
};


