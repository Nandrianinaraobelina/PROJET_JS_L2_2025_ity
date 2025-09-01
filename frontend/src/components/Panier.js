import React, { useEffect, useState } from 'react';
import './Catalogue.css';
import { addPurchase } from '../services/purchaseService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Panier({ setActiveTab }) {
  // Ajout du design blur sur le conteneur principal

  // Toast notification
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type }), 2600);
  };
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [achatLoading, setAchatLoading] = useState(false);
  const [achatMsg, setAchatMsg] = useState('');






  // Vider le panier
  const clearPanier = () => {
    console.log('🗑️ Vidage du panier');
    localStorage.removeItem('panier');
    localStorage.removeItem('panier_force');
    localStorage.removeItem('panier_backup');
    localStorage.removeItem('panier_emergency_backup');
    localStorage.removeItem('panier_timestamp');
    localStorage.removeItem('panier_last_update');
    localStorage.removeItem('panier_error_timestamp');
    localStorage.removeItem('panier_auto_recovery');
    localStorage.removeItem('panier_emergency_recovery');
    setCart([]);
    setTotal(0);
    showToast('Panier vidé complètement', 'warning');
  };

  // Fonction pour charger le panier depuis localStorage
  const loadCartFromStorage = () => {
    console.log('🔄 CHARGEMENT PANIER - Début');

    try {
      // Vérifier tous les emplacements possibles
      const timestamp = localStorage.getItem('panier_timestamp');
      const lastUpdate = localStorage.getItem('panier_last_update');
      const errorTimestamp = localStorage.getItem('panier_error_timestamp');

      console.log('⏰ Timestamp panier:', timestamp);
      console.log('📅 Last Update:', lastUpdate);
      console.log('⚠️ Error Timestamp:', errorTimestamp);

      let stored = localStorage.getItem('panier');
      let source = 'principal';

      console.log('📦 localStorage panier (principal):', stored ? stored.substring(0, 100) + '...' : 'null');

      // Si pas de données principales, essayer toutes les alternatives
      if (!stored || stored.trim() === '' || stored === 'undefined' || stored === 'null') {
        console.log('🔄 Recherche de sauvegardes alternatives...');

        // Essayer la sauvegarde forcée
        stored = localStorage.getItem('panier_force');
        if (stored && stored.trim() !== '') {
          source = 'forcée';
          console.log('📦 Sauvegarde forcée trouvée:', stored.substring(0, 100) + '...');
        } else {
          // Essayer la sauvegarde alternative
          stored = localStorage.getItem('panier_backup');
          if (stored && stored.trim() !== '') {
            source = 'alternative';
            console.log('📦 Sauvegarde alternative trouvée:', stored.substring(0, 100) + '...');
          }
        }
      }

      console.log('🎯 Source des données:', source);

      if (stored && stored.trim() !== '' && stored !== 'undefined' && stored !== 'null') {
        console.log('🔍 Tentative de parsing JSON...');
        const parsed = JSON.parse(stored);
        console.log('🎯 JSON.parse() réussi, type:', typeof parsed, 'length:', Array.isArray(parsed) ? parsed.length : 'N/A');

        if (Array.isArray(parsed)) {
          console.log('📋 Tableau détecté avec', parsed.length, 'éléments bruts');

          // Nettoyer les données invalides avec logique plus souple
          const cleanItems = parsed.filter((item, index) => {
            // Accepter les objets qui ont au moins un identifiant ou un titre
            const isValid = item &&
                           typeof item === 'object' &&
                           (item.Titre || item.title || item.ID_PROD || item.id);

            if (!isValid) {
              console.log(`⚠️ Item ${index} invalide filtré:`, item);
            }

            return isValid;
          });

          console.log('🧹 Nettoyage terminé:', cleanItems.length, '/', parsed.length, 'items valides');

          if (cleanItems.length > 0) {
            console.log('✅ Panier valide avec', cleanItems.length, 'articles');
            setCart(cleanItems);

            const calculatedTotal = cleanItems.reduce((sum, item) => {
              const price = item?.Prix_unitaire || item?.price || 500;
              const quantity = item?.quantite || item?.quantity || 1;
              const itemTotal = price * quantity;
              console.log(`💵 Item "${item.Titre || item.title}": ${price} x ${quantity} = ${itemTotal}`);
              return sum + itemTotal;
            }, 0);

            setTotal(calculatedTotal);
            console.log('💰 Total final calculé:', calculatedTotal);

            // Sauvegarder immédiatement pour confirmer
            try {
              localStorage.setItem('panier', JSON.stringify(cleanItems));
              console.log('🔄 Données resynchronisées dans localStorage');
            } catch (resyncError) {
              console.error('❌ Échec resynchronisation:', resyncError);
            }

          } else {
            console.log('⚠️ Aucun item valide trouvé après nettoyage');
            setCart([]);
            setTotal(0);
          }
        } else {
          console.log('⚠️ Données panier pas un tableau, type:', typeof parsed);
          setCart([]);
          setTotal(0);
        }
      } else {
        console.log('📭 Aucun panier trouvé dans toutes les sources');
        console.log('🔍 État localStorage:');
        console.log('  - panier:', localStorage.getItem('panier'));
        console.log('  - panier_force:', localStorage.getItem('panier_force'));
        console.log('  - panier_backup:', localStorage.getItem('panier_backup'));
        setCart([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('❌ ERREUR CRITIQUE chargement panier:', error);
      console.error('Stack trace:', error.stack);

      // En cas d'erreur, essayer de récupérer depuis les backups
      try {
        const backup = localStorage.getItem('panier_backup');
        if (backup) {
          console.log('🔧 Tentative récupération backup...');
          const parsedBackup = JSON.parse(backup);
          if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
            console.log('✅ Récupération backup réussie');
            setCart(parsedBackup);
            setTotal(parsedBackup.reduce((sum, item) =>
              sum + ((item?.Prix_unitaire || item?.price || 500) * (item?.quantite || item?.quantity || 1)), 0
            ));
            return;
          }
        }
      } catch (backupError) {
        console.error('❌ Échec récupération backup:', backupError);
      }

      // Si tout échoue
      setCart([]);
      setTotal(0);
    }

    console.log('🔄 CHARGEMENT PANIER - Fin');
  };

  // Surveillance continue pour auto-récupération
  useEffect(() => {
    const checkAndRecover = () => {
    const stored = localStorage.getItem('panier');
      const currentLength = cart.length;

    if (stored) {
        try {
      const parsed = JSON.parse(stored);
          const storedLength = parsed.length;

          if (storedLength !== currentLength && storedLength > currentLength) {
            console.warn('🔄 PANIER: Désynchronisation détectée, auto-récupération...');
            console.log('📊 Panier actuel:', currentLength, 'localStorage:', storedLength);

            // Auto-récupération depuis localStorage
            const cleanItems = parsed.filter(item =>
              item &&
              (item.Titre || item.title) &&
              typeof item === 'object'
            );

            if (cleanItems.length > 0) {
              console.log('✅ Récupération automatique:', cleanItems.length, 'films');
              setCart(cleanItems);

              const calculatedTotal = cleanItems.reduce((sum, item) => {
                const price = item?.Prix_unitaire || item?.price || 500;
                const quantity = item?.quantite || item?.quantity || 1;
                return sum + (price * quantity);
              }, 0);

              setTotal(calculatedTotal);
              console.log('💰 Total recalculé:', calculatedTotal);
            }
          }
        } catch (error) {
          console.error('❌ Erreur auto-récupération Panier:', error);
        }
      }
    };

    // Vérifier toutes les 4 secondes
    const recoveryInterval = setInterval(checkAndRecover, 4000);
    return () => clearInterval(recoveryInterval);
  }, [cart]);

  useEffect(() => {
    console.log('🚀 Panier component mounted');
    // Charger le panier au démarrage
    loadCartFromStorage();

    // Écouter les mises à jour du panier
    const handlePanierUpdate = (event) => {
      console.log('🛒 Événement panierUpdated reçu:', event.detail);
      console.log('⏳ Attente avant rechargement pour synchro...');

      // Attendre un délai plus long pour s'assurer que toutes les sauvegardes sont terminées
      setTimeout(() => {
        console.log('🔄 Rechargement du panier depuis localStorage...');
        loadCartFromStorage();
      }, 800); // Augmenté à 800ms pour être sûr que tout est synchronisé
    };

    console.log('👂 Ajout de l\'écouteur d\'événements');
    window.addEventListener('panierUpdated', handlePanierUpdate);

    // Nettoyer l'écouteur
    return () => {
      console.log('🧹 Nettoyage de l\'écouteur d\'événements');
      window.removeEventListener('panierUpdated', handlePanierUpdate);
    };
  }, []);

  // Génère et télécharge une facture PDF par client
  const generatePDF = (cart) => {
    if (!cart.length) return;
    // Grouper les achats par client
    const grouped = {};
    cart.forEach(item => {
      const clientId = item.client ? item.client.ID_CLIENT : 'inconnu';
      if (!grouped[clientId]) grouped[clientId] = [];
      grouped[clientId].push(item);
    });
    // Générer une facture par client
    Object.values(grouped).forEach(clientItems => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Facture d\'achat', 80, 18);
      doc.setFontSize(11);
      const client = clientItems[0].client;
      doc.text('Date : ' + new Date().toLocaleDateString(), 14, 28);
      doc.text('Client : ' + (client ? client.NomCli + ' ' + client.PrenomCli : '-'), 14, 36);
      doc.text('Vendeur(s) :', 14, 44);
      // Lister tous les vendeurs pour ce client
      const vendeurs = [...new Set(clientItems.map(i => i.vendeur ? (i.vendeur.NomVendeur + ' ' + i.vendeur.PrenomVendeur) : ''))];
      vendeurs.forEach((v,i) => { if (v) doc.text('- ' + v, 30, 52 + i*7); });
      const vendY = 52 + (vendeurs.length ? vendeurs.length*7 : 0);
      autoTable(doc, {
        startY: vendY + 2,
        head: [["Film", "Quantité", "Prix unitaire", "Total"]],
        body: clientItems.map(item => [
          item.Titre,
          item.quantite || 1,
          '500 ARIARY',
          (item.quantite ? item.quantite * 500 : 500) + ' ARIARY'
        ]),
        styles: { fontSize: 11 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        margin: { left: 14, right: 14 },
      });
      doc.setFontSize(13);
      doc.text('Total : ' + clientItems.reduce((sum, item) => sum + (item.quantite ? item.quantite * 500 : 500), 0) + ' ARIARY', 14, doc.lastAutoTable.finalY + 12);
      doc.setFontSize(10);
      doc.text('Merci pour votre achat !', 14, doc.lastAutoTable.finalY + 20);
      doc.save('facture_achat_' + (client ? client.NomCli : 'client') + '.pdf');
    });
  };


  const retirer = (idx) => {
    const newCart = cart.filter((_, i) => i !== idx);
    setCart(newCart);
    setTotal(newCart.reduce((sum, item) => sum + (item.quantite ? item.quantite * 500 : 500), 0));
    localStorage.setItem('panier', JSON.stringify(newCart));
  };

  const vider = () => {
    setCart([]);
    setTotal(0);
    localStorage.removeItem('panier');
  };

  return (
    <div className="panier-container-modern">
      {/* Toast notification moderne */}
      {toast.show && (
        <div className="toast-modern" style={{
          position: 'fixed',
          top: 100,
          right: 30,
          zIndex: 2000,
          minWidth: 320
        }}>
          <div className={`toast-content-modern ${toast.type === 'danger' ? 'toast-error' : 'toast-success'}`}>
            <div className="toast-icon-modern">
              {toast.type === 'danger' ? '❌' : '✅'}
            </div>
            <div className="toast-text-modern">{toast.msg}</div>
          </div>
        </div>
      )}

      <div className="panier-wrapper-modern">
        {/* Header moderne */}
        <div className="panier-header-modern">
          <div className="panier-title-modern">
            <div className="panier-icon-modern">🛒</div>
            <h2 className="panier-title-text-modern">Mon Panier</h2>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="panier-content-modern">
          {cart.length === 0 ? (
            <div className="panier-empty-modern">
              <div className="panier-empty-icon-modern">📭</div>
              <h3 className="panier-empty-title-modern">Votre panier est vide</h3>
              <p className="panier-empty-text-modern">
                Découvrez notre catalogue et ajoutez des films à votre panier !
              </p>
              <button
                className="btn-glass-modern btn-bounce"
                onClick={() => setActiveTab && setActiveTab('catalogue')}
              >
                <i className="bi bi-collection me-2"></i>
                Explorer le Catalogue
              </button>


            </div>
          ) : (
            <div className="panier-items-modern">
              {/* Liste des articles */}
              <div className="panier-items-list-modern">
                {cart.map((item, idx) => (
                  <div className="panier-item-modern" key={idx}>
                    <div className="panier-item-content-modern">
                      <div className="panier-item-header-modern">
                        <div className="panier-item-title-modern">
                          <i className="bi bi-film me-2"></i>
                          {item.Titre}
                        </div>
                        <button
                          className="panier-item-remove-modern"
                          onClick={() => retirer(idx)}
                          title="Retirer du panier"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>

                      <div className="panier-item-details-modern">
                      {item.client && (
                          <div className="panier-item-client-modern">
                            <i className="bi bi-person me-1"></i>
                            {item.client.NomCli} {item.client.PrenomCli}
                          </div>
                      )}
                      {item.vendeur && (
                          <div className="panier-item-vendeur-modern">
                            <i className="bi bi-shop me-1"></i>
                            {item.vendeur.NomVendeur} {item.vendeur.PrenomVendeur}
                          </div>
                      )}
                    </div>

                      <div className="panier-item-footer-modern">
                        <div className="panier-item-quantity-modern">
                          Quantité: <span className="quantity-value-modern">{item.quantite || 1}</span>
                        </div>
                        <div className="panier-item-price-modern">
                          {(item.quantite ? item.quantite * 500 : 500)} ARIARY
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé et total */}
              <div className="panier-summary-modern">
                <div className="panier-summary-content-modern">
                  <div className="panier-summary-row-modern">
                    <span className="panier-summary-label-modern">Total articles:</span>
                    <span className="panier-summary-value-modern">{cart.length}</span>
                  </div>
                  <div className="panier-summary-row-modern">
                    <span className="panier-summary-label-modern">Total quantité:</span>
                    <span className="panier-summary-value-modern">
                      {cart.reduce((sum, item) => sum + (item.quantite || 1), 0)}
                    </span>
                  </div>
                  <div className="panier-summary-divider-modern"></div>
                  <div className="panier-summary-row-modern panier-summary-total-modern">
                    <span className="panier-summary-label-modern">Total à payer:</span>
                    <span className="panier-summary-value-modern panier-total-price-modern">
                      {total} ARIARY
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="panier-actions-modern">
                <button
                  className={`btn-success-modern flex-fill ${achatLoading ? 'btn-loading' : ''}`}
                  disabled={achatLoading}
                  onClick={async () => {
                setAchatLoading(true);
                setAchatMsg('');
                try {
                  for (const item of cart) {
                    await addPurchase({
                      ID_CLIENT: item.client.ID_CLIENT,
                      ID_PROD: item.ID_PROD,
                      ID_VENDEUR: item.vendeur ? item.vendeur.ID_VENDEUR : undefined,
                      DateAchat: new Date().toISOString().slice(0, 10),
                      Prix_unitaire: 500,
                      Quantite: item.quantite || 1
                    });
                  }
                  setAchatMsg('Achats enregistrés avec succès !');
                  showToast('Facture générée et achats enregistrés !','success');
                  generatePDF(cart);
                  setTimeout(() => {
                    vider();
                    setAchatLoading(false);
                    if (setActiveTab) setActiveTab('achats');
                  }, 1700);
                } catch (e) {
                  setAchatMsg('Erreur lors de la création des achats.');
                  showToast('Erreur lors de la création des achats.','danger');
                  setAchatLoading(false);
                }
                  }}
                >
                  {achatLoading ? (
                    <>
                      <div className="spinner-modern me-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-receipt me-2"></i>
                      Acheter & Télécharger Facture
                    </>
                  )}
                </button>

                <button
                  className="btn-ghost-modern flex-fill"
                  onClick={vider}
                  disabled={achatLoading}
                >
                  <i className="bi bi-trash me-2"></i>
                  Vider le Panier
                </button>
              </div>

              {achatMsg && (
                <div className={`panier-message-modern ${achatMsg.startsWith('Erreur') ? 'panier-message-error' : 'panier-message-success'}`}>
                  <div className="panier-message-icon-modern">
                    {achatMsg.startsWith('Erreur') ? '❌' : '✅'}
                  </div>
                  <div className="panier-message-text-modern">{achatMsg}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Panier;
