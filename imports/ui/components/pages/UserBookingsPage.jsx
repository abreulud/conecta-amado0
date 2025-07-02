import React, { useEffect, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { BookingsTable } from '../admin/BookingsTable';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Bookings } from '../../../api/bookings/bookings';
import { Services } from '../../../api/services/services';

export const UserBookingsPage = () => {
  const navigate = useNavigate();
  const [initialLoad, setInitialLoad] = useState(true);
  const user = useTracker(() => Meteor.user());

  const { bookings, services, isLoading } = useTracker(() => {
    if (!user) return { bookings: [], services: [], isLoading: false };

    const bookingsHandler = Meteor.subscribe('bookings.user');
    const servicesHandler = Meteor.subscribe('services');

    return {
      bookings: Bookings.find(
        { userId: user._id },
        { sort: { date: -1, time: -1 } }
      ).fetch(),
      services: Services.find().fetch(),
      isLoading: !bookingsHandler.ready() || !servicesHandler.ready(),
    };
  }, [user]);

  useEffect(() => {
    if (initialLoad && user === null) {
      toast.error('Você precisa fazer login para ver suas reservas');
      navigate('/login');
      setInitialLoad(false);
    } else if (user) {
      setInitialLoad(false);
    }
  }, [user, navigate, initialLoad]);

  const handleCancelBooking = bookingId => {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      Meteor.call('bookings.cancel', bookingId, error => {
        if (error) {
          toast.error(`Erro ao cancelar: ${error.reason}`);
        } else {
          toast.success('Reserva cancelada com sucesso!');
        }
      });
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Minhas Reservas</h1>
          <button
            onClick={() => navigate('/book')}
            className="px-4 py-2 bg-blue text-white rounded-md hover:bg-dark-blue"
          >
            Nova Reserva
          </button>
        </div>

        {isLoading && initialLoad ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando suas reservas...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-gray-600 mb-4">Você ainda não tem reservas</p>
            <button
              onClick={() => navigate('/book')}
              className="px-4 py-2 bg-blue text-white rounded-md hover:bg-dark-blue"
            >
              Fazer uma reserva
            </button>
          </div>
        ) : (
          <BookingsTable
            rowsPerPage={15}
            bookings={bookings}
            services={services}
            showActions={true}
            formatDate={formatDate}
            onCancel={handleCancelBooking}
          />
        )}
      </div>
    </div>
  );
};
