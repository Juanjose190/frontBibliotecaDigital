import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loanService } from '../../services/api';
import { Plus } from 'lucide-react';

interface Loan {
  id: number;
  libro: any;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal: string | null;
  estado: 'ACTIVO' | 'RETRASADO' | 'COMPLETADO' | 'EN_CURSO' | 'FINALIZADO';
}

interface DelayStats {
  [month: string]: {
    totalDaysDelayed: number;
    count: number;
  };
}

const LoanList = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [delayStats, setDelayStats] = useState<Record<string, number>>({});
  const [conteoRetrasosPorMes, setConteoRetrasosPorMes] = useState<
    { mes: number; año: number; conteoRetrasos: number }[]
  >([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await loanService.getAll();
        setLoans(data);
        calcularPromedioRetrasos(data);
      } catch (err) {
        setError('Error al cargar los préstamos');
        console.error('Error fetching loans:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchConteoRetrasos = async () => {
      try {
        const data = await loanService.getConteoRetrasosPorMes();
        setConteoRetrasosPorMes(data);
      } catch (error) {
        console.error('Error al obtener el conteo de retrasos:', error);
      }
    };

    fetchLoans();
    fetchConteoRetrasos();
  }, []);

  const calcularPromedioRetrasos = (loans: Loan[]) => {
    const stats: DelayStats = {};

    loans.forEach((loan) => {
      if (!loan.fechaDevolucionReal) return;
      const fechaEsperada = new Date(loan.fechaDevolucionEsperada + 'T00:00:00');
      const fechaReal = new Date(loan.fechaDevolucionReal + 'T00:00:00');
      if (fechaReal <= fechaEsperada) return;
      const diffTime = fechaReal.getTime() - fechaEsperada.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const mes = fechaReal.toISOString().slice(0, 7);
      if (!stats[mes]) {
        stats[mes] = { totalDaysDelayed: 0, count: 0 };
      }
      stats[mes].totalDaysDelayed += diffDays;
      stats[mes].count += 1;
    });

    const promedioPorMes: Record<string, number> = {};
    Object.entries(stats).forEach(([mes, { totalDaysDelayed, count }]) => {
      promedioPorMes[mes] = totalDaysDelayed / count;
    });

    setDelayStats(promedioPorMes);
  };

  const getEstadoClass = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
      case 'EN_CURSO':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETADO':
      case 'FINALIZADO':
        return 'bg-green-100 text-green-800';
      case 'RETRASADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center py-8">Cargando...</div>;
  if (error) return <div className="text-red-600 py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Préstamos</h1>
        <Link to="/loans/new" className="btn-primary">
          <Plus className="mr-1" /> Nuevo Préstamo
        </Link>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded shadow">
        <h2 className="font-semibold mb-2">Promedio de días de retraso por mes</h2>
        {Object.keys(delayStats).length === 0 ? (
          <p>No hay registros de retrasos.</p>
        ) : (
          <ul>
            {Object.entries(delayStats).map(([mes, promedio]) => (
              <li key={mes}>
                <strong>{mes}:</strong> {promedio.toFixed(0)} días
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6 p-4 bg-purple-50 rounded shadow">
        <h2 className="font-semibold mb-2">Conteo de retrasos por mes</h2>
        {conteoRetrasosPorMes.length === 0 ? (
          <p>No hay retrasos registrados.</p>
        ) : (
          <ul>
            {conteoRetrasosPorMes.map((item, index) => (
              <li key={index}>
                <strong>{`${item.mes}/${item.año}`}:</strong> {item.conteoRetrasos} retrasos
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Préstamo</th>
              <th className="px-6 py-3 text-left">Fecha Préstamo</th>
              <th className="px-6 py-3 text-left">Fecha Devolución</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">ID: {loan.id}</td>
                <td className="px-6 py-4">
                  {new Date(loan.fechaPrestamo + 'T00:00:00').toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4">
                  {loan.fechaDevolucionReal
                    ? new Date(loan.fechaDevolucionReal + 'T00:00:00').toLocaleDateString('es-ES')
                    : new Date(loan.fechaDevolucionEsperada + 'T00:00:00').toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getEstadoClass(loan.estado)}`}>
                    {loan.estado}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <Link to={`/loans/edit/${loan.id}`} className="text-blue-600 hover:underline">
                    Editar
                  </Link>
                  <Link to={`/loans/${loan.id}`} className="text-gray-600 hover:underline">
                    Detalles
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanList;
