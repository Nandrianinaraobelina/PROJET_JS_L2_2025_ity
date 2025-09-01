// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

// module.exports = (db) => {
//   // Inscription admin
//   router.post('/register', async (req, res) => {
//     const { username, password, email } = req.body;
//     if (!username || !password || !email) {
//       return res.status(400).json({ error: 'Champs requis manquants' });
//     }
//     db.query('SELECT * FROM ADMIN WHERE username = ?', [username], async (err, results) => {
//       if (err) return res.status(500).json({ error: err });
//       if (results.length > 0) return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris' });
//       const hashedPassword = await bcrypt.hash(password, 10);
//       db.query('INSERT INTO ADMIN (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], (err2, result) => {
//         if (err2) return res.status(500).json({ error: err2 });
//         res.json({ message: 'Compte créé avec succès' });
//       });
//     });
//   });

//   // Connexion admin
//   router.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       return res.status(400).json({ error: 'Champs requis manquants' });
//     }
//     db.query('SELECT * FROM ADMIN WHERE username = ?', [username], async (err, results) => {
//       if (err) return res.status(500).json({ error: err });
//       if (results.length === 0) return res.status(401).json({ error: 'Identifiants invalides' });
//       const admin = results[0];
//       // Vérification du mot de passe (hashé ou non)
//       const passwordMatch = await bcrypt.compare(password, admin.password).catch(() => false);
//       if (!passwordMatch && password !== admin.password) {
//         return res.status(401).json({ error: 'Identifiants invalides' });
//       }
//       // Génération du token JWT
//       const token = jwt.sign({ id: admin.ID_ADMIN, username: admin.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
//       res.json({ token });
//     });
//   });

//   return router;
// }; 