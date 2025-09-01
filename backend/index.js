const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const clientRoutes = require('./routes/client.routes');
const produitRoutes = require('./routes/produit.routes');
const authRoutes = require('./routes/auth.routes');
const vendeurRoutes = require('./routes/vendeur.routes');
const venteProduitRoutes = require('./routes/vente_produit.routes');
const acheterRoutes = require('./routes/acheter.routes'); // <-- AJOUT pour les achats

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Sert le dossier uploads pour les images uploadées
app.use('/uploads', express.static('uploads'));


// Connexion à la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'monbaseDeDonneVenteFilm',
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
  } else {
    console.log('Connecté à la base de données MySQL !');
  }
});

// Endpoint de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API opérationnelle !' });
});

app.use('/api/clients', clientRoutes(db));
app.use('/api/produits', produitRoutes(db));
app.use('/api/auth', authRoutes(db));
app.use('/api/vendeurs', vendeurRoutes(db));
app.use('/api/ventes', venteProduitRoutes(db));
app.use('/api/achats', acheterRoutes(db)); // <-- AJOUT pour activer /api/achats

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
}); 