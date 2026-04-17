try {
  const app = require('../src/app');
  module.exports = app;
} catch (err) {
  console.error('Erro ao carregar app:', err);
  const express = require('express');
  const app = express();
  
  app.get('/', (req, res) => {
    res.status(500).json({ 
      error: 'Erro ao iniciar aplicação',
      message: err.message 
    });
  });
  
  module.exports = app;
}
