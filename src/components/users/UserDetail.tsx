import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import { Edit, Trash, ArrowLeft } from 'lucide-react';

interface User {
  id: number;
  nombre: string;
  email: string;
  tipoUsuario: string;
  sanciones: number;
  fechaRegistro: string;
}

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getById(Number(id));
        setUser(data);
      } catch {
        setError('Error al cargar los detalles del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await userService.delete(Number(id));
        navigate('/users');
      } catch {
        setError('Error al eliminar el usuario');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando detalles del usuario...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>;
  }

  if (!user) {
    return <div className="text-gray-600 py-8">No se encontró el usuario</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/users" className="text-blue-600 hover:text-blue-800 mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Detalles del Usuario</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user.nombre}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="flex space-x-2">
            <Link 
              to={`/users/${user.id}/edit`} 
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
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Información del Usuario</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Usuario</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.tipoUsuario === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.tipoUsuario}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Registro</p>
                <p>{new Date(user.fechaRegistro).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sanciones</p>
                <p>{user.sanciones}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
