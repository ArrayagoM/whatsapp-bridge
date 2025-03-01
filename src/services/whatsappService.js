const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Account = require('../models/Account');
const Session = require('../models/Session');

// Usar puppeteer-core en producción y puppeteer en desarrollo
const puppeteer =
  process.env.NODE_ENV === 'production' ? require('puppeteer-core') : require('puppeteer');

const chromium = process.env.NODE_ENV === 'production' ? require('@sparticuz/chromium') : null;

const clients = new Map();

// Configurar la ruta de Chromium
const getChromiumPath = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Ruta de Chromium en Vercel
    return await chromium.executablePath();
  } else {
    // Ruta de Chromium descargada por puppeteer en desarrollo
    return puppeteer.executablePath();
  }
};

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

  if (session) {
    console.log(`Cargando sesión existente para ${accountId}`);
    return; // Si ya hay sesión, no hace falta mostrar QR
  }

  return new Promise(async (resolve, reject) => {
    const client = new Client({
      session,
      puppeteer: {
        headless: true,
        executablePath: await getChromiumPath(),
        args: process.env.NODE_ENV === 'production' ? chromium.args : [],
      },
    });

    clients.set(accountId, client);

    client.on('qr', (qr) => {
      console.log(`QR generado para ${accountId}`);
      resolve(qr);
    });

    client.on('ready', async () => {
      console.log(`Cliente ${accountId} está listo!`);
      await saveSession(accountId, client.session);
    });

    client.on('disconnected', async (reason) => {
      console.log(`Cliente ${accountId} desconectado. Razón: ${reason}`);
      clients.delete(accountId);
      await Session.deleteOne({ accountId });
    });

    try {
      await client.initialize();
    } catch (error) {
      reject(error);
    }
  });
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
