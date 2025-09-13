const jwt = require('jsonwebtoken');

// Clé secrète pour JWT (doit correspondre à celle des routes)
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_jwt';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré.' });
    }

    req.user = user; // Ajouter les informations de l'utilisateur à la requête
    next();
  });
}

module.exports = authenticateToken; 