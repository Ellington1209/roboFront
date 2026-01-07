import { useState, useEffect } from 'react';
import type { CreateRobotData } from '../../services/robotService';

interface CreateRobotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRobotData) => Promise<void>;
}

const CreateRobotModal = ({ isOpen, onClose, onSubmit }: CreateRobotModalProps) => {
  const [formData, setFormData] = useState<CreateRobotData>({
    name: '',
    description: '',
    language: 'nelogica',
    tags: [],
    code: '',
    is_active: true,
    parameters: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageTitles, setImageTitles] = useState<string[]>([]);
  const [imageCaptions, setImageCaptions] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Preparar dados com imagens e arquivos
      const submitData: CreateRobotData = {
        ...formData,
        images: selectedImages.length > 0 ? selectedImages : undefined,
        image_titles: imageTitles.some((t) => t.trim()) ? imageTitles : undefined,
        image_captions: imageCaptions.some((c) => c.trim()) ? imageCaptions : undefined,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
        file_names: fileNames.some((n) => n.trim()) ? fileNames : undefined,
      };

      await onSubmit(submitData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        language: 'nelogica',
        tags: [],
        code: '',
        is_active: true,
        parameters: [],
      });
      setTagInput('');
      setSelectedImages([]);
      setImagePreviews([]);
      setImageTitles([]);
      setImageCaptions([]);
      setSelectedFiles([]);
      setFileNames([]);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao criar robô');
      } else {
        setError('Erro ao criar robô. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Upload de imagens
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Criar previews
    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Inicializar títulos e legendas
    setImageTitles([...imageTitles, ...new Array(files.length).fill('')]);
    setImageCaptions([...imageCaptions, ...new Array(files.length).fill('')]);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newTitles = imageTitles.filter((_, i) => i !== index);
    const newCaptions = imageCaptions.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    setImageTitles(newTitles);
    setImageCaptions(newCaptions);
  };

  // Upload de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validar tipos de arquivo (.psf e .mq5)
    const validFiles = files.filter((file) => {
      const extension = file.name.toLowerCase().split('.').pop();
      return extension === 'psf' || extension === 'mq5';
    });

    if (validFiles.length !== files.length) {
      setError('Apenas arquivos .psf e .mq5 são permitidos');
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);

    // Inicializar nomes personalizados (usar nome original se não especificado)
    const newFileNames = [...fileNames, ...validFiles.map((f) => f.name)];
    setFileNames(newFileNames);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newFileNames = fileNames.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setFileNames(newFileNames);
  };

  // Gerenciar parâmetros
  const addParameter = () => {
    setFormData({
      ...formData,
      parameters: [
        ...formData.parameters,
        {
          key: '',
          label: '',
          type: 'number',
          value: '',
          default_value: '',
          required: false,
          options: null,
          validation_rules: null,
          group: null,
          sort_order: formData.parameters.length,
        },
      ],
    });
  };

  const removeParameter = (index: number) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.filter((_, i) => i !== index),
    });
  };

  // Função para gerar key a partir do label (lowercase, espaços viram hífens)
  const generateKeyFromLabel = (label: string): string => {
    return label
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/[^a-z0-9-]/g, ''); // Remove caracteres especiais, mantém apenas letras, números e hífens
  };

  const updateParameter = (index: number, field: string, value: unknown) => {
    const newParameters = [...formData.parameters];
    newParameters[index] = {
      ...newParameters[index],
      [field]: value,
    };
    
    // Se o campo alterado for 'label', atualiza automaticamente a 'key'
    if (field === 'label' && typeof value === 'string') {
      newParameters[index].key = generateKeyFromLabel(value);
    }
    
    setFormData({
      ...formData,
      parameters: newParameters,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-opacity-90 z-[9998]"
          onClick={onClose}
        ></div>

        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-3xl sm:my-8 sm:align-middle z-[9999]">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Criar Novo Robô</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Linguagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Linguagem *
                  </label>
                  <select
                    required
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        language: e.target.value as 'nelogica' | 'meta traider',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="nelogica">Nelogica</option>
                    <option value="meta traider">Meta Trader</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      (tempo que roda o robô, palavras-chave para categorizar e buscar robôs, ex: trading, forex, scalping)
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Digite uma tag e pressione Enter"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Adicionar
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-indigo-600 dark:hover:text-indigo-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Parâmetros */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Parâmetros
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (configurações do robô, ex: stop loss, take profit, etc.)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={addParameter}
                      className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      + Adicionar Parâmetro
                    </button>
                  </div>

                  {formData.parameters.length > 0 && (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      {formData.parameters.map((param, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Parâmetro {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeParameter(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remover
                            </button>
                          </div>

                          {/* Campo key escondido - será gerado automaticamente a partir do label */}
                          <input type="hidden" value={param.key} />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Label (nome exibido) *
                              </label>
                              <input
                                type="text"
                                required
                                value={param.label}
                                onChange={(e) => updateParameter(index, 'label', e.target.value)}
                                placeholder="ex: Stop Loss"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                              />
                              {param.key && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  Key gerada: <span className="font-mono">{param.key}</span>
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo *
                              </label>
                              <select
                                required
                                value={param.type}
                                onChange={(e) => updateParameter(index, 'type', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="number">Número</option>
                                <option value="string">Texto</option>
                                <option value="boolean">Sim/Não</option>
                                <option value="select">Seleção</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Valor Padrão *
                              </label>
                              {param.type === 'boolean' ? (
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(param.value)}
                                    onChange={(e) => updateParameter(index, 'value', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                                    {Boolean(param.value) ? 'Sim' : 'Não'}
                                  </span>
                                </div>
                              ) : (
                                <input
                                  type={param.type === 'number' ? 'number' : 'text'}
                                  required
                                  value={String(param.value)}
                                  onChange={(e) => {
                                    let value: string | number | boolean = e.target.value;
                                    if (param.type === 'number') {
                                      value = parseFloat(e.target.value) || 0;
                                    }
                                    updateParameter(index, 'value', value);
                                  }}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                              )}
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={param.required || false}
                                onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                                Obrigatório
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload de Imagens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Imagens
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      (você pode enviar múltiplas imagens)
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-24 h-24 object-cover rounded"
                            />
                            <div className="flex-1 space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Título (opcional)
                                </label>
                                <input
                                  type="text"
                                  value={imageTitles[index] || ''}
                                  onChange={(e) => {
                                    const newTitles = [...imageTitles];
                                    newTitles[index] = e.target.value;
                                    setImageTitles(newTitles);
                                  }}
                                  placeholder="Título da imagem"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Legenda (opcional)
                                </label>
                                <input
                                  type="text"
                                  value={imageCaptions[index] || ''}
                                  onChange={(e) => {
                                    const newCaptions = [...imageCaptions];
                                    newCaptions[index] = e.target.value;
                                    setImageCaptions(newCaptions);
                                  }}
                                  placeholder="Legenda da imagem"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload de Arquivos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Arquivos
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      (arquivos .psf e .mq5, você pode enviar múltiplos arquivos)
                    </span>
                  </label>
                  <input
                    type="file"
                    accept=".psf,.mq5"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Nome do arquivo (opcional)
                                </label>
                                <input
                                  type="text"
                                  value={fileNames[index] || ''}
                                  onChange={(e) => {
                                    const newFileNames = [...fileNames];
                                    newFileNames[index] = e.target.value;
                                    setFileNames(newFileNames);
                                  }}
                                  placeholder={file.name}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código *
                  </label>
                  <textarea
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Digite o código do robô..."
                  />
                </div>

                {/* Status Ativo */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Robô ativo
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? 'Criando...' : 'Criar Robô'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRobotModal;

