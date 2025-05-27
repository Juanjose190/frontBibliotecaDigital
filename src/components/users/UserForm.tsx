import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';

interface UserFormData {
  nombre: string;
  email: string;
  tipoUsuario: string;
  cedula: string;
  fechaRegistro?: string;
}

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    email: '',
    tipoUsuario: 'ESTUDIANTE',
    cedula: '',
    fechaRegistro: new Date().toISOString().substring(0, 10),
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
          cedula: data.cedula,

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
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[0-9]{6,15}$/.test(formData.cedula)) {
      setError('La cédula debe contener solo números y tener entre 6 y 15 dígitos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Por favor ingrese un email válido');
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {

        await userService.update(Number(id), {
          nombre: formData.nombre,
          email: formData.email,
          tipoUsuario: formData.tipoUsuario,
          cedula: formData.cedula
        });
      } else {
 
        await userService.create({
          ...formData,
          sanciones: 0 
        });
      }

      navigate('/users');
    } catch (err: any) {
      if (err.message.includes('correo')) {
        setError('El email ya está registrado');
      } else if (err.message.includes('cédula')) {
        setError(err.message);
      } else {
        setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el usuario`);
      }
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
          <label htmlFor="cedula" className="block text-gray-700 font-medium mb-2">
            Cédula
          </label>
          <input
            type="text"
            id="cedula"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
            maxLength={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la cédula (solo números)"
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