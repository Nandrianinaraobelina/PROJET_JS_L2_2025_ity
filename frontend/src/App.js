import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import { isAuthenticated, logout, getToken } from "./services/authService";
import Clients from "./components/Clients";
import Products from "./components/Products";
import Vendors from "./components/Vendors";
import TabsMenu from "./components/TabsMenu";
import Dashboard from "./components/Dashboard";
import Achats from "./components/Achats";
import Ventes from "./components/Ventes";
import Catalogue from "./components/Catalogue";
import Admin from "./components/Admin";
function App() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedFilms, setSelectedFilms] = useState([]);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const verifyToken = async () => {
      const token = getToken();
      console.log(
        "🔍 Vérification token au démarrage:",
        token ? "Token présent" : "Aucun token"
      );

      if (token) {
        try {
          const response = await fetch(
            "http://localhost:5000/api/auth/verify",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            console.log("✅ Token valide, utilisateur authentifié");
            setAuth(true);
          } else {
            console.log("❌ Token invalide, déconnexion");
            logout(); // Token invalide, on le supprime
          }
        } catch (error) {
          console.error("Erreur de vérification du token:", error);
          logout();
        }
      } else {
        console.log("ℹ️ Aucun token, utilisateur non authentifié");
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const handleLogin = () => {
    setAuth(true);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    logout();
    setAuth(false);
    setActiveTab("clients");
  };

  // Gérer les films sélectionnés pour les ventes
  const handleFilmsSelected = (films) => {
    console.log("🎬 Films sélectionnés pour les ventes:", films);
    setSelectedFilms((prevFilms) => {
      // Vérifier si le film est déjà dans la liste
      const existingFilmIndex = prevFilms.findIndex(
        (f) => f.ID_PROD === films[0]?.ID_PROD
      );

      if (existingFilmIndex >= 0) {
        // Le film existe déjà, augmenter la quantité
        const updatedFilms = [...prevFilms];
        updatedFilms[existingFilmIndex] = {
          ...updatedFilms[existingFilmIndex],
          quantite: (updatedFilms[existingFilmIndex].quantite || 1) + 1,
        };
        console.log(
          "📈 Quantité augmentée pour le film existant:",
          updatedFilms[existingFilmIndex]
        );
        return updatedFilms;
      } else {
        // Nouveau film, l'ajouter à la liste existante
        const newFilms = [...prevFilms, ...films];
        console.log("➕ Nouveau film ajouté, liste complète:", newFilms);
        return newFilms;
      }
    });
  };

  // Gérer la suppression d'un film des ventes
  const handleFilmRemoved = (productId) => {
    console.log("🗑️ Suppression du film:", productId);
    setSelectedFilms((prev) =>
      prev.filter((film) => film.ID_PROD !== productId)
    );
  };

  // Gérer la modification de quantité d'un film
  const handleQuantityChanged = (productId, newQuantity) => {
    console.log(
      "🔢 Modification quantité:",
      productId,
      "nouvelle quantité:",
      newQuantity
    );
    setSelectedFilms((prev) =>
      prev.map((film) =>
        film.ID_PROD === productId
          ? { ...film, quantite: Math.max(1, newQuantity) }
          : film
      )
    );
  };

  // Afficher écran de chargement pendant la vérification
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2 text-muted">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  // Afficher le formulaire de connexion si pas authentifié
  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Navigation fixe en haut */}
      <div className="fixed-navigation">
        <div className="navigation-section">
          <TabsMenu
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={[
              "dashboard",
              "clients",
              "films",
              "vendeurs",
              "achats",
              "ventes",
              "catalogue",
              "admin",
            ]}
          />
        </div>
      </div>

      <div className="main-container">
        <div className="header-section">
          <div className="text-center">
            <h1 className="main-title fade-in mb-0">
              <span
                className="d-none d-md-inline"
                style={{ marginRight: "0.5rem" }}
              >
                🚀
              </span>
              <span
                className="d-inline d-md-none"
                style={{ marginRight: "0.3rem", fontSize: "1.2rem" }}
              >
                🚀
              </span>
              <span className="d-none d-sm-inline">
                Bienvenue, administrateur !
              </span>
              <span className="d-sm-none">Admin</span>
            </h1>
          </div>
        </div>

        <div className="content-section">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "clients" && <Clients />}
          {activeTab === "films" && <Products />}
          {activeTab === "vendeurs" && <Vendors />}
          {activeTab === "achats" && <Achats />}
          {activeTab === "ventes" && (
            <Ventes
              setActiveTab={setActiveTab}
              selectedFilms={selectedFilms}
              onFilmRemoved={handleFilmRemoved}
              onQuantityChanged={handleQuantityChanged}
            />
          )}
          {activeTab === "catalogue" && (
            <Catalogue
              setActiveTab={setActiveTab}
              onFilmsSelected={handleFilmsSelected}
            />
          )}
          {activeTab === "admin" && <Admin />}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-info">
              <span className="footer-text">
                <i className="bi bi-shield-check-fill footer-icon"></i>
                <span className="footer-status">
                  <strong>ADMIN</strong> Connecté
                </span>
              </span>
            </div>
          </div>

          <div className="footer-section">
            <div className="footer-actions">
              <div className="footer-description">
                <small className="text-light opacity-75">
                  <i className="bi bi-shield-check me-1"></i>
                  Session administrateur active
                </small>
              </div>
              <div className="footer-buttons">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "🔒 Êtes-vous sûr de vouloir vous déconnecter ?\n\nCette action vous redirigera vers la page de connexion."
                      )
                    ) {
                      handleLogout();
                    }
                  }}
                  className="btn btn-danger btn-sm footer-btn"
                  title="Se déconnecter de l'application"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  <span className="d-none d-sm-inline">Déconnexion</span>
                  <span className="d-sm-none">
                    <i className="bi bi-power"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
