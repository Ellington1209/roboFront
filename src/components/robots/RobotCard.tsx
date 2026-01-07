import { useAuth } from '../../contexts/AuthContext';
import type { Robot } from '../../services/robotService';
import { getImageUrl } from '../../utils/imageUtils';

interface RobotCardProps {
  robot: Robot;
  onClick: () => void;
  onDelete?: (robotId: number) => void;
}

const RobotCard = ({ robot, onClick, onDelete }: RobotCardProps) => {
  const { user } = useAuth();
  const canDelete = user?.email === 'tom@example.com';

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

  const primaryImage = robot.images?.find((img) => img.is_primary) || robot.images?.[0];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o onClick do card seja chamado
    if (onDelete) {
      onDelete(robot.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-[rgb(var(--color-card))] rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-[rgb(var(--color-card-border))]"
    >
      {/* Imagem do robô */}
      <div className="relative h-48 bg-[rgb(var(--color-bg-secondary))] overflow-hidden">
        {primaryImage ? (
          <img
            src={getImageUrl(primaryImage.url)}
            alt={primaryImage.title || robot.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[rgb(var(--color-text-muted))]">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Badge de status */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {/* Botão de delete (apenas para tom@example.com) */}
          {canDelete && onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg z-10"
              title="Deletar robô"
              aria-label="Deletar robô"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              robot.is_active
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white'
            }`}
          >
            {robot.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        {/* Badge de linguagem */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getLanguageColor(
              robot.language
            )}`}
          >
            {getLanguageLabel(robot.language)}
          </span>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-[rgb(var(--color-text))] mb-2 line-clamp-1">
          {robot.name}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3 line-clamp-2">
          {robot.description || 'Sem descrição'}
        </p>

        {/* Tags */}
        {robot.tags && robot.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {robot.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {robot.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                +{robot.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Informações adicionais */}
        <div className="flex items-center justify-between text-xs text-[rgb(var(--color-text-muted))]">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>{robot.parameters?.length || 0} parâmetros</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{robot.images?.length || 0} imagens</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotCard;

