const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

app.use(express.json()); 

// Definir as rotas
const itemRoutes = require('./routes/itemRoutes');
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

// Rodando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});