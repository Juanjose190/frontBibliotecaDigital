import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';

interface UserFormData {
  nombre: string;
  email: string;
  tipoUsuario: string;
  sanciones: number;
  fechaRegistro?: string; // Opcional porque no siempre existe (en edición no)
}

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    email: '',
    tipoUsuario: 'ESTUDIANTE',
    sanciones: 0,
    fechaRegistro: new Date().toISOString().substring(0, 10), // sólo para creación
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getById(Number(id));
        setFormData({
          nombre: data.nombre,
          email: data.email,
          tipoUsuario: data.tipoUsuario,
          sanciones: data.sanciones,
          // no seteamos fechaRegistro porque no viene ni debe enviarse
        });
      } catch {
        setError('Error al cargar los detalles del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sanciones' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (isEditing && id) {
        // En edición no enviamos fechaRegistro porque backend no lo usa
        const { fechaRegistro, ...dataToUpdate } = formData;
        await userService.update(Number(id), dataToUpdate);
      } else {
        // En creación sí enviamos todo (incluyendo fechaRegistro)
        await userService.create(formData);
      }

      navigate('/users');
    } catch {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el usuario`);
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
        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-gray-700 font-medium mb-2">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="tipoUsuario"
            className="block text-gray-700 font-medium mb-2"
          >
            Tipo de Usuario
          </label>
          <select
            id="tipoUsuario"
            name="tipoUsuario"
            value={formData.tipoUsuario}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="PROFESOR">Profesor</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="sanciones"
            className="block text-gray-700 font-medium mb-2"
          >
            Sanciones
          </label>
          <input
            type="number"
            id="sanciones"
            name="sanciones"
            value={formData.sanciones}
            onChange={handleChange}
            min={0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mostrar fechaRegistro sólo en creación */}
        {!isEditing && (
          <div className="mb-6">
            <label
              htmlFor="fechaRegistro"
              className="block text-gray-700 font-medium mb-2"
            >
              Fecha de Registro
            </label>
            <input
              type="date"
              id="fechaRegistro"
              name="fechaRegistro"
              value={formData.fechaRegistro ?? ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/users')}
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

export default UserForm;
