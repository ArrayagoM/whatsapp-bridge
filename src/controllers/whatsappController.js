const whatsappService = require('../services/whatsappService');
const Account = require('../models/Account');
const Session = require('../models/Session');

// Iniciar sesión y mostrar QR
const startSession = async (req, res) => {
  const { accountId } = req.body;

  try {
    const qr = await whatsappService.initializeClient(accountId);
    res.status(200).json({ success: true, qr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enviar mensaje
const sendMessage = async (req, res) => {
  const { accountId, phoneNumber, message } = req.body;

  try {
    await whatsappService.sendMessage(accountId, phoneNumber, message);
    res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Registrar usuario
const registerUser = async (req, res) => {
  const { name, phoneNumber } = req.body;

  try {
    let account = await Account.findOne({ phoneNumber });
    if (!account) {
      account = new Account({ name, phoneNumber });
      await account.save();
    }
    const qr = await whatsappService.initializeClient(account._id.toString());
    res.status(200).json({ success: true, qr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startSession, sendMessage, registerUser };
