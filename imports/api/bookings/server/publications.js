import { Meteor } from 'meteor/meteor';
import { Bookings } from '../bookings';

Meteor.publish('bookings.user', function () {
  if (!this.userId) return this.ready();

  return Bookings.find(
    {
      userId: this.userId,
      status: { $ne: 'cancelled' },
    },
    {
      sort: { date: -1, time: -1 },
    }
  );
});

Meteor.publish('bookings.admin', async function () {
  if (!this.userId) {
    console.log('No user ID for admin bookings');
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId, {
    fields: {
      'profile.isAdmin': 1,
      'emails.address': 1,
    },
  });

  // Verificação segura com fallback
  const isAdmin = user?.profile?.isAdmin ?? false;
  const email = user?.emails?.[0]?.address ?? 'unknown';

  console.log(`Admin check for ${email}:`, isAdmin);

  if (!isAdmin) {
    console.log(`Access denied for user ${this.userId} (${email})`);
    return this.ready();
  }

  console.log(`Admin access granted for ${email}`);
  return Bookings.find({}, { sort: { createdAt: -1 } });
});
