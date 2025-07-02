// server/main.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ServiceConfiguration } from 'meteor/service-configuration';
import '../imports/api/bookings/server/publications.js';
import '../imports/api/bookings/methods.js';
import '../imports/api/services/server/publications.js';
import '../imports/api/services/methods.js';
import { Bookings } from '../imports/api/bookings/bookings';
import { Services } from '../imports/api/services/services';

// ========================
// Configuração de Segurança
// ========================

// Configuração de e-mail
if (Meteor.settings.MAIL_URL) {
  process.env.MAIL_URL = Meteor.settings.MAIL_URL;
} else if (Meteor.isDevelopment) {
  // Configuração para desenvolvimento (Mailtrap ou similar)
  process.env.MAIL_URL = 'smtp://username:password@smtp.mailtrap.io:2525';
}

Accounts.config({
  sendVerificationEmail: false, // Enviar e-mail de verificação
  forbidClientAccountCreation: false,
});

// Configuração de provedores OAuth (se necessário)
if (Meteor.settings.OAuth) {
  ServiceConfiguration.configurations.upsert(
    { service: 'google' },
    {
      $set: {
        clientId: Meteor.settings.google.clientId,
        secret: Meteor.settings.google.secret,
        loginStyle: 'popup',
      },
    }
  );
}

// ========================
// Templates de E-mail
// ========================

Accounts.emailTemplates.siteName = 'ConectaAmado';
Accounts.emailTemplates.from = 'Reservas <no-reply@conectaamado.com>';

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return 'Verifique seu endereço de e-mail';
  },
  text(user, url) {
    return `Olá ${user.profile.name},\n\nPor favor, verifique seu e-mail clicando no link: ${url}\n\nObrigado!`;
  },
};

Accounts.emailTemplates.resetPassword = {
  subject() {
    return 'Redefina sua senha';
  },
  text(user, url) {
    return `Olá ${user.profile.name},\n\nPara redefinir sua senha, clique no link: ${url}\n\nSe você não solicitou isso, ignore este e-mail.`;
  },
};

Accounts.emailTemplates.enrollAccount = {
  subject() {
    return 'Bem-vindo ao Sistema de Reservas';
  },
  text(user, url) {
    return `Olá ${user.profile.name},\n\nVocê foi convidado a usar nosso sistema. Para ativar sua conta, clique no link: ${url}`;
  },
};

// ========================
// Hooks de Usuário
// ========================

Accounts.onCreateUser((options, user) => {
  // Garantir que o perfil existe
  const userProfile = options.profile || {};

  // Definir campos padrão
  return {
    ...user,
    profile: {
      name: userProfile.name || '',
      isAdmin: userProfile.isAdmin || false,
      isVerified: false, // Será verificado por e-mail
      createdAt: new Date(),
      ...userProfile, // Preserva campos extras
    },
    // Adicionar e-mails se não existirem
    emails: user.emails || [{ address: options.email, verified: false }],
  };
});
/*
// Verificar e-mail após verificação
Accounts.onEmailVerificationLink((token, done) => {
  Accounts.verifyEmail(token, error => {
    if (!error) {
      const userId = Meteor.userId();
      Meteor.users.update(userId, {
        $set: { 'profile.isVerified': true },
      });
    }
    done();
  });
});
*/
// ========================
// Funções de Inicialização
// ========================

async function createMockAdminUser() {
  try {
    const adminEmail = Meteor.settings.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = Meteor.settings.ADMIN_PASSWORD || 'tempPassword123';

    // Verifica se o usuário admin já existe
    let adminUser = await Meteor.users.findOneAsync({
      'emails.address': adminEmail,
    });

    if (!adminUser) {
      // Cria o usuário admin
      const userId = await Accounts.createUserAsync({
        email: adminEmail,
        password: adminPassword,
      });

      // Atualiza o perfil diretamente na coleção de usuários
      await Meteor.users.updateAsync(userId, {
        $set: {
          profile: {
            name: 'Admin',
            isAdmin: true,
            isVerified: true,
            createdAt: new Date(),
          },
          'emails.0.verified': true,
        },
      });

      console.log(`✅ Admin user created: ${adminEmail}`);
      adminUser = await Meteor.users.findOneAsync(userId);
    }

    // Garante que o usuário existente tenha a flag de admin
    if (adminUser && (!adminUser.profile || !adminUser.profile.isAdmin)) {
      await Meteor.users.updateAsync(adminUser._id, {
        $set: {
          'profile.isAdmin': true,
        },
      });
      console.log(`🛠️ Updated user ${adminEmail} to admin`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

async function seedInitialServices() {
  try {
    const count = await Services.find().countAsync();

    if (count === 0) {
      const initialServices = [
        { name: 'Corte de Cabelo', duration: 30, price: 50 },
        { name: 'Manicure', duration: 45, price: 35 },
        { name: 'Massagem', duration: 60, price: 80 },
      ];

      await Promise.all(
        initialServices.map(service => Services.insertAsync(service))
      );

      console.log('✅ Initial services seeded');
    }
  } catch (error) {
    console.error('Error seeding services:', error);
  }
}

async function migrateBookingStatus() {
  try {
    // Atualizar reservas antigas sem status
    const result = await Bookings.updateAsync(
      { status: { $exists: false } },
      { $set: { status: 'confirmed' } },
      { multi: true }
    );

    if (result > 0) {
      console.log(`✅ Migrated ${result} bookings to have status`);
    }
  } catch (error) {
    console.error('Booking migration error:', error);
  }
}

// ========================
// Inicialização do Servidor
// ========================

Meteor.startup(async () => {
  // Configurar zona de tempo padrão
  process.env.TZ = 'America/Sao_Paulo';

  // Inicialização do banco de dados
  await createMockAdminUser();
  //await seedInitialServices();
  await migrateBookingStatus();

  // Configurações de segurança adicionais
  Meteor.users.deny({
    update() {
      return true;
    }, // Usar métodos para atualizações
  });

  // Logging de conexões em desenvolvimento
  if (Meteor.isDevelopment) {
    Meteor.onConnection(connection => {
      console.log(`New connection: ${connection.id}`);

      connection.onClose(() => {
        console.log(`Connection closed: ${connection.id}`);
      });
    });
  }

  // Health check endpoint
  WebApp.connectHandlers.use('/health', (req, res) => {
    res.writeHead(200);
    res.end('OK');
  });

  console.log('🚀 Server started successfully');
});
