const API_BASE_URL = 'http://localhost:8080';

const fetchApi = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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

export const bookService = {
  getAll: async () => fetchApi('/api/libros'),

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

  ping: async () => fetchApi('/api/libros/ping'),
};

export const categoryService = {
  getAll: async () => fetchApi('/api/categorias'),

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
};

export const userService = {
  getAll: async () => fetchApi('/api/usuarios'),

  getById: async (id: number) => fetchApi(`/api/usuarios/${id}`),

  create: async (user: any) =>
    fetchApi('/api/usuarios', {
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
};

export const loanService = {
  getAll: async () => fetchApi('/api/prestamos'),

  getById: async (id: number) => fetchApi(`/api/prestamos/${id}`),

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
};
