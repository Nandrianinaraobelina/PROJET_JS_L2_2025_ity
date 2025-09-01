import React, { useEffect, useState } from 'react';
import { getPurchases, addPurchase, updatePurchase, deletePurchase } from '../services/purchaseService';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';//exporte an'ilay pdf ny eto

function Achats() {
  // Ajout du design blur sur le conteneur principal

  const [purchases, setPurchases] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    ID_CLIENT: '',
    ID_PROD: '',
    DateAchat: '',
    Prix_unitaire: '',
    Quantite: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [deletedPurchases, setDeletedPurchases] = useState([]); // Corbeille pour les achats supprimés
  const [showTrash, setShowTrash] = useState(false); // Afficher/cacher la corbeille

  useEffect(() => {
    fetchAll();

    // Restaurer la corbeille depuis localStorage si elle existe et n'est pas expirée
    const savedTrash = localStorage.getItem('achats_deleted_trash');
    if (savedTrash) {
      try {
        const trashData = JSON.parse(savedTrash);
        const now = Date.now();
        const expiryTime = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

        if (now - trashData.timestamp < expiryTime) {
          setDeletedPurchases(trashData.items);
          console.log(`🗑️ Corbeille restaurée : ${trashData.items.length} élément(s)`);
        } else {
          localStorage.removeItem('achats_deleted_trash');
          console.log('🗑️ Corbeille expirée supprimée automatiquement');
        }
      } catch (error) {
        console.error('Erreur lors de la restauration de la corbeille:', error);
        localStorage.removeItem('achats_deleted_trash');
      }
    }

    // Synchroniser avec le Dashboard au chargement d'Achats
    const syncWithDashboard = () => {
      if (window.dashboardRefreshStats) {
        console.log('🔄 Synchronisation initiale avec le Dashboard...');
        setTimeout(() => {
          window.dashboardRefreshStats();
        }, 1000); // Petit délai pour laisser le temps au Dashboard de s'initialiser
      }
    };

    syncWithDashboard();

    // Cleanup function : sauvegarder et nettoyer la corbeille
    return () => {
      console.log('🏁 Sortie de la page Achats');

      if (deletedPurchases.length > 0) {
        // Sauvegarder temporairement la corbeille dans localStorage (expire dans 24h)
        const trashData = {
          items: deletedPurchases,
          timestamp: Date.now()
        };
        localStorage.setItem('achats_deleted_trash', JSON.stringify(trashData));
        console.log(`💾 Corbeille sauvegardée temporairement : ${deletedPurchases.length} élément(s)`);
      } else {
        // Supprimer toute ancienne sauvegarde si la corbeille est vide
        localStorage.removeItem('achats_deleted_trash');
      }
    };
  }, []);



  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [p, c, f] = await Promise.all([
        getPurchases(),
        getClients(),
        getProducts()
      ]);
      setPurchases(p);
      setClients(c);
      setProducts(f);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.ID_CLIENT || !form.ID_PROD || !form.DateAchat || !form.Prix_unitaire || !form.Quantite) {
      setFormError('Tous les champs sont obligatoires');
      return;
    }
    setFormLoading(true);
    try {
      if (editId) {
        await updatePurchase(editId, form);
      } else {
        await addPurchase(form);
      }
      setForm({ ID_CLIENT: '', ID_PROD: '', DateAchat: '', Prix_unitaire: '', Quantite: '' });
      setEditId(null);
      fetchAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (purchase) => {
    // Trouver les détails pour une meilleure UX
    const client = clients.find(c => c.ID_CLIENT === purchase.ID_CLIENT);
    const product = products.find(p => p.ID_PROD === purchase.ID_PROD);

    // Remplir le formulaire avec les données de l'achat
    setForm({
      ID_CLIENT: purchase.ID_CLIENT,
      ID_PROD: purchase.ID_PROD,
      DateAchat: purchase.DateAchat ? purchase.DateAchat.substring(0, 10) : '',
      Prix_unitaire: purchase.Prix_unitaire,
      Quantite: purchase.Quantite,
    });
    setEditId(purchase.ID_ACHAT);

    // Afficher une notification informative
    const editNotification = document.createElement('div');
    editNotification.className = 'notification-toast-modern notification-info-modern';
    editNotification.innerHTML = `
      <div class="notification-content-modern">
        <div class="notification-icon-modern">✏️</div>
        <div class="notification-text-modern">
          <div class="notification-title-modern">Mode édition activé</div>
          <div class="notification-message-modern">
            Modification de l'achat: ${product?.Titre || 'Film inconnu'}<br>
            Client: ${client?.NomCli || ''} ${client?.PrenomCli || ''}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(editNotification);
    setTimeout(() => editNotification.classList.add('show'), 10);
    setTimeout(() => {
      editNotification.classList.remove('show');
      setTimeout(() => document.body.removeChild(editNotification), 300);
    }, 2500);

    // Faire défiler vers le formulaire pour une meilleure UX
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Ajouter une animation temporaire sur le formulaire
      formElement.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.3)';
      setTimeout(() => {
        formElement.style.boxShadow = '';
      }, 2000);
    }
  };

  const handleDelete = async (id) => {
    // Trouver les détails de l'achat pour une meilleure confirmation
    const purchase = purchases.find(p => p.ID_ACHAT === id);
    const client = clients.find(c => c.ID_CLIENT === purchase?.ID_CLIENT);
    const product = products.find(p => p.ID_PROD === purchase?.ID_PROD);

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer cet achat ?\n\n` +
      `Client: ${client?.NomCli || ''} ${client?.PrenomCli || ''}\n` +
      `Film: ${product?.Titre || 'Film inconnu'}\n` +
      `Date: ${purchase?.DateAchat ? purchase.DateAchat.substring(0, 10) : 'N/A'}\n` +
      `Total: ${purchase?.Prix_unitaire * purchase?.Quantite || 0} ARIARY\n\n` +
      `Cette action est irréversible !`;

    if (window.confirm(confirmMessage)) {
      try {
        setFormLoading(true);

        // Afficher une notification de suppression en cours
        const loadingNotification = document.createElement('div');
        loadingNotification.className = 'notification-toast-modern notification-warning-modern';
        loadingNotification.innerHTML = `
          <div class="notification-content-modern">
            <div class="notification-icon-modern">⏳</div>
            <div class="notification-text-modern">
              <div class="notification-title-modern">Suppression en cours...</div>
              <div class="notification-message-modern">Suppression de l'achat en cours</div>
            </div>
          </div>
        `;
        document.body.appendChild(loadingNotification);
        setTimeout(() => loadingNotification.classList.add('show'), 10);

        await deletePurchase(id);

        // Supprimer la notification de chargement
        loadingNotification.classList.remove('show');
        setTimeout(() => document.body.removeChild(loadingNotification), 300);

        // Actualiser les données
        await fetchAll();

        // Synchroniser avec le Dashboard
        if (window.dashboardRefreshStats) {
          console.log('🔄 Synchronisation avec le Dashboard...');
          window.dashboardRefreshStats();
        }

        // Afficher une notification de succès
        const successNotification = document.createElement('div');
        successNotification.className = 'notification-toast-modern notification-success-modern';
        successNotification.innerHTML = `
          <div class="notification-content-modern">
            <div class="notification-icon-modern">✅</div>
            <div class="notification-text-modern">
              <div class="notification-title-modern">Achat supprimé !</div>
              <div class="notification-message-modern">L'achat a été supprimé avec succès</div>
            </div>
          </div>
        `;
        document.body.appendChild(successNotification);
        setTimeout(() => successNotification.classList.add('show'), 10);
        setTimeout(() => {
          successNotification.classList.remove('show');
          setTimeout(() => document.body.removeChild(successNotification), 300);
        }, 3000);

      } catch (err) {
        console.error('Erreur lors de la suppression:', err);

        // Supprimer la notification de chargement en cas d'erreur
        const existingNotifications = document.querySelectorAll('.notification-warning-modern');
        existingNotifications.forEach(notification => {
          notification.classList.remove('show');
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        });

        // Afficher une notification d'erreur
        const errorNotification = document.createElement('div');
        errorNotification.className = 'notification-toast-modern notification-error-modern';
        errorNotification.innerHTML = `
          <div class="notification-content-modern">
            <div class="notification-icon-modern">❌</div>
            <div class="notification-text-modern">
              <div class="notification-title-modern">Erreur de suppression</div>
              <div class="notification-message-modern">${err.message || 'Une erreur est survenue'}</div>
            </div>
          </div>
        `;
        document.body.appendChild(errorNotification);
        setTimeout(() => errorNotification.classList.add('show'), 10);
        setTimeout(() => {
          errorNotification.classList.remove('show');
          setTimeout(() => document.body.removeChild(errorNotification), 300);
        }, 4000);

        alert(`Erreur lors de la suppression: ${err.message}`);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setForm({ ID_CLIENT: '', ID_PROD: '', DateAchat: '', Prix_unitaire: '', Quantite: '' });
    setEditId(null);
    setFormError('');
  };

    // Exclure seulement les achats supprimés (pas de filtrage)
  const filteredPurchases = purchases.filter(pur => {
    // Vérifier que l'achat n'est pas dans la corbeille (supprimé)
    return !deletedPurchases.some(deleted => deleted.ID_ACHAT === pur.ID_ACHAT);
  });

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const paginatedPurchases = filteredPurchases.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Liste des achats', 14, 15);
    doc.setFontSize(10);
    doc.text('Exporté le : ' + new Date().toLocaleString(), 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [[
        'ID achat', 'Client', 'Film', 'Date', 'Prix unitaire', 'Quantité'
      ]],
      body: paginatedPurchases.map(pur => [
        pur.ID_ACHAT,
        (clients.find(c => c.ID_CLIENT === pur.ID_CLIENT) || {}).NomCli,
        (products.find(p => p.ID_PROD === pur.ID_PROD) || {}).Titre,
        pur.DateAchat ? pur.DateAchat.substring(0, 10) : '',
        pur.Prix_unitaire,
        pur.Quantite
      ]),
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });
    doc.save('achats.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(paginatedPurchases.map(pur => ({
      'ID achat': pur.ID_ACHAT,
      'Client': (clients.find(c => c.ID_CLIENT === pur.ID_CLIENT) || {}).NomCli,
      'Film': (products.find(p => p.ID_PROD === pur.ID_PROD) || {}).Titre,
      'Date': pur.DateAchat ? pur.DateAchat.substring(0, 10) : '',
      'Prix unitaire': pur.Prix_unitaire,
      'Quantité': pur.Quantite
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Achats');
    XLSX.writeFile(wb, 'achats.xlsx');
  };

  // Fonction utilitaire pour regrouper les achats par client et date
  const groupPurchasesByClientAndDate = (targetPurchase) => {
    const clientId = targetPurchase.ID_CLIENT;
    const purchaseDate = targetPurchase.DateAchat ? targetPurchase.DateAchat.substring(0, 10) : '';

    // Filtrer tous les achats du même client à la même date
    const relatedPurchases = purchases.filter(p =>
      p.ID_CLIENT === clientId &&
      p.DateAchat &&
      p.DateAchat.substring(0, 10) === purchaseDate
    );

    return {
      client: clients.find(c => c.ID_CLIENT === clientId) || {},
      purchases: relatedPurchases,
      totalAmount: relatedPurchases.reduce((sum, p) => sum + (p.Prix_unitaire * p.Quantite), 0),
      purchaseDate: purchaseDate
    };
  };

  const previewInvoice = (achat) => {
    // Utiliser les achats filtrés (tous les achats du client dans la liste actuelle)
    const clientPurchases = filteredPurchases.filter(p => p.ID_CLIENT === achat.ID_CLIENT);
    const client = clients.find(c => c.ID_CLIENT === achat.ID_CLIENT) || {};
    const totalAmount = clientPurchases.reduce((sum, p) => sum + (p.Prix_unitaire * p.Quantite), 0);
    const purchaseDate = clientPurchases.length > 0 ? clientPurchases[0].DateAchat?.substring(0, 10) : '';

    const purchases = clientPurchases;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('FACTURE CONSOLIDÉE', 14, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${purchaseDate}`, 14, 35);
    doc.text(`Client: ${client.NomCli || ''} ${client.PrenomCli || ''}`, 14, 45);
    if (client.Email) {
      doc.text(`Email: ${client.Email}`, 14, 55);
    }

    // En-tête du tableau
    doc.setFontSize(10);
    doc.text('DÉTAIL DES ACHATS', 14, 70);

    let yPosition = 80;

    // Ligne d'en-tête du tableau
    doc.setFont('helvetica', 'bold');
    doc.text('Produit', 14, yPosition);
    doc.text('Prix Unit.', 100, yPosition);
    doc.text('Qté', 140, yPosition);
    doc.text('Total', 160, yPosition);
    doc.line(14, yPosition + 2, 190, yPosition + 2);

    yPosition += 10;
    doc.setFont('helvetica', 'normal');

    // Détails de chaque produit
    purchases.forEach((purchase, index) => {
      const produit = products.find(p => p.ID_PROD === purchase.ID_PROD) || {};
      const itemTotal = purchase.Prix_unitaire * purchase.Quantite;

      if (yPosition > 250) { // Nouvelle page si nécessaire
        doc.addPage();
        yPosition = 20;
      }

      doc.text(produit.Titre || 'Produit inconnu', 14, yPosition);
      doc.text(`${purchase.Prix_unitaire} Ar`, 100, yPosition);
      doc.text(`${purchase.Quantite}`, 145, yPosition);
      doc.text(`${itemTotal} Ar`, 160, yPosition);

      yPosition += 8;
    });

    // Ligne de séparation
    yPosition += 5;
    doc.line(14, yPosition, 190, yPosition);
    yPosition += 8;

    // Total général
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL GÉNÉRAL: ${totalAmount} Ar`, 120, yPosition);

    // Informations supplémentaires
    yPosition += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Nombre d'articles: ${purchases.length}`, 14, yPosition);
    doc.text(`Facture générée le: ${new Date().toLocaleDateString('fr-FR')}`, 14, yPosition + 8);

    // Aperçu dans un nouvel onglet PDF
    window.open(doc.output('bloburl'), '_blank');
  };

  const generateInvoice = (achat) => {
    // Utiliser les achats filtrés (tous les achats du client dans la liste actuelle)
    const clientPurchases = filteredPurchases.filter(p => p.ID_CLIENT === achat.ID_CLIENT);
    const client = clients.find(c => c.ID_CLIENT === achat.ID_CLIENT) || {};
    const totalAmount = clientPurchases.reduce((sum, p) => sum + (p.Prix_unitaire * p.Quantite), 0);
    const purchaseDate = clientPurchases.length > 0 ? clientPurchases[0].DateAchat?.substring(0, 10) : '';

    const purchases = clientPurchases;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('FACTURE CONSOLIDÉE', 14, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${purchaseDate}`, 14, 35);
    doc.text(`Client: ${client.NomCli || ''} ${client.PrenomCli || ''}`, 14, 45);
    if (client.Email) {
      doc.text(`Email: ${client.Email}`, 14, 55);
    }

    // En-tête du tableau
    doc.setFontSize(10);
    doc.text('DÉTAIL DES ACHATS', 14, 70);

    let yPosition = 80;

    // Ligne d'en-tête du tableau
    doc.setFont('helvetica', 'bold');
    doc.text('Produit', 14, yPosition);
    doc.text('Prix Unit.', 100, yPosition);
    doc.text('Qté', 140, yPosition);
    doc.text('Total', 160, yPosition);
    doc.line(14, yPosition + 2, 190, yPosition + 2);

    yPosition += 10;
    doc.setFont('helvetica', 'normal');

    // Détails de chaque produit
    purchases.forEach((purchase, index) => {
      const produit = products.find(p => p.ID_PROD === purchase.ID_PROD) || {};
      const itemTotal = purchase.Prix_unitaire * purchase.Quantite;

      if (yPosition > 250) { // Nouvelle page si nécessaire
        doc.addPage();
        yPosition = 20;
      }

      doc.text(produit.Titre || 'Produit inconnu', 14, yPosition);
      doc.text(`${purchase.Prix_unitaire} Ar`, 100, yPosition);
      doc.text(`${purchase.Quantite}`, 145, yPosition);
      doc.text(`${itemTotal} Ar`, 160, yPosition);

      yPosition += 8;
    });

    // Ligne de séparation
    yPosition += 5;
    doc.line(14, yPosition, 190, yPosition);
    yPosition += 8;

    // Total général
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL GÉNÉRAL: ${totalAmount} Ar`, 120, yPosition);

    // Informations supplémentaires
    yPosition += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Nombre d'articles: ${purchases.length}`, 14, yPosition);
    doc.text(`Facture générée le: ${new Date().toLocaleDateString('fr-FR')}`, 14, yPosition + 8);

    // Générer un nom de fichier unique basé sur le client et la date
    const fileName = `facture_consolidee_${client.NomCli || 'client'}_${client.PrenomCli || ''}_${purchaseDate.replace(/-/g, '')}.pdf`;
    doc.save(fileName);
  };

  // Fonction pour créer une facture globale de tous les achats d'un client
  const generateGlobalInvoice = (achat) => {
    const client = clients.find(c => c.ID_CLIENT === achat.ID_CLIENT) || {};

    // Récupérer tous les achats du client dans la liste actuelle
    const allClientPurchases = filteredPurchases.filter(p => p.ID_CLIENT === achat.ID_CLIENT);

    if (allClientPurchases.length === 0) {
      alert('Aucun achat trouvé pour ce client.');
      return;
    }

    const totalAmount = allClientPurchases.reduce((sum, p) => sum + (p.Prix_unitaire * p.Quantite), 0);

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('HISTORIQUE COMPLET DES ACHATS', 14, 20);

    doc.setFontSize(12);
    doc.text(`Client: ${client.NomCli || ''} ${client.PrenomCli || ''}`, 14, 35);
    if (client.Email) {
      doc.text(`Email: ${client.Email}`, 14, 45);
    }
    doc.text(`Période: Tous les achats`, 14, 55);

    // Statistiques générales
    doc.setFontSize(10);
    doc.text(`Nombre total d'achats: ${allClientPurchases.length}`, 14, 70);
    doc.text(`Montant total: ${totalAmount} Ar`, 14, 78);

    let yPosition = 90;

    // En-tête du tableau
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Date', 14, yPosition);
    doc.text('Produit', 35, yPosition);
    doc.text('Prix Unit.', 120, yPosition);
    doc.text('Qté', 150, yPosition);
    doc.text('Total', 170, yPosition);
    doc.line(14, yPosition + 2, 190, yPosition + 2);

    yPosition += 8;
    doc.setFont('helvetica', 'normal');

    // Trier par date (plus récent en premier)
    const sortedPurchases = allClientPurchases.sort((a, b) =>
      new Date(b.DateAchat) - new Date(a.DateAchat)
    );

    // Détails de chaque achat
    sortedPurchases.forEach((purchase, index) => {
      const produit = products.find(p => p.ID_PROD === purchase.ID_PROD) || {};
      const itemTotal = purchase.Prix_unitaire * purchase.Quantite;
      const purchaseDate = purchase.DateAchat ? purchase.DateAchat.substring(0, 10) : 'N/A';

      if (yPosition > 270) { // Nouvelle page si nécessaire
        doc.addPage();
        yPosition = 20;

        // Ré-afficher l'en-tête sur la nouvelle page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Date', 14, yPosition);
        doc.text('Produit', 35, yPosition);
        doc.text('Prix Unit.', 120, yPosition);
        doc.text('Qté', 150, yPosition);
        doc.text('Total', 170, yPosition);
        doc.line(14, yPosition + 2, 190, yPosition + 2);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
      }

      // Tronquer le titre du produit s'il est trop long
      const productTitle = (produit.Titre || 'Produit inconnu').substring(0, 25);
      const productTitleWithEllipsis = productTitle.length < (produit.Titre || '').length ? productTitle + '...' : productTitle;

      doc.text(purchaseDate, 14, yPosition);
      doc.text(productTitleWithEllipsis, 35, yPosition);
      doc.text(`${purchase.Prix_unitaire} Ar`, 120, yPosition);
      doc.text(`${purchase.Quantite}`, 155, yPosition);
      doc.text(`${itemTotal} Ar`, 170, yPosition);

      yPosition += 6;
    });

    // Ligne de séparation
    yPosition += 5;
    doc.line(14, yPosition, 190, yPosition);
    yPosition += 8;

    // Total général
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL GÉNÉRAL: ${totalAmount} Ar`, 100, yPosition);

    // Informations supplémentaires
    yPosition += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Historique généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, yPosition);

    // Générer un nom de fichier
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `historique_${client.NomCli || 'client'}_${client.PrenomCli || ''}_${dateStr}_complet.pdf`;
    doc.save(fileName);
  };

  // Fonction pour supprimer TOUS les achats avec confirmation
  const handleDeleteAllPurchases = async () => {
    if (purchases.length === 0) {
      alert('Aucun achat à supprimer.');
      return;
    }

    const totalAmount = purchases.reduce((sum, p) => sum + (p.Prix_unitaire * p.Quantite), 0);

    const confirmMessage = `🚨 ATTENTION : SUPPRESSION TOTALE !\n\n` +
      `Vous êtes sur le point de supprimer TOUS les achats :\n\n` +
      `• Nombre d'achats : ${purchases.length}\n` +
      `• Montant total : ${totalAmount} Ar\n\n` +
      `Cette action va :\n` +
      `✅ Supprimer définitivement toutes les données d'achat\n` +
      `✅ Vider complètement la table ACHETER\n` +
      `✅ Effacer l'historique des transactions\n\n` +
      `⚠️ Cette action est IRRÉVERSIBLE !\n` +
      `Les achats supprimés ne pourront PAS être récupérés.\n\n` +
      `Tapez "oui" pour confirmer :`;

    const confirmation = prompt(confirmMessage);

    if (confirmation !== "oui") {
      alert('Suppression annulée.');
      return;
    }

    try {
      setFormLoading(true);

      // Afficher une notification de suppression en cours
      const loadingNotification = document.createElement('div');
      loadingNotification.className = 'notification-toast-modern notification-warning-modern';
      loadingNotification.innerHTML = `
        <div class="notification-content-modern">
          <div class="notification-icon-modern">⏳</div>
          <div class="notification-text-modern">
            <div class="notification-title-modern">Suppression globale en cours...</div>
            <div class="notification-message-modern">Suppression de ${purchases.length} achats...</div>
          </div>
        </div>
      `;
      document.body.appendChild(loadingNotification);
      setTimeout(() => loadingNotification.classList.add('show'), 10);

      // Sauvegarder les achats dans la corbeille avant suppression
      setDeletedPurchases([...purchases]);

      // Supprimer tous les achats un par un
      const deletePromises = purchases.map(purchase => deletePurchase(purchase.ID_ACHAT));
      await Promise.allSettled(deletePromises);

      // Supprimer la notification de chargement
      loadingNotification.classList.remove('show');
      setTimeout(() => document.body.removeChild(loadingNotification), 300);

      // Actualiser les données
      await fetchAll();

      // Afficher une notification de succès
      const successNotification = document.createElement('div');
      successNotification.className = 'notification-toast-modern notification-success-modern';
      successNotification.innerHTML = `
        <div class="notification-content-modern">
          <div class="notification-icon-modern">✅</div>
          <div class="notification-text-modern">
            <div class="notification-title-modern">Suppression globale réussie !</div>
            <div class="notification-message-modern">
              ${purchases.length} achats supprimés<br>
              Montant total : ${totalAmount} Ar<br>
              <small>Utilisez "Restaurer" pour récupérer les données</small>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(successNotification);
      setTimeout(() => successNotification.classList.add('show'), 10);
      setTimeout(() => {
        successNotification.classList.remove('show');
        setTimeout(() => document.body.removeChild(successNotification), 300);
      }, 5000);

    } catch (err) {
      console.error('Erreur lors de la suppression globale:', err);

      // Supprimer la notification de chargement en cas d'erreur
      const existingNotifications = document.querySelectorAll('.notification-warning-modern');
      existingNotifications.forEach(notification => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      });

      // Afficher une notification d'erreur
      const errorNotification = document.createElement('div');
      errorNotification.className = 'notification-toast-modern notification-error-modern';
      errorNotification.innerHTML = `
        <div class="notification-content-modern">
          <div class="notification-icon-modern">❌</div>
          <div class="notification-text-modern">
            <div class="notification-title-modern">Erreur de suppression globale</div>
            <div class="notification-message-modern">${err.message || 'Une erreur est survenue'}</div>
          </div>
        </div>
      `;
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.classList.add('show'), 10);
      setTimeout(() => {
        errorNotification.classList.remove('show');
        setTimeout(() => document.body.removeChild(errorNotification), 300);
      }, 4000);

      alert(`Erreur lors de la suppression globale: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  // Fonction pour restaurer tous les achats supprimés
  const handleRestoreAllPurchases = async () => {
    if (deletedPurchases.length === 0) {
      alert('Aucun achat à restaurer.');
      return;
    }

    const totalAmount = deletedPurchases.reduce((sum, p) => sum + (p.Prix_unitaire * p.Quantite), 0);

    const confirmMessage = `🔄 RESTAURATION DES ACHATS\n\n` +
      `Vous allez restaurer ${deletedPurchases.length} achats :\n\n` +
      `• Nombre d'achats : ${deletedPurchases.length}\n` +
      `• Montant total : ${totalAmount} Ar\n\n` +
      `Ces achats seront :\n` +
      `✅ Rajoutés dans la base de données\n` +
      `✅ Rendus visibles dans la liste\n` +
      `✅ Disponibles pour les rapports\n\n` +
      `Confirmer la restauration ?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setFormLoading(true);

      // Afficher une notification de restauration en cours
      const loadingNotification = document.createElement('div');
      loadingNotification.className = 'notification-toast-modern notification-info-modern';
      loadingNotification.innerHTML = `
        <div class="notification-content-modern">
          <div class="notification-icon-modern">🔄</div>
          <div class="notification-text-modern">
            <div class="notification-title-modern">Restauration en cours...</div>
            <div class="notification-message-modern">Restauration de ${deletedPurchases.length} achats...</div>
          </div>
        </div>
      `;
      document.body.appendChild(loadingNotification);
      setTimeout(() => loadingNotification.classList.add('show'), 10);

      // Créer de nouveaux achats pour chaque élément supprimé
      // Note: On ne peut pas restaurer avec le même ID, il faut créer de nouveaux enregistrements
      const restorePromises = deletedPurchases.map(async (purchase) => {
        try {
          const newPurchase = {
            ID_CLIENT: purchase.ID_CLIENT,
            ID_PROD: purchase.ID_PROD,
            DateAchat: purchase.DateAchat,
            Prix_unitaire: purchase.Prix_unitaire,
            Quantite: purchase.Quantite
          };
          return await addPurchase(newPurchase);
        } catch (error) {
          console.error(`Erreur lors de la restauration de l'achat ${purchase.ID_ACHAT}:`, error);
          return null; // Retourner null en cas d'erreur pour cet élément
        }
      });

      const results = await Promise.allSettled(restorePromises);
      const successfulRestores = results.filter(result => result.status === 'fulfilled' && result.value).length;
      const failedRestores = results.filter(result => result.status === 'rejected' || !result.value).length;

      // Supprimer la notification de chargement
      loadingNotification.classList.remove('show');
      setTimeout(() => document.body.removeChild(loadingNotification), 300);

      // Actualiser les données
      await fetchAll();

      // Vider la corbeille après restauration
      setDeletedPurchases([]);

      // Supprimer la sauvegarde du localStorage car la corbeille est maintenant vide
      localStorage.removeItem('achats_deleted_trash');

      // Synchroniser avec le Dashboard
      if (window.dashboardRefreshStats) {
        console.log('🔄 Synchronisation avec le Dashboard après restauration...');
        window.dashboardRefreshStats();
      }

      // Afficher une notification de succès
      const successNotification = document.createElement('div');
      successNotification.className = 'notification-toast-modern notification-success-modern';
      successNotification.innerHTML = `
        <div class="notification-content-modern">
          <div class="notification-icon-modern">✅</div>
          <div class="notification-text-modern">
            <div class="notification-title-modern">Restauration terminée !</div>
            <div class="notification-message-modern">
              ${successfulRestores} achat(s) restauré(s) avec succès<br>
              ${failedRestores > 0 ? `${failedRestores} échec(s)` : ''}
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(successNotification);
      setTimeout(() => successNotification.classList.add('show'), 10);
      setTimeout(() => {
        successNotification.classList.remove('show');
        setTimeout(() => document.body.removeChild(successNotification), 300);
      }, 4000);

    } catch (err) {
      console.error('Erreur lors de la restauration globale:', err);

      // Supprimer la notification de chargement en cas d'erreur
      const existingNotifications = document.querySelectorAll('.notification-info-modern');
      existingNotifications.forEach(notification => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      });

      // Afficher une notification d'erreur
      const errorNotification = document.createElement('div');
      errorNotification.className = 'notification-toast-modern notification-error-modern';
      errorNotification.innerHTML = `
        <div class="notification-content-modern">
          <div class="notification-icon-modern">❌</div>
          <div class="notification-text-modern">
            <div class="notification-title-modern">Erreur de restauration</div>
            <div class="notification-message-modern">${err.message || 'Une erreur est survenue'}</div>
          </div>
        </div>
      `;
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.classList.add('show'), 10);
      setTimeout(() => {
        errorNotification.classList.remove('show');
        setTimeout(() => document.body.removeChild(errorNotification), 300);
      }, 4000);

      alert(`Erreur lors de la restauration: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  // Fonction pour basculer l'affichage de la corbeille
  const toggleTrashView = () => {
    setShowTrash(!showTrash);
  };

  // Fonction pour vider complètement la corbeille
  const emptyTrash = () => {
    if (deletedPurchases.length === 0) {
      alert('La corbeille est déjà vide.');
      return;
    }

    const confirmEmpty = window.confirm(
      `🚨 ATTENTION : VIDAGE DÉFINITIF DE LA CORBEILLE !\n\n` +
      `Vous êtes sur le point de supprimer DÉFINITIVEMENT ${deletedPurchases.length} achat(s) de la corbeille.\n\n` +
      `• Ces achats seront perdus pour toujours\n` +
      `• Ils ne pourront plus être restaurés\n` +
      `• Cette action est IRRÉVERSIBLE\n\n` +
      `Êtes-vous sûr de vouloir continuer ?`
    );

    if (confirmEmpty) {
      const finalConfirm = window.confirm(
        `DERNIÈRE CONFIRMATION :\n\n` +
        `Tapez "VIDER" pour confirmer le vidage définitif de la corbeille :`
      );

      if (finalConfirm) {
        setDeletedPurchases([]);
        setShowTrash(false);

        // Supprimer aussi la sauvegarde du localStorage
        localStorage.removeItem('achats_deleted_trash');

        // Notification de succès
        const notification = document.createElement('div');
        notification.className = 'notification-toast-modern notification-success-modern';
        notification.innerHTML = `
          <div class="notification-content-modern">
            <div class="notification-icon-modern">🗑️</div>
            <div class="notification-text-modern">
              <div class="notification-title-modern">Corbeille vidée !</div>
              <div class="notification-message-modern">${deletedPurchases.length} achat(s) supprimé(s) définitivement</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);

        console.log(`🗑️ Corbeille vidée : ${deletedPurchases.length} achats supprimés définitivement`);
      }
    }
  };

  return (
    <div className="section-card fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-title">
          <i className="bi bi-cart-plus me-2"></i>
          Gestion des achats
          <span className="badge bg-primary ms-2">{filteredPurchases.length}</span>
        </h2>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-primary" onClick={exportPDF} type="button"><i className="bi bi-file-earmark-pdf me-1"></i>Exporter PDF</button>
          <button className="btn btn-outline-success" onClick={exportExcel} type="button"><i className="bi bi-file-earmark-excel me-1"></i>Exporter Excel</button>

          {/* Boutons de suppression globale et restauration */}
          <div className="d-flex gap-1">
            <button
              className="btn btn-danger"
              onClick={handleDeleteAllPurchases}
              disabled={formLoading || purchases.length === 0}
              type="button"
              title="Supprimer TOUS les achats (avec confirmation)"
            >
              <i className="bi bi-trash-fill me-1"></i>
              <span className="d-none d-lg-inline">Supprimer Tout</span>
              <span className="d-lg-none">Tout</span>
            </button>

            {deletedPurchases.length > 0 && (
              <button
                className="btn btn-warning"
                onClick={handleRestoreAllPurchases}
                disabled={formLoading}
                type="button"
                title="Restaurer les achats supprimés"
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                <span className="d-none d-lg-inline">Restaurer</span>
                <span className="d-lg-none">↺</span>
                <span className="badge bg-light text-dark ms-1">{deletedPurchases.length}</span>
              </button>
            )}
          </div>
        </div>

      </div>
      <form className="row g-3 mb-4 fade-in" onSubmit={handleSubmit}>
        <div className="col-md-2">
          <select className="form-control" name="ID_CLIENT" value={form.ID_CLIENT} onChange={handleChange} required>
            <option value="">Client</option>
            {clients.map(cli => (
              <option key={cli.ID_CLIENT} value={cli.ID_CLIENT}>{cli.NomCli} {cli.PrenomCli}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-control" name="ID_PROD" value={form.ID_PROD} onChange={handleChange} required>
            <option value="">Film</option>
            {products.map(prod => (
              <option key={prod.ID_PROD} value={prod.ID_PROD}>{prod.Titre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" name="DateAchat" value={form.DateAchat} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" name="Prix_unitaire" placeholder="Prix" value={form.Prix_unitaire} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" name="Quantite" placeholder="Quantité" value={form.Quantite} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success me-2" disabled={formLoading}>
            {formLoading ? (editId ? 'Modification...' : 'Ajout...') : (editId ? 'Modifier' : 'Ajouter achat')}
          </button>
          {editId && <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Annuler</button>}
        </div>
        {formError && <div className="alert alert-danger mt-2">{formError}</div>}
      </form>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <table className="table table-bordered fade-in">
            <thead>
              <tr>
                <th>ID achat</th>
                <th>Client</th>
                <th>Film</th>
                <th>Date</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPurchases.map((pur) => (
                <tr key={pur.ID_ACHAT}>
                  <td>{pur.ID_ACHAT}</td>
                  <td>
                    <span className="badge bg-info text-dark mb-1" style={{fontSize: '1em'}}>
                      {(clients.find(c => c.ID_CLIENT === pur.ID_CLIENT) || {}).NomCli} {(clients.find(c => c.ID_CLIENT === pur.ID_CLIENT) || {}).PrenomCli}
                    </span>
                    <br />
                    <span className="text-muted" style={{fontSize: '0.85em'}}>
                      {(clients.find(c => c.ID_CLIENT === pur.ID_CLIENT) || {}).Email}
                    </span>
                  </td>
                  <td>{(products.find(p => p.ID_PROD === pur.ID_PROD) || {}).Titre}</td>
                  <td>{pur.DateAchat ? pur.DateAchat.substring(0, 10) : ''}</td>
                  <td>{pur.Prix_unitaire}</td>
                  <td>{pur.Quantite}</td>
                  <td>
                    <div className="d-flex flex-column gap-2 align-items-start">
                      {/* Boutons principaux d'actions */}
                      <div className="d-flex gap-2 align-items-center">
                        <button
                          className="btn achat-btn-edit"
                          onClick={() => handleEdit(pur)}
                          title="Modifier cet achat"
                        >
                          <i className="bi bi-pencil-fill me-1"></i>
                          <span className="d-none d-lg-inline">Modifier</span>
                        </button>
                        <button
                          className="btn achat-btn-del"
                          onClick={() => handleDelete(pur.ID_ACHAT)}
                          title="Supprimer cet achat"
                          disabled={formLoading}
                        >
                          <i className="bi bi-trash-fill me-1"></i>
                          <span className="d-none d-lg-inline">Supprimer</span>
                        </button>
  </div>

                      {/* Boutons secondaires (factures) */}
                      <div className="d-flex flex-column gap-1 w-100">
                        <button
                          className="btn achat-btn-apercu w-100"
                          onClick={() => previewInvoice(pur)}
                          title="Aperçu de la facture consolidée"
                        >
                          <i className="bi bi-eye-fill me-1"></i>
                          Aperçu facture
                        </button>
                        <button
                          className="btn achat-btn-facture w-100"
                          onClick={() => generateInvoice(pur)}
                          title="Télécharger la facture consolidée PDF"
                        >
                          <i className="bi bi-file-earmark-arrow-down-fill me-1"></i>
                          Facture PDF
                        </button>
                        <button
                          className="btn achat-btn-historique w-100"
                          onClick={() => generateGlobalInvoice(pur)}
                          title="Télécharger l'historique complet des achats du client"
                        >
                          <i className="bi bi-file-earmark-spreadsheet-fill me-1"></i>
                          Historique complet
                        </button>
  </div>
</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-center align-items-center mt-2">
            <button className="btn btn-outline-primary btn-sm me-2" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage-1)}>Précédent</button>
            <span>Page {currentPage} / {totalPages || 1}</span>
            <button className="btn btn-outline-primary btn-sm ms-2" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage+1)}>Suivant</button>
          </div>
        </>
      )}

      {/* Section Corbeille - Affichée quand il y a des achats supprimés */}
      {deletedPurchases.length > 0 && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="text-warning mb-0">
              <i className="bi bi-trash me-2"></i>
              Corbeille ({deletedPurchases.length} élément{deletedPurchases.length > 1 ? 's' : ''})
            </h4>
            <div className="d-flex gap-2">
              <button
                className="btn btn-danger btn-sm"
                onClick={emptyTrash}
                disabled={deletedPurchases.length === 0}
                type="button"
                title="Vider complètement la corbeille (suppression définitive)"
              >
                <i className="bi bi-trash-fill me-1"></i>
                Vider corbeille
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={toggleTrashView}
                type="button"
              >
                <i className={`bi bi-chevron-${showTrash ? 'up' : 'down'} me-1`}></i>
                {showTrash ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {showTrash && (
            <div className="card border-warning">
              <div className="card-body">
                <div className="alert alert-warning">
                  <i className="bi bi-info-circle me-2"></i>
                  Ces achats ont été supprimés et peuvent être restaurés. Ils ne sont plus visibles dans la liste principale.
                  <br />
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    La corbeille sera automatiquement vidée quand vous quitterez cette page.
                    <br />
                    <i className="bi bi-save me-1"></i>
                    Les éléments sont sauvegardés temporairement (24h) pour persister entre les sessions.
                  </small>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Film</th>
                        <th>Date</th>
                        <th>Prix</th>
                        <th>Quantité</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedPurchases.map((purchase) => {
                        const client = clients.find(c => c.ID_CLIENT === purchase.ID_CLIENT) || {};
                        const product = products.find(p => p.ID_PROD === purchase.ID_PROD) || {};
                        const total = purchase.Prix_unitaire * purchase.Quantite;

                        return (
                          <tr key={`deleted-${purchase.ID_ACHAT}`} className="table-secondary">
                            <td><small className="text-muted">#{purchase.ID_ACHAT}</small></td>
                            <td>
                              <small>
                                {client.NomCli || ''} {client.PrenomCli || ''}
                                {client.Email && <div className="text-muted">{client.Email}</div>}
                              </small>
                            </td>
                            <td><small>{product.Titre || 'Produit inconnu'}</small></td>
                            <td><small>{purchase.DateAchat ? purchase.DateAchat.substring(0, 10) : 'N/A'}</small></td>
                            <td><small>{purchase.Prix_unitaire} Ar</small></td>
                            <td><small>{purchase.Quantite}</small></td>
                            <td><small className="fw-bold">{total} Ar</small></td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="6" className="text-end fw-bold">
                          Total supprimé :
                        </td>
                        <td className="fw-bold text-danger">
                          {deletedPurchases.reduce((sum, p) => sum + (p.Prix_unitaire * p.Quantite), 0)} Ar
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    💡 Utilisez le bouton "Restaurer" ci-dessus pour récupérer ces données
                  </small>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      if (window.confirm('Vider définitivement la corbeille ? Cette action est irréversible.')) {
                        setDeletedPurchases([]);
                        setShowTrash(false);
                      }
                    }}
                    type="button"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Vider la corbeille
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Achats; 