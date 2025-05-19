import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, categoryService } from '../../services/api';

interface Category {
  id: number;
  nombre: string;
}

interface BookFormData {
  titulo: string;
  autor: string;
  fechaPublicacion: string;
  copiasDisponibles: number;
  categoriaId: number;
}

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<BookFormData>({
    titulo: '',
    autor: '',
    fechaPublicacion: '',
    copiasDisponibles: 1,
    categoriaId: 0
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        setError('Error al cargar las categorías');
      }
    };

    const fetchBook = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          const data = await bookService.getById(Number(id));
          setFormData({
            titulo: data.titulo,
            autor: data.autor,
            fechaPublicacion: data.fechaPublicacion.substring(0, 10), // YYYY-MM-DD format
            copiasDisponibles: data.copiasDisponibles,
            categoriaId: data.categoriaId
          });
        } catch (err) {
          setError('Error al cargar los detalles del libro');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategories();
    fetchBook();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'copiasDisponibles' || name === 'categoriaId' 
        ? Number(value) 
        : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (isEditing) {
        await bookService.update(Number(id), formData);
      } else {
        await bookService.create(formData);
      }
      navigate('/books');
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el libro`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="flex justify-center py-8">Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Editar Libro' : 'Nuevo Libro'}
      </h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-gray-700 font-medium mb-2">Título</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="autor" className="block text-gray-700 font-medium mb-2">Autor</label>
          <input
            type="text"
            id="autor"
            name="autor"
            value={formData.autor}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="fechaPublicacion" className="block text-gray-700 font-medium mb-2">Fecha de Publicación</label>
          <input
            type="date"
            id="fechaPublicacion"
            name="fechaPublicacion"
            value={formData.fechaPublicacion}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="copiasDisponibles" className="block text-gray-700 font-medium mb-2">Copias Disponibles</label>
          <input
            type="number"
            id="copiasDisponibles"
            name="copiasDisponibles"
            value={formData.copiasDisponibles}
            onChange={handleChange}
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="categoriaId" className="block text-gray-700 font-medium mb-2">Categoría</label>
          <select
            id="categoriaId"
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.nombre}</option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;