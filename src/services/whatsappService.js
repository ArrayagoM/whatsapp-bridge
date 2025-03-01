const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Account = require('../models/Account');
const Session = require('../models/Session');

const puppeteer =
  process.env.NODE_ENV === 'production' ? require('puppeteer-core') : require('puppeteer');
const chromium = process.env.NODE_ENV === 'production' ? require('@sparticuz/chromium') : null;

const clients = new Map();

// Configurar la ruta de Chromium
const getChromiumPath = async () => {
  if (process.env.NODE_ENV === 'production') {
    return await chromium.executablePath();
  } else {
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

// Función para inicializar un cliente de WhatsApp y devolver el QR
const initializeClient = async (accountId) => {
  const session = await loadSession(accountId);

  return new Promise(async (resolve, reject) => {
    const client = new Client({
      session: session,
      puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: process.env.NODE_ENV === 'production' ? chromium.args : [],
      },
    });

    clients.set(accountId, client);

    let qrResolved = false;
    client.on('qr', (qr) => {
      console.log(`QR para la cuenta ${accountId}: ${qr}`);
      qrcode.generate(qr, { small: true });
      if (!qrResolved) {
        qrResolved = true;
        resolve(qr);
      }
    });

    client.on('ready', async () => {
      console.log(`Cliente ${accountId} está listo!`);
      await saveSession(accountId, client.session);
      if (!qrResolved) {
        console.log(`No se emitió QR, pero la sesión ya está activa.`);
        qrResolved = true;
        resolve('Cliente ya autenticado, no se generó nuevo QR.');
      }
    });

    client.on('disconnected', async (reason) => {
      console.log(`Cliente ${accountId} desconectado. Razón: ${reason}`);
      clients.delete(accountId);
      await Session.deleteOne({ accountId });
    });

    client.on('disconnected', (reason) => {
      console.log('Cliente desconectado:', reason);
      client.destroy();
    });

    try {
      await client.initialize();
    } catch (error) {
      reject(error);
    }
  });
};

// Función para inicializar todas las cuentas (al arrancar la app)
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
