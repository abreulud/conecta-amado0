// imports/ui/components/pages/BookingConfirmation.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

export const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDetails = location.state || {};

  useEffect(() => {
    if (!bookingDetails.service) {
      navigate('/book');
    }
  }, [bookingDetails, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Agendamento Confirmado!
          </h1>
          <p className="text-gray-600">
            Seu agendamento foi realizado com sucesso. Detalhes abaixo:
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-gray-500">Serviço</p>
              <p className="font-medium">{bookingDetails.service || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Data e Horário</p>
              <p className="font-medium">
                {bookingDetails.date
                  ? new Date(bookingDetails.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })
                  : 'N/A'}{' '}
                às {bookingDetails.time || 'N/A'}
              </p>
            </div>

            {bookingDetails.note && (
              <div>
                <p className="text-sm text-gray-500">Observações</p>
                <p className="font-medium">{bookingDetails.note}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/my-bookings')}
            className="py-3 bg-blue text-white rounded-lg hover:bg-dark-blue"
          >
            Ver Minhas Reservas
          </button>
          <button
            onClick={() => navigate('/book')}
            className="py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Novo Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};
