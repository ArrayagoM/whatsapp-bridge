const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Account = require('../models/Account');
const fs = require('fs');
const path = require('path');

const clients = new Map();

// Función para inicializar un cliente de WhatsApp
const initializeClient = async (accountId) => {
  const sessionPath = path.join(__dirname, '..', 'temp', `${accountId}.json`);

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: accountId,
      dataPath: path.join(__dirname, '..', 'temp'),
    }),
    puppeteer: { headless: true },
  });

  clients.set(accountId, client);

  client.on('qr', (qr) => {
    console.log(`QR para la cuenta ${accountId}:`);
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log(`Cliente ${accountId} está listo!`);
  });

  client.on('disconnected', (reason) => {
    console.log(`Cliente ${accountId} desconectado. Razón: ${reason}`);
    clients.delete(accountId);
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
    }
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
