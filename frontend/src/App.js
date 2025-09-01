import React, { useState } from 'react';
import Login from './components/Login';
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
    <div className="container mt-5">
      <h1 className="main-title fade-in">Bienvenue, administrateur !</h1>
      {/* Supprimé : <button className="btn btn-danger mt-3 mb-3" onClick={handleLogout}>Se déconnecter</button> */}
      
      <TabsMenu 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={['dashboard', 'clients', 'films', 'vendeurs', 'achats', 'ventes', 'catalogue', 'panier']} 
      />
      
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'clients' && <Clients />}
      {activeTab === 'films' && <Products />}
      {activeTab === 'vendeurs' && <Vendors />}
      {activeTab === 'achats' && <Achats />}
      {activeTab === 'ventes' && <Ventes />}
      {activeTab === 'catalogue' && <Catalogue />}
      {activeTab === 'panier' && <Panier setActiveTab={setActiveTab} />}
    </div>
  );
}

export default App;