const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const whatsappRoutes = require('./routes/whatsappRoutes');
const { initializeAllClients } = require('./services/whatsappService');

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(async () => {
    console.log('Conectado a MongoDB');
    await initializeAllClients();
  })
  .then(() => console.log('🟢 Conectado a MongoDB'))
  .catch((err) => console.error('🔴 Error al conectar a MongoDB:', err));

app.use(express.static(path.join(__dirname, 'src', 'views')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use('/api/whatsapp', whatsappRoutes);

module.exports = app;
