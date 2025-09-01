import React, { useEffect, useState } from 'react';
import { addSale } from '../services/saleService';
import { addPurchase } from '../services/purchaseService';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import { getVendors } from '../services/vendorService';

function Ventes({ selectedFilms = [], onFilmRemoved, onQuantityChanged, setActiveTab }) {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    ID_CLIENT: '',
    ID_VENDEUR: '',
    DateVente: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [c, p, v] = await Promise.all([
        getClients(),
        getProducts(),
        getVendors()
      ]);
      setClients(c);
      setProducts(p);
      setVendors(v);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si le produit change, mettre à jour automatiquement le prix
    if (name === 'ID_PROD' && value) {
      const selectedProduct = products.find(p => p.ID_PROD === Number(value));
      if (selectedProduct) {
        setForm({
          ...form,
          [name]: value,
          Prix_unitaire: selectedProduct.Prix_unitaire || 500
        });
        return;
      }
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.ID_CLIENT || !form.ID_VENDEUR || !form.DateVente) {
      setFormError('Tous les champs sont obligatoires');
      return;
    }

    if (selectedFilms.length === 0) {
      setFormError('Aucun film sélectionné');
      return;
    }

    setFormLoading(true);
    try {
      console.log('🎬 Création des ventes et achats pour', selectedFilms.length, 'films...');

      // Créer une vente ET un achat pour chaque film sélectionné
      const transactionPromises = selectedFilms.map(async (film) => {
        const product = products.find(p => p.ID_PROD === film.ID_PROD);
        const prix = product?.Prix_unitaire || 500;
        const quantite = film.quantite || 1;

        console.log(`📦 Traitement du film ${film.ID_PROD}:`, {
          titre: product?.Titre,
          prix: prix,
          quantite: quantite
        });

        // Créer la vente
        const salePromise = addSale({
          ID_CLIENT: form.ID_CLIENT,
          ID_PROD: film.ID_PROD,
          ID_VENDEUR: form.ID_VENDEUR,
          DateVente: form.DateVente,
          Prix_unitaire: prix,
          Quantite: quantite
        });

        // Créer l'achat correspondant
        const purchasePromise = addPurchase({
          ID_CLIENT: form.ID_CLIENT,
          ID_PROD: film.ID_PROD,
          DateAchat: form.DateVente, // Même date que la vente
          Prix_unitaire: prix,
          Quantite: quantite
        });

        // Attendre que les deux opérations soient terminées
        const [saleResult, purchaseResult] = await Promise.all([salePromise, purchasePromise]);

        console.log(`✅ Vente et achat créés pour le film ${film.ID_PROD}`);
        return { sale: saleResult, purchase: purchaseResult };
      });

      // Attendre que toutes les transactions soient terminées
      const results = await Promise.allSettled(transactionPromises);

      // Vérifier s'il y a eu des erreurs
      const failures = results.filter(result => result.status === 'rejected');
      const successes = results.filter(result => result.status === 'fulfilled');

      console.log(`📊 Résultats: ${successes.length} succès, ${failures.length} échecs`);

      if (failures.length > 0) {
        console.error('❌ Échecs détectés:', failures);
        throw new Error(`${failures.length} transaction(s) ont échoué. Vérifiez la console pour plus de détails.`);
      }

      console.log('🎉 Toutes les ventes et achats ont été créés avec succès !');

      // Garder les films sélectionnés pour la facturation
      // Ne pas vider les films sélectionnés ici
      setForm({ ID_CLIENT: '', ID_VENDEUR: '', DateVente: '' });

      // Afficher une notification de succès
      const successNotification = document.createElement('div');
      successNotification.className = 'notification-toast-modern notification-success-modern';
      successNotification.innerHTML = `
        <div class="notification-content-modern">
          <div class="notification-icon-modern">✅</div>
          <div class="notification-text-modern">
            <div class="notification-title-modern">Vente réussie !</div>
            <div class="notification-message-modern">${selectedFilms.length} vente(s) enregistrée(s)</div>
            <div class="notification-message-modern">🔄 Redirection vers Achats...</div>
          </div>
        </div>
      `;
      document.body.appendChild(successNotification);
      setTimeout(() => successNotification.classList.add('show'), 10);

      // Rediriger vers Achats pour la facturation
      console.log('🔄 Tentative de redirection vers Achats...');
      if (setActiveTab) {
        console.log('✅ setActiveTab disponible, redirection programmée');
        setTimeout(() => {
          console.log('🚀 Exécution de la redirection vers Achats');
          setActiveTab('achats');
          console.log('✅ Redirection vers Achats effectuée');

          // Supprimer la notification après redirection
          successNotification.classList.remove('show');
          setTimeout(() => {
            if (document.body.contains(successNotification)) {
              document.body.removeChild(successNotification);
            }
          }, 300);
        }, 1000); // Délai réduit pour une redirection plus rapide
      } else {
        console.error('❌ setActiveTab non disponible dans Ventes');

        // Afficher une erreur si la redirection échoue
        successNotification.innerHTML = `
          <div class="notification-content-modern">
            <div class="notification-icon-modern">⚠️</div>
            <div class="notification-text-modern">
              <div class="notification-title-modern">Vente réussie !</div>
              <div class="notification-message-modern">Redirection vers Achats manuelle requise</div>
            </div>
          </div>
        `;

        setTimeout(() => {
          successNotification.classList.remove('show');
          setTimeout(() => {
            if (document.body.contains(successNotification)) {
              document.body.removeChild(successNotification);
            }
          }, 300);
        }, 3000);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveFilm = (productId) => {
    if (onFilmRemoved) {
      onFilmRemoved(productId);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    // Mettre à jour la quantité du film dans la liste sélectionnée
    if (onQuantityChanged) {
      onQuantityChanged(productId, Math.max(1, parseInt(newQuantity) || 1));
    }
  };



  return (
    <div className="section-card fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-title">
          <i className="bi bi-cash-coin me-2"></i>
          Finaliser l'achat
          <span className="badge bg-primary ms-2">{selectedFilms.length}</span>
        </h2>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              if (setActiveTab) {
                setActiveTab('catalogue');
              }
            }}
            type="button"
          >
            <i className="bi bi-plus-circle me-1"></i>
            Ajouter plus de films
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              if (setActiveTab) {
                setActiveTab('catalogue');
              }
            }}
            type="button"
          >
            <i className="bi bi-arrow-left me-1"></i>
            Retour au Catalogue
          </button>
          {selectedFilms.length > 0 && (
            <>
              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  if (window.confirm('Voulez-vous vraiment vider toute la sélection ?')) {
                    selectedFilms.forEach(film => onFilmRemoved && onFilmRemoved(film.ID_PROD));
                    setForm({ ID_CLIENT: '', ID_VENDEUR: '', DateVente: '' });
                  }
                }}
                type="button"
                title="Vider toute la sélection"
              >
                <i className="bi bi-trash me-1"></i>
                Vider la sélection
              </button>
              <button
                className="btn btn-outline-info"
                onClick={() => {
                  console.log('🧪 Test de redirection vers Achats');
                  if (setActiveTab) {
                    setActiveTab('achats');
                    console.log('✅ Test réussi - Redirection vers Achats');
                  } else {
                    console.error('❌ setActiveTab non disponible pour le test');
                  }
                }}
                type="button"
                title="Tester la redirection vers Achats"
              >
                <i className="bi bi-gear me-1"></i>
                Test Redirection Achats
              </button>
            </>
          )}
        </div>
      </div>
      {/* Liste des films sélectionnés */}
      {selectedFilms.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-3">
            <i className="bi bi-film me-2"></i>
            Films sélectionnés ({selectedFilms.length})
            <span className="badge bg-info ms-2">
              <i className="bi bi-info-circle me-1"></i>
              Conservés lors du retour au catalogue
            </span>
          </h4>
          <div className="row g-3">
            {selectedFilms.map(film => {
              const product = products.find(p => p.ID_PROD === film.ID_PROD);
              return (
                <div key={film.ID_PROD} className="col-md-6 col-lg-4">
                  <div className="card border-primary">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-title mb-1">
                            <i className="bi bi-film me-1"></i>
                            {product?.Titre || 'Film inconnu'}
                          </h6>
                          <p className="card-text small text-muted mb-2">
                            Prix: {product?.Prix_unitaire || 500} ARIARY
                          </p>
                          <div className="d-flex align-items-center">
                            <label className="form-label me-2 mb-0 small">Quantité:</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '80px' }}
                              min="1"
                              value={film.quantite || 1}
                              onChange={(e) => handleQuantityChange(film.ID_PROD, parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveFilm(film.ID_PROD)}
                          title="Retirer ce film"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedFilms.length === 0 && (
        <div className="alert alert-info text-center mb-4">
          <div className="mb-2">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Aucun film sélectionné</strong>
          </div>
          <p className="mb-2">Retournez au catalogue pour choisir des films à acheter.</p>
          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab && setActiveTab('catalogue')}
            >
              <i className="bi bi-film me-1"></i>
              Aller au Catalogue
            </button>
          </div>
        </div>
      )}

      {/* Message informatif sur le workflow */}
      {selectedFilms.length > 0 && (
        <div className="alert alert-success mb-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-lightbulb me-2"></i>
            <div>
              <strong>Workflow d'achat :</strong>
              <ol className="mb-0 mt-2">
                <li>Selectionneo ao @ catalogue ny FILM anao</li>
                <li>Miverena eto rehefa aveo amaetrahana ny anaranao sy date ary andray anao teto</li>
                <li>Tsindrio outon Achats rehefa vita izay rehtra izay</li>
                <li>any @achats no manao factures fa tsy ato tompoko</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <form className="row g-3 mb-4 fade-in" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label className="form-label">Client</label>
          <select className="form-control" name="ID_CLIENT" value={form.ID_CLIENT} onChange={handleChange} required>
            <option value="">Choisir un client</option>
            {clients.map(cli => (
              <option key={cli.ID_CLIENT} value={cli.ID_CLIENT}>{cli.NomCli} {cli.PrenomCli}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Vendeur</label>
          <select className="form-control" name="ID_VENDEUR" value={form.ID_VENDEUR} onChange={handleChange} required>
            <option value="">Choisir un vendeur</option>
            {vendors.map(v => (
              <option key={v.ID_VENDEUR} value={v.ID_VENDEUR}>{v.NomVendeur} {v.PrenomVendeur}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Date de vente</label>
          <input type="date" className="form-control" name="DateVente" value={form.DateVente} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success btn-lg" disabled={formLoading || selectedFilms.length === 0}>
            {formLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Enregistrement en cours...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Finaliser l'achat et aller aux Achats
                <br />
                <small className="text-white-50">
                  ({selectedFilms.length} film{selectedFilms.length > 1 ? 's' : ''} → Facturation)
                </small>
              </>
            )}
          </button>
        </div>
        {formError && <div className="alert alert-danger mt-2">{formError}</div>}
      </form>
    </div>
  );
}

export default Ventes; 