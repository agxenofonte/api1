const checkWeekday = (req, res, next) => {
  const currentDay = new Date().getDay();  
  if (currentDay === 0 || currentDay === 6) {  // Bloqueia Sábado (6) e Domingo (0)
    return res.status(403).json({ message: 'Acesso permitido apenas de segunda a sexta-feira.' });
  }
  next(); 
};

module.exports = checkWeekday;