require('dotenv').config();
const app = require('./src/app');
const os = require('os');
const fs = require('fs');
const path = require('path');
const tempDir = path.join(__dirname, 'temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
  console.log('Carpeta temporal creada:', tempDir);
}
const PORT = process.env.PORT || 5656;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return '127.0.0.1';
}

app.listen(PORT, () => {
  getLocalIP();
  console.log(`Server running on port ${PORT}`);
});
