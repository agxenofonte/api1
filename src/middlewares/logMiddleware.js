const logRequest = (req, res, next) => {
  const currentDate = new Date();
  console.log(`[${currentDate}] - Requisição feita para: ${req.originalUrl}`);
  next();  
};

logs.push({
  url: req.originalUrl,
  date: new Date()
});

module.exports = logRequest; 
