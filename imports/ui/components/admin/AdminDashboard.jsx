import React, { useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { AdminServiceManager } from './AdminServiceManager';
import { Bookings } from '../../../api/bookings/bookings';
import { Services } from '../../../api/services/services';
import { BookingsTable } from './BookingsTable';

export const AdminDashboard = () => {
  const user = useTracker(() => Meteor.user());
  const navigate = useNavigate();

  const isAdmin = user?.profile?.isAdmin;

  console.log('AdminDashboard user:', {
    id: user?._id,
    email: user?.emails?.[0]?.address,
    profile: user?.profile,
    isAdmin,
  });

  const { bookings, services, isLoading } = useTracker(() => {
    if (!isAdmin) return { bookings: [], services: [], isLoading: false };

    const subBookings = Meteor.subscribe('bookings.admin');
    const subServices = Meteor.subscribe('services');

    return {
      bookings: Bookings.find({}, { sort: { createdAt: -1 } }).fetch(),
      services: Services.find().fetch(),
      loading: !subBookings.ready() || !subServices.ready(),
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else if (!isAdmin) {
      toast.error('Acesso restrito a administradores');
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  const handleLogout = () => {
    Meteor.logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo,{' '}
                <span className="font-medium text-blue">
                  {user?.profile?.name}
                </span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Todas as Reservas
              </h2>
              {!isLoading && (
                <span className="bg-light-blue text-dark-blue text-xs px-2.5 py-0.5 rounded-full">
                  {bookings.length}{' '}
                  {bookings.length === 1 ? 'reserva' : 'reservas'}
                </span>
              )}
            </div>

            {isLoading ? (
              <p className="py-6 text-center text-gray-500">
                Carregando reservas...
              </p>
            ) : bookings.length === 0 ? (
              <p className="py-6 text-center text-gray-500">
                Nenhuma reserva encontrada
              </p>
            ) : (
              <BookingsTable
                bookings={bookings}
                services={services}
                showNote={true}
                formatDate={dateString =>
                  new Date(dateString).toLocaleDateString('pt-BR')
                }
              />
            )}
          </div>

          {/* Services Manager Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <AdminServiceManager />
          </div>
        </div>
      </div>
    </div>
  );
};
