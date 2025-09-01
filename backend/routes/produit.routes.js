const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Dossier de destination pour les fichiers uploadés

module.exports = (db) => {
  // Créer un produit (film)
  router.post('/', authenticateToken, upload.single('Photo'), [
    body('Titre').notEmpty().withMessage('Le titre est requis'),
    body('Prix_unitaire').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('DateSortie').optional().isDate().withMessage('Date de sortie invalide'),
    body('Duree').optional().isInt({ min: 1 }).withMessage('Durée invalide'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Titre, Realisateur, DateSortie, Duree, PaysOrigine, ActeursPrincipaux, Prix_unitaire, Langue, Genre } = req.body;
    // Gestion du fichier Photo
    let Photo = null;
    if (req.file) {
      Photo = req.file.filename; // On stocke le nom du fichier uploadé
    }
    const sql = 'INSERT INTO PRODUIT (Titre, Realisateur, DateSortie, Photo, Duree, PaysOrigine, ActeursPrincipaux, Prix_unitaire, Langue, Genre) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [Titre, Realisateur, DateSortie, Photo, Duree, PaysOrigine, ActeursPrincipaux, Prix_unitaire, Langue, Genre], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, ...req.body, Photo });
    });
  });

  // Lire tous les produits
  router.get('/', (req, res) => {
    db.query('SELECT * FROM PRODUIT', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // Lire un produit par ID
  router.get('/:id', (req, res) => {
    db.query('SELECT * FROM PRODUIT WHERE ID_PROD = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Produit non trouvé' });
      res.json(results[0]);
    });
  });

  // Mettre à jour un produit
  router.put('/:id', authenticateToken, [
    body('Titre').notEmpty().withMessage('Le titre est requis'),
    body('Prix_unitaire').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('DateSortie').optional().isDate().withMessage('Date de sortie invalide'),
    body('Duree').optional().isInt({ min: 1 }).withMessage('Durée invalide'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Titre, Realisateur, DateSortie, Photo, Duree, PaysOrigine, ActeursPrincipaux, Prix_unitaire, Langue, Genre } = req.body;
    const sql = 'UPDATE PRODUIT SET Titre=?, Realisateur=?, DateSortie=?, Photo=?, Duree=?, PaysOrigine=?, ActeursPrincipaux=?, Prix_unitaire=?, Langue=?, Genre=? WHERE ID_PROD=?';
    db.query(sql, [Titre, Realisateur, DateSortie, Photo, Duree, PaysOrigine, ActeursPrincipaux, Prix_unitaire, Langue, Genre, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Produit mis à jour' });
    });
  });

  // Supprimer un produit
  router.delete('/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM PRODUIT WHERE ID_PROD = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Produit supprimé' });
    });
  });

  return router;
}; 