const qrcode = require('qrcode-terminal');

const generateQR = (qr) => {
    qrcode.generate(qr, { small: true });
};

module.exports = { generateQR };