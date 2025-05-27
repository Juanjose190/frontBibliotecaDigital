import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService, loanService } from '../../services/api';
import { Plus, Edit, Trash, Search } from 'lucide-react'; 

interface Book {
  id: number;
  titulo: string;
  autor: string;
  fechaPublicacion: string; 
  copiasDisponibles: number;

  categoria: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  disponible?: boolean;
}

interface LibroPrestado {
  titulo: string;
  categoria: string;
  cantidadPrestamos: number;
}

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [librosPrestados, setLibrosPrestados] = useState<LibroPrestado[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(true);
  const [loadingPrestados, setLoadingPrestados] = useState<boolean>(true);
  const [loadingBusqueda, setLoadingBusqueda] = useState<boolean>(false);
  const [errorBooks, setErrorBooks] = useState<string | null>(null);
  const [errorPrestados, setErrorPrestados] = useState<string | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);

  const [autor, setAutor] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>(''); 
  const [fechaFin, setFechaFin] = useState<string>(''); 
  const [busquedaRealizada, setBusquedaRealizada] = useState<boolean>(false);

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'N/A'; 
    try {

      const datePart = dateString.split('T')[0];
      const date = new Date(datePart + 'T00:00:00');

      if (isNaN(date.getTime())) {
        return 'Fecha Inválida';
      }

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (e) {
      console.error("Error al formatear fecha:", e);
      return 'Error al formatear'; 
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await bookService.getAll();

        const cleanData = data.filter((item: any) => typeof item === 'object' && item !== null && 'id' in item);
        setBooks(cleanData);
        setFilteredBooks(cleanData);
      } catch (err) {
        console.error("Error al cargar libros:", err);
        setErrorBooks('Error al cargar los libros. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoadingBooks(false);
      }
    };

    const fetchPrestados = async () => {
      try {
        const data = await loanService.getLibrosMasPrestadosPorCategoria();
        setLibrosPrestados(data);
      } catch (err) {
        console.error("Error al cargar libros más prestados:", err);
        setErrorPrestados('Error al cargar los libros más prestados.');
      } finally {
        setLoadingPrestados(false);
      }
    };

    fetchBooks();
    fetchPrestados();
  }, []);


  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      try {
        await bookService.delete(id);
 
        setBooks(books.filter(book => book.id !== id));
        setFilteredBooks(filteredBooks.filter(book => book.id !== id));
      } catch (err) {
        console.error("Error al eliminar libro:", err);
        setErrorBooks('Error al eliminar el libro.');
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!autor && !fechaInicio && !fechaFin) {
      setFilteredBooks(books);
      setBusquedaRealizada(false);
      setErrorBusqueda(null); 
      return;
    }

    try {
      setLoadingBusqueda(true);
      setErrorBusqueda(null);

      if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
        throw new Error('Por favor introduce ambos años (Desde y Hasta) o ninguno.');
      }

      const startYearParam = fechaInicio ? `${fechaInicio}-01-01` : '';
      const endYearParam = fechaFin ? `${fechaFin}-12-31` : '';

      const results = await bookService.buscarPorAutorYRangoFechas(
        autor,
        startYearParam,
        endYearParam
      );

      setFilteredBooks(results);
      setBusquedaRealizada(true);
    } catch (error: any) {
      console.error("Error en la búsqueda:", error);
      setErrorBusqueda(error.message || 'Error al realizar la búsqueda. Inténtalo de nuevo.');
      setFilteredBooks([]); 
    } finally {
      setLoadingBusqueda(false);
    }
  };


  const resetSearch = () => {
    setAutor('');
    setFechaInicio('');
    setFechaFin('');
    setFilteredBooks(books); 
    setBusquedaRealizada(false);
    setErrorBusqueda(null); 
  };

  if (loadingBooks) {
    return <div className="flex justify-center py-8 text-lg font-medium">Cargando libros...</div>;
  }

  if (errorBooks) {
    return <div className="text-red-600 py-8 text-center text-lg">{errorBooks}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Libros</h1>
        <Link to="/books/new" className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md">
          <Plus className="h-5 w-5 mr-2" />
          Añadir Nuevo Libro
        </Link>
      </div>


      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Buscar Libros</h2>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <label htmlFor="autor" className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
            <input
              type="text"
              id="autor"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Nombre del autor"
              disabled={loadingBusqueda}
            />
          </div>

          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">Año desde</label>
            <input
              type="number"
              id="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Ej: 1900"
              min="1000"
              max="2099"
              disabled={loadingBusqueda}
            />
          </div>

          <div>
            <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">Año hasta</label>
            <input
              type="number"
              id="fechaFin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Ej: 2025"
              min="1000"
              max="2099"
              disabled={loadingBusqueda}
            />
          </div>

          <div className="flex items-end space-x-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loadingBusqueda}
            >
              <Search className="h-5 w-5 mr-2" />
              {loadingBusqueda ? 'Buscando...' : 'Buscar'}
            </button>

            {busquedaRealizada && (
              <button
                type="button"
                onClick={resetSearch}
                className="px-5 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors shadow-md"
                disabled={loadingBusqueda}
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        {errorBusqueda && (
          <div className="mt-4 text-red-600 text-sm">{errorBusqueda}</div>
        )}
      </div>


      {busquedaRealizada && (
        <div className="mb-4 text-md text-gray-700 font-medium">
          Mostrando {filteredBooks.length} resultados
        </div>
      )}

  
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
          <p className="text-gray-600 text-lg">
            {busquedaRealizada
              ? 'No se encontraron libros con los criterios de búsqueda.'
              : 'No hay libros disponibles en el sistema. ¡Haz clic en "Añadir Nuevo Libro" para empezar!'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 mb-12">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Autor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha de Publicación</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Copias Disponibles</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/books/${book.id}`} className="text-blue-600 hover:underline font-medium">
                      {book.titulo}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">{book.autor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">{formatDateForDisplay(book.fechaPublicacion)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">{book.copiasDisponibles}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex space-x-3">
                    <Link to={`/books/${book.id}/edit`} className="text-blue-600 hover:text-blue-800 transition-colors" title="Editar">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-800 transition-colors" title="Eliminar">
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Top Libros Más Prestados por Categoría</h2>
        {loadingPrestados ? (
          <div className="text-center text-gray-600">Cargando libros más prestados...</div>
        ) : errorPrestados ? (
          <div className="text-red-600 text-center">{errorPrestados}</div>
        ) : librosPrestados.length === 0 ? (
          <p className="text-gray-600 text-center">No hay datos de libros más prestados disponibles.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Préstamos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {librosPrestados.map((libro, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{libro.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{libro.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{libro.cantidadPrestamos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;