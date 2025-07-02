import SimpleSchema from 'simpl-schema';

export const BookingSchema = new SimpleSchema({
  note: {
    type: String,
    optional: true,
    max: 500,
  },
  userId: {
    type: String,
    label: 'ID do Usuário',
  },
  name: {
    type: String,
    label: 'Nome do Cliente',
  },
  serviceId: {
    type: String,
    label: 'ID do Serviço',
  },
  date: {
    type: String,
    label: 'Data da Reserva (ISO)',
  },
  time: {
    type: String,
    label: 'Horário da Reserva',
  },
  status: {
    type: String,
    allowedValues: ['confirmed', 'pending', 'cancelled'],
    defaultValue: 'confirmed',
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) return new Date();
    },
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isUpdate) return new Date();
    },
  },
  cancelledAt: {
    type: Date,
    optional: true,
  },
  cancelledBy: {
    type: String,
    optional: true,
  },
});

Bookings.attachSchema(BookingSchema);
