import React from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Services } from '../../api/services/services';

export const ServicesTable = ({ categoryFilter }) => {
  const { services, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('services');
    const allServices = Services.find({}, { sort: { name: 1 } }).fetch();

    const filteredServices =
      categoryFilter === 'all'
        ? allServices
        : allServices.filter(s => s.category === categoryFilter);

    return {
      services: filteredServices,
      isLoading: !handler.ready(),
    };
  });

  const formatWeekdays = weekdays => {
    if (!weekdays || weekdays.length === 0) return 'Todos os dias';

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return weekdays.map(d => dayNames[d]).join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-10">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Nenhum serviço cadastrado
        </h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-light-blue">
          <tr>
            <TableHeader>Serviço</TableHeader>
            <TableHeader>Duração</TableHeader>
            <TableHeader>Preço</TableHeader>
            <TableHeader>Horário</TableHeader>
            <TableHeader>Dias</TableHeader>
            <TableHeader className="text-center">Ações</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {services.map(service => (
            <TableRow
              key={service._id}
              service={service}
              formatWeekdays={formatWeekdays}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '' }) => (
  <th
    scope="col"
    className={`px-6 py-3 text-left text-xs font-medium text-dark-blue uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const TableRow = ({ service, formatWeekdays }) => (
  <tr className="hover:bg-light-blue transition-colors duration-150">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {service.name}
          </div>
          <div className="text-sm text-gray-500">
            {service.description || 'Sem descrição'}
          </div>
        </div>
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {service.duration || 30} minutos
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">
        {service.price ? `R$ ${service.price.toFixed(2)}` : 'A consultar'}
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {service.startTime || '09:00'} - {service.endTime || '18:00'}
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {formatWeekdays(service.allowedWeekdays)}
      </div>
    </td>

    <td className="px-6 py-4 whitespace-nowrap text-center">
      <Link
        to={`/book?serviceId=${service._id}`}
        className="px-3 py-1 bg-blue text-white rounded-md hover:bg-dark-blue text-sm"
      >
        Agendar
      </Link>
    </td>
  </tr>
);
