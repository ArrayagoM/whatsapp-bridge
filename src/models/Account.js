const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    isAuthenticated: { type: Boolean, default: false },
    clientId: { type: String, default: null },
  },
  { timestamps: true }
);
const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
