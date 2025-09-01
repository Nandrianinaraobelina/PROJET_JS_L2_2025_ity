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

  useEffect(() => {
    const stored = localStorage.getItem('panier');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCart(parsed);
      setTotal(parsed.reduce((sum, item) => sum + (item.quantite ? item.quantite * 500 : 500), 0));
    }
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
    <div className="container mt-5">
      {/* Toast notification moderne */}
      {toast.show && (
        <div style={{position:'fixed',top:30,right:30,zIndex:2000,minWidth:280}}>
          <div className={`toast show text-white bg-${toast.type==='danger'?'danger':'success'}`} role="alert" style={{borderRadius:14,boxShadow:'0 4px 16px rgba(0,0,0,0.14)',fontSize:'1.08rem'}}>
            <div className="toast-body">{toast.msg}</div>
          </div>
        </div>
      )}
      <div className="card shadow-sm" style={{maxWidth: 540, margin: '0 auto', background:'#fafdff', border:'1px solid #e0e8f0'}}>
        <div className="card-header bg-primary text-white" style={{borderRadius:'18px 18px 0 0',fontSize:'1.25rem',letterSpacing:'0.04em'}}>🛒 Mon Panier</div>
        <div className="card-body">
          {cart.length === 0 ? (
            <div className="alert alert-info">Votre panier est vide.</div>
          ) : (
            <>
              <ul className="list-group mb-3">
                {cart.map((item, idx) => (
                  <li className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center shadow-sm mb-2" style={{borderLeft:'5px solid #2563eb', background:'#f8fafc'}} key={idx}>
                    <div className="mb-2 mb-md-0">
                      <span className="fw-bold text-primary">{item.Titre}</span>
                      {item.client && (
                        <span className="badge bg-info text-dark ms-2">{item.client.NomCli} {item.client.PrenomCli}</span>
                      )}
                      {item.vendeur && (
                        <span className="badge bg-warning text-dark ms-2">Vendeur: {item.vendeur.NomVendeur} {item.vendeur.PrenomVendeur}</span>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge rounded-pill bg-secondary">Qté: {item.quantite || 1}</span>
                      <span className="badge rounded-pill bg-success">{(item.quantite ? item.quantite * 500 : 500)} ARIARY</span>
                      <button className="btn panier-btn-del btn-sm ms-2 px-3 py-1" onClick={() => retirer(idx)}><i className="bi bi-trash"></i></button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                <strong className="fs-5">Total</strong>
                <span className="fs-4 fw-bold text-success">{total} ARIARY</span>
              </div>
              <button className="btn panier-btn-acheter w-100 mb-2 py-2" disabled={achatLoading} onClick={async () => {
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
              }}><i className="bi bi-cash-coin me-2"></i>Acheter & Télécharger Facture</button>
              {achatMsg && <div className={`alert ${achatMsg.startsWith('Erreur') ? 'alert-danger' : 'alert-success'} mt-2`}>{achatMsg}</div>}
              <button className="btn btn-outline-secondary w-100" onClick={vider}>Vider le panier</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Panier;
