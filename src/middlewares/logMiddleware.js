const logs = require('../logs'); // ✅ importa o array compartilhado

const logRequest = (req, res, next) => {
  const currentDate = new Date();

  console.log(`[${currentDate}] - Requisição feita para: ${req.originalUrl}`);

  logs.push({           // ✅ dentro da função, roda a cada requisição
    url: req.originalUrl,
    date: currentDate
  });

  next();
};

module.exports = logRequest;