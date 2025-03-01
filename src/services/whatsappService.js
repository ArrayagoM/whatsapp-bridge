const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const Account = require('../models/Account');
const Session = require('../models/Session');
const path = require('path');
const fs = require('fs');

const clients = new Map();

// Función para inicializar un cliente de WhatsApp
const initializeClient = async (accountId) => {
  const sessionPath = path.join(__dirname, '..', 'sessions', accountId);

  // Crear la carpeta de sesión si no existe
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  // Cargar el estado de autenticación
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const client = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  clients.set(accountId, client);

  // Escuchar el evento de QR
  client.ev.on('connection.update', (update) => {
    const { qr } = update;
    if (qr) {
      console.log(`QR para la cuenta ${accountId}:`);
      qrcode.generate(qr, { small: true });
    }
  });

  // Escuchar el evento de autenticación exitosa
  client.ev.on('creds.update', saveCreds);

  // Escuchar el evento de conexión
  client.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') {
      console.log(`Cliente ${accountId} está listo!`);
    } else if (connection === 'close') {
      console.log(`Cliente ${accountId} desconectado.`);
      clients.delete(accountId);
    }
  });

  return client;
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

  const chatId = `${phoneNumber}@s.whatsapp.net`;
  await client.sendMessage(chatId, { text: message });
};

module.exports = { initializeAllClients, sendMessage, initializeClient };
