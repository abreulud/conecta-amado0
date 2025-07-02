import SimpleSchema from 'simpl-schema';

export const ServiceSchema = new SimpleSchema({
  serviceId: {
    type: String,
    label: 'Id do Serviço',
  },
  name: {
    type: String,
    label: 'Nome do Serviço',
  },
  startTime: {
    type: String,
    label: 'Horário de Início',
    regEx: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    label: 'Horário de Término',
    regEx: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  allowedWeekdays: {
    type: Array,
    label: 'Dias Permitidos',
    minCount: 1,
  },
  'allowedWeekdays.$': {
    type: SimpleSchema.Integer,
    allowedValues: [0, 1, 2, 3, 4, 5, 6],
  },
  category: {
    type: String,
    label: 'Categoria',
    allowedValues: ['medical', 'exam', 'therapy', 'other'],
    defaultValue: 'other',
  },
  price: {
    type: Number,
    label: 'Preço (R$)',
    min: 0,
    optional: true,
  },
});
