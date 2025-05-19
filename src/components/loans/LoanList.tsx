import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loanService } from '../../services/api';
import { Plus } from 'lucide-react';

interface Libro {
  id: number;
  titulo: string;
}

interface Loan {
  id: number;
  libro: Libro;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal: string | null;
  estado: string;
}

interface PromedioRetrasosItem {
  año: number;
  mes: number;
  promedioRetraso: number;
}

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const LoanList = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promedios, setPromedios] = useState<PromedioRetrasosItem[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await loanService.getAll();
        setLoans(data);
      } catch {
        setError('Error al cargar los préstamos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    const fetchPromedios = async () => {
      try {
        const data = await loanService.getPromedioRetrasosPorMes();
        setPromedios(data || []);
      } catch {}
    };

    fetchLoans();
    fetchPromedios();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8">Cargando préstamos...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Préstamos</h1>
        <Link
          to="/loans/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-1" />
          Nuevo Préstamo
        </Link>
      </div>

      {promedios.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Promedio de días de retraso por mes</h2>
          <ul className="list-disc list-inside text-sm text-blue-800">
            {promedios.map(({ año, mes, promedioRetraso }) => (
              <li key={`${año}-${mes}`}>
                <span className="font-medium">
                  {año} - {meses[mes - 1]} ({mes}):
                </span>{' '}
                {promedioRetraso.toFixed(2)} días de retraso
              </li>
            ))}
          </ul>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No hay préstamos disponibles. ¡Añade uno nuevo!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Libro</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Fecha Préstamo</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Fecha Devolución</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Estado</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{loan.libro?.titulo ?? `ID: ${loan.libro.id}`}</td>
                  <td className="px-6 py-4">{new Date(loan.fechaPrestamo).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(loan.fechaDevolucionEsperada).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        loan.estado.toLowerCase() === 'en_curso'
                          ? 'bg-yellow-100 text-yellow-800'
                          : loan.estado.toLowerCase() === 'finalizado'
                          ? 'bg-green-100 text-green-800'
                          : loan.estado.toLowerCase() === 'retrasado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {loan.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/loans/edit/${loan.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoanList;
