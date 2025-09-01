const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

module.exports = (db) => {
  // Créer un client
  router.post('/', authenticateToken, [
    body('NomCli').notEmpty().withMessage('Le nom est requis'),
    body('PrenomCli').notEmpty().withMessage('Le prénom est requis'),
    body('EmailCli').isEmail().withMessage('Email invalide'),
    body('TelephoneCli').optional().isMobilePhone().withMessage('Téléphone invalide'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { NomCli, PrenomCli, EmailCli, AdresseCli, Ville, Pays, Preferences, TelephoneCli, PhotoCli } = req.body;
    const sql = 'INSERT INTO CLIENT (NomCli, PrenomCli, EmailCli, AdresseCli, Ville, Pays, Preferences, TelephoneCli, PhotoCli) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [NomCli, PrenomCli, EmailCli, AdresseCli, Ville, Pays, Preferences, TelephoneCli, PhotoCli], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, ...req.body });
    });
  });

  // Lire tous les clients
  router.get('/', (req, res) => {
    db.query('SELECT * FROM CLIENT', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // Lire un client par ID
  router.get('/:id', (req, res) => {
    db.query('SELECT * FROM CLIENT WHERE ID_CLIENT = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Client non trouvé' });
      res.json(results[0]);
    });
  });

  // Mettre à jour un client
  router.put('/:id', authenticateToken, [
    body('NomCli').notEmpty().withMessage('Le nom est requis'),
    body('PrenomCli').notEmpty().withMessage('Le prénom est requis'),
    body('EmailCli').isEmail().withMessage('Email invalide'),
    body('TelephoneCli').optional().isMobilePhone().withMessage('Téléphone invalide'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { NomCli, PrenomCli, EmailCli, AdresseCli, Ville, Pays, Preferences, TelephoneCli, PhotoCli } = req.body;
    const sql = 'UPDATE CLIENT SET NomCli=?, PrenomCli=?, EmailCli=?, AdresseCli=?, Ville=?, Pays=?, Preferences=?, TelephoneCli=?, PhotoCli=? WHERE ID_CLIENT=?';
    db.query(sql, [NomCli, PrenomCli, EmailCli, AdresseCli, Ville, Pays, Preferences, TelephoneCli, PhotoCli, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Client mis à jour' });
    });
  });

  // Supprimer un client
  router.delete('/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM CLIENT WHERE ID_CLIENT = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Client supprimé' });
    });
  });

  return router;
}; 