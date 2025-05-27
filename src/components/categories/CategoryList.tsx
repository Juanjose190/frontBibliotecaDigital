import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/api';
import { Plus, Edit, Trash2, Bookmark, FolderOpen, AlertTriangle } from 'lucide-react';

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
    } catch (err) {
      console.error("Error fetching categories:", err);
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
    } catch (err) {
      console.error("Error deleting category:", err);
      alert('Error al eliminar la categoría. Asegúrate de que no tenga libros asociados.'); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 text-lg text-gray-600">
        <FolderOpen className="h-8 w-8 mr-3 animate-pulse text-blue-500" />
        Cargando categorías...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16 text-xl text-red-600 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-lg p-6 shadow-md">
        <AlertTriangle className="h-7 w-7 mr-3 text-red-500" />
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Gestión de Categorías</h1>
        <Link
          to="/categories/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Categoría
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-gray-200">
          <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 text-xl font-medium">
            No hay categorías disponibles. ¡Añade una nueva para organizar tus libros!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col justify-between border border-gray-100 transform hover:-translate-y-1"
            >
              <div className="flex items-start mb-4">
                <Bookmark className="h-7 w-7 text-blue-500 mr-3 flex-shrink-0" /> 
                <div>
                  <h2 className="text-xl font-bold text-gray-800 break-words">{category.nombre}</h2>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">{category.descripcion}</p>
              <div className="mt-auto flex justify-end space-x-3">
                <button
                  onClick={() => navigate(`/categories/edit/${category.id}`)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
                  aria-label={`Editar categoría ${category.nombre}`}
                  title={`Editar ${category.nombre}`}
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                  aria-label={`Eliminar categoría ${category.nombre}`}
                  title={`Eliminar ${category.nombre}`}
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