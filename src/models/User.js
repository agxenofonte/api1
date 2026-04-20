const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// F. Criptografar a senha do usuário no banco
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: {
      type: String,
      required: true,
      minlength: 6,
    },
    twoFAEnabled: {
      type: Boolean,
      default: false, // 2FA é opcional
    },
    twoFAPending: {
      type: Boolean,
      default: false, // Indicador se há 2FA pendente de verificação
    },
  },
  { timestamps: true }
);

// ✅ Middleware para criptografar senha antes de salvar
userSchema.pre('save', async function (next) {
  // Se a senha não foi modificada, não criptografa novamente
  if (!this.isModified('senha')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Método para comparar senha com hash
userSchema.methods.compararSenha = async function (senhaPlana) {
  return await bcrypt.compare(senhaPlana, this.senha);
};

module.exports = mongoose.model('User', userSchema);
