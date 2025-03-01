const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Account = require('../models/Account');
const Session = require('../models/Session');

const clients = new Map();

// Función para guardar la sesión en MongoDB
const saveSession = async (accountId, session) => {
  await Session.findOneAndUpdate({ accountId }, { session }, { upsert: true, new: true });
};

// Función para cargar la sesión desde MongoDB
const loadSession = async (accountId) => {
  const sessionData = await Session.findOne({ accountId });
  return sessionData ? sessionData.session : null;
};

// Función para inicializar un cliente de WhatsApp
const initializeClient = async (accountId) => {
  const session = await loadSession(accountId);

  const client = new Client({
    session: session,
    puppeteer: { headless: true },
  });

  clients.set(accountId, client);

  client.on('qr', (qr) => {
    console.log(`QR para la cuenta ${accountId}:`);
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log(`Cliente ${accountId} está listo!`);
    // Guardar la sesión en MongoDB
    await saveSession(accountId, client.session);
  });

  client.on('disconnected', async (reason) => {
    console.log(`Cliente ${accountId} desconectado. Razón: ${reason}`);
    clients.delete(accountId);
    // Eliminar la sesión de MongoDB
    await Session.deleteOne({ accountId });
  });

  await client.initialize();
};

// Función para inicializar todas las cuentas
const initializeAllClients = async () => {
  const accounts = await Account.find({});
  accounts.forEach((account) => {
    initializeClient(account._id.toString());
  });
};

// Función para enviar un mensaje
const sendMessage = async (accountId, phoneNumber, message) => {
  const client = clients.get(accountId);

  if (!client) {
    throw new Error(`Cliente ${accountId} no está inicializado.`);
  }

  const chatId = `${phoneNumber}@c.us`;
  await client.sendMessage(chatId, message);
};

module.exports = { initializeAllClients, sendMessage, initializeClient };
