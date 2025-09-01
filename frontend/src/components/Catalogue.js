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

  // Synchronise le panier avec localStorage
  useEffect(() => {
    localStorage.setItem('panier', JSON.stringify(cart));
  }, [cart]);

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

  return (
    <div className="container catalogue-container mt-4">
      <h2 className="mb-4 text-center">Notre Catalogue de Films</h2>

      {/* MODALE CHOIX CLIENT */}
      {clientModalOpen && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:24,borderRadius:10,minWidth:340,maxWidth:440}} onClick={e => e.stopPropagation()}>
            <h5 className="mb-3">Ajouter au panier</h5>
            <div className="mb-2"><strong>Film :</strong> {pendingProduct?.Titre}</div>
            {/* Sélection du client */}
            <div className="mb-2">
              <label className="form-label">Client acheteur :</label>
              {clientsLoading ? (
                <div className="text-center my-2">Chargement clients...</div>
              ) : clientsError ? (
                <div className="alert alert-danger">{clientsError}</div>
              ) : (
                <select className="form-select mb-2" value={selectedClient?.ID_CLIENT || ''} onChange={e => {
                  const cli = clients.find(c => c.ID_CLIENT === Number(e.target.value));
                  setSelectedClient(cli);
                }}>
                  <option value="">Sélectionner</option>
                  {clients.map(cli => (
                    <option key={cli.ID_CLIENT} value={cli.ID_CLIENT}>{cli.NomCli} {cli.PrenomCli}</option>
                  ))}
                </select>
              )}
            </div>
            {/* Sélection du vendeur */}
            <div className="mb-2">
              <label className="form-label">Vendeur présent :</label>
              {vendorsLoading ? (
                <div className="text-center my-2">Chargement vendeurs...</div>
              ) : vendorsError ? (
                <div className="alert alert-danger">{vendorsError}</div>
              ) : (
                <select className="form-select mb-2" value={selectedVendor?.ID_VENDEUR || ''} onChange={e => {
                  const ven = vendors.find(v => v.ID_VENDEUR === Number(e.target.value));
                  setSelectedVendor(ven);
                }}>
                  <option value="">Sélectionner</option>
                  {vendors.map(ven => (
                    <option key={ven.ID_VENDEUR} value={ven.ID_VENDEUR}>{ven.NomVendeur} {ven.PrenomVendeur}</option>
                  ))}
                </select>
              )}
            </div>
            {/* Quantité */}
            <div className="mb-3">
              <label className="form-label">Quantité :</label>
              <input type="number" min={1} className="form-control" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} style={{maxWidth:120}} />
            </div>
            {/* Résumé & Valider */}
            <div className="mb-3">
              <strong>Résumé :</strong>
              <div>Client : {selectedClient ? selectedClient.NomCli + ' ' + selectedClient.PrenomCli : <span className="text-danger">Non choisi</span>}</div>
              <div>Vendeur : {selectedVendor ? selectedVendor.NomVendeur + ' ' + selectedVendor.PrenomVendeur : <span className="text-danger">Non choisi</span>}</div>
              <div>Quantité : {quantity}</div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn catalogue-btn-valider flex-fill" disabled={!selectedClient || !selectedVendor || !quantity} onClick={() => {
                setCart([
                  ...cart,
                  {
                    ...pendingProduct,
                    client: selectedClient,
                    vendeur: selectedVendor,
                    quantite: quantity
                  }
                ]);
                setClientModalOpen(false);
                setPendingProduct(null);
                setSelectedClient(null);
                setSelectedVendor(null);
                setQuantity(1);
                if (setActiveTab) setActiveTab('panier');
              }}>
              <i className="bi bi-check-circle me-1"></i>Valider</button>
              <button className="btn catalogue-btn-annuler flex-fill" onClick={() => {
                setClientModalOpen(false);
                setPendingProduct(null);
                setSelectedClient(null);
                setSelectedVendor(null);
                setQuantity(1);
              }}>
              <i className="bi bi-x-circle me-1"></i>Annuler</button>
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
          products.slice((page-1)*itemsPerPage, page*itemsPerPage).map(product => (
            <div key={product.ID_PROD} className="col-md-4 col-lg-3 mb-4">
              <div className="card product-card h-100">
                <img 
                  src={product.Photo ? (product.Photo.startsWith('http') ? product.Photo : `http://localhost:5000/uploads/${product.Photo}`) : 'https://via.placeholder.com/150x220.png?text=Pas+d\'image'} 
                  className="card-img-top product-image" 
                  alt={product.Titre} 
                  style={{cursor:'pointer'}}
                  onClick={() => { setModalImg(product.Photo ? (product.Photo.startsWith('http') ? product.Photo : `http://localhost:5000/uploads/${product.Photo}`) : 'https://via.placeholder.com/150x220.png?text=Pas+d\'image'); setModalOpen(true); }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.Titre}</h5>
                  <p className="card-text mt-auto product-price">Prix : 500 ARIARY</p>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn catalogue-btn-apercu btn-sm flex-fill" onClick={() => { setModalImg(product.Photo ? (product.Photo.startsWith('http') ? product.Photo : `http://localhost:5000/uploads/${product.Photo}`) : 'https://via.placeholder.com/150x220.png?text=Pas+d\'image'); setModalOpen(true); }}><i className="bi bi-eye me-1"></i>Aperçu</button>
                    <button className="btn catalogue-btn-ajouter btn-sm flex-fill" onClick={async () => {
                      setPendingProduct(product);
                      setClientsError('');
                      setVendorsError('');
                      setClientsLoading(true);
                      setVendorsLoading(true);
                      setSelectedClient(null);
                      setSelectedVendor(null);
                      setQuantity(1);
                      try {
                        const clientsData = await getClients();
                        setClients(clientsData);
                        setClientsLoading(false);
                      } catch (e) {
                        setClientsError("Erreur lors du chargement des clients");
                        setClientsLoading(false);
                      }
                      try {
                        const vendorsData = await getVendors();
                        setVendors(vendorsData);
                        setVendorsLoading(false);
                      } catch (e) {
                        setVendorsError("Erreur lors du chargement des vendeurs");
                        setVendorsLoading(false);
                      }
                      setClientModalOpen(true);}}>
                    <i className="bi bi-cart-plus me-1"></i>Ajouter au panier</button>
                  </div>
                </div>
              </div>
            </div>
          ))
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
