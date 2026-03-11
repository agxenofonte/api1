const logRequest = (req, res, next) => {
  const currentDate = new Date();
  console.log(`[${currentDate}] - Requisição feita para: ${req.originalUrl}`);
  next();  
};

module.exports = logRequest; 