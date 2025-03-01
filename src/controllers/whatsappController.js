const whatsappService = require('../services/whatsappService');

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
    const account = new Account({ name, phoneNumber });
    await account.save();

    await initializeClient(account._id.toString());
    res.status(200).json({ success: true, qr: 'QR generado. Escanea para autenticar.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startSession, sendMessage, registerUser };
