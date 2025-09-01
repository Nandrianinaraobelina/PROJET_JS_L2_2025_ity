const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

module.exports = (db) => {
  // Créer un vendeur
  router.post('/', authenticateToken, [
    body('NomVendeur').notEmpty().withMessage('Le nom est requis'),
    body('PrenomVendeur').notEmpty().withMessage('Le prénom est requis'),
    body('CIN').notEmpty().withMessage('Le CIN est requis'),
    body('Email').isEmail().withMessage('Email invalide'),
    body('Telephone').optional().isMobilePhone().withMessage('Téléphone invalide'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { NomVendeur, PrenomVendeur, CIN, Email, Telephone, Adresse, PhotoVendeur } = req.body;
    const sql = 'INSERT INTO VENDEUR (NomVendeur, PrenomVendeur, CIN, Email, Telephone, Adresse, PhotoVendeur) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [NomVendeur, PrenomVendeur, CIN, Email, Telephone, Adresse, PhotoVendeur], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, ...req.body });
    });
  });

  // Lire tous les vendeurs
  router.get('/', (req, res) => {
    db.query('SELECT * FROM VENDEUR', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // Lire un vendeur par ID
  router.get('/:id', (req, res) => {
    db.query('SELECT * FROM VENDEUR WHERE ID_VENDEUR = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Vendeur non trouvé' });
      res.json(results[0]);
    });
  });

  // Mettre à jour un vendeur
  router.put('/:id', authenticateToken, [
    body('NomVendeur').notEmpty().withMessage('Le nom est requis'),
    body('PrenomVendeur').notEmpty().withMessage('Le prénom est requis'),
    body('CIN').notEmpty().withMessage('Le CIN est requis'),
    body('Email').isEmail().withMessage('Email invalide'),
    body('Telephone').optional().isMobilePhone().withMessage('Téléphone invalide'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { NomVendeur, PrenomVendeur, CIN, Email, Telephone, Adresse, PhotoVendeur } = req.body;
    const sql = 'UPDATE VENDEUR SET NomVendeur=?, PrenomVendeur=?, CIN=?, Email=?, Telephone=?, Adresse=?, PhotoVendeur=? WHERE ID_VENDEUR=?';
    db.query(sql, [NomVendeur, PrenomVendeur, CIN, Email, Telephone, Adresse, PhotoVendeur, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Vendeur mis à jour' });
    });
  });

  // Supprimer un vendeur
  router.delete('/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM VENDEUR WHERE ID_VENDEUR = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Vendeur supprimé' });
    });
  });

  return router;
}; 