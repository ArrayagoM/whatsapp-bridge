const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, unique: true },
    session: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
