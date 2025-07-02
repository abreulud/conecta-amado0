import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ServicesTable } from '../ServicesTable';
import { Services } from '../../../api/services/services';
import { HomeNavbar } from '../HomeNavbar';

export const ServiceDisplayPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useTracker(() => {
    const uniqueCategories = Services.find(
      {},
      { fields: { category: 1 }, sort: { category: 1 } }
    )
      .fetch()
      .reduce((acc, service) => {
        if (service.category && !acc.some(c => c.id === service.category)) {
          acc.push({
            id: service.category,
            name: {
              medical: 'Consultas Médicas',
              exam: 'Exames',
              therapy: 'Terapias',
              other: 'Outros',
            }[service.category],
          });
        }
        return acc;
      }, []);

    return [{ id: 'all', name: 'Todos os Serviços' }, ...uniqueCategories];
  }, []);

  return (
    <div className="bg-blue">
      <nav className="max-w-screen-xl mx-auto">
        <HomeNavbar />
      </nav>
      <div className="min-h-screen bg-gradient-to-b bg-light-blue to-white">
        {/* Hero Section */}
        <div className="bg-blue text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Nossos Serviços
              </h1>
              <p className="mt-6 text-xl max-w-3xl mx-auto">
                Você merece cuidado que respeite sua identidade. Agende agora
                seu atendimento em um ambiente onde você pode ser quem realmente
                é.
              </p>
            </div>
          </div>
        </div>

        {/* Filtro de Categorias */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue text-white'
                    : 'bg-white text-blue border border-blue hover:bg-light-blue'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Serviços */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Serviços Disponíveis
              </h2>
              <p className="mt-1 text-gray-600">
                Selecione um serviço para ver disponibilidade e agendar
              </p>
            </div>

            <div className="p-4 md:p-6">
              <ServicesTable categoryFilter={selectedCategory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
