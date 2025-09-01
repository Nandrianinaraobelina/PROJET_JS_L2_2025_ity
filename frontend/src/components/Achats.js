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
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAll();
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
    setForm({
      ID_CLIENT: purchase.ID_CLIENT,
      ID_PROD: purchase.ID_PROD,
      DateAchat: purchase.DateAchat ? purchase.DateAchat.substring(0, 10) : '',
      Prix_unitaire: purchase.Prix_unitaire,
      Quantite: purchase.Quantite,
    });
    setEditId(purchase.ID_ACHAT);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet achat ?')) {
      try {
        await deletePurchase(id);
        fetchAll();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setForm({ ID_CLIENT: '', ID_PROD: '', DateAchat: '', Prix_unitaire: '', Quantite: '' });
    setEditId(null);
    setFormError('');
  };

  const filteredPurchases = purchases.filter(pur =>
    (pur.ID_CLIENT + '').includes(search) ||
    (pur.ID_PROD + '').includes(search) ||
    (pur.DateAchat || '').toLowerCase().includes(search.toLowerCase())
  );
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

  const previewInvoice = (achat) => {
    const client = clients.find(c => c.ID_CLIENT === achat.ID_CLIENT) || {};
    const produit = products.find(p => p.ID_PROD === achat.ID_PROD) || {};
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Facture d\'achat', 14, 15);
    doc.setFontSize(12);
    doc.text(`Date: ${achat.DateAchat ? achat.DateAchat.substring(0, 10) : ''}`, 14, 25);
    doc.text(`Client: ${client.NomCli || ''} ${client.PrenomCli || ''}`, 14, 35);
    doc.text(`Produit: ${produit.Titre || ''}`, 14, 45);
    doc.text(`Prix unitaire: ${achat.Prix_unitaire} Ar`, 14, 55);
    doc.text(`Quantité: ${achat.Quantite}`, 14, 65);
    doc.text(`Total: ${achat.Prix_unitaire * achat.Quantite} Ar`, 14, 75);
    // Aperçu dans un nouvel onglet PDF
    window.open(doc.output('bloburl'), '_blank');
  };

  const generateInvoice = (achat) => {
    const client = clients.find(c => c.ID_CLIENT === achat.ID_CLIENT) || {};
    const produit = products.find(p => p.ID_PROD === achat.ID_PROD) || {};
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Facture d\'achat', 14, 15);
    doc.setFontSize(12);
    doc.text(`Date: ${achat.DateAchat ? achat.DateAchat.substring(0, 10) : ''}`, 14, 25);
    doc.text(`Client: ${client.NomCli || ''} ${client.PrenomCli || ''}`, 14, 35);
    doc.text(`Produit: ${produit.Titre || ''}`, 14, 45);
    doc.text(`Prix unitaire: ${achat.Prix_unitaire} Ar`, 14, 55);
    doc.text(`Quantité: ${achat.Quantite}`, 14, 65);
    doc.text(`Total: ${achat.Prix_unitaire * achat.Quantite} Ar`, 14, 75);
    doc.save(`facture_achat_${achat.ID_ACHAT || ''}.pdf`);
  };

  return (
    <div className="section-card fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-title"><i className="bi bi-cart-plus me-2"></i>Gestion des achats <span className="badge bg-primary">{purchases.length}</span></h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={exportPDF} type="button"><i className="bi bi-file-earmark-pdf me-1"></i>Exporter PDF</button>
          <button className="btn btn-outline-success" onClick={exportExcel} type="button"><i className="bi bi-file-earmark-excel me-1"></i>Exporter Excel</button>
        </div>
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Recherche... (ID client, film, date)"
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{ minWidth: 180 }}
        />
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
                    <div className="d-flex flex-column gap-1 align-items-start">
  <div className="d-flex gap-2 mb-1">
    <button className="btn achat-btn-edit" onClick={() => handleEdit(pur)}><i className="bi bi-pencil"></i></button>
    <button className="btn achat-btn-del" onClick={() => handleDelete(pur.ID_ACHAT)}><i className="bi bi-trash"></i></button>
  </div>
  <div className="d-flex gap-2">
    <button className="btn achat-btn-apercu" onClick={() => previewInvoice(pur)}><i className="bi bi-eye"></i> Aperçu facture</button>
    <button className="btn achat-btn-facture" onClick={() => generateInvoice(pur)}><i className="bi bi-file-earmark-arrow-down"></i> Facture</button>
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
    </div>
  );
}

export default Achats; 