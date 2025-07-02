import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Services } from './services';

console.log('methods.js loaded');

Meteor.methods({
  async 'services.insert'({
    name,
    startTime,
    endTime,
    allowedWeekdays,
    category,
    price,
  }) {
    check(name, String);
    check(startTime, String);
    check(endTime, String);
    check(allowedWeekdays, [Number]);
    check(category, String);
    check(price, Match.Maybe(Number));

    console.log('Calling services.insert with:', {
      name,
      startTime,
      endTime,
      allowedWeekdays,
      category,
      price,
    });

    if (!allowedWeekdays.length) {
      throw new Meteor.Error(
        'validation-error',
        'Deve selecionar pelo menos um dia permitido'
      );
    }

    try {
      const id = await Services.insertAsync({
        name,
        startTime,
        endTime,
        allowedWeekdays,
        category,
        price,
        createdAt: new Date(),
      });
      console.log(`Inserted new service with _id: ${id}`);
      return id;
    } catch (error) {
      console.error('Error inserting service:', error);
      throw new Meteor.Error('insert-failed', 'Falha ao inserir o serviço.');
    }
  },

  async 'services.update'({
    serviceId,
    name,
    startTime,
    endTime,
    allowedWeekdays,
    category,
    price,
  }) {
    check(serviceId, String);
    check(name, String);
    check(startTime, String);
    check(endTime, String);
    check(allowedWeekdays, [Number]);
    check(category, String);
    check(price, Match.Maybe(Number));

    console.log(`Calling services.update on id: ${serviceId} with`, {
      name,
      startTime,
      endTime,
      allowedWeekdays,
      category,
      price,
    });

    if (!allowedWeekdays.length) {
      throw new Meteor.Error(
        'validation-error',
        'Deve selecionar pelo menos um dia permitido'
      );
    }

    try {
      const updatedCount = await Services.updateAsync(serviceId, {
        $set: {
          name,
          startTime,
          endTime,
          allowedWeekdays,
          category,
          price,
          updatedAt: new Date(),
        },
      });
      if (updatedCount === 0) {
        throw new Meteor.Error(
          'not-found',
          'Serviço não encontrado para atualizar.'
        );
      }
      console.log(`Updated service ${serviceId} successfully.`);
      return updatedCount;
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Meteor.Error('update-failed', 'Falha ao atualizar o serviço.');
    }
  },

  async 'services.remove'(serviceId) {
    check(serviceId, String);
    console.log(`Calling services.remove with id: ${serviceId}`);

    try {
      const removedCount = await Services.removeAsync(serviceId);
      if (removedCount === 0) {
        throw new Meteor.Error(
          'not-found',
          'Serviço não encontrado para excluir.'
        );
      }
      console.log(`Removed service ${serviceId} successfully.`);
      return removedCount;
    } catch (error) {
      console.error('Error removing service:', error);
      throw new Meteor.Error(
        'delete-failed',
        'Não foi possível excluir o serviço.'
      );
    }
  },
});
