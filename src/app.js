if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const mongoose = require("mongoose");
const User = require('./models/User');
const TwoFACode = require('./models/TwoFACode');
const { enviar2FACode } = require('./services/emailService');

// A. Armazenar os dados com banco de dados MongoDB em nuvem
const mongoUri = process.env.MONGO_URI || "mongodb+srv://anthonyxenofonte06_db_user:123@cluster0.zsyy5rc.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoUri)
  .then(() => console.log("Conectado ao MongoDB"))
  .catch(err => console.log(err));

app.use(express.json());

// ✅ Configurar CORS - permitir apenas requisições do mesmo servidor
const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origin (curl, Postman, mobile) e do mesmo servidor
    if (!origin) {
      callback(null, true);
    } else {
      // Define origem permitida (padrão: localhost ou Vercel)
      const allowedOrigins = [
        `http://localhost:${port}`,
        `http://localhost:3000`,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS negado para origem: ${origin}`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use('/ui', express.static(path.join(__dirname, '../public')));
app.get('/ui', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const logs = require('./logs');

// ✅ Rotas de autenticação ANTES dos middlewares de verificação
// Cadastro com criptografia de senha
app.post('/cadastro', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Verifica se usuário já existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Cria novo usuário (senha criptografada automaticamente pelo middleware)
    const novoUsuario = new User({ email, senha });
    await novoUsuario.save();

    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secreta', { expiresIn: '1h' });
    res.status(201).json({ message: 'Usuário cadastrado com sucesso', token });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao cadastrar usuário', error: err.message });
  }
});

// ✅ Login com comparação de senha criptografada e 2FA
// H. Ter segundo fator de segurança, com código enviado por sms ou email
app.post('/logar', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Encontra usuário no banco
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Compara senha fornecida com hash armazenado
    const senhaValida = await usuario.compararSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // ✅ Gerar código 2FA (6 dígitos aleatórios)
    const codigo2FA = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Salvar código no banco com TTL de 10 minutos
    await TwoFACode.findOneAndDelete({ email }); // Remove código anterior se existir
    const registroCodigo = new TwoFACode({
      email,
      code: codigo2FA,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await registroCodigo.save();

    // Enviar código por email
    const emailEnviado = await enviar2FACode(email, codigo2FA);

    if (!emailEnviado) {
      return res.status(500).json({ message: 'Erro ao enviar código 2FA' });
    }

    // Marcar usuário como tendo 2FA pendente
    usuario.twoFAPending = true;
    await usuario.save();

    res.json({ 
      message: 'Código 2FA enviado por email',
      requiresTwoFA: true,
      email: email.replace(/(.{2})(.*)(@.*)/, '$1****$3') // Mascarar email
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer login', error: err.message });
  }
});

// ✅ Verificar código 2FA e retornar token
app.post('/verificar-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email e código são obrigatórios' });
    }

    // Encontrar código 2FA
    const registroCodigo = await TwoFACode.findOne({ email });
    
    if (!registroCodigo) {
      return res.status(400).json({ message: 'Nenhum código ativo encontrado. Faça login novamente.' });
    }

    // Verificar se código expirou
    if (registroCodigo.expiresAt < new Date()) {
      await TwoFACode.deleteOne({ _id: registroCodigo._id });
      return res.status(400).json({ message: 'Código expirou. Faça login novamente.' });
    }

    // Verificar se não excedeu tentativas
    if (registroCodigo.attempts >= 5) {
      await TwoFACode.deleteOne({ _id: registroCodigo._id });
      return res.status(429).json({ message: 'Muitas tentativas. Faça login novamente.' });
    }

    // Comparar código
    if (registroCodigo.code !== code) {
      registroCodigo.attempts += 1;
      await registroCodigo.save();
      return res.status(401).json({ 
        message: 'Código inválido',
        tentativasRestantes: 5 - registroCodigo.attempts
      });
    }

    // Código válido - gerar token JWT
    const usuario = await User.findOne({ email });
    usuario.twoFAPending = false;
    await usuario.save();

    // Deletar código usado
    await TwoFACode.deleteOne({ _id: registroCodigo._id });

    // Gerar token
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secreta', { expiresIn: '1h' });
    
    res.json({ 
      message: 'Autenticação 2FA realizada com sucesso',
      token,
      usuario: { email: usuario.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao verificar 2FA', error: err.message });
  }
});

// ✅ Ativar 2FA para usuário (após login)
app.post('/ativar-2fa', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    usuario.twoFAEnabled = true;
    await usuario.save();

    res.json({ message: '2FA ativado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao ativar 2FA', error: err.message });
  }
});

// ✅ Desativar 2FA para usuário
app.post('/desativar-2fa', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    usuario.twoFAEnabled = false;
    usuario.twoFAPending = false;
    await usuario.save();

    res.json({ message: '2FA desativado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao desativar 2FA', error: err.message });
  }
});

// I. Ter rota para calcular distância entre dois pontos em um mapa, através da informação das coordenadas geográficas
app.post('/api/distance', (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.body;

    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
      return res.status(400).json({ message: 'Coordenadas obrigatórias: lat1, lon1, lat2, lon2' });
    }

    // Fórmula de Haversine para calcular distância em km
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    res.json({ distance: Math.round(distance * 100) / 100 }); // Arredonda para 2 casas decimais
  } catch (err) {
    res.status(500).json({ message: 'Erro ao calcular distância', error: err.message });
  }
});

// ✅ Middlewares (não afetam /cadastro e /logar)
const checkWeekday = require('./middlewares/weekdayMiddleware');
app.use(checkWeekday);

const logRequest = require('./middlewares/logMiddleware');
app.use(logRequest);

// ✅ Rota raiz para health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de livros funcionando',
    version: '1.0.0',
    endpoints: [
      'GET /api/items',
      'POST /api/items',
      'GET /api/items/:codigo',
      'PUT /api/items/:codigo',
      'DELETE /api/items/:codigo',
      'POST /api/items/:codigo/image',
      'GET /api/items/pdf',
      'POST /cadastro',
      'POST /logar',
      'GET /api/requests/:date'
    ]
  });
});

// Rotas de livros
const itemRoutes = require('./routes/bookRoutes');
app.use('/api/items', itemRoutes);

// Rota para consultar logs por data
app.get('/api/requests/:date', (req, res) => {
  const { date } = req.params;

  const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!formatoValido) {
    return res.status(400).json({ message: 'Formato de data inválido. Use YYYY-MM-DD' });
  }

  const filteredLogs = logs.filter(log => {
    const logDate = log.date.toISOString().split('T')[0];
    return logDate === date;
  });

  if (filteredLogs.length === 0) {
    return res.status(404).json({ message: 'Nenhuma requisição encontrada para esta data' });
  }

  res.json(filteredLogs);
});

// ✅ Inicia o servidor apenas em desenvolvimento local
if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

// ✅ Exporta o app para Vercel usar como serverless function
module.exports = app;