
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import { Plus, Edit, Trash } from 'lucide-react';

interface User {
  id: number;
  nombre: string;
  email: string;
  tipoUsuario: string;
  sanciones: number;
}

interface UsuarioSancion {
  nombre: string;
  sanciones: number;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [usuariosConSanciones, setUsuariosConSanciones] = useState<UsuarioSancion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSanciones, setLoadingSanciones] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorSanciones, setErrorSanciones] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAll();
        setUsers(data);
      } catch (err) {
        setError('Error al cargar los usuarios. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsuariosConMasSanciones = async () => {
      try {
        const data = await userService.getUsuariosConMasSanciones();
        setUsuariosConSanciones(data);
      } catch (err) {
        setErrorSanciones('Error al cargar los usuarios con más sanciones.');
      } finally {
        setLoadingSanciones(false);
      }
    };

    fetchUsers();
    fetchUsuariosConMasSanciones();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await userService.delete(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        setError('Error al eliminar el usuario.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <Link to="/users/new" className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5 mr-1" />
          Nuevo Usuario
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No hay usuarios disponibles. ¡Añade uno nuevo!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Tipo</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Sanciones</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/users/${user.id}`} className="text-blue-600 hover:underline">
                      {user.nombre}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.tipoUsuario === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.tipoUsuario}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.sanciones || 0}</td>
                  <td className="px-6 py-4 flex space-x-2">
                    <Link to={`/users/${user.id}/edit`} className="text-blue-600 hover:text-blue-800">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800">
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sección de usuarios con más sanciones */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Usuarios con más sanciones</h2>
        
        {loadingSanciones ? (
          <div>Cargando datos de sanciones...</div>
        ) : errorSanciones ? (
          <div className="text-red-600">{errorSanciones}</div>
        ) : usuariosConSanciones.length === 0 ? (
          <p className="text-gray-600">No hay datos de sanciones disponibles.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-full h-80">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Usuario</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Número de Sanciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosConSanciones.map((usuario, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{usuario.nombre}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-purple-600 h-4 rounded-full"
                              style={{ width: `${Math.min(100, (usuario.sanciones / Math.max(...usuariosConSanciones.map(u => u.sanciones))) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2">{usuario.sanciones}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;