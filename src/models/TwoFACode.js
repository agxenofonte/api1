const mongoose = require('mongoose');

const twoFACodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5, // Máximo de 5 tentativas
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // Expira em 10 minutos
      index: { expireAfterSeconds: 0 }, // TTL index
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TwoFACode', twoFACodeSchema);
