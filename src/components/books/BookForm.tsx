import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, categoryService } from '../../services/api';

interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface BookFormData {
  id?: number;
  titulo: string;
  autor: string;
  fechaPublicacion: string;
  copiasDisponibles: number;
  categoria: {
    id: number;
    nombre?: string;
    descripcion?: string;
  };
}

interface ApiResponse {
  creado: boolean;
  libro: BookFormData;
  advertencia?: boolean;
  mensaje?: string;
  duplicadosPotenciales?: BookFormData[];
}

const ExclamationIcon = () => (
  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<BookFormData>({
    titulo: '',
    autor: '',
    fechaPublicacion: new Date().toISOString().split('T')[0],
    copiasDisponibles: 1,
    categoria: { id: 0 }
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDuplicatesWarning, setShowDuplicatesWarning] = useState<boolean>(false);
  const [duplicatesList, setDuplicatesList] = useState<BookFormData[]>([]);

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return isNaN(date.getTime()) ? '' : 
        date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    } catch {
      return '';
    }
  };

  // Validar formato de fecha
  const isValidDate = (dateString: string) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const d = new Date(dateString);
    return d instanceof Date && !isNaN(d.getTime());
  };

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        setError('Error al cargar las categorías');
      }
    };
    fetchCategories();
  }, []);

  // Cargar libro si está en modo edición
  useEffect(() => {
    const fetchBook = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          const data = await bookService.getById(Number(id));
          setFormData({
            ...data,
            fechaPublicacion: data.fechaPublicacion.substring(0, 10)
          });
        } catch (err) {
          setError('Error al cargar los detalles del libro');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBook();
  }, [id, isEditing]);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'categoriaId') {
      setFormData({
        ...formData,
        categoria: { id: Number(value) }
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'copiasDisponibles' ? Number(value) : value
      });
    }
  };

  // Renderizar advertencia de duplicados
  const renderDuplicatesWarning = (duplicates: BookFormData[]) => {
    return (
      <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <div className="flex items-center">
          <ExclamationIcon />
          <p className="ml-2 font-medium text-yellow-800">
            Advertencia: Se encontraron posibles libros duplicados
          </p>
        </div>
        <div className="mt-2 pl-7">
          <p className="text-yellow-700">Libros similares existentes:</p>
          <ul className="list-disc pl-5 mt-1 text-yellow-700">
            {duplicates.map(dup => (
              <li key={dup.id} className="py-1">
                <span className="font-semibold">{dup.titulo}</span> (ID: {dup.id}) - {dup.autor}
                {dup.fechaPublicacion && (
                  <span className="text-yellow-600 text-sm ml-2">
                    Publicado: {formatDisplayDate(dup.fechaPublicacion)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setShowDuplicatesWarning(false);
              setError(null);
            }}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={async () => {
              setShowDuplicatesWarning(false);
              await submitForm(true);
            }}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Continuar de todos modos
          </button>
        </div>
      </div>
    );
  };

  // Enviar formulario (con opción para ignorar duplicados)
  const submitForm = async (ignoreDuplicates = false) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);


      if (!formData.titulo.trim()) {
        throw new Error('El título es requerido');
      }

      if (!formData.autor.trim()) {
        throw new Error('El autor es requerido');
      }

      if (!isValidDate(formData.fechaPublicacion)) {
        throw new Error('Fecha inválida. Use el formato YYYY-MM-DD');
      }

      if (formData.categoria.id === 0) {
        throw new Error('Debe seleccionar una categoría');
      }

      console.log("📦 Categoría seleccionada:", formData.categoria);

      const libroData = {
        ...formData,
        categoria: { id: formData.categoria.id }
      };


      let response: ApiResponse;
      if (isEditing) {
        response = await bookService.update(Number(id), libroData);
      } else {
        response = await bookService.create(libroData);
      }

      if (response.advertencia && response.duplicadosPotenciales && !ignoreDuplicates) {
        setDuplicatesList(response.duplicadosPotenciales);
        setShowDuplicatesWarning(true);
        setError(renderDuplicatesWarning(response.duplicadosPotenciales));
      } else {
        setSuccess(`Libro ${isEditing ? 'actualizado' : 'creado'} correctamente`);
        setTimeout(() => navigate('/books'), 1500);
      }
    } catch (err: any) {
      setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el libro`);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    submitForm();
    
  };

  

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Editar Libro' : 'Nuevo Libro'}
      </h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {typeof error === 'string' ? error : 'Error al procesar la solicitud'}
              </h3>
              {typeof error !== 'string' && (
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-gray-700 font-medium mb-2">
            Título *
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="autor" className="block text-gray-700 font-medium mb-2">
            Autor *
          </label>
          <input
            type="text"
            id="autor"
            name="autor"
            value={formData.autor}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="fechaPublicacion" className="block text-gray-700 font-medium mb-2">
            Fecha de Publicación *
          </label>
          <input
            type="date"
            id="fechaPublicacion"
            name="fechaPublicacion"
            value={formData.fechaPublicacion}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <small className="text-gray-500">
            Formato: AAAA-MM-DD. Ejemplo: {new Date().toISOString().split('T')[0]}
          </small>
          {formData.fechaPublicacion && (
            <div className="mt-1 text-sm text-gray-600">
              Fecha seleccionada: {formatDisplayDate(formData.fechaPublicacion)}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="copiasDisponibles" className="block text-gray-700 font-medium mb-2">
            Copias Disponibles *
          </label>
          <input
            type="number"
            id="copiasDisponibles"
            name="copiasDisponibles"
            value={formData.copiasDisponibles}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="categoriaId" className="block text-gray-700 font-medium mb-2">
            Categoría *
          </label>
          <select
            id="categoriaId"
            name="categoriaId"
            value={formData.categoria.id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="0">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>
        
        {showDuplicatesWarning && renderDuplicatesWarning(duplicatesList)}
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || showDuplicatesWarning}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              loading || showDuplicatesWarning
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Actualizando...' : 'Creando...'}
              </span>
            ) : (
              isEditing ? 'Actualizar' : 'Crear'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;