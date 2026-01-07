import api from './api';

export interface RobotParameter {
  id?: number;
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  value: string | number | boolean;
  default_value?: string | number | boolean;
  required?: boolean;
  options?: string[] | null;
  validation_rules?: {
    min?: number;
    max?: number;
    regex?: string;
  } | null;
  group?: string | null;
  sort_order?: number;
}

export interface RobotImage {
  id: number;
  robot_id: number;
  title: string | null;
  caption: string | null;
  disk: string;
  path: string;
  url: string;
  thumbnail_path: string | null;
  mime_type: string;
  size_bytes: number;
  width: number;
  height: number;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RobotFile {
  id: number;
  robot_id: number;
  name: string;
  original_name: string;
  disk: string;
  path: string;
  url: string;
  file_type: 'psf' | 'mq5';
  mime_type: string;
  size_bytes: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Robot {
  id: number;
  user_id: number;
  name: string;
  description: string;
  language: 'nelogica' | 'meta traider';
  tags: string[];
  code: string;
  is_active: boolean;
  version: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
  parameters: RobotParameter[];
  images: RobotImage[];
  files: RobotFile[];
}

export interface RobotsResponse {
  data: Robot[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface RobotResponse {
  data: Robot;
}

export interface CreateRobotData {
  name: string;
  description: string;
  language: 'nelogica' | 'meta traider';
  tags: string[];
  code: string;
  is_active: boolean;
  parameters: Omit<RobotParameter, 'id'>[];
  images?: File[];
  image_titles?: string[];
  image_captions?: string[];
  files?: File[];
  file_names?: string[];
}

export interface UpdateRobotData extends Partial<CreateRobotData> {
  parameters?: RobotParameter[];
  delete_image_ids?: number[];
  delete_file_ids?: number[];
  create_version?: boolean;
  changelog?: string;
}

export const robotService = {
  // GET - Listar robôs
  getAll: async (params?: {
    language?: string;
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<RobotsResponse> => {
    const response = await api.get<RobotsResponse>('/robots', { params });
    return response.data;
  },

  // GET - Buscar robô por ID
  getById: async (id: number): Promise<Robot> => {
    const response = await api.get<RobotResponse>(`/robots/${id}`);
    return response.data.data;
  },

  // POST - Criar robô
  create: async (data: CreateRobotData): Promise<Robot> => {
    const formData = new FormData();

    // Campos básicos
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('language', data.language);
    formData.append('code', data.code);
    formData.append('is_active', data.is_active ? '1' : '0');

    // Tags
    data.tags.forEach((tag) => {
      formData.append('tags[]', tag);
    });

    // Parâmetros
    data.parameters.forEach((param, index) => {
      formData.append(`parameters[${index}][key]`, param.key);
      formData.append(`parameters[${index}][label]`, param.label);
      formData.append(`parameters[${index}][type]`, param.type);
      formData.append(`parameters[${index}][value]`, String(param.value));
      if (param.default_value !== undefined) {
        formData.append(`parameters[${index}][default_value]`, String(param.default_value));
      }
      if (param.required !== undefined) {
        formData.append(`parameters[${index}][required]`, param.required ? '1' : '0');
      }
      if (param.options) {
        param.options.forEach((option) => {
          formData.append(`parameters[${index}][options][]`, option);
        });
      }
      if (param.validation_rules) {
        if (param.validation_rules.min !== undefined) {
          formData.append(`parameters[${index}][validation_rules][min]`, String(param.validation_rules.min));
        }
        if (param.validation_rules.max !== undefined) {
          formData.append(`parameters[${index}][validation_rules][max]`, String(param.validation_rules.max));
        }
        if (param.validation_rules.regex) {
          formData.append(`parameters[${index}][validation_rules][regex]`, param.validation_rules.regex);
        }
      }
      if (param.group) {
        formData.append(`parameters[${index}][group]`, param.group);
      }
      if (param.sort_order !== undefined) {
        formData.append(`parameters[${index}][sort_order]`, String(param.sort_order));
      }
    });

    // Imagens
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images[]', image);
      });

      // Títulos e legendas
      if (data.image_titles) {
        data.image_titles.forEach((title, index) => {
          formData.append(`image_titles[${index}]`, title);
        });
      }
      if (data.image_captions) {
        data.image_captions.forEach((caption, index) => {
          formData.append(`image_captions[${index}]`, caption);
        });
      }
    }

    // Arquivos
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files[]', file);
      });

      // Nomes personalizados
      if (data.file_names) {
        data.file_names.forEach((name, index) => {
          formData.append(`file_names[${index}]`, name);
        });
      }
    }

    const response = await api.post<{ data: Robot }>('/robots', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // PUT - Atualizar robô
  update: async (id: number, data: UpdateRobotData): Promise<Robot> => {
    const formData = new FormData();

    // Campos básicos (apenas os que foram enviados)
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.language) formData.append('language', data.language);
    if (data.code) formData.append('code', data.code);
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');

    // Tags
    if (data.tags) {
      data.tags.forEach((tag) => {
        formData.append('tags[]', tag);
      });
    }

    // Parâmetros
    if (data.parameters) {
      data.parameters.forEach((param, index) => {
        if (param.id) {
          formData.append(`parameters[${index}][id]`, String(param.id));
        }
        formData.append(`parameters[${index}][key]`, param.key);
        formData.append(`parameters[${index}][label]`, param.label);
        formData.append(`parameters[${index}][type]`, param.type);
        formData.append(`parameters[${index}][value]`, String(param.value));
        if (param.default_value !== undefined) {
          formData.append(`parameters[${index}][default_value]`, String(param.default_value));
        }
        if (param.required !== undefined) {
          formData.append(`parameters[${index}][required]`, param.required ? '1' : '0');
        }
        if (param.options) {
          param.options.forEach((option) => {
            formData.append(`parameters[${index}][options][]`, option);
          });
        }
        if (param.validation_rules) {
          if (param.validation_rules.min !== undefined) {
            formData.append(`parameters[${index}][validation_rules][min]`, String(param.validation_rules.min));
          }
          if (param.validation_rules.max !== undefined) {
            formData.append(`parameters[${index}][validation_rules][max]`, String(param.validation_rules.max));
          }
        }
        if (param.group) {
          formData.append(`parameters[${index}][group]`, param.group);
        }
        if (param.sort_order !== undefined) {
          formData.append(`parameters[${index}][sort_order]`, String(param.sort_order));
        }
      });
    }

    // Novas imagens
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    // Deletar imagens
    if (data.delete_image_ids) {
      data.delete_image_ids.forEach((imageId) => {
        formData.append('delete_image_ids[]', String(imageId));
      });
    }

    // Novos arquivos
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files[]', file);
      });

      // Nomes personalizados
      if (data.file_names) {
        data.file_names.forEach((name, index) => {
          formData.append(`file_names[${index}]`, name);
        });
      }
    }

    // Deletar arquivos
    if (data.delete_file_ids) {
      data.delete_file_ids.forEach((fileId) => {
        formData.append('delete_file_ids[]', String(fileId));
      });
    }

    // Versionamento
    if (data.create_version) {
      formData.append('create_version', '1');
      if (data.changelog) {
        formData.append('changelog', data.changelog);
      }
    }

    const response = await api.post<{ data: Robot }>(`/robots/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // DELETE - Deletar robô
  delete: async (id: number): Promise<void> => {
    await api.delete(`/robots/${id}`);
  },

  // GET - Download de arquivo
  downloadFile: async (robotId: number, fileId: number): Promise<Blob> => {
    const response = await api.get(`/robots/${robotId}/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

