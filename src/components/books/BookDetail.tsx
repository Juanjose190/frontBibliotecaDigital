import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookService } from '../../services/api';
import { Edit, Trash, ArrowLeft } from 'lucide-react';

interface Book {
  id: number;
  titulo: string;
  autor: string;
  fechaPublicacion: string;
  copiasDisponibles: number;
  categoriaId: number;
  categoriaNombre?: string;
}

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await bookService.getById(Number(id));
        setBook(data);
      } catch (err) {
        setError('Error al cargar los detalles del libro');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      try {
        await bookService.delete(Number(id));
        navigate('/books');
      } catch (err) {
        setError('Error al eliminar el libro');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando detalles del libro...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>;
  }

  if (!book) {
    return <div className="text-gray-600 py-8">No se encontró el libro</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/books" className="text-blue-600 hover:text-blue-800 mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Detalles del Libro</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{book.titulo}</h2>
            <p className="text-gray-600">por {book.autor}</p>
          </div>
          <div className="flex space-x-2">
            <Link 
              to={`/books/${book.id}/edit`} 
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Link>
            <button 
              onClick={handleDelete}
              className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash className="h-4 w-4 mr-1" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Información del Libro</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Fecha de Publicación</p>
                <p>{new Date(book.fechaPublicacion).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoría</p>
                <p>{book.categoriaNombre || `ID: ${book.categoriaId}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Copias Disponibles</p>
                <p>{book.copiasDisponibles}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;