const nodemailer = require('nodemailer');

// ✅ Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  }
});

// ✅ Função para enviar código 2FA
const enviar2FACode = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@api-livros.com',
      to: email,
      subject: '🔐 Seu código de verificação 2FA',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h1 style="color: #333;">Verificação de Segurança</h1>
          <p style="color: #666; font-size: 16px;">
            Seu código de autenticação de dois fatores é:
          </p>
          <div style="
            background: #f0f0f0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #333;
            font-family: 'Courier New', monospace;
          ">
            ${code}
          </div>
          <p style="color: #999; font-size: 12px;">
            ⏰ Este código expira em 10 minutos
          </p>
          <p style="color: #999; font-size: 12px;">
            🔒 Nunca compartilhe este código com ninguém
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            Se você não solicitou este código, ignore este email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Código 2FA enviado para ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ Erro ao enviar email 2FA: ${err.message}`);
    return false;
  }
};

module.exports = { enviar2FACode };
