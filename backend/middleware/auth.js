const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "votre_cle_secrete_jwt";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN no eto "

  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Token manquant." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide ou expiré." });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
