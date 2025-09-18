const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const authenticateToken = require("./middleware/auth");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();
const clientRoutes = require("./routes/client.routes");
const produitRoutes = require("./routes/produit.routes");
const authRoutes = require("./routes/auth.routes");
const vendeurRoutes = require("./routes/vendeur.routes");
const venteProduitRoutes = require("./routes/vente_produit.routes");
const acheterRoutes = require("./routes/acheter.routes"); // <-- AJOUT pour les achats

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Sert le dossier uploads pour les images uploadées
app.use("/uploads", express.static("uploads"));

// Connexion à la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "monbaseDeDonneVenteFilm",
});

db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
  } else {
    console.log("Connecté à la base de données MySQL !");
  }
});

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Vente de Films",
      version: "1.0.0",
      description:
        "API pour la gestion des ventes de films avec authentification JWT",
      contact: {
        name: "Votre Nom",
        email: "votre.email@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Serveur de développement",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./index.js"], // Chemins vers les fichiers contenant les annotations Swagger
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Endpoint de test (protégé)
app.get("/api/test", authenticateToken, (req, res) => {
  res.json({ message: "API opérationnelle ! Utilisateur authentifié." });
});

// Routes publiques (pas besoin d'authentification)
app.use("/api/auth", authRoutes(db));

// Middleware d'authentification pour toutes les autres routes
app.use("/api/clients", authenticateToken, clientRoutes(db));
app.use("/api/produits", authenticateToken, produitRoutes(db));
app.use("/api/vendeurs", authenticateToken, vendeurRoutes(db));
app.use("/api/ventes", authenticateToken, venteProduitRoutes(db));
app.use("/api/achats", authenticateToken, acheterRoutes(db)); // <-- AJOUT pour activer /api/achats

// Routes Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route pour récupérer la spécification Swagger en JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(
    `📚 Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`
  );
});
