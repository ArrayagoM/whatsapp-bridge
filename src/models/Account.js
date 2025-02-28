const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    isAuthenticated: { type: Boolean, default: false }, // Estado de autenticación
    clientId: { type: String, default: null }, // Identificador de la sesión
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
