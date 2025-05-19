import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, User, List, BookCopy, Users, Clock, Plus } from 'lucide-react';

const Dashboard = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const stats = [
    { label: 'Libros Totales', value: '1,234' },
    { label: 'Usuarios Activos', value: '856' },
    { label: 'Préstamos Activos', value: '123' },
    { label: 'Categorías', value: '45' }
  ];
  

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestión Bibliotecaria
          </h1>
          <p className="text-xl text-gray-600">
            Administra tu biblioteca digital de manera eficiente
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200"
            >
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={item}>
            <Link 
              to="/books" 
              className="block bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookCopy className="h-8 w-8 text-white" />
                  <span className="bg-blue-400 bg-opacity-30 text-white px-3 py-1 rounded-full text-sm">
                    Gestionar
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Libros</h2>
                <p className="text-blue-100">Administra el catálogo completo</p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <Link 
                  to="/books/new" 
                  className="flex items-center text-white hover:underline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Libro
                </Link>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link 
              to="/categories" 
              className="block bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <List className="h-8 w-8 text-white" />
                  <span className="bg-green-400 bg-opacity-30 text-white px-3 py-1 rounded-full text-sm">
                    Organizar
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Categorías</h2>
                <p className="text-green-100">Clasifica tu colección</p>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                <Link 
                  to="/categories/new" 
                  className="flex items-center text-white hover:underline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Link>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link 
              to="/users" 
              className="block bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-white" />
                  <span className="bg-purple-400 bg-opacity-30 text-white px-3 py-1 rounded-full text-sm">
                    Usuarios
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Miembros</h2>
                <p className="text-purple-100">Gestiona los usuarios</p>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                <Link 
                  to="/users/new" 
                  className="flex items-center text-white hover:underline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Link>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link 
              to="/loans" 
              className="block bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-white" />
                  <span className="bg-orange-400 bg-opacity-30 text-white px-3 py-1 rounded-full text-sm">
                    Préstamos
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Préstamos</h2>
                <p className="text-orange-100">Control de préstamos</p>
              </div>
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4">
                <Link 
                  to="/loans/new" 
                  className="flex items-center text-white hover:underline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Préstamo
                </Link>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            {/* Placeholder for recent activity - would be populated with real data */}
            <div className="flex items-center text-gray-600 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <BookOpen className="h-5 w-5 mr-3 text-blue-500" />
              <span>Nuevo libro añadido: "El nombre del viento"</span>
              <span className="ml-auto text-sm text-gray-400">Hace 2 horas</span>
            </div>
            <div className="flex items-center text-gray-600 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <User className="h-5 w-5 mr-3 text-purple-500" />
              <span>Nuevo usuario registrado: María García</span>
              <span className="ml-auto text-sm text-gray-400">Hace 3 horas</span>
            </div>
            <div className="flex items-center text-gray-600 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <BookCopy className="h-5 w-5 mr-3 text-orange-500" />
              <span>Préstamo devuelto: "Cien años de soledad"</span>
              <span className="ml-auto text-sm text-gray-400">Hace 5 horas</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;