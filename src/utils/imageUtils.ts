/**
 * Constrói a URL completa da imagem
 * @param imageUrl URL da imagem retornada pela API (pode ser relativa ou completa)
 * @returns URL completa da imagem
 */
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  // Se a URL está vazia, nula ou indefinida, retorna string vazia
  if (!imageUrl || imageUrl.trim() === '') {
    return '';
  }

  // Remove caracteres escapados que podem vir do JSON (ex: \/ vira /)
  let cleanUrl = imageUrl.replace(/\\\//g, '/');

  // Se a URL já começa com http:// ou https://, retorna como está
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // Se começa com //, adiciona o protocolo
  if (cleanUrl.startsWith('//')) {
    return `http:${cleanUrl}`;
  }

  // Garante que a URL comece com /
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = `/${cleanUrl}`;
  }

  // Obtém a base URL da API e remove /api/ do final
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/';
  
  // Remove /api/ do final se existir, e também remove a barra final
  let baseUrl = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  
  // Se não tiver protocolo, adiciona http://
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `http://${baseUrl}`;
  }

  // Constrói a URL completa
  return `${baseUrl}${cleanUrl}`;
};

