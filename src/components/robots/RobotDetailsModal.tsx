import { useState, useEffect, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../contexts/ThemeContext';
import { getImageUrl } from '../../utils/imageUtils';
import { robotService } from '../../services/robotService';
import type { Robot } from '../../services/robotService';

interface RobotDetailsModalProps {
  robot: Robot | null;
  isOpen: boolean;
  onClose: () => void;
}

const RobotDetailsModal = ({ robot, isOpen, onClose }: RobotDetailsModalProps) => {
  const { theme } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

  const imagesLength = robot?.images?.length || 0;

  const openFullscreenImage = useCallback((index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenImageOpen(true);
  }, []);

  const closeFullscreenImage = useCallback(() => {
    setIsFullscreenImageOpen(false);
  }, []);

  const nextFullscreenImage = useCallback(() => {
    if (imagesLength > 0) {
      setFullscreenImageIndex((prev) => (prev + 1) % imagesLength);
    }
  }, [imagesLength]);

  const prevFullscreenImage = useCallback(() => {
    if (imagesLength > 0) {
      setFullscreenImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
    }
  }, [imagesLength]);

  useEffect(() => {
    if (robot && robot.images && robot.images.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [robot]);

  // Bloquear scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Detectar tecla ESC para fechar imagem em tela cheia
  useEffect(() => {
    if (!isFullscreenImageOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreenImage();
      } else if (e.key === 'ArrowLeft') {
        prevFullscreenImage();
      } else if (e.key === 'ArrowRight') {
        nextFullscreenImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenImageOpen, closeFullscreenImage, prevFullscreenImage, nextFullscreenImage]);

  if (!isOpen || !robot) return null;

  const images = robot.images || [];
  const currentImage = images[currentImageIndex];

  const handleDownloadFile = async (fileId: number, fileName: string) => {
    try {
      const blob = await robotService.downloadFile(robot.id, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      // Fallback: tentar abrir URL direta
      const file = robot.files?.find((f) => f.id === fileId);
      if (file) {
        window.open(getImageUrl(file.url), '_blank');
      }
    }
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      nelogica: 'bg-blue-500',
      'meta traider': 'bg-green-500',
    };
    return colors[language] || 'bg-gray-500';
  };

  const getLanguageLabel = (language: string) => {
    const labels: Record<string, string> = {
      nelogica: 'Nelogica',
      'meta traider': 'Meta Trader',
    };
    return labels[language] || language;
  };

  const getSyntaxLanguage = (language: string) => {
    const langMap: Record<string, string> = {
      nelogica: 'pascal',
      'meta traider': 'mql',
    };
    return langMap[language.toLowerCase()] || 'text';
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-opacity-90 z-[9998]"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-4xl sm:my-8 sm:align-middle z-[9999]">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{robot.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getLanguageColor(
                      robot.language
                    )}`}
                  >
                    {getLanguageLabel(robot.language)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      robot.is_active
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {robot.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Carrossel de Imagens */}
            {images.length > 0 ? (
              <div className="mb-6">
                <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                  {/* Imagem principal */}
                  <div className="relative h-48 sm:h-64 md:h-96 flex items-center justify-center">
                    <img
                      src={getImageUrl(currentImage.url)}
                      alt={currentImage.title || robot.name}
                      className="max-w-full max-h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openFullscreenImage(currentImageIndex)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Error';
                      }}
                    />
                    {/* Ícone de expandir */}
                    <button
                      onClick={() => openFullscreenImage(currentImageIndex)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                      aria-label="Expandir imagem"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>

                    {/* Navegação anterior/próxima */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-1.5 sm:p-2 rounded-full transition-all touch-manipulation"
                          aria-label="Imagem anterior"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-1.5 sm:p-2 rounded-full transition-all touch-manipulation"
                          aria-label="Próxima imagem"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Indicador de imagem atual */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>

                  {/* Miniaturas */}
                  {images.length > 1 && (
                    <div className="p-2 sm:p-4 bg-gray-50 dark:bg-gray-900">
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => goToImage(index)}
                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                              index === currentImageIndex
                                ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          >
                            <img
                              src={getImageUrl(image.url)}
                              alt={image.title || `Imagem ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Título e legenda da imagem */}
                  {(currentImage.title || currentImage.caption) && (
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      {currentImage.title && (
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{currentImage.title}</h4>
                      )}
                      {currentImage.caption && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{currentImage.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 h-64 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Nenhuma imagem disponível</p>
                </div>
              </div>
            )}

            {/* Descrição */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descrição</h4>
              <p className="text-gray-600 dark:text-gray-400">{robot.description || 'Sem descrição'}</p>
            </div>

            {/* Tags */}
            {robot.tags && robot.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {robot.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Parâmetros */}
            {robot.parameters && robot.parameters.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Parâmetros ({robot.parameters.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {robot.parameters.map((param) => (
                    <div
                      key={param.id || param.key}
                      className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{param.label}</span>
                        {param.required && (
                          <span className="text-xs text-red-500">Obrigatório</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Tipo:</span> {param.type}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Valor:</span> {String(param.value)}
                      </div>
                      {param.group && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Grupo: {param.group}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Código */}
            {robot.code && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Código</h4>
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getLanguageLabel(robot.language)}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(robot.code);
                      }}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
                      title="Copiar código"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <SyntaxHighlighter
                      language={getSyntaxLanguage(robot.language)}
                      style={theme === 'dark' ? vscDarkPlus : vs}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                      }}
                      showLineNumbers
                      wrapLines
                    >
                      {robot.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            )}

            {/* Arquivos */}
            {robot.files && robot.files.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Arquivos ({robot.files.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {robot.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name || file.original_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {file.file_type.toUpperCase()} • {(file.size_bytes / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file.id, file.name || file.original_name)}
                        className="flex-shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                        title="Baixar arquivo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Baixar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Versão</span>
                <p className="font-semibold text-gray-900 dark:text-white">{robot.version}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Criado em</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(robot.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Última execução</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {robot.last_executed_at
                    ? new Date(robot.last_executed_at).toLocaleDateString('pt-BR')
                    : 'Nunca'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Criado por</span>
                <p className="font-semibold text-gray-900 dark:text-white">{robot.user.name}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Imagem em Tela Cheia */}
      {isFullscreenImageOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[10000] bg-black bg-opacity-95 flex items-center justify-center">
          {/* Botão fechar */}
          <button
            onClick={closeFullscreenImage}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[10001] p-2"
            aria-label="Fechar"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navegação anterior */}
          {images.length > 1 && (
            <button
              onClick={prevFullscreenImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all z-[10001]"
              aria-label="Imagem anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Imagem */}
          <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <img
              src={getImageUrl(images[fullscreenImageIndex].url)}
              alt={images[fullscreenImageIndex].title || robot.name}
              className="max-w-full max-h-[95vh] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Error';
              }}
            />
          </div>

          {/* Navegação próxima */}
          {images.length > 1 && (
            <button
              onClick={nextFullscreenImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all z-[10001]"
              aria-label="Próxima imagem"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Indicador de imagem */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
              {fullscreenImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Miniaturas na parte inferior */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setFullscreenImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === fullscreenImageIndex
                      ? 'border-white ring-2 ring-white'
                      : 'border-gray-600 hover:border-gray-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImageUrl(image.url)}
                    alt={image.title || `Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RobotDetailsModal;

