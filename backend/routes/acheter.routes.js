const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

module.exports = (db) => {
  // Créer un achat
  router.post('/', authenticateToken, [
    body('ID_CLIENT').isInt({ min: 1 }).withMessage('ID_CLIENT requis'),
    body('ID_PROD').isInt({ min: 1 }).withMessage('ID_PROD requis'),
    body('DateAchat').notEmpty().withMessage('DateAchat requise'),
    body('Prix_unitaire').isFloat({ min: 0 }).withMessage('Prix invalide'),
    body('Quantite').isInt({ min: 1 }).withMessage('Quantité invalide'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { ID_CLIENT, ID_PROD, DateAchat, Prix_unitaire, Quantite } = req.body;
    const sql = 'INSERT INTO ACHETER (ID_CLIENT, ID_PROD, DateAchat, Prix_unitaire, Quantite) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [ID_CLIENT, ID_PROD, DateAchat, Prix_unitaire, Quantite], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, ...req.body });
    });
  });

  // Lire tous les achats (avec infos client et produit)
  router.get('/', authenticateToken, (req, res) => { // J'ai remis authenticateToken, à vérifier si c'est voulu
    const sql = `
      SELECT 
        a.ID_ACHAT,
        a.ID_CLIENT,
        a.ID_PROD,
        a.DateAchat,
        a.Prix_unitaire,
        a.Quantite,
        c.NomCli,
        c.PrenomCli,
        p.Titre AS TitreProduit
      FROM ACHETER a
      LEFT JOIN CLIENT c ON a.ID_CLIENT = c.ID_CLIENT
      LEFT JOIN PRODUIT p ON a.ID_PROD = p.ID_PROD
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // Lire un achat par ID
  router.get('/:id', (req, res) => {
    db.query('SELECT * FROM ACHETER WHERE ID_ACHAT = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Achat non trouvé' });
      res.json(results[0]);
    });
  });

  // Mettre à jour un achat
  router.put('/:id', authenticateToken, [
    body('ID_CLIENT').isInt({ min: 1 }).withMessage('ID_CLIENT requis'),
    body('ID_PROD').isInt({ min: 1 }).withMessage('ID_PROD requis'),
    body('DateAchat').notEmpty().withMessage('DateAchat requise'),
    body('Prix_unitaire').isFloat({ min: 0 }).withMessage('Prix invalide'),
    body('Quantite').isInt({ min: 1 }).withMessage('Quantité invalide'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { ID_CLIENT, ID_PROD, DateAchat, Prix_unitaire, Quantite } = req.body;
    const sql = 'UPDATE ACHETER SET ID_CLIENT=?, ID_PROD=?, DateAchat=?, Prix_unitaire=?, Quantite=? WHERE ID_ACHAT=?';
    db.query(sql, [ID_CLIENT, ID_PROD, DateAchat, Prix_unitaire, Quantite, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Achat mis à jour' });
    });
  });

  // Supprimer un achat
  router.delete('/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM ACHETER WHERE ID_ACHAT = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Achat supprimé' });
    });
  });

  return router;
}; 