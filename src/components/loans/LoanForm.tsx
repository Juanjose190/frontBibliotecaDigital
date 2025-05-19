import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loanService, bookService, userService } from '../../services/api';

interface Book {
  id: number;
  titulo: string;
}

interface User {
  id: number;
  nombre: string;
}

interface LoanFormData {
  usuarioId: number;
  libroId: number;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal: string | null;
  estado: string;
}

const LoanForm = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoanFormData>({
    usuarioId: 0,
    libroId: 0,
    fechaPrestamo: new Date().toISOString().substring(0, 10),
    fechaDevolucionEsperada: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10),
    fechaDevolucionReal: null,
    estado: 'EN_CURSO'
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksData, usersData] = await Promise.all([
          bookService.getAll(),
          userService.getAll()
        ]);
        setBooks(booksData);
        setUsers(usersData);

        if (loanId) {
          const loanData = await loanService.getById(Number(loanId));
          setFormData({
            usuarioId: loanData.usuario.id,
            libroId: loanData.libro.id,
            fechaPrestamo: loanData.fechaPrestamo.substring(0, 10),
            fechaDevolucionEsperada: loanData.fechaDevolucionEsperada.substring(0, 10),
            fechaDevolucionReal: loanData.fechaDevolucionReal
              ? loanData.fechaDevolucionReal.substring(0, 10)
              : null,
            estado: loanData.estado
          });
        }
      } catch {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loanId]);

  useEffect(() => {
    if (
      formData.fechaDevolucionReal &&
      formData.fechaDevolucionReal > formData.fechaDevolucionEsperada
    ) {
      setFormData(prev => ({ ...prev, estado: 'RETRASADO' }));
    }
  }, [formData.fechaDevolucionReal, formData.fechaDevolucionEsperada]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'usuarioId' || name === 'libroId') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: loanId ? Number(loanId) : undefined,
      usuario: { id: formData.usuarioId },
      libro: { id: formData.libroId },
      fechaPrestamo: formData.fechaPrestamo,
      fechaDevolucionEsperada: formData.fechaDevolucionEsperada,
      fechaDevolucionReal: formData.fechaDevolucionReal || null,
      estado: formData.estado
    };

    try {
      setLoading(true);
      if (loanId) {
        await loanService.update(Number(loanId), payload);
      } else {
        await loanService.create(payload);
      }
      navigate('/loans');
    } catch {
      setError('Error al guardar el préstamo');
    } finally {
      setLoading(false);
    }
  };

  if (loading && (books.length === 0 || users.length === 0)) {
    return <div className="flex justify-center py-8">Cargando datos...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{loanId ? 'Editar Préstamo' : 'Nuevo Préstamo'}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="usuarioId" className="block text-gray-700 font-medium mb-2">Usuario</label>
          <select
            id="usuarioId"
            name="usuarioId"
            value={formData.usuarioId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un usuario</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="libroId" className="block text-gray-700 font-medium mb-2">Libro</label>
          <select
            id="libroId"
            name="libroId"
            value={formData.libroId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un libro</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.titulo}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="fechaPrestamo" className="block text-gray-700 font-medium mb-2">Fecha de Préstamo</label>
          <input
            type="date"
            id="fechaPrestamo"
            name="fechaPrestamo"
            value={formData.fechaPrestamo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fechaDevolucionEsperada" className="block text-gray-700 font-medium mb-2">
            Fecha de Devolución Esperada
          </label>
          <input
            type="date"
            id="fechaDevolucionEsperada"
            name="fechaDevolucionEsperada"
            value={formData.fechaDevolucionEsperada}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fechaDevolucionReal" className="block text-gray-700 font-medium mb-2">
            Fecha de Devolución Real
          </label>
          <input
            type="date"
            id="fechaDevolucionReal"
            name="fechaDevolucionReal"
            value={formData.fechaDevolucionReal ?? ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="estado" className="block text-gray-700 font-medium mb-2">Estado</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EN_CURSO">En Curso</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="RETRASADO">Retrasado</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/loans')}
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

export default LoanForm
