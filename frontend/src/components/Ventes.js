import React, { useEffect, useState } from 'react';
import { getSales, addSale, updateSale, deleteSale } from '../services/saleService';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import { getVendors } from '../services/vendorService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function Ventes() {
  // Ajout du design blur sur le conteneur principal

  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    ID_CLIENT: '',
    ID_PROD: '',
    ID_VENDEUR: '',
    DateVente: '',
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
      const [s, c, p, v] = await Promise.all([
        getSales(),
        getClients(),
        getProducts(),
        getVendors()
      ]);
      setSales(s);
      setClients(c);
      setProducts(p);
      setVendors(v);
console.log("clients", c);
console.log("vendors", v);
console.log("sales", s);
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
    if (!form.ID_CLIENT || !form.ID_PROD || !form.ID_VENDEUR || !form.DateVente || !form.Prix_unitaire || !form.Quantite) {
      setFormError('Tous les champs sont obligatoires');
      return;
    }
    setFormLoading(true);
    try {
      if (editId) {
        await updateSale(editId, form);
      } else {
        await addSale(form);
      }
      setForm({ ID_CLIENT: '', ID_PROD: '', ID_VENDEUR: '', DateVente: '', Prix_unitaire: '', Quantite: '' });
      setEditId(null);
      fetchAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (sale) => {
    setForm({
      ID_CLIENT: sale.ID_CLIENT,
      ID_PROD: sale.ID_PROD,
      ID_VENDEUR: sale.ID_VENDEUR,
      DateVente: sale.DateVente ? sale.DateVente.substring(0, 10) : '',
      Prix_unitaire: sale.Prix_unitaire,
      Quantite: sale.Quantite,
    });
    setEditId(sale.ID_VENTE);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette vente ?')) {
      try {
        await deleteSale(id);
        fetchAll();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setForm({ ID_CLIENT: '', ID_PROD: '', ID_VENDEUR: '', DateVente: '', Prix_unitaire: '', Quantite: '' });
    setEditId(null);
    setFormError('');
  };

  const filteredSales = sales.filter(sale =>
    (sale.ID_CLIENT + '').includes(search) ||
    (sale.ID_PROD + '').includes(search) ||
    (sale.ID_VENDEUR + '').includes(search) ||
    (sale.DateVente || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  const exportPDF = () => {
    const doc = new jsPDF();
    // Ajout d'un logo (remplacez par le chemin de votre logo si besoin)
    // doc.addImage('logo.png', 'PNG', 10, 8, 30, 15); // Décommentez et adaptez si vous avez un logo

    // Titre principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des ventes', 50, 18);

    // Sous-titre et date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Exporté le : ' + new Date().toLocaleString(), 150, 18, { align: 'right' });

    autoTable(doc, {
      startY: 28,
      head: [[
        'ID vente', 'Client', 'Film', 'Vendeur', 'Date', 'Prix unitaire', 'Quantité'
      ]],
      body: paginatedSales.map(sale => [
        sale.ID_VENTE,
        (() => {
          const c = clients.find(c => c.ID_CLIENT === sale.ID_CLIENT);
          return c ? `${c.NomCli} ${c.PrenomCli}` : '';
        })(),
        (products.find(p => p.ID_PROD === sale.ID_PROD) || {}).Titre,
        (() => {
          const v = vendors.find(v => v.ID_VENDEUR === sale.ID_VENDEUR);
          return v ? `${v.NomVendeur} ${v.PrenomVendeur}` : '';
        })(),
        sale.DateVente ? sale.DateVente.substring(0, 10) : '',
        sale.Prix_unitaire,
        sale.Quantite
      ]),
      foot: [[
        '', '', '', '', 'Total',
        paginatedSales.reduce((sum, sale) => sum + (sale.Prix_unitaire || 0) * (sale.Quantite || 0), 0),
        ''
      ]],
      headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold', textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      footStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      margin: { left: 10, right: 10 },
    });

    // Pied de page personnalisé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text('Entreprise XYZ - www.entreprise-xyz.com', 10, 287);
      doc.text('Page ' + i + ' / ' + pageCount, 200, 287, { align: 'right' });
    }

    doc.save('ventes.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(paginatedSales.map(sale => ({
      'ID vente': sale.ID_VENTE,
      'Client': (() => { const c = clients.find(c => c.ID_CLIENT === sale.ID_CLIENT); return c ? `${c.NomCli} ${c.PrenomCli}` : ''; })(),
      'Film': (products.find(p => p.ID_PROD === sale.ID_PROD) || {}).Titre,
      'Vendeur': (() => { const v = vendors.find(v => v.ID_VENDEUR === sale.ID_VENDEUR); return v ? `${v.NomVendeur} ${v.PrenomVendeur}` : ''; })(),
      'Date': sale.DateVente ? sale.DateVente.substring(0, 10) : '',
      'Prix unitaire': sale.Prix_unitaire,
      'Quantité': sale.Quantite
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventes');
    XLSX.writeFile(wb, 'ventes.xlsx');
  };

  return (
    <div className="section-card fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-title"><i className="bi bi-cash-coin me-2"></i>Gestion des ventes <span className="badge bg-primary">{sales.length}</span></h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={exportPDF} type="button"><i className="bi bi-file-earmark-pdf me-1"></i>Exporter PDF</button>
          <button className="btn btn-outline-success" onClick={exportExcel} type="button"><i className="bi bi-file-earmark-excel me-1"></i>Exporter Excel</button>
        </div>
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Recherche... (client, film, vendeur, date)"
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
          <select className="form-control" name="ID_VENDEUR" value={form.ID_VENDEUR} onChange={handleChange} required>
            <option value="">Vendeur</option>
            {vendors.map(v => (
              <option key={v.ID_VENDEUR} value={v.ID_VENDEUR}>{v.NomVen} {v.PrenomVen}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" name="DateVente" value={form.DateVente} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" name="Prix_unitaire" placeholder="Prix" value={form.Prix_unitaire} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" name="Quantite" placeholder="Quantité" value={form.Quantite} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success me-2" disabled={formLoading}>
            {formLoading ? (editId ? 'Modification...' : 'Ajout...') : (editId ? 'Modifier' : 'Ajouter vente')}
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
                <th>ID vente</th>
                <th>Client</th>
                <th>Film</th>
                <th>Vendeur</th>
                <th>Date</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.map((sale) => (
                <tr key={sale.ID_VENTE}>
                  <td>{sale.ID_VENTE}</td>
                  <td>{(() => { 
                    const c = clients.find(c => c.ID_CLIENT === sale.ID_CLIENT);
                    return c ? `${c.NomCli} ${c.PrenomCli}` : '';
                  })()}</td>
                  <td>{(products.find(p => p.ID_PROD === sale.ID_PROD) || {}).Titre}</td>
                  <td>{(() => { 
                    const v = vendors.find(v => v.ID_VENDEUR === sale.ID_VENDEUR);
                    return v ? `${v.NomVendeur} ${v.PrenomVendeur}` : '';
                  })()}</td>
                  <td>{sale.DateVente ? sale.DateVente.substring(0, 10) : ''}</td>
                  <td>{sale.Prix_unitaire}</td>
                  <td>{sale.Quantite}</td>
                  <td>
                    <div className="d-flex gap-2">
  <button className="btn vente-btn-edit" onClick={() => handleEdit(sale)}><i className="bi bi-pencil"></i> Modifier</button>
  <button className="btn vente-btn-del" onClick={() => handleDelete(sale.ID_VENTE)}><i className="bi bi-trash"></i> Supprimer</button>
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

export default Ventes; 