const express = require('express');
const whatsappController = require('../controllers/whatsappController');

const router = express.Router();

router.post('/start-session', whatsappController.startSession);
router.post('/send-message', whatsappController.sendMessage);
router.post('/register', whatsappController.registerUser);

module.exports = router;
