const whatsappService = require('../services/whatsappService');
const Account = require('../models/Account');
// Iniciar sesión y mostrar QR
const startSession = async (req, res) => {
  const { accountId } = req.body;

  try {
    await whatsappService.startSession(accountId);
    res
      .status(200)
      .json({ success: true, message: 'QR generated. Please scan it to authenticate.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enviar mensaje
const sendMessage = async (req, res) => {
  const { accountId, phoneNumber, message } = req.body;

  try {
    await whatsappService.sendMessage(accountId, phoneNumber, message);
    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  const { name, phoneNumber } = req.body;

  try {
    let account = await Account.findOne({ phoneNumber });

    if (account) {
      console.log(`Usuario ${phoneNumber} ya registrado.`);
      // Si ya está registrado, inicializamos el cliente y devolvemos el QR
      const qr = await whatsappService.initializeClient(account._id.toString());
      return res
        .status(200)
        .json({ success: true, message: 'Usuario ya registrado. Escanea el QR.', qr });
    }

    account = new Account({ name, phoneNumber });
    await account.save();

    const qr = await whatsappService.initializeClient(account._id.toString());
    res.status(201).json({ success: true, message: 'Usuario registrado correctamente.', qr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startSession, sendMessage, registerUser };
