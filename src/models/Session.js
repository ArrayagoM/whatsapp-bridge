const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, unique: true },
    session: { type: Object, required: true },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
