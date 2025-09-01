// Middleware d'authentification temporairement désactivé
function authenticateToken(req, res, next) {
  // Temporairement désactivé pour permettre l'accès sans authentification
  next();
}

module.exports = authenticateToken; 