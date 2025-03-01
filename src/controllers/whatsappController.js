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
    // Verificar si el usuario ya está registrado
    let account = await Account.findOne({ phoneNumber });

    if (!account) {
      // Si no existe, lo creamos
      account = await Account.create({ name, phoneNumber });
    }

    // Iniciar sesión para generar QR (si es necesario)
    const qr = await whatsappService.initializeClient(account._id.toString());

    res.status(200).json({
      success: true,
      message: 'Registro exitoso',
      qr,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startSession, sendMessage, registerUser };
