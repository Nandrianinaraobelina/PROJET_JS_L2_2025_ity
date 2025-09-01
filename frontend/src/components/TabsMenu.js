import React from 'react';

function TabsMenu({ activeTab, setActiveTab, tabs = ['dashboard', 'clients', 'films', 'vendeurs', 'achats', 'ventes', 'catalogue'] }) {
  
  // Fonction pour obtenir l'icône correspondante à l'onglet
  const getIconForTab = (tabName) => {
    switch (tabName) {
      case 'dashboard':
        return <i className="bi bi-speedometer2 me-1"></i>;
      case 'clients':
        return <i className="bi bi-people me-1"></i>;
      case 'films':
        return <i className="bi bi-film me-1"></i>;
      case 'vendeurs':
        return <i className="bi bi-person-badge me-1"></i>;
      case 'achats':
        return <i className="bi bi-cart-plus me-1"></i>;
      case 'ventes':
        return <i className="bi bi-cash-coin me-1"></i>;
      case 'catalogue': // Ajout d'une icône pour le catalogue si souhaité
        return <i className="bi bi-images me-1"></i>; 
      default:
        return null;
    }
  };

  return (
    <ul className="nav nav-tabs mb-4">
      {tabs.map(tab => (
        <li className="nav-item" key={tab}>
          <button
            className={`nav-link ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {getIconForTab(tab)}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TabsMenu;