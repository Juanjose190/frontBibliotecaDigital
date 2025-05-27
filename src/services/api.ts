const API_BASE_URL = 'http://localhost:8080';

const fetchApi = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers,
      },
    });


    if (!response.ok) {
      const errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    console.log('Respuesta recibida del backend:', data);
    return data;
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('No se pudo conectar con el backend. ¿Está el servidor en http://localhost:8080 encendido?');
    } else {
      console.error('Error inesperado:', error.message || error);
    }
    throw error;
  }
};

export const authService = {
  login: async (credentials: { email: string, password: string }) =>
    fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: async (userData: any) =>
    fetchApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: async () =>
    fetchApi('/api/auth/logout', {
      method: 'POST',
    }),

  checkSession: async () => fetchApi('/api/auth/session'),
};

export const bookService = {
  getAll: async () => fetchApi('/api/libros'),
  getPaginated: async (page: number, size: number) =>
    fetchApi(`/api/libros/paginados?page=${page}&size=${size}`),
  
  getById: async (id: number) => fetchApi(`/api/libros/${id}`),

  create: async (book: any) =>
    fetchApi('/api/libros', {
      method: 'POST',
      body: JSON.stringify(book),
    }),

  update: async (id: number, book: any) =>
    fetchApi(`/api/libros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    }),

  delete: async (id: number) =>
    fetchApi(`/api/libros/${id}`, {
      method: 'DELETE',
    }),

  buscarPorAutorYRangoFechas: async (autor: string, fechaInicio: string, fechaFin: string) => {
    const params = new URLSearchParams({ autor, fechaInicio, fechaFin });
    return fetchApi(`/api/libros/buscar?${params.toString()}`);
  },

  searchAdvanced: async (filters: any) =>
    fetchApi('/api/libros/busqueda-avanzada', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),

  uploadCover: async (bookId: number, imageFile: FormData) =>
    fetchApi(`/api/libros/${bookId}/portada`, {
      method: 'POST',
      body: imageFile,
      headers: {} 
    }),

  getBookStats: async () => fetchApi('/api/libros/estadisticas'),
  verificarDuplicados: async (titulo: string) =>
    fetchApi('/api/libros/verificar-duplicados', {
      method: 'POST',
      body: JSON.stringify({ titulo }),
    }),

  ping: async () => fetchApi('/api/libros/ping'),
};

export const categoryService = {
  getAll: async () => fetchApi('/api/categorias'),
  getPaginated: async (page: number, size: number) =>
    fetchApi(`/api/categorias/paginadas?page=${page}&size=${size}`),

  create: async (category: any) =>
    fetchApi('/api/categorias', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  update: async (id: number, category: any) =>
    fetchApi(`/api/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),

  delete: async (id: number) =>
    fetchApi(`/api/categorias/${id}`, {
      method: 'DELETE',
    }),

  getWithBookCount: async () => fetchApi('/api/categorias/con-conteo'),
  getPopularCategories: async () => fetchApi('/api/categorias/populares'),
};

export const userService = {
  getAll: async () => fetchApi(`/api/usuarios?ts=${Date.now()}`),
  getPaginated: async (page: number, size: number) =>
    fetchApi(`/api/usuarios/paginados?page=${page}&size=${size}`),

  getById: async (id: number) => fetchApi(`/api/usuarios/${id}`),

 create: async (user: any) =>
  fetchApi('/api/usuarios/registrar', {  
    method: 'POST',
    body: JSON.stringify(user),
  }),

  update: async (id: number, user: any) =>
    fetchApi(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),

  delete: async (id: number) =>
    fetchApi(`/api/usuarios/${id}`, {
      method: 'DELETE',
    }),

  getUsuariosConMasSanciones: async () => fetchApi('/api/usuarios/mas-sanciones'),
  getUsuariosSancionados: async () => fetchApi('/api/usuarios/sancionados'),
  searchUsers: async (query: string) =>
    fetchApi(`/api/usuarios/buscar?q=${encodeURIComponent(query)}`),
  verificarDisponibilidad: async (id: number) =>
    fetchApi(`/api/usuarios/${id}/puede-prestar`),
};

export const loanService = {
  getAll: async () => fetchApi('/api/prestamos'),
getConteoRetrasosPorMes: async () => fetchApi('/api/prestamos/conteo-retrasos'),
  getPaginated: async (page: number, size: number) =>
    fetchApi(`/api/prestamos/paginados?page=${page}&size=${size}`),

  getById: async (id: number) =>
    fetchApi(`/api/prestamos/${id}`),

    

  create: async (loan: any) =>
    fetchApi('/api/prestamos', {
      method: 'POST',
      body: JSON.stringify(loan),
    }),

  update: async (id: number, loan: any) =>
    fetchApi(`/api/prestamos/${id}`, {
      method: 'PUT', 
      body: JSON.stringify(loan),
    }),

  delete: async (id: number) =>
    fetchApi(`/api/prestamos/${id}`, {
      method: 'DELETE',
    }),


    

  getLibrosMasPrestadosPorCategoria: async () => fetchApi('/api/prestamos/libros-mas-prestados'),
  getPromedioRetrasosPorMes: async () => fetchApi('/api/prestamos/promedio-retrasos'),
registerReturn: async (id: number) =>
    fetchApi(`/api/prestamos/${id}/devolver`, {
      method: 'PUT',
    }),
  getPrestamosActivos: async (userId?: number) =>
    fetchApi(userId ? `/api/prestamos/activos?userId=${userId}` : '/api/prestamos/activos'),
  getPrestamosRetrasados: async () => fetchApi('/api/prestamos/retrasados'),
  getUserLoanHistory: async (userId: number) =>
    fetchApi(`/api/prestamos/historico/${userId}`),
  getEstadisticas: async () => fetchApi('/api/prestamos/estadisticas'),
};

export const reportService = {
  generateLoansReport: async (params: any) =>
    fetchApi('/api/reportes/prestamos', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  generateInventoryReport: async () => fetchApi('/api/reportes/inventario'),
  generateUserActivityReport: async (userId: number) =>
    fetchApi(`/api/reportes/actividad-usuario/${userId}`),



  
};