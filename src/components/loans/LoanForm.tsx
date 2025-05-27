
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loanService, bookService, userService } from '../../services/api';

interface User {
  id: number;
  nombre: string;
  cedula: string;
  sanciones?: number;
}

interface Book {
  id: number;
  titulo: string;
}

interface Loan {
  id: number;
  usuario: User;
  libro: Book;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal: string | null;
  estado: string;
  devuelto: boolean;
}

interface LoanFormData {
  usuarioId: number;
  libroId: number;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal: string | null;
  estado: string;
  devuelto: boolean;
}

const LoanForm = () => {
  const { id } = useParams<{ id: string }>(); 
  const loanId = id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoanFormData>({
    usuarioId: 0,
    libroId: 0,
    fechaPrestamo: new Date().toISOString().substring(0, 10),
    fechaDevolucionEsperada: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10),
    fechaDevolucionReal: null,
    estado: 'EN_CURSO',
    devuelto: false
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [willCreateSanction, setWillCreateSanction] = useState<boolean>(false);

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
          const loanData: Loan = await loanService.getById(Number(loanId));
          
          setFormData({
            usuarioId: loanData.usuario.id,
            libroId: loanData.libro.id,
            fechaPrestamo: loanData.fechaPrestamo.substring(0, 10),
            fechaDevolucionEsperada: loanData.fechaDevolucionEsperada.substring(0, 10),
            fechaDevolucionReal: loanData.fechaDevolucionReal
              ? loanData.fechaDevolucionReal.substring(0, 10)
              : null,
            estado: loanData.estado,
            devuelto: loanData.devuelto || false
          });

          setEditingUser(loanData.usuario);
          setEditingBook(loanData.libro);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loanId]);

  useEffect(() => {
    if (!loanId || !formData.fechaDevolucionEsperada) return;

const fechaEsperada = new Date(formData.fechaDevolucionEsperada + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaEsperada.setHours(0, 0, 0, 0);

    const shouldCreateSanction = fechaEsperada < hoy && !formData.devuelto;
    setWillCreateSanction(shouldCreateSanction);
  }, [formData.fechaDevolucionEsperada, formData.devuelto, loanId]);


  useEffect(() => {
    if (books.length === 0 || users.length === 0) return;

    setFormData(prev => {
      let newState = { ...prev };
      
      const isReturned = !!newState.fechaDevolucionReal;
      newState.devuelto = isReturned;
      
      if (isReturned) {
        const fechaReal = new Date(newState.fechaDevolucionReal! + 'T00:00:00');
        const fechaEsperada = new Date(newState.fechaDevolucionEsperada + 'T00:00:00');
        newState.estado = fechaReal > fechaEsperada ? 'RETRASADO' : 'FINALIZADO';
      } else {
        const hoy = new Date();
        const fechaEsperada = new Date(newState.fechaDevolucionEsperada + 'T00:00:00');
        newState.estado = hoy > fechaEsperada ? 'RETRASADO' : 'EN_CURSO';
      }
      
      return newState;
    });
  }, [formData.fechaDevolucionReal, formData.fechaDevolucionEsperada, books.length, users.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      if (name === 'usuarioId' || name === 'libroId') {
        return { ...prev, [name]: Number(value) };
      } else if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        return { ...prev, [name]: checked };
      } else if (name === 'fechaDevolucionReal') {
        const realDate = value || null;
        return { 
          ...prev, 
          [name]: realDate,
          devuelto: !!realDate
        };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const notifyUserSanctionUpdate = () => {
    // Disparar evento inmediatamente
    window.dispatchEvent(new Event('userSanctionUpdated'));

setTimeout(() => {
  console.log('📣 Lanzando evento userSanctionUpdated desde LoanForm');
  window.dispatchEvent(new Event('userSanctionUpdated'));
}, 1000);

    

    setTimeout(() => {
      window.dispatchEvent(new Event('userSanctionUpdated'));
    }, 500);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.devuelto && !formData.fechaDevolucionReal) {
    setError('Si el libro está devuelto, debe especificar la fecha de devolución real.');
    return;
  }

  if (!formData.devuelto && formData.fechaDevolucionReal) {
    setError('Si hay fecha de devolución real, el libro debe estar marcado como devuelto.');
    return;
  }

  const payload = {
    usuarioId: formData.usuarioId,
    libroId: formData.libroId,
    fechaPrestamo: formData.fechaPrestamo,
    fechaDevolucionEsperada: formData.fechaDevolucionEsperada,
    fechaDevolucionReal: formData.fechaDevolucionReal,
    devuelto: formData.devuelto,
    estado: formData.estado
  };

  try {
    setLoading(true);
    setError(null);

    console.log('📤 Enviando payload:', payload);
    console.log('🧭 Modo:', loanId ? 'EDICIÓN' : 'CREACIÓN');
    console.log('⚠️ ¿Aplica sanción?:', willCreateSanction);

    let response;
    if (loanId) {
      response = await loanService.update(Number(loanId), payload);
    } else {
      response = await loanService.create(payload);
    }

    console.log('✅ Respuesta del backend:', response);

  
    if (willCreateSanction) {
      setTimeout(() => {
        console.log('📣 Lanzando evento userSanctionUpdated desde LoanForm');
        window.dispatchEvent(new Event('userSanctionUpdated'));
      }, 1000);
    }


navigate('/users?updated=true', {
  state: {
    message: 'Préstamo actualizado con sanción',
    type: 'success',
    sancionAplicada: willCreateSanction
  }
});

  } catch (err: any) {
    console.error('❌ Error al guardar el préstamo:', err);
    setError(err.message || 'Error al guardar el préstamo. Verifique los datos.');
  } finally {
    setLoading(false);
  }
};


  if (loading && (books.length === 0 || users.length === 0)) {
    return <div className="flex justify-center py-8">Cargando datos...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {loanId ? 'Editar Préstamo' : 'Nuevo Préstamo'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}


      {willCreateSanction && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>
              <strong>Advertencia:</strong> Este préstamo está retrasado. Al guardar, se aplicará una sanción automáticamente al usuario.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">

        <div className="mb-4">
          <label htmlFor="usuarioId" className="block text-gray-700 font-medium mb-2">
            Usuario
          </label>
          {loanId ? (
            <>
              <input
                type="text"
                value={`${editingUser?.nombre || ''} ${editingUser?.sanciones ? `(${editingUser.sanciones} sanciones)` : ''}`}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
              <p className="text-gray-600 text-sm mt-1">
                Cédula: {editingUser?.cedula || ''}
              </p>
            </>
          ) : (
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
                  {user.nombre} ({user.cedula})
                </option>
              ))}
            </select>
          )}
        </div>


        <div className="mb-4">
          <label htmlFor="libroId" className="block text-gray-700 font-medium mb-2">
            Libro
          </label>
          {loanId ? (
            <input
              type="text"
              value={editingBook?.titulo || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          ) : (
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
          )}
        </div>


        <div className="mb-4">
          <label htmlFor="fechaPrestamo" className="block text-gray-700 font-medium mb-2">
            Fecha de Préstamo
          </label>
          <input
            type="date"
            id="fechaPrestamo"
            name="fechaPrestamo"
            value={formData.fechaPrestamo}
            onChange={handleChange}
            required
            disabled={!!loanId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            value={formData.fechaDevolucionReal || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-600 text-sm mt-1">
            Dejar vacío si el libro aún no ha sido devuelto
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="estado" className="block text-gray-700 font-medium mb-2">
            Estado
          </label>
          <input
            type="text"
            value={formData.estado}
            disabled
            className={`w-full px-3 py-2 border border-gray-300 rounded-md cursor-not-allowed ${
              formData.estado === 'RETRASADO' ? 'bg-red-50 text-red-800' : 'bg-gray-100'
            }`}
          />
          <p className="text-gray-600 text-sm mt-1">
            El estado se calcula automáticamente según las fechas
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Estado de Devolución
          </label>
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.devuelto 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {formData.devuelto ? '✅ Devuelto' : '⏳ Pendiente de devolución'}
            </span>
          </div>
          {formData.devuelto && formData.fechaDevolucionReal && (
            <p className="text-green-600 text-sm mt-1">
              Devuelto el {new Date(formData.fechaDevolucionReal + 'T00:00:00').toLocaleDateString()}
            </p>
          )}
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
            className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
              willCreateSanction 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Guardando...' : willCreateSanction ? 'Guardar (Aplicar Sanción)' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanForm;