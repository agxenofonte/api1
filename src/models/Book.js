const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  codigo: {
    type: Number,
    required: true,
    unique: true
  },
  titulo: {
    type: String,
    required: true
  },
  autor: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  resenha: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  imagePublicId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);