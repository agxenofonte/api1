const express = require('express');
const jwt = require('jsonwebtoken');
const logs = [];
const PDFDocument = require('pdfkit');
const app = express();
const port = 3000;
app.use(express.json());

//Midleware para verificar o dia da semana
const checkWeekday = require('./middlewares/weekdayMiddleware');
app.use(checkWeekday); 

//LogMiddleware
const logRequest = require('./middlewares/logMiddleware');
app.use(logRequest);



// Definir as rotas
const itemRoutes = require('./routes/bookRoutes');
app.use('/api/items', itemRoutes); // Usar as rotas de itens

// Rota de login
app.post('/logar', (req, res) => {
  const { email, senha } = req.body;

  // Validação simples
  if (email === 'usuario@exemplo.com' && senha === 'senha123') {
    const token = jwt.sign({ email }, 'secreta', { expiresIn: '1h' });
    return res.json({ token });
  }

  // Se as credenciais forem inválidas
  res.status(401).json({ message: 'Credenciais inválidas' });
});

// Rota para consultar os logs de requisições por data
app.get('/api/requests/:date', (req, res) => {
  const { date } = req.params;
  
  // Filtrando logs pela data
  const filteredLogs = logs.filter(log => {
    const logDate = log.date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    return logDate === date;
  });

  if (filteredLogs.length === 0) {
    return res.status(404).json({ message: 'Nenhuma requisição encontrada para esta data' });
  }

  res.json(filteredLogs);  // Retorna os logs filtrados
});

// Rodando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});