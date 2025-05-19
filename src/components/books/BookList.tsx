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
  categoriaId: number;
  categoriaNombre?: string;
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
  
  // Estados para el formulario de búsqueda
  const [autor, setAutor] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [busquedaRealizada, setBusquedaRealizada] = useState<boolean>(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await bookService.getAll();
        setBooks(data);
        setFilteredBooks(data);
      } catch {
        setErrorBooks('Error al cargar los libros. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoadingBooks(false);
      }
    };

    const fetchPrestados = async () => {
      try {
        const data = await loanService.getLibrosMasPrestadosPorCategoria();
        setLibrosPrestados(data);
      } catch {
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
      } catch {
        setErrorBooks('Error al eliminar el libro.');
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!autor && !fechaInicio && !fechaFin) {
      setFilteredBooks(books);
      setBusquedaRealizada(false);
      return;
    }

    try {
      setLoadingBusqueda(true);
      setErrorBusqueda(null);
      
      // Validar fechas si se proporcionan
      if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
        throw new Error('Por favor introduce ambas fechas o ninguna.');
      }
      
      const startYear = fechaInicio ? `${fechaInicio}-01-01` : '';
      const endYear = fechaFin ? `${fechaFin}-12-31` : '';
      
      const results = await bookService.buscarPorAutorYRangoFechas(
        autor, 
        startYear, 
        endYear
      );
      
      setFilteredBooks(results);
      setBusquedaRealizada(true);
    } catch (error: any) {
      setErrorBusqueda(error.message || 'Error al realizar la búsqueda.');
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
    return <div className="flex justify-center py-8">Cargando libros...</div>;
  }

  if (errorBooks) {
    return <div className="text-red-600 py-8">{errorBooks}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Libros</h1>
        <Link to="/books/new" className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5 mr-1" />
          Nuevo Libro
        </Link>
      </div>

      {/* Formulario de búsqueda por autor y rango de fechas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Buscar libros por autor y año de publicación</h2>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="autor" className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
            <input
              type="text"
              id="autor"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del autor"
            />
          </div>
          
          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">Año desde</label>
            <input
              type="number"
              id="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Año inicial"
              min="1000"
              max="2099"
            />
          </div>
          
          <div>
            <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">Año hasta</label>
            <input
              type="number"
              id="fechaFin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Año final"
              min="1000"
              max="2099"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={loadingBusqueda}
            >
              <Search className="h-4 w-4 mr-1" />
              {loadingBusqueda ? 'Buscando...' : 'Buscar'}
            </button>
            
            {busquedaRealizada && (
              <button
                type="button"
                onClick={resetSearch}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>
        
        {errorBusqueda && (
          <div className="mt-4 text-red-600">{errorBusqueda}</div>
        )}
      </div>

      {/* Listado de libros (filtrado o todos) */}
      {busquedaRealizada && (
        <div className="mb-2 text-sm text-gray-600">
          Mostrando {filteredBooks.length} resultados
        </div>
      )}
      
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">
            {busquedaRealizada 
              ? 'No se encontraron libros con los criterios de búsqueda.' 
              : 'No hay libros disponibles. ¡Añade uno nuevo!'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Título</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Autor</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Fecha de Publicación</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Copias Disponibles</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/books/${book.id}`} className="text-blue-600 hover:underline">
                      {book.titulo}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{book.autor}</td>
                  <td className="px-6 py-4">{new Date(book.fechaPublicacion).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{book.copiasDisponibles}</td>
                  <td className="px-6 py-4 flex space-x-2">
                    <Link to={`/books/${book.id}/edit`} className="text-blue-600 hover:text-blue-800">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-800">
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sección de libros más prestados por categoría */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Libros más prestados por categoría</h2>
        {loadingPrestados ? (
          <div>Cargando libros más prestados...</div>
        ) : errorPrestados ? (
          <div className="text-red-600">{errorPrestados}</div>
        ) : librosPrestados.length === 0 ? (
          <p className="text-gray-600">No hay datos de libros más prestados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Título</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Categoría</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Préstamos</th>
                </tr>
              </thead>
              <tbody>
                {librosPrestados.map((libro, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{libro.titulo}</td>
                    <td className="px-6 py-4">{libro.categoria}</td>
                    <td className="px-6 py-4">{libro.cantidadPrestamos}</td>
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