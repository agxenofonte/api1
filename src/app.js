const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000; // ✅ porta via variável de ambiente

app.use(express.json());

// ✅ logs importados do módulo compartilhado, não mais um array isolado
const logs = require('./logs');

// Middlewares
const checkWeekday = require('./middlewares/weekdayMiddleware');
app.use(checkWeekday);

const logRequest = require('./middlewares/logMiddleware');
app.use(logRequest);

// Rotas de livros
const itemRoutes = require('./routes/bookRoutes');
app.use('/api/items', itemRoutes);

// Rota de login — fica fora do authMiddleware propositalmente
app.post('/logar', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' }); // ✅ validação
  }

  if (email === 'usuario@exemplo.com' && senha === 'senha123') {
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secreta', { expiresIn: '1h' }); // ✅ secret via env
    return res.json({ token });
  }

  res.status(401).json({ message: 'Credenciais inválidas' });
});

// Rota para consultar logs por data
app.get('/api/requests/:date', (req, res) => {
  const { date } = req.params;

  // ✅ Valida o formato da data antes de filtrar
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

// ✅ app.listen condicional para funcionar na Vercel
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

// ✅ exporta o app para a Vercel conseguir usar
module.exports = app;