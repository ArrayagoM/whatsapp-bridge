const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const whatsappRoutes = require('./routes/whatsappRoutes');
const { initializeAllClients } = require('./services/whatsappService');

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'))
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Conectado a MongoDB');
    // Inicializar todas las cuentas al arrancar el servidor
    await initializeAllClients();
  })
  .catch((err) => console.error('No se pudo conectar a MongoDB', err));

app.use('/api/whatsapp', whatsappRoutes);

module.exports = app;
