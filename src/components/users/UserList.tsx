import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { userService } from '../../services/api';
import { Plus, Edit, Trash, AlertTriangle, RefreshCw, BellRing } from 'lucide-react'; // Import BellRing for animation

interface User {
  id: number;
  nombre: string;
  email: string;
  tipoUsuario: string;
  sanciones: number;
  cedula: string;
}

interface UsuarioSancion {
  id: number;
  nombre: string;
  sanciones: number;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [usuariosConSanciones, setUsuariosConSanciones] = useState<UsuarioSancion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSanciones, setLoadingSanciones] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorSanciones, setErrorSanciones] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());

  const location = useLocation();

  const fetchData = async () => {
    console.log('🚀 Ejecutando fetchData...');
    try {
      setLoading(true);
      setLoadingSanciones(true);

      const [usersData, sancionesData] = await Promise.all([
        userService.getAll(),
        userService.getUsuariosConMasSanciones()
      ]);

      const processedUsers = usersData.map((user: any) => ({
        ...user,
        sanciones: Number(user.sanciones || 0)
      })).sort((a: any, b: any) => b.sanciones - a.sanciones);

      setUsers(processedUsers);
      setUsuariosConSanciones(sancionesData);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
      setErrorSanciones(null);

      console.log('✅ Datos de usuarios actualizados');
    } catch (err) {
      console.error('❌ Error en fetchData:', err);
      setError('Error al cargar los datos de usuarios');
      setErrorSanciones('Error al cargar sanciones');
    } finally {
      setLoading(false);
      setLoadingSanciones(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleSanctionUpdate = () => {
      console.log('📥 Evento userSanctionUpdated recibido');
      fetchData();
    };

    window.addEventListener('userSanctionUpdated', handleSanctionUpdate);
    return () => window.removeEventListener('userSanctionUpdated', handleSanctionUpdate);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏱️ Actualización automática');
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('updated') === 'true') {
      console.log('🔁 URL indica actualización');
      fetchData();
      window.history.replaceState({}, '', '/users');
    }
  }, [location.search]);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await userService.delete(id);
        fetchData();
      } catch (err) {
        setError('Error al eliminar el usuario');
      }
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Refrescando manualmente');
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-600 text-sm mt-1">Última actualización: {lastUpdate}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="bg-gray-600 text-white px-3 py-2 rounded-md flex items-center hover:bg-gray-700 transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            to="/users/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-1" />
            Nuevo Usuario
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={handleRefresh} className="text-red-800 hover:text-red-900 underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sanciones</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/users/${user.id}`} className="text-blue-600 hover:underline font-medium">
                      {user.nombre}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.cedula}</td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.tipoUsuario === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.tipoUsuario}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.sanciones > 0 && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />}
                      <span className={`font-medium ${
                        user.sanciones > 0 ? 'text-red-600' : 'text-gray-600'
                      } ${user.sanciones > 3 ? 'animate-pulse' : ''}`}>
                        {user.sanciones}
                      </span>
                      {user.sanciones > 3 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                          CRÍTICO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <Link
                      to={`/users/${user.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200"> 
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          <BellRing className="h-6 w-6 text-orange-500 mr-2 animate-wiggle" /> 
          Usuarios con más sanciones
          {loadingSanciones && <RefreshCw className="h-4 w-4 ml-2 animate-spin text-gray-500" />}
        </h2>

        {loadingSanciones ? (
          <div className="flex justify-center py-4 text-gray-600">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Cargando datos de sanciones...
          </div>
        ) : errorSanciones ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            {errorSanciones}
          </div>
        ) : usuariosConSanciones.length === 0 ? (
          <p className="text-gray-500 italic text-center">No hay usuarios con sanciones registradas.</p>
        ) : (
          <ul className="space-y-3"> 
            {usuariosConSanciones.map(usuario => (
              <li key={usuario.id} className={`flex justify-between items-center p-3 rounded-lg ${
                usuario.sanciones > 0 ? 'bg-red-50 border border-red-200 shadow-sm' : 'bg-gray-50'
              }`}> 
                <Link to={`/users/${usuario.id}`} className="flex items-center text-gray-800 hover:text-blue-600 font-medium">
                  {usuario.sanciones > 0 && <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />} {/* Icon for sanctioned users */}
                  {usuario.nombre}
                </Link>
                <span className={`font-semibold text-lg ${
                  usuario.sanciones > 0 ? 'text-red-600 animate-bounce-once' : 'text-gray-700'
                }`}> 
                  {usuario.sanciones} {usuario.sanciones === 1 ? 'sanción' : 'sanciones'}
                  {usuario.sanciones > 3 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded-full font-bold uppercase">
                      ¡ALTO!
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserList;