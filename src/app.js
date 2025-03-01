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

// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(async () => {
    console.log('Conectado a MongoDB');
    await initializeAllClients();
  })
  .catch((err) => console.error('No se pudo conectar a MongoDB', err));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'views')));

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para manejar el favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Rutas de la API
app.use('/api/whatsapp', whatsappRoutes);

module.exports = app;
