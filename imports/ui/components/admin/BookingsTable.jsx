import React, { useMemo, useState } from 'react';

export const BookingsTable = ({
  bookings,
  services = [],
  loading,
  formatDate,
  showActions = false,
  showNote = false,
  onCancel,
  rowsPerPage = 4,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const enhancedBookings = useMemo(() => {
    return bookings.map(booking => {
      const service = services.find(s => s._id === booking.serviceId);
      return {
        ...booking,
        serviceName: service ? service.name : 'Serviço desconhecido',
        status: booking.status || 'confirmed',
      };
    });
  }, [bookings, services]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return enhancedBookings.slice(startIndex, startIndex + rowsPerPage);
  }, [enhancedBookings, currentPage]);

  const getStatusClass = status => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-light-red text-dark-red';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading)
    return <p className="py-6 text-center text-gray-500">Carregando...</p>;
  if (!bookings.length)
    return (
      <p className="py-6 text-center text-gray-500">
        Nenhuma reserva encontrada
      </p>
    );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      {/* Contêiner com altura fixa e scroll */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <TableHeader>Status</TableHeader>
            <TableHeader>Cliente</TableHeader>
            <TableHeader>Serviço</TableHeader>
            <TableHeader>Data</TableHeader>
            <TableHeader>Horário</TableHeader>
            {showNote && <TableHeader>Anotações</TableHeader>}
            {showActions && (
              <TableHeader className="text-right">Ações</TableHeader>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {paginatedBookings.map(booking => (
            <TableRow
              key={booking._id}
              booking={booking}
              formatDate={formatDate}
              getStatusClass={getStatusClass}
              showActions={showActions}
              showNote={showNote}
              onCancel={onCancel}
            />
          ))}
        </tbody>
      </table>

      {/* Controles de paginação */}
      {enhancedBookings.length > rowsPerPage && (
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando {Math.min(rowsPerPage, paginatedBookings.length)} de{' '}
            {enhancedBookings.length} reservas
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>
            <span className="px-3 py-1 bg-white border border-gray-300 rounded-md">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={
                currentPage >= Math.ceil(enhancedBookings.length / rowsPerPage)
              }
              className={`px-3 py-1 rounded-md ${
                currentPage >= Math.ceil(enhancedBookings.length / rowsPerPage)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para cabeçalhos
const TableHeader = ({ children, className = '' }) => (
  <th
    scope="col"
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

// Componente auxiliar para linhas
const TableRow = ({
  booking,
  formatDate,
  getStatusClass,
  showActions,
  showNote,
  onCancel,
}) => (
  <tr className="hover:bg-gray-50 transition-colors duration-150">
    {/* Coluna de Status */}
    <td className="px-6 py-4 whitespace-nowrap">
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.status)}`}
      >
        {booking.status === 'confirmed' && 'Confirmada'}
        {booking.status === 'pending' && 'Pendente'}
        {booking.status === 'cancelled' && 'Cancelada'}
      </span>
    </td>

    {/* Coluna de Cliente */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">{booking.name}</div>
      {booking.userId && (
        <div className="text-xs text-gray-500">
          ID: {booking.userId.slice(-6)}
        </div>
      )}
    </td>

    {/* Coluna de Serviço */}
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {booking.serviceName}
    </td>

    {/* Coluna de Data */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {formatDate ? formatDate(booking.date) : booking.date}
      </div>
    </td>

    {/* Coluna de Horário */}
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {booking.time}
    </td>

    {/* Coluna de Anotações */}
    {showNote && (
      <td className="px-6 py-4 whitespace-normal max-w-xs text-sm text-gray-500">
        {booking.note || 'Nenhuma'}
      </td>
    )}

    {/* Coluna de Ações */}
    {showActions && (
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {booking.status !== 'cancelled' && (
          <button
            onClick={() => onCancel && onCancel(booking._id)}
            className="text-red hover:text-dark-red"
          >
            Cancelar
          </button>
        )}
      </td>
    )}
  </tr>
);
