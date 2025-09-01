const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

module.exports = (db) => {
  // Créer une vente
  router.post('/', authenticateToken, [
    body('ID_PROD').isInt({ min: 1 }).withMessage('ID_PROD requis'),
    body('ID_VENDEUR').isInt({ min: 1 }).withMessage('ID_VENDEUR requis'),
    body('DateVente').notEmpty().withMessage('DateVente requise'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { ID_PROD, ID_VENDEUR, DateVente } = req.body;
    const sql = 'INSERT INTO VENTE_PRODUIT (ID_PROD, ID_VENDEUR, DateVente) VALUES (?, ?, ?)';
    db.query(sql, [ID_PROD, ID_VENDEUR, DateVente], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, ...req.body });
    });
  });

  // Lire toutes les ventes (état initial sans jointures)
  router.get('/', (req, res) => {
    db.query('SELECT * FROM VENTE_PRODUIT', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // Lire une vente par ID
  router.get('/:id', (req, res) => {
    db.query('SELECT * FROM VENTE_PRODUIT WHERE ID_VENTE = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Vente non trouvée' });
      res.json(results[0]);
    });
  });

  // Mettre à jour une vente
  router.put('/:id', authenticateToken, [
    body('ID_PROD').isInt({ min: 1 }).withMessage('ID_PROD requis'),
    body('ID_VENDEUR').isInt({ min: 1 }).withMessage('ID_VENDEUR requis'),
    body('DateVente').notEmpty().withMessage('DateVente requise'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { ID_PROD, ID_VENDEUR, DateVente } = req.body;
    const sql = 'UPDATE VENTE_PRODUIT SET ID_PROD=?, ID_VENDEUR=?, DateVente=? WHERE ID_VENTE=?';
    db.query(sql, [ID_PROD, ID_VENDEUR, DateVente, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Vente mise à jour' });
    });
  });

  // Supprimer une vente
  router.delete('/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM VENTE_PRODUIT WHERE ID_VENTE = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Vente supprimée' });
    });
  });

  return router;
}; 