import { Meteor } from 'meteor/meteor';
import { Services } from '../services';

Meteor.publish('services', function () {
  return Services.find({}, { sort: { name: 1 } });
});
