const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Authentification temporairement désactivée
  router.post('/register', (req, res) => {
    res.json({ message: 'Authentification désactivée - accès direct autorisé' });
  });

  router.post('/login', (req, res) => {
    res.json({ message: 'Authentification désactivée - accès direct autorisé' });
  });

  return router;
}; 