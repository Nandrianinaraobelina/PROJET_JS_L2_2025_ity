import React, { useState } from 'react';
// Supprimé : import Login from './components/Login';
// Supprimé : import { isAuthenticated, logout } from './services/authService';
import Clients from './components/Clients';
import Products from './components/Products';
import Vendors from './components/Vendors';
import TabsMenu from './components/TabsMenu';
import Dashboard from './components/Dashboard';
import Achats from './components/Achats';
import Ventes from './components/Ventes';
import Catalogue from './components/Catalogue';
function App() {
  // Supprimé : const [auth, setAuth] = useState(isAuthenticated());
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedFilms, setSelectedFilms] = useState([]);

  // Supprimé : const handleLogin = () => { setAuth(true); };
  // Supprimé : const handleLogout = () => { logout(); setAuth(false); };

  // Gérer les films sélectionnés pour les ventes
  const handleFilmsSelected = (films) => {
    console.log('🎬 Films sélectionnés pour les ventes:', films);
    setSelectedFilms(prevFilms => {
      // Vérifier si le film est déjà dans la liste
      const existingFilmIndex = prevFilms.findIndex(f => f.ID_PROD === films[0]?.ID_PROD);

      if (existingFilmIndex >= 0) {
        // Le film existe déjà, augmenter la quantité
        const updatedFilms = [...prevFilms];
        updatedFilms[existingFilmIndex] = {
          ...updatedFilms[existingFilmIndex],
          quantite: (updatedFilms[existingFilmIndex].quantite || 1) + 1
        };
        console.log('📈 Quantité augmentée pour le film existant:', updatedFilms[existingFilmIndex]);
        return updatedFilms;
      } else {
        // Nouveau film, l'ajouter à la liste existante
        const newFilms = [...prevFilms, ...films];
        console.log('➕ Nouveau film ajouté, liste complète:', newFilms);
        return newFilms;
      }
    });
  };

  // Gérer la suppression d'un film des ventes
  const handleFilmRemoved = (productId) => {
    console.log('🗑️ Suppression du film:', productId);
    setSelectedFilms(prev => prev.filter(film => film.ID_PROD !== productId));
  };

  // Gérer la modification de quantité d'un film
  const handleQuantityChanged = (productId, newQuantity) => {
    console.log('🔢 Modification quantité:', productId, 'nouvelle quantité:', newQuantity);
    setSelectedFilms(prev => prev.map(film =>
      film.ID_PROD === productId
        ? { ...film, quantite: Math.max(1, newQuantity) }
        : film
    ));
  };

  // Supprimé : if (!auth) { return <Login onLogin={handleLogin} />; }

  return (
    <div className="app-container">
      {/* Navigation fixe en haut */}
      <div className="fixed-navigation">
        <div className="navigation-section">
          <TabsMenu
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={['dashboard', 'clients', 'films', 'vendeurs', 'achats', 'ventes', 'catalogue']}
          />
        </div>
      </div>

      <div className="main-container">
        <div className="header-section">
          <h1 className="main-title fade-in text-center text-sm-start">
            <span className="d-none d-md-inline" style={{marginRight: '0.5rem'}}>🚀</span>
            <span className="d-inline d-md-none" style={{marginRight: '0.3rem', fontSize: '1.2rem'}}>🚀</span>
            <span className="d-none d-sm-inline">Bienvenue, administrateur !</span>
            <span className="d-sm-none">Admin</span>
          </h1>
        </div>

        <div className="content-section">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'clients' && <Clients />}
          {activeTab === 'films' && <Products />}
          {activeTab === 'vendeurs' && <Vendors />}
          {activeTab === 'achats' && <Achats />}
          {activeTab === 'ventes' && (
            <Ventes
              setActiveTab={setActiveTab}
              selectedFilms={selectedFilms}
              onFilmRemoved={handleFilmRemoved}
              onQuantityChanged={handleQuantityChanged}
            />
          )}
          {activeTab === 'catalogue' && (
            <Catalogue
              setActiveTab={setActiveTab}
              onFilmsSelected={handleFilmsSelected}
            />
          )}

        </div>
      </div>
    </div>
  );
}

export default App;