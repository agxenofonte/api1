const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const mongoose = require("mongoose");
const User = require('./models/User');

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

// ✅ Login com comparação de senha criptografada
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

    // Gera token JWT
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secreta', { expiresIn: '1h' });
    res.json({ message: 'Login realizado com sucesso', token });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer login', error: err.message });
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