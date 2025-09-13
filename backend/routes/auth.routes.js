const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Clé secrète pour JWT (en production, utiliser une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_jwt';

module.exports = (db) => {
  // Route d'inscription
  router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
  ], async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { username, email, password } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const checkUserQuery = 'SELECT * FROM UTILISATEURS WHERE Username = ? OR Email = ?';
      db.query(checkUserQuery, [username, email], async (err, results) => {
        if (err) {
          console.error('Erreur lors de la vérification de l\'utilisateur:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (results.length > 0) {
          return res.status(400).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
        }

        // Hasher le mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insérer le nouvel utilisateur
        const insertQuery = 'INSERT INTO UTILISATEURS (Username, Email, Password, Role) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [username, email, hashedPassword, 'admin'], (err, result) => {
          if (err) {
            console.error('Erreur lors de l\'inscription:', err);
            return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
          }

          res.status(201).json({ message: 'Utilisateur créé avec succès' });
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Route de connexion
  router.post('/login', [
    body('username').notEmpty().withMessage('Nom d\'utilisateur requis'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ], (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { username, password } = req.body;

      // Rechercher l'utilisateur
      const query = 'SELECT * FROM UTILISATEURS WHERE Username = ?';
      db.query(query, [username], async (err, results) => {
        if (err) {
          console.error('Erreur lors de la recherche de l\'utilisateur:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

        const user = results[0];

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.Password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

        // Créer le token JWT
        const token = jwt.sign(
          {
            userId: user.ID_USER,
            username: user.Username,
            email: user.Email,
            role: user.Role
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Connexion réussie',
          token,
          user: {
            id: user.ID_USER,
            username: user.Username,
            email: user.Email,
            role: user.Role
          }
        });
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Route de vérification du token (pour maintenir la session)
  router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ error: 'Token invalide' });
    }
  });


  return router;
}; 