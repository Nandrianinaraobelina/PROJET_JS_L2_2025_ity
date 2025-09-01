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
import Panier from './components/Panier';

function App() {
  // Supprimé : const [auth, setAuth] = useState(isAuthenticated());
  const [activeTab, setActiveTab] = useState('clients');

  // Supprimé : const handleLogin = () => { setAuth(true); };
  // Supprimé : const handleLogout = () => { logout(); setAuth(false); };

  // Supprimé : if (!auth) { return <Login onLogin={handleLogin} />; }

  return (
    <div className="app-container">
      {/* Navigation fixe en haut */}
      <div className="fixed-navigation">
        <div className="navigation-section">
          <TabsMenu
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={['dashboard', 'clients', 'films', 'vendeurs', 'achats', 'ventes', 'catalogue', 'panier']}
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
          {activeTab === 'ventes' && <Ventes />}
          {activeTab === 'catalogue' && <Catalogue setActiveTab={setActiveTab} />}
          {activeTab === 'panier' && <Panier setActiveTab={setActiveTab} />}
        </div>
      </div>
    </div>
  );
}

export default App;