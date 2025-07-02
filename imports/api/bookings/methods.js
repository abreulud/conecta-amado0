// imports/api/bookings/methods.js
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Bookings } from './bookings';
import { Services } from '../services/services';

Meteor.methods({
  async 'bookings.insert'(bookingData) {
    check(bookingData, {
      name: String,
      serviceId: String,
      date: String,
      time: String,
      note: Match.Optional(String),
      userId: String,
    });

    const { name, serviceId, date, time, note, userId } = bookingData;

    // Verificar autenticação
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
    }

    // Verificar correspondência de usuário
    if (userId !== this.userId) {
      throw new Meteor.Error('forbidden', 'Permissão negada');
    }

    try {
      // Verificar existência do serviço (assíncrono)
      const service = await Services.findOneAsync(serviceId);
      if (!service) {
        throw new Meteor.Error('not-found', 'Serviço não encontrado');
      }

      // Verificar conflito de horário (assíncrono)
      const existingBooking = await Bookings.findOneAsync({
        date,
        time,
        serviceId,
        status: { $ne: 'cancelled' }, // Ignorar cancelados
      });

      if (existingBooking) {
        throw new Meteor.Error(
          'time-conflict',
          'Este horário já está reservado'
        );
      }

      // Inserir reserva (assíncrono)
      const bookingId = await Bookings.insertAsync({
        name,
        serviceId,
        date,
        time,
        note: note || '',
        userId,
        createdAt: new Date(),
        status: 'confirmed',
      });

      return bookingId;
    } catch (error) {
      console.error('Erro ao inserir reserva:', error);
      throw new Meteor.Error(
        error.error || 'insert-failed',
        error.reason || 'Falha ao criar o agendamento',
        error.details
      );
    }
  },

  async 'bookings.cancel'(bookingId) {
    check(bookingId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Acesso não autorizado');
    }

    try {
      // Buscar reserva (assíncrono)
      const booking = await Bookings.findOneAsync(bookingId);
      if (!booking) {
        throw new Meteor.Error('not-found', 'Reserva não encontrada');
      }

      // Verificar permissões
      const isAdmin = Meteor.user().profile?.isAdmin;
      if (booking.userId !== this.userId && !isAdmin) {
        throw new Meteor.Error('forbidden', 'Permissão negada para esta ação');
      }

      // Verificar status
      if (booking.status === 'cancelled') {
        throw new Meteor.Error('invalid-status', 'Reserva já cancelada');
      }

      // Atualizar reserva (assíncrono)
      await Bookings.updateAsync(bookingId, {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: this.userId,
        },
      });
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      throw new Meteor.Error(
        error.error || 'cancel-failed',
        error.reason || 'Falha ao cancelar a reserva'
      );
    }
  },

  async 'bookings.updateStatus'({ bookingId, status }) {
    check(bookingId, String);
    check(status, String);

    try {
      // Verificar permissões de admin
      if (!this.userId || !Meteor.user().profile?.isAdmin) {
        throw new Meteor.Error(
          'not-authorized',
          'Acesso restrito a administradores'
        );
      }

      // Validar status
      const validStatuses = ['confirmed', 'pending', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Meteor.Error('invalid-status', 'Status inválido');
      }

      // Buscar reserva (assíncrono)
      const booking = await Bookings.findOneAsync(bookingId);
      if (!booking) {
        throw new Meteor.Error('not-found', 'Reserva não encontrada');
      }

      // Preparar atualização
      const updateData = { $set: { status } };

      // Adicionar dados de cancelamento se necessário
      if (status === 'cancelled') {
        updateData.$set.cancelledAt = new Date();
        updateData.$set.cancelledBy = this.userId;
      }

      // Executar atualização (assíncrono)
      await Bookings.updateAsync(bookingId, updateData);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw new Meteor.Error(
        error.error || 'update-failed',
        error.reason || 'Falha ao atualizar o status'
      );
    }
  },

  async 'bookings.getUserBookings'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
    }

    try {
      // Buscar reservas (assíncrono)
      return await Bookings.find(
        { userId: this.userId },
        { sort: { date: -1 } }
      ).fetchAsync();
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      throw new Meteor.Error(
        'fetch-failed',
        'Falha ao buscar reservas do usuário'
      );
    }
  },

  async 'bookings.getBookingDetails'(bookingId) {
    check(bookingId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Acesso não autorizado');
    }

    try {
      // Buscar reserva com detalhes (assíncrono)
      const booking = await Bookings.findOneAsync(bookingId);

      if (!booking) {
        throw new Meteor.Error('not-found', 'Reserva não encontrada');
      }

      // Verificar permissão
      const isAdmin = Meteor.user().profile?.isAdmin;
      if (booking.userId !== this.userId && !isAdmin) {
        throw new Meteor.Error('forbidden', 'Permissão negada');
      }

      return booking;
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      throw new Meteor.Error(
        error.error || 'fetch-failed',
        error.reason || 'Falha ao buscar detalhes da reserva'
      );
    }
  },
});
