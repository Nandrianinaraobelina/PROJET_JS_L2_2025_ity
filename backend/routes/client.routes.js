const express = require("express");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

module.exports = (db) => {
  /**
   * @swagger
   * /api/clients:
   *   post:
   *     summary: Créer un nouveau client
   *     tags: [Clients]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - NomCli
   *               - PrenomCli
   *             properties:
   *               NomCli:
   *                 type: string
   *                 description: Nom du client
   *               PrenomCli:
   *                 type: string
   *                 description: Prénom du client
   *               EmailCli:
   *                 type: string
   *                 format: email
   *                 description: Email du client (optionnel)
   *               TelephoneCli:
   *                 type: string
   *                 description: Téléphone du client (optionnel)
   *     responses:
   *       201:
   *         description: Client créé avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 message:
   *                   type: string
   *                 client:
   *                   type: object
   *       400:
   *         description: Erreur de validation
   *       500:
   *         description: Erreur serveur
   */
  // Créer un client
  router.post(
    "/",
    [
      body("NomCli").notEmpty().withMessage("Le nom est requis"),
      body("PrenomCli").notEmpty().withMessage("Le prénom est requis"),
      body("EmailCli")
        .optional()
        .isEmail()
        .withMessage("Format d'email invalide"),
      body("TelephoneCli")
        .optional()
        .isLength({ min: 1 })
        .withMessage("Téléphone invalide"),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Erreurs de validation:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { NomCli, PrenomCli, EmailCli, TelephoneCli } = req.body;

      // Préparer les valeurs avec des valeurs par défaut pour les champs optionnels
      const sql =
        "INSERT INTO CLIENT (NomCli, PrenomCli, EmailCli, TelephoneCli, AdresseCli, Ville, Pays) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const values = [
        NomCli,
        PrenomCli,
        EmailCli || null,
        TelephoneCli || null,
        null, // AdresseCli
        null, // Ville
        null, // Pays
      ];

      console.log("📝 Insertion client:", values);

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Erreur SQL:", err);
          return res
            .status(500)
            .json({ error: "Erreur lors de l'insertion en base de données" });
        }
        console.log("✅ Client créé avec ID:", result.insertId);
        res.status(201).json({
          id: result.insertId,
          message: "Client créé avec succès",
          client: {
            ID_CLIENT: result.insertId,
            NomCli,
            PrenomCli,
            EmailCli,
            TelephoneCli,
          },
        });
      });
    }
  );

  /**
   * @swagger
   * /api/clients:
   *   get:
   *     summary: Récupérer tous les clients
   *     tags: [Clients]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Liste des clients récupérée avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   ID_CLIENT:
   *                     type: integer
   *                   NomCli:
   *                     type: string
   *                   PrenomCli:
   *                     type: string
   *                   EmailCli:
   *                     type: string
   *                   TelephoneCli:
   *                     type: string
   *       401:
   *         description: Non autorisé
   *       500:
   *         description: Erreur serveur
   */
  // Lire tous les clients
  router.get("/", (req, res) => {
    db.query("SELECT * FROM CLIENT", (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // Lire un client par ID
  router.get("/:id", (req, res) => {
    db.query(
      "SELECT * FROM CLIENT WHERE ID_CLIENT = ?",
      [req.params.id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0)
          return res.status(404).json({ error: "Client non trouvé" });
        res.json(results[0]);
      }
    );
  });

  // Mettre à jour un client
  router.put(
    "/:id",
    [
      body("NomCli").notEmpty().withMessage("Le nom est requis"),
      body("PrenomCli").notEmpty().withMessage("Le prénom est requis"),
      body("EmailCli")
        .optional()
        .isEmail()
        .withMessage("Format d'email invalide"),
      body("TelephoneCli")
        .optional()
        .isLength({ min: 1 })
        .withMessage("Téléphone invalide"),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Erreurs de validation:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { NomCli, PrenomCli, EmailCli, TelephoneCli } = req.body;

      console.log("🔄 Mise à jour client ID:", req.params.id, "avec:", {
        NomCli,
        PrenomCli,
        EmailCli,
        TelephoneCli,
      });

      const sql =
        "UPDATE CLIENT SET NomCli=?, PrenomCli=?, EmailCli=?, TelephoneCli=? WHERE ID_CLIENT=?";
      const values = [
        NomCli,
        PrenomCli,
        EmailCli || null,
        TelephoneCli || null,
        req.params.id,
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Erreur SQL:", err);
          return res
            .status(500)
            .json({
              error: "Erreur lors de la mise à jour en base de données",
            });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Client non trouvé" });
        }
        console.log("✅ Client mis à jour");
        res.json({
          message: "Client mis à jour avec succès",
          client: {
            ID_CLIENT: req.params.id,
            NomCli,
            PrenomCli,
            EmailCli,
            TelephoneCli,
          },
        });
      });
    }
  );

  // Supprimer un client
  router.delete("/:id", (req, res) => {
    console.log("🗑️ Suppression client ID:", req.params.id);
    db.query(
      "DELETE FROM CLIENT WHERE ID_CLIENT = ?",
      [req.params.id],
      (err, result) => {
        if (err) {
          console.error("❌ Erreur SQL:", err);
          return res
            .status(500)
            .json({ error: "Erreur lors de la suppression" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Client non trouvé" });
        }
        console.log("✅ Client supprimé");
        res.json({ message: "Client supprimé avec succès" });
      }
    );
  });

  return router;
};
