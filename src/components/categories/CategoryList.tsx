import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  nombre: string;
  descripcion: string;
}

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      setError(null);
    } catch {
      setError('Error al cargar las categorías. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await categoryService.delete(id);
      fetchCategories();
    } catch {
      alert('Error al eliminar la categoría');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <Link
          to="/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-1" />
          Nueva Categoría
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No hay categorías disponibles. ¡Añade una nueva!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{category.nombre}</h2>
                <p className="text-gray-600">{category.descripcion}</p>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => navigate(`/categories/edit/${category.id}`)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label="Editar categoría"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Eliminar categoría"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
