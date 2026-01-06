import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';
import type { Robot } from '../../services/robotService';

interface RobotDetailsModalProps {
  robot: Robot | null;
  isOpen: boolean;
  onClose: () => void;
}

const RobotDetailsModal = ({ robot, isOpen, onClose }: RobotDetailsModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  if (!isOpen || !robot) return null;

  const images = robot.images || [];
  const currentImage = images[currentImageIndex];

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
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Error';
                      }}
                    />

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
    </div>
  );
};

export default RobotDetailsModal;

