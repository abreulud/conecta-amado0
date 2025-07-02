// imports/ui/components/pages/BookingPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar } from '../scheduling/Calendar';
import { Navbar } from '../scheduling/Navbar';
import { useTracker } from 'meteor/react-meteor-data';
import { Services } from '../../../api/services/services';
import { Bookings } from '../../../api/bookings/bookings';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Helper functions
const timeToMinutes = time => {
  const [timePart, modifier] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const minutesToTimeString = minutes => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const generateTimeSlots = (start, end, duration = 30) => {
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);
  const slots = [];

  for (let mins = startMins; mins <= endMins - duration; mins += duration) {
    slots.push(minutesToTimeString(mins));
  }

  return slots;
};

export const BookingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: service, 2: date, 3: time, 4: confirm
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [userNote, setUserNote] = useState('');

  const currentUser = useTracker(() => Meteor.user());
  const userName = currentUser?.profile?.name || currentUser?.username || '';

  // Carregar serviços
  const services = useTracker(() => {
    const sub = Meteor.subscribe('services');
    return sub.ready() ? Services.find().fetch() : [];
  }, []);

  // Carregar reservas para o mês atual
  const bookings = useTracker(() => {
    if (!calendarMonth) return [];

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const sub = Meteor.subscribe('bookings.month', year, month);

    return sub.ready()
      ? Bookings.find({
          date: {
            $gte: new Date(year, month, 1).toISOString().slice(0, 10),
            $lt: new Date(year, month + 1, 1).toISOString().slice(0, 10),
          },
          status: { $ne: 'cancelled' }, // Ignorar reservas canceladas
        }).fetch()
      : [];
  }, [calendarMonth]);

  // Serviço selecionado
  const selectedService = useMemo(
    () => services.find(s => s._id === selectedServiceId),
    [selectedServiceId, services]
  );

  // Dias permitidos para o serviço
  const allowedWeekdays = useMemo(() => {
    if (!selectedService?.allowedWeekdays) return [0, 1, 2, 3, 4, 5, 6];
    return selectedService.allowedWeekdays;
  }, [selectedService]);

  // Reservas para a data selecionada
  const bookingsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const formatted = selectedDate.toISOString().slice(0, 10);
    return bookings.filter(b => b.date === formatted);
  }, [bookings, selectedDate]);

  // Horários já reservados
  const bookedTimes = useMemo(
    () => bookingsForSelectedDate.map(b => b.time),
    [bookingsForSelectedDate]
  );

  // Gerar slots disponíveis
  const timeSlots = useMemo(() => {
    if (!selectedService) return [];

    const {
      startTime = '09:00 AM',
      endTime = '06:00 PM',
      duration = 30,
    } = selectedService;
    return generateTimeSlots(startTime, endTime, duration).filter(
      slot => !bookedTimes.includes(slot)
    );
  }, [selectedService, bookedTimes]);

  // Dias totalmente reservados
  const fullyBookedDates = useMemo(() => {
    if (!selectedService) return [];

    const {
      startTime = '09:00 AM',
      endTime = '06:00 PM',
      duration = 30,
    } = selectedService;
    const slotsPerDay = generateTimeSlots(startTime, endTime, duration).length;
    const countsByDate = {};

    bookings.forEach(booking => {
      if (!countsByDate[booking.date]) countsByDate[booking.date] = 0;
      countsByDate[booking.date]++;
    });

    return Object.entries(countsByDate)
      .filter(([_, count]) => count >= slotsPerDay)
      .map(([date]) => date);
  }, [bookings, selectedService]);

  // Avançar para o próximo passo
  const goToNextStep = () => {
    if (bookingStep === 1 && !selectedServiceId) {
      toast.error('Selecione um serviço para continuar');
      return;
    }
    if (bookingStep === 2 && !selectedDate) {
      toast.error('Selecione uma data para continuar');
      return;
    }
    if (bookingStep === 3 && !selectedTime) {
      toast.error('Selecione um horário para continuar');
      return;
    }

    setBookingStep(prev => Math.min(prev + 1, 4));
  };

  // Voltar para o passo anterior
  const goToPrevStep = () => {
    setBookingStep(prev => Math.max(prev - 1, 1));
  };

  // Realizar o agendamento
  const handleSchedule = async () => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para agendar');
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      const formattedDate = selectedDate.toISOString().slice(0, 10);

      await Meteor.callAsync('bookings.insert', {
        name: userName,
        serviceId: selectedServiceId,
        date: formattedDate,
        time: selectedTime,
        note: userNote,
        userId: currentUser._id,
      });

      toast.success('Agendamento realizado com sucesso!');

      // Redirecionar para página de confirmação
      navigate('/booking-confirmation', {
        state: {
          service: selectedService.name,
          date: formattedDate,
          time: selectedTime,
          note: userNote,
        },
      });
    } catch (error) {
      console.error('Erro completo:', error);

      let errorMessage = 'Erro ao agendar';
      if (error.details) {
        errorMessage += `: ${error.details}`;
      } else if (error.reason) {
        errorMessage += `: ${error.reason}`;
      } else {
        errorMessage += '. Por favor tente novamente.';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resetar seleção quando o serviço mudar
  useEffect(() => {
    if (selectedServiceId) {
      setSelectedDate(null);
      setSelectedTime('');
    }
  }, [selectedServiceId]);

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 flex z-0">
        <div className="w-1/2 bg-blue"></div>
        <div className="w-1/2 bg-white"></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          <Navbar username={userName} />
        </div>

        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col items-center justify-center">
                <div className="max-w-lg w-full">
                  <h2 className="text-2xl font-yeseva text-white mb-6 text-center">
                    Agende seu horário
                  </h2>

                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Calendar
                      onChangeDate={date => {
                        setSelectedDate(date);
                        setBookingStep(3);
                      }}
                      selectedDate={selectedDate}
                      onMonthChange={setCalendarMonth}
                      fullyBookedDates={fullyBookedDates}
                      allowedWeekdays={allowedWeekdays}
                      highlightSelection={bookingStep >= 2}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-8">
                {/* Passo 1: Seleção de Serviço */}
                {bookingStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-montserrat font-semibold mb-6 text-center">
                      Escolha o serviço
                    </h2>

                    <div className="grid grid-cols-1 gap-4 mb-8">
                      {services.map(service => (
                        <button
                          key={service._id}
                          className={`p-4 border rounded-lg text-left transition-all ${
                            selectedServiceId === service._id
                              ? 'border-blue bg-light-blue shadow-md'
                              : 'border-gray-300 hover:border-blue'
                          }`}
                          onClick={() => {
                            setSelectedServiceId(service._id);
                            goToNextStep();
                          }}
                        >
                          <h3 className="font-medium font-montserrat">
                            {service.name}
                          </h3>
                          {service.duration && (
                            <p className="text-sm text-gray-600 mt-1 font-montserrat">
                              Duração: {service.duration} min
                            </p>
                          )}
                          {service.price && (
                            <p className="text-sm text-gray-600 font-montserrat">
                              Preço: R$ {service.price.toFixed(2)}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passo 2: Seleção de Data */}
                {bookingStep === 2 && (
                  <div className="flex-1">
                    <div className="flex items-center mb-6">
                      <button
                        onClick={goToPrevStep}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                      >
                        &larr;
                      </button>
                      <h2 className="text-xl font-semibold">
                        Selecione a data
                      </h2>
                    </div>

                    <div className="mb-8">
                      <p className="text-gray-600 mb-2">
                        Serviço selecionado:
                        <span className="font-semibold ml-2">
                          {selectedService?.name}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedService?.description || 'Sem descrição'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
                      <p className="text-center text-gray-600">
                        Selecione uma data no calendário ao lado
                      </p>
                    </div>

                    <button
                      onClick={goToNextStep}
                      disabled={!selectedDate}
                      className={`w-full py-3 rounded-lg ${
                        selectedDate
                          ? 'bg-blue text-white hover:bg-dark-blue'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {selectedDate
                        ? 'Continuar para horários'
                        : 'Selecione uma data'}
                    </button>
                  </div>
                )}

                {/* Passo 3: Seleção de Horário */}
                {bookingStep === 3 && (
                  <div className="flex-1">
                    <div className="flex items-center mb-6">
                      <button
                        onClick={goToPrevStep}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                      >
                        &larr;
                      </button>
                      <h2 className="text-xl font-semibold">
                        Escolha o horário
                      </h2>
                    </div>

                    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium">
                        {selectedService?.name} -{' '}
                        {selectedDate?.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>

                    <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                      {timeSlots.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500 mb-4">
                            {selectedDate
                              ? 'Não há horários disponíveis para esta data'
                              : 'Selecione uma data primeiro'}
                          </p>
                          {selectedDate && (
                            <button
                              onClick={() => setSelectedDate(null)}
                              className="text-blue hover:underline"
                            >
                              Escolher outra data
                            </button>
                          )}
                        </div>
                      ) : (
                        timeSlots.map(time => (
                          <button
                            key={time}
                            className={`py-3 rounded-lg border transition-all ${
                              selectedTime === time
                                ? 'bg-blue text-white'
                                : 'border-gray-300 hover:border-blue'
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={goToPrevStep}
                        className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={goToNextStep}
                        disabled={!selectedTime}
                        className={`flex-1 py-3 rounded-lg ${
                          selectedTime
                            ? 'bg-blue text-white hover:bg-dark-blue'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                )}

                {/* Passo 4: Confirmação */}
                {bookingStep === 4 && (
                  <div className="flex-1">
                    <div className="flex items-center mb-6">
                      <button
                        onClick={goToPrevStep}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                      >
                        &larr;
                      </button>
                      <h2 className="text-xl font-semibold">
                        Confirme seu agendamento
                      </h2>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">
                            Serviço
                          </h3>
                          <p className="font-medium">{selectedService?.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">Data</h3>
                          <p className="font-medium">
                            {selectedDate?.toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">
                            Horário
                          </h3>
                          <p className="font-medium">{selectedTime}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">
                            Duração
                          </h3>
                          <p className="font-medium">
                            {selectedService?.duration || 30} minutos
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm text-gray-700 mb-2">
                          Observações (opcional)
                        </label>
                        <textarea
                          value={userNote}
                          onChange={e => setUserNote(e.target.value)}
                          placeholder="Alguma informação adicional que devemos saber?"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue focus:border-blue"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={goToPrevStep}
                        className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={handleSchedule}
                        disabled={isLoading}
                        className={`flex-1 p-3 rounded-lg ${
                          isLoading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue hover:bg-dark-blue'
                        } text-white`}
                      >
                        {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
