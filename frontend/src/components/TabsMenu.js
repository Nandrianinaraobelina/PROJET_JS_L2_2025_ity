import React from 'react';

function TabsMenu({ activeTab, setActiveTab, tabs = ['dashboard', 'clients', 'films', 'vendeurs', 'achats', 'ventes', 'catalogue', 'panier'], cartItemsCount = 0 }) {
  
  // Fonction pour obtenir l'icône correspondante à l'onglet
  const getIconForTab = (tabName) => {
    const iconClasses = "me-1 me-md-2 transition-all duration-200";
    switch (tabName) {
      case 'dashboard':
        return <i className={`bi bi-bar-chart-line ${iconClasses}`}></i>;
      case 'clients':
        return <i className={`bi bi-person-lines-fill ${iconClasses}`}></i>;
      case 'films':
        return <i className={`bi bi-camera-reels-fill ${iconClasses}`}></i>;
      case 'vendeurs':
        return <i className={`bi bi-shop ${iconClasses}`}></i>;
      case 'achats':
        return <i className={`bi bi-receipt ${iconClasses}`}></i>;
      case 'ventes':
        return <i className={`bi bi-graph-up-arrow ${iconClasses}`}></i>;
      case 'catalogue':
        return <i className={`bi bi-grid-3x3 ${iconClasses}`}></i>;
      case 'panier':
        return <i className={`bi bi-basket3-fill ${iconClasses}`}></i>;
      default:
        return null;
    }
  };

  // Fonction pour obtenir le texte court pour mobile
  const getShortTextForTab = (tabName) => {
    switch (tabName) {
      case 'dashboard':
        return '📊';
      case 'clients':
        return '👥';
      case 'films':
        return '🎬';
      case 'vendeurs':
        return '🏪';
      case 'achats':
        return '🛒';
      case 'ventes':
        return '📈';
      case 'catalogue':
        return '📋';
      case 'panier':
        return '🗂️';
      default:
        return tabName.charAt(0).toUpperCase() + tabName.slice(1);
    }
  };

  return (
    <nav className="nav-tabs-modern">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`nav-link ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
          style={{
            minHeight: '48px',
            padding: '0.75rem 0.5rem',
            fontSize: '0.875rem'
          }}
          {...(tab === 'panier' && cartItemsCount > 0 ? { 'data-badge': cartItemsCount } : {})}
        >
          <div className="d-flex flex-column align-items-center justify-content-center">
            <div className="icon-container mb-1 mb-md-0">
              {getIconForTab(tab)}
            </div>
            <span className="tab-text d-none d-md-inline">
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('films', 'Produits')}
            </span>
            <span className="tab-text-short d-md-none text-xs">
              {getShortTextForTab(tab)}
            </span>
          </div>
        </button>
      ))}
    </nav>
  );
}

export default TabsMenu;