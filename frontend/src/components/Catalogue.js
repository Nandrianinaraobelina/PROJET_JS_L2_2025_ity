import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import './Catalogue.css'; // Nous créerons ce fichier CSS ensuite

import { getClients } from '../services/clientService';
import { getVendors } from '../services/vendorService';

function Catalogue({ setActiveTab }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('panier');
    return stored ? JSON.parse(stored) : [];
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [clientsError, setClientsError] = useState('');
  const [vendorsError, setVendorsError] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // État pour gérer la session d'achat multiple
  const [isMultiplePurchaseMode, setIsMultiplePurchaseMode] = useState(false);
  const [sessionClient, setSessionClient] = useState(null);
  const [sessionVendor, setSessionVendor] = useState(null);
  const [addedFilmsCount, setAddedFilmsCount] = useState(0);

  // Synchronise le panier avec localStorage
  useEffect(() => {
    console.log('💾 SAUVEGARDE PANIER - Début, longueur:', cart.length);

    // Nettoyer le panier pour éviter les données corrompues
    const cleanCart = cart.filter(item =>
      item &&
      (item.Titre || item.title) &&
      typeof item === 'object'
    );

    console.log('🧹 Panier nettoyé:', cleanCart);

    try {
      const cartJson = JSON.stringify(cleanCart);
      console.log('📝 JSON généré:', cartJson);

      localStorage.setItem('panier', cartJson);
      localStorage.setItem('panier_timestamp', Date.now().toString());

      console.log('✅ Panier sauvegardé avec succès');

      // Vérification immédiate
      const verify = localStorage.getItem('panier');
      const timestamp = localStorage.getItem('panier_timestamp');
      console.log('🔍 Vérification - JSON:', verify);
      console.log('🔍 Vérification - Timestamp:', timestamp);

      if (verify !== cartJson) {
        console.error('❌ ERREUR: La sauvegarde n\'a pas fonctionné correctement!');
      }
    } catch (error) {
      console.error('❌ ERREUR sauvegarde panier:', error);
      // Essayer une approche alternative
      try {
        localStorage.setItem('panier_backup', JSON.stringify(cleanCart));
        console.log('💾 Sauvegarde alternative réussie');
      } catch (backupError) {
        console.error('❌ Même la sauvegarde alternative a échoué:', backupError);
      }
    }

    console.log('💾 SAUVEGARDE PANIER - Fin');
  }, [cart]);

  // Charger la session d'achat depuis localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('purchaseSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setSessionClient(session.client);
      setSessionVendor(session.vendor);
      setAddedFilmsCount(session.count || 0);
      setIsMultiplePurchaseMode(session.isActive || false);
    }
  }, []);

  // Sauvegarder la session d'achat
  const savePurchaseSession = (client, vendor, count, isActive) => {
    const session = { client, vendor, count, isActive, timestamp: Date.now() };
    localStorage.setItem('purchaseSession', JSON.stringify(session));
  };

  // Démarrer une session d'achat multiple
  const startMultiplePurchaseSession = (client, vendor) => {
    setSessionClient(client);
    setSessionVendor(vendor);
    setIsMultiplePurchaseMode(true);
    setAddedFilmsCount(0);
    savePurchaseSession(client, vendor, 0, true);
  };

  // Ajouter un film en mode session multiple (sans modal)
  const addFilmToCartQuick = (product) => {
    // Vérifier que le produit existe
    if (!product) {
      console.error('❌ Produit null ou undefined dans addFilmToCartQuick');
      return;
    }

    if (!sessionClient || !sessionVendor) {
      // Si pas de session, ouvrir la modal normale
      setPendingProduct(product);
      setClientModalOpen(true);
      return;
    }

    const newCartItem = {
      ...product,
      client: sessionClient,
      vendeur: sessionVendor,
      quantite: 1,
      dateAjout: new Date().toISOString()
    };

    console.log('📦 Ajout du film au panier local:', newCartItem);
    setCart(prevCart => {
      const newCart = [...prevCart, newCartItem];
      console.log('🛒 Nouveau panier local:', newCart);
      return newCart;
    });
    setAddedFilmsCount(prev => prev + 1);
    savePurchaseSession(sessionClient, sessionVendor, addedFilmsCount + 1, true);

    // Notification de succès
    const notification = document.createElement('div');
    notification.className = 'notification-toast-modern';
    notification.innerHTML = `
      <div class="notification-content-modern">
        <div class="notification-icon-modern">🎬</div>
        <div class="notification-text-modern">
          <div class="notification-title-modern">Film ajouté !</div>
          <div class="notification-message-modern">${product?.Titre || 'Film'} ajouté (${addedFilmsCount + 1} films)</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);

    // Notifier les autres composants
    console.log('📡 Envoi de l\'événement panierUpdated');
    window.dispatchEvent(new CustomEvent('panierUpdated', {
      detail: { action: 'add', item: newCartItem }
    }));
  };

  // Terminer la session d'achat multiple
  const endMultiplePurchaseSession = () => {
    setIsMultiplePurchaseMode(false);
    setSessionClient(null);
    setSessionVendor(null);
    setAddedFilmsCount(0);
    localStorage.removeItem('purchaseSession');
  };

  // Mettre à jour la quantité d'un article dans le panier
  const updateCartItemQuantity = (itemId, newQuantity) => {
    console.log('🔄 Mise à jour quantité - Item:', itemId, 'Nouvelle quantité:', newQuantity);

    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        const currentId = item.id || item.ID_PROD;
        if (currentId === itemId || (!currentId && prevCart.indexOf(item) === itemId)) {
          console.log('✅ Item trouvé, mise à jour quantité:', item.Titre, newQuantity);
          return { ...item, quantite: newQuantity };
        }
        return item;
      });

      // Sauvegarde automatique dans localStorage
      try {
        const cartJson = JSON.stringify(updatedCart);
        localStorage.setItem('panier', cartJson);
        localStorage.setItem('panier_timestamp', Date.now().toString());
        console.log('💾 Quantité mise à jour et sauvegardée');
      } catch (error) {
        console.error('❌ Erreur sauvegarde après mise à jour quantité:', error);
      }

      // Notifier les autres composants
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('panierUpdated', {
          detail: { action: 'update_quantity', itemId, newQuantity }
        }));
      }, 100);

      return updatedCart;
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        console.log('Produits chargés dans Catalogue:', data); // Ajout du console.log
      } catch (err) {
        setError('Erreur lors de la récupération des films : ' + (err.message || 'Erreur inconnue'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="container mt-3"><p>Chargement du catalogue...</p></div>;
  }

  if (error) {
    return <div className="container mt-3"><div className="alert alert-danger">{error}</div></div>;
  }

  // Fonction de test API
  const testAPI = async () => {
    console.log('🧪 Test des APIs...');
    try {
      const response = await fetch('http://localhost:5000/api/test');
      const data = await response.json();
      console.log('✅ API test:', data);
      alert('API fonctionne: ' + JSON.stringify(data));
    } catch (error) {
      console.error('❌ Erreur API test:', error);
      alert('Erreur API: ' + error.message);
    }
  };

  // Test des APIs clients et vendeurs
  const testClientsVendors = async () => {
    console.log('🧪 Test APIs clients et vendeurs...');
    try {
      const [clients, vendors] = await Promise.all([
        getClients(),
        getVendors()
      ]);
      console.log('✅ Clients:', clients.length, 'éléments');
      console.log('✅ Vendeurs:', vendors.length, 'éléments');
      alert(`Données chargées:\n- ${clients.length} clients\n- ${vendors.length} vendeurs`);
    } catch (error) {
      console.error('❌ Erreur APIs:', error);
      alert('Erreur APIs: ' + error.message);
    }
  };

  return (
    <div className="section-card-modern fade-in">
      {/* Header avec titre et contrôles d'achat multiple */}
      <div className="catalogue-header-modern">
        <h2 className="section-title-modern">
          <i className="bi bi-collection" style={{marginRight: '0.5rem'}}></i>
          Notre Catalogue de Films
        </h2>

        {/* Contrôles d'achat multiple */}
        <div className="purchase-controls-modern">
          {!isMultiplePurchaseMode ? (
            <div className="purchase-mode-indicator-modern">
              <div className="purchase-mode-icon-modern">🎯</div>
              <div className="purchase-mode-text-modern">
                <div className="purchase-mode-title-modern">Mode Normal</div>
                <div className="purchase-mode-subtitle-modern">
                  Sélection client/vendeur à chaque achat
                </div>
              </div>
            </div>
          ) : (
            <div className="multiple-purchase-active-modern">
              <div className="multiple-purchase-header-modern">
                <div className="multiple-purchase-icon-modern">🛒</div>
                <div className="multiple-purchase-info-modern">
                  <div className="multiple-purchase-title-modern">
                    Session Multiple Active
                  </div>
                  <div className="multiple-purchase-details-modern">
                    Client: {sessionClient?.NomCli} {sessionClient?.PrenomCli} |
                    Vendeur: {sessionVendor?.NomVendeur} {sessionVendor?.PrenomVendeur} |
                    Films: {addedFilmsCount}
                  </div>
                </div>
                <button
                  className="btn-end-session-modern"
                  onClick={endMultiplePurchaseSession}
                  title="Terminer la session d'achat multiple"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section pour démarrer une session multiple */}
      {!isMultiplePurchaseMode && (
        <div className="start-session-section-modern">
          <div className="start-session-card-modern">
            <div className="start-session-icon-modern">🚀</div>
            <div className="start-session-content-modern">
              <h3 className="start-session-title-modern">
                Acheter Plusieurs Films Rapidement
              </h3>
              <p className="start-session-description-modern">
                Sélectionnez un client et un vendeur pour commencer une session d'achat multiple.
                Ajoutez ensuite plusieurs films sans resélectionner à chaque fois !
              </p>
              <button
                className="btn-start-session-modern"
                onClick={() => {
                  setPendingProduct(null);
                  setClientsError('');
                  setVendorsError('');
                  setClientsLoading(true);
                  setVendorsLoading(true);
                  setSelectedClient(null);
                  setSelectedVendor(null);
                  setQuantity(1);

                  // Charger les clients et vendeurs pour la session
                  const [clientsPromise, vendorsPromise] = [
                    getClients().catch(e => {
                      console.error('❌ Erreur chargement clients:', e);
                      setClientsError("Erreur lors du chargement des clients");
                      return [];
                    }),
                    getVendors().catch(e => {
                      console.error('❌ Erreur chargement vendeurs:', e);
                      setVendorsError("Erreur lors du chargement des vendeurs");
                      return [];
                    })
                  ];

                  Promise.all([clientsPromise, vendorsPromise]).then(([clientsData, vendorsData]) => {
                    setClients(clientsData);
                    setVendors(vendorsData);
                    setClientsLoading(false);
                    setVendorsLoading(false);
                    setClientModalOpen(true);
                  }).catch(e => {
                    console.error('❌ Erreur lors du chargement:', e);
                    setClientsLoading(false);
                    setVendorsLoading(false);
                  });
                }}
              >
                <i className="bi bi-play-circle me-2"></i>
                Démarrer Session Multiple
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRE DE RECHERCHE MODERNE */}
      <div className="search-container-modern mb-4">
        <input
          type="text"
          className="search-input-modern"
          placeholder="Rechercher un film..."
          value=""
          onChange={() => {}}
        />
        <div className="search-icon-modern">
          <i className="bi bi-search"></i>
        </div>
      </div>

      {/* INFOS ET ACTIONS */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 gap-sm-0 mb-4">
        <div className="text-muted">
          <small className="d-block d-sm-inline">
            {products.length} film{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
          </small>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 w-100 w-sm-auto">
          <button
            className="btn-glass-modern flex-fill flex-sm-shrink-0 btn-bounce"
            onClick={testAPI}
            style={{
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              minHeight: '36px'
            }}
          >
            <i className="bi bi-wifi me-1"></i>
            <span className="d-none d-sm-inline">Test API</span>
            <span className="d-sm-none">API</span>
          </button>
          <button
            className="btn-glass-modern flex-fill flex-sm-shrink-0 btn-bounce"
            onClick={testClientsVendors}
            style={{
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              minHeight: '36px'
            }}
          >
            <i className="bi bi-people me-1"></i>
            <span className="d-none d-sm-inline">Test Données</span>
            <span className="d-sm-none">Données</span>
          </button>
        </div>
      </div>

      {/* INDICATEUR PANIER MODERNE */}
      {cart.length > 0 && (
        <div className="d-flex justify-content-center mb-4 px-3 px-md-0">
          <div className="data-card-modern w-100" style={{maxWidth: '320px'}}>
            <div className="data-header-modern">
              <div className="flex-grow-1">
                <div className="data-title-modern" style={{fontSize: '1rem'}}>Votre Panier</div>
                <div className="data-subtitle-modern">
                  {cart.length} élément{cart.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="data-icon-modern ms-3">
                <i className="bi bi-cart3" style={{fontSize: '1.5rem'}}></i>
              </div>
            </div>
            <button
              className="btn-primary-modern w-100 mt-3 btn-bounce"
              onClick={() => setActiveTab('panier')}
              style={{
                fontSize: '0.9rem',
                padding: '0.75rem 1rem',
                minHeight: '44px'
              }}
            >
              <i className="bi bi-cart-check me-2"></i>
              Voir le panier
            </button>
          </div>
        </div>
      )}

      {/* MODALE CHOIX CLIENT MODERNE */}
      {/* MODAL AJOUTER AU PANIER MODERNE ET PARFAITEMENT CENTRÉE */}
      {clientModalOpen && (
        <div className="modal-overlay-modern">
          <div className="modal-backdrop-modern" onClick={() => setClientModalOpen(false)}>
            <div
              className="modal-content-modern"
              onClick={e => e.stopPropagation()}
            >
            {/* Header de la modal */}
            <div className="modal-header-modern">
              <h2 className="modal-title-modern">
                <i className="bi bi-cart-plus modal-title-icon-modern"></i>
                Ajouter au panier
              </h2>
            </div>

            {/* Corps de la modal */}
            <div className="modal-body-modern">
              {/* Film sélectionné */}
              <div className="film-selection-modern">
                <div className="film-title-modern">
                  <i className="bi bi-film film-price-icon-modern"></i>
                  {pendingProduct?.Titre}
                </div>
                <div className="film-price-modern">
                  <i className="bi bi-cash-coin film-price-icon-modern"></i>
                  {pendingProduct?.Prix_unitaire} ARIARY
                </div>
              </div>
            {/* Sélection du client */}
              <div className="selection-section-modern">
                <label className="selection-label-modern">
                  <i className="bi bi-person selection-icon-modern"></i>
                  Client acheteur
                </label>
              {clientsLoading ? (
                  <div className="loading-state-modern">
                    <div className="spinner-modern"></div>
                    <span className="loading-text-modern">Chargement des clients...</span>
                  </div>
              ) : clientsError ? (
                  <div className="error-state-modern">
                    <div className="error-content-modern">
                      <i className="bi bi-exclamation-triangle error-icon-modern"></i>
                      <div>
                        <div className="error-title-modern">Erreur de chargement</div>
                        <div className="error-message-modern">{clientsError}</div>
                        <div className="error-hint-modern">Vérifiez que la base de données contient des clients.</div>
                      </div>
                    </div>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="empty-state-modern">
                    <div className="empty-content-modern">
                      <i className="bi bi-info-circle empty-icon-modern"></i>
                      <div>
                        <div className="empty-title-modern">Aucun client trouvé</div>
                        <div className="empty-message-modern">La base de données ne contient aucun client.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <select
                    className="form-select-modern"
                    value={selectedClient?.ID_CLIENT || ''}
                    onChange={e => {
                  const cli = clients.find(c => c.ID_CLIENT === Number(e.target.value));
                  setSelectedClient(cli);
                      console.log('Client sélectionné:', cli);
                    }}
                  >
                    <option value="">
                      Sélectionner un client ({clients.length} disponible{clients.length > 1 ? 's' : ''})
                    </option>
                  {clients.map(cli => (
                      <option key={cli.ID_CLIENT} value={cli.ID_CLIENT}>
                        {cli.NomCli} {cli.PrenomCli}
                        {cli.EmailCli && ` - ${cli.EmailCli}`}
                      </option>
                  ))}
                </select>
              )}
            </div>
            {/* Sélection du vendeur */}
              <div className="selection-section-modern">
                <label className="selection-label-modern">
                  <i className="bi bi-shop selection-icon-modern"></i>
                  Vendeur présent
                </label>
              {vendorsLoading ? (
                  <div className="loading-state-modern">
                    <div className="spinner-modern"></div>
                    <span className="loading-text-modern">Chargement des vendeurs...</span>
                  </div>
              ) : vendorsError ? (
                  <div className="error-state-modern">
                    <div className="error-content-modern">
                      <i className="bi bi-exclamation-triangle error-icon-modern"></i>
                      <div>
                        <div className="error-title-modern">Erreur de chargement</div>
                        <div className="error-message-modern">{vendorsError}</div>
                        <div className="error-hint-modern">Vérifiez que la base de données contient des vendeurs.</div>
                      </div>
                    </div>
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="empty-state-modern">
                    <div className="empty-content-modern">
                      <i className="bi bi-info-circle empty-icon-modern"></i>
                      <div>
                        <div className="empty-title-modern">Aucun vendeur trouvé</div>
                        <div className="empty-message-modern">La base de données ne contient aucun vendeur.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <select
                    className="form-select-modern"
                    value={selectedVendor?.ID_VENDEUR || ''}
                    onChange={e => {
                  const ven = vendors.find(v => v.ID_VENDEUR === Number(e.target.value));
                  setSelectedVendor(ven);
                      console.log('Vendeur sélectionné:', ven);
                    }}
                  >
                    <option value="">
                      Sélectionner un vendeur ({vendors.length} disponible{vendors.length > 1 ? 's' : ''})
                    </option>
                  {vendors.map(ven => (
                      <option key={ven.ID_VENDEUR} value={ven.ID_VENDEUR}>
                        {ven.NomVendeur} {ven.PrenomVendeur}
                        {ven.Email && ` - ${ven.Email}`}
                      </option>
                  ))}
                </select>
              )}
            </div>
            {/* Quantité */}
              <div className="quantity-section-modern">
                <label className="selection-label-modern">
                  <i className="bi bi-hash selection-icon-modern"></i>
                  Quantité
                </label>
                <input
                  type="number"
                  min={1}
                  className="quantity-input-modern"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                />
              </div>

              {/* Liste des films dans le panier actuel */}
              {cart.length > 0 && (
                <div className="cart-preview-modern">
                  <h4 className="cart-preview-title-modern">
                    <i className="bi bi-cart-check cart-preview-icon-modern"></i>
                    Films dans votre panier ({cart.length})
                  </h4>
                  <div className="cart-preview-list-modern">
                    {cart.slice(0, 3).map((item, index) => (
                      <div key={item.id || index} className="cart-preview-item-modern">
                        <div className="cart-preview-film-modern">
                          <i className="bi bi-film cart-preview-film-icon-modern"></i>
                          <span className="cart-preview-film-title-modern">
                            {item.Titre || item.title || 'Film sans titre'}
                          </span>
                        </div>
                        <div className="cart-preview-details-modern">
                          <div className="cart-preview-quantity-controls-modern">
                            <button
                              className="cart-preview-quantity-btn-modern"
                              onClick={() => {
                                const newQuantity = Math.max(1, (item.quantite || 1) - 1);
                                updateCartItemQuantity(item.id || item.ID_PROD || index, newQuantity);
                              }}
                              disabled={(item.quantite || 1) <= 1}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="cart-preview-quantity-modern">
                              {item.quantite || 1}
                            </span>
                            <button
                              className="cart-preview-quantity-btn-modern"
                              onClick={() => {
                                const newQuantity = (item.quantite || 1) + 1;
                                updateCartItemQuantity(item.id || item.ID_PROD || index, newQuantity);
                              }}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                          <span className="cart-preview-price-modern">
                            {((item.Prix_unitaire || item.price || 500) * (item.quantite || 1))} ARIARY
                          </span>
                        </div>
                      </div>
                    ))}
                    {cart.length > 3 && (
                      <div className="cart-preview-more-modern">
                        <i className="bi bi-three-dots"></i>
                        <span>{cart.length - 3} autre{cart.length - 3 > 1 ? 's' : ''} film{cart.length - 3 > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="cart-preview-total-modern">
                    <strong>Total actuel: {cart.reduce((sum, item) =>
                      sum + ((item.Prix_unitaire || item.price || 500) * (item.quantite || 1)), 0
                    )} ARIARY</strong>
                  </div>
                </div>
              )}

              {/* Résumé de commande */}
              <div className="order-summary-modern">
                <h3 className="summary-title-modern">Résumé de la commande</h3>
                <div className="summary-item-modern">
                  <span className="summary-label-modern">Client :</span>
                  <span className={`summary-value-modern ${selectedClient ? 'text-success' : 'text-muted'}`}>
                    {selectedClient ? `${selectedClient.NomCli} ${selectedClient.PrenomCli}` : 'Non choisi'}
                  </span>
                </div>
                <div className="summary-item-modern">
                  <span className="summary-label-modern">Vendeur :</span>
                  <span className={`summary-value-modern ${selectedVendor ? 'text-success' : 'text-muted'}`}>
                    {selectedVendor ? `${selectedVendor.NomVendeur} ${selectedVendor.PrenomVendeur}` : 'Non choisi'}
                  </span>
                </div>
                <div className="summary-item-modern">
                  <span className="summary-label-modern">Quantité :</span>
                  <span className="summary-value-modern">{quantity}</span>
                </div>
                <div className="summary-item-modern summary-total-modern">
                  <span className="summary-label-modern">Total à payer :</span>
                  <span className="summary-value-modern panier-total-price-modern">
                    {quantity * (pendingProduct?.Prix_unitaire || 0)} ARIARY
                  </span>
            </div>
            </div>

              {/* Boutons d'action */}
            </div>
            <div className="modal-actions-modern">
                <button
                  className="btn-primary-modern"
                  disabled={!selectedClient || !selectedVendor || !quantity || clientsLoading || vendorsLoading}
                  onClick={() => {
                    console.log('🎯 Validation du panier...');
                    console.log('Produit:', pendingProduct);
                    console.log('Client:', selectedClient);
                    console.log('Vendeur:', selectedVendor);
                    console.log('Quantité:', quantity);

                    // Vérifier que tous les champs sont remplis
                    if (!pendingProduct || !selectedClient || !selectedVendor) {
                      console.error('❌ Données manquantes pour l\'ajout au panier');
                      alert('Erreur: Données manquantes pour ajouter au panier');
                      return;
                    }

                    const newCartItem = {
                      ...pendingProduct,
                      client: selectedClient,
                      vendeur: selectedVendor,
                      quantite: quantity,
                      dateAjout: new Date().toISOString(),
                      id: Date.now() // ID unique pour éviter les doublons
                    };

                    console.log('📦 Nouvel item panier:', newCartItem);

                    // Utiliser un callback pour s'assurer que setCart est terminé
                    setCart(prevCart => {
                      const updatedCart = [...prevCart, newCartItem];
                      console.log('🛒 Panier mis à jour localement:', updatedCart);

                      // Sauvegarde immédiate dans localStorage
                      try {
                        const cartJson = JSON.stringify(updatedCart);
                        localStorage.setItem('panier', cartJson);
                        localStorage.setItem('panier_timestamp', Date.now().toString());
                        console.log('💾 Sauvegarde localStorage réussie');

                        // Vérifier la sauvegarde
                        const verify = localStorage.getItem('panier');
                        if (verify !== cartJson) {
                          console.error('❌ ERREUR: Sauvegarde localStorage échouée');
                        }
                      } catch (error) {
                        console.error('❌ ERREUR sauvegarde localStorage:', error);
                      }

                      return updatedCart;
                    });

                    // Afficher une notification de succès
                    const notification = document.createElement('div');
                    notification.className = 'notification-toast-modern';
                    notification.innerHTML = `
                      <div class="notification-content-modern">
                        <div class="notification-icon-modern">✅</div>
                        <div class="notification-text-modern">
                          <div class="notification-title-modern">Article ajouté !</div>
                          <div class="notification-message-modern">${pendingProduct?.Titre || 'Film'} ajouté au panier</div>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(notification);

                    // Animation d'entrée
                    setTimeout(() => {
                      notification.classList.add('show');
                    }, 10);

                    // Supprimer la notification après 3 secondes
                    setTimeout(() => {
                      notification.classList.remove('show');
                      setTimeout(() => {
                        document.body.removeChild(notification);
                      }, 300);
                    }, 3000);

                    // Attendre un peu avant d'envoyer l'événement pour s'assurer que setCart est terminé
                    setTimeout(() => {
                      console.log('📡 Envoi événement panierUpdated');
                      window.dispatchEvent(new CustomEvent('panierUpdated', {
                        detail: { action: 'add', item: newCartItem }
                      }));
                    }, 200);

                    // Reset modal
                setClientModalOpen(false);
                setPendingProduct(null);
                setSelectedClient(null);
                setSelectedVendor(null);
                setQuantity(1);

                    // Aller au panier
                if (setActiveTab) setActiveTab('panier');
                  }}
                >
                  {clientsLoading || vendorsLoading ? (
                    <>
                      <div className="spinner-modern me-2"></div>
                      Chargement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Ajouter au panier
                    </>
                  )}
                </button>
                <button
                  className="btn-secondary-modern"
                  onClick={() => {
                    console.log('❌ Annulation de l\'ajout au panier');
                setClientModalOpen(false);
                setPendingProduct(null);
                setSelectedClient(null);
                setSelectedVendor(null);
                setQuantity(1);
                  }}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION + CATALOGUE FILMS */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="btn catalogue-btn-nav" onClick={() => setPage(page-1)} disabled={page === 1}><i className="bi bi-arrow-left"></i> Précédent</button>
        <span className="fw-bold">Page {page}</span>
        <button className="btn catalogue-btn-nav" onClick={() => setPage(page+1)} disabled={page * itemsPerPage >= products.length}>Suivant <i className="bi bi-arrow-right"></i></button>
      </div>
      <div className="row">
        {products.length > 0 ? (
          products.slice((page-1)*itemsPerPage, page*itemsPerPage).map(product => {
            if (!product) return null;
            return (
              <div key={product.ID_PROD || Math.random()} className="col-md-4 col-lg-3 mb-4">
              <div className="product-card-modern hover-lift">
                <img 
                  src={product.Photo ? (product.Photo.startsWith('http') ? product.Photo : `http://localhost:5000/uploads/${product.Photo}`) : 'https://via.placeholder.com/300x400.png?text=Pas+d\'image'}
                  className="product-image-modern"
                  alt={product?.Titre || 'Film'} 
                  style={{cursor:'pointer'}}
                  onClick={() => { setModalImg(product.Photo ? (product.Photo.startsWith('http') ? product.Photo : `http://localhost:5000/uploads/${product.Photo}`) : 'https://via.placeholder.com/300x400.png?text=Pas+d\'image'); setModalOpen(true); }}
                />
                <div className="product-content-modern">
                  <h5 className="product-title-modern">{product?.Titre || 'Film sans titre'}</h5>
                  <p className="product-description-modern" style={{marginBottom: '1rem'}}>
                    {product.Genre && `Genre: ${product.Genre}`}
                    {product.Realisateur && ` • Réalisateur: ${product.Realisateur}`}
                  </p>
                  <div className="product-price-modern">Prix : {product?.Prix_unitaire || 500} ARIARY</div>
                  <div className="product-actions-modern">
                    <button
                      className="product-btn-preview-modern"
                      onClick={() => { setModalImg(product.Photo ? (product.Photo.startsWith('http') ? product.Photo : `http://localhost:5000/uploads/${product.Photo}`) : 'https://via.placeholder.com/300x400.png?text=Pas+d\'image'); setModalOpen(true); }}
                    >
                      <i className="bi bi-eye"></i> Aperçu
                    </button>
                    <button
                      className="product-btn-cart-modern"
                      onClick={async () => {
                        console.log('🔘 Bouton "Ajouter au panier" cliqué pour le produit:', product);

                        // Vérifier que le produit existe
                        if (!product) {
                          console.error('❌ Produit null ou undefined');
                          return;
                        }

                        // Si on est en mode session multiple, ajouter rapidement
                        if (isMultiplePurchaseMode && sessionClient && sessionVendor) {
                          addFilmToCartQuick(product);
                          return;
                        }

                        // Sinon, ouvrir la modal normale
                      setPendingProduct(product);
                      setClientsError('');
                      setVendorsError('');
                      setClientsLoading(true);
                      setVendorsLoading(true);
                        setSelectedClient(sessionClient); // Pré-remplir avec la session
                        setSelectedVendor(sessionVendor); // Pré-remplir avec la session
                      setQuantity(1);

                        console.log('📡 Chargement des clients et vendeurs...');

                        // Charger les clients et vendeurs en parallèle
                        const [clientsPromise, vendorsPromise] = [
                          getClients().catch(e => {
                            console.error('❌ Erreur chargement clients:', e);
                            setClientsError("Erreur lors du chargement des clients");
                            return [];
                          }),
                          getVendors().catch(e => {
                            console.error('❌ Erreur chargement vendeurs:', e);
                            setVendorsError("Erreur lors du chargement des vendeurs");
                            return [];
                          })
                        ];

                        try {
                          const [clientsData, vendorsData] = await Promise.all([clientsPromise, vendorsPromise]);
                          console.log('✅ Clients chargés:', clientsData.length, 'éléments');
                          console.log('✅ Vendeurs chargés:', vendorsData.length, 'éléments');

                        setClients(clientsData);
                          setVendors(vendorsData);
                        setClientsLoading(false);
                          setVendorsLoading(false);
                          setClientModalOpen(true);

                          console.log('🎉 Modale ouverte avec succès!');
                      } catch (e) {
                          console.error('❌ Erreur générale lors du chargement:', e);
                        setClientsLoading(false);
                        setVendorsLoading(false);
                      }
                      }}>
                      <i className="bi bi-cart-plus me-1"></i>
                      {isMultiplePurchaseMode && sessionClient && sessionVendor ? 'Ajouter' : 'Ajouter au panier'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })
        ) : (
          <p className="text-center w-100">Aucun film disponible dans le catalogue pour le moment.</p>
        )}
      </div>

      {/* MODALE APERCU */}
      {modalOpen && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.6)',zIndex:1050,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => setModalOpen(false)}>
          <div style={{background:'#fff',padding:20,borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,0.2)',maxWidth:500}} onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="Aperçu" style={{width:'100%',maxHeight:400,objectFit:'contain',marginBottom:16}} />
            <button className="btn btn-secondary w-100" onClick={() => setModalOpen(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalogue;
