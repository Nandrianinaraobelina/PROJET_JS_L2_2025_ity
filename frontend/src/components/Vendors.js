import React, { useEffect, useState } from 'react';
import { getVendors, addVendor, updateVendor, deleteVendor } from '../services/vendorService';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone) {
  return phone === '' || /^\d+$/.test(phone);
}

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    NomVendeur: '',
    PrenomVendeur: '',
    CIN: '',
    Email: '',
    Telephone: '',
    Adresse: '',
    PhotoVendeur: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getVendors();
      setVendors(data);
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
    if (!form.NomVendeur || !form.PrenomVendeur || !form.CIN) {
      setFormError('Nom, prénom et CIN obligatoires');
      return;
    }
    if (!validateEmail(form.Email)) {
      setFormError('Email invalide');
      return;
    }
    if (!validatePhone(form.Telephone)) {
      setFormError('Téléphone invalide (chiffres uniquement)');
      return;
    }
    setFormLoading(true);
    try {
      if (editId) {
        await updateVendor(editId, form);
      } else {
        await addVendor(form);
      }
      setForm({ NomVendeur: '', PrenomVendeur: '', CIN: '', Email: '', Telephone: '', Adresse: '', PhotoVendeur: '' });
      setEditId(null);
      fetchVendors();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (vendor) => {
    setForm({
      NomVendeur: vendor.NomVendeur,
      PrenomVendeur: vendor.PrenomVendeur,
      CIN: vendor.CIN,
      Email: vendor.Email,
      Telephone: vendor.Telephone || '',
      Adresse: vendor.Adresse || '',
      PhotoVendeur: vendor.PhotoVendeur || '',
    });
    setEditId(vendor.ID_VENDEUR);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce vendeur ?')) {
      try {
        await deleteVendor(id);
        fetchVendors();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setForm({ NomVendeur: '', PrenomVendeur: '', CIN: '', Email: '', Telephone: '', Adresse: '', PhotoVendeur: '' });
    setEditId(null);
    setFormError('');
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.NomVendeur.toLowerCase().includes(search.toLowerCase()) ||
    vendor.PrenomVendeur.toLowerCase().includes(search.toLowerCase()) ||
    vendor.CIN.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  return (
    <div className="section-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-title"><i className="bi bi-person-badge me-2"></i>Gestion des vendeurs <span className="badge bg-primary">{vendors.length}</span></h2>
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Recherche..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{ minWidth: 180 }}
        />
      </div>
      <form className="row g-3 mb-4 fade-in" onSubmit={handleSubmit}>
        <div className="col-md-2">
          <input type="text" className="form-control" name="NomVendeur" placeholder="Nom" value={form.NomVendeur} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="PrenomVendeur" placeholder="Prénom" value={form.PrenomVendeur} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="CIN" placeholder="CIN" value={form.CIN} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="email" className="form-control" name="Email" placeholder="Email" value={form.Email} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="Telephone" placeholder="Téléphone" value={form.Telephone} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="Adresse" placeholder="Adresse" value={form.Adresse} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="PhotoVendeur" placeholder="Photo (URL ou nom)" value={form.PhotoVendeur} onChange={handleChange} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success me-2" disabled={formLoading}>
            {formLoading ? (editId ? 'Modification...' : 'Ajout...') : (editId ? 'Modifier' : 'Ajouter vendeur')}
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
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>CIN</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Photo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVendors.map((vendor) => (
                <tr key={vendor.ID_VENDEUR}>
                  <td>{vendor.ID_VENDEUR}</td>
                  <td>{vendor.NomVendeur}</td>
                  <td>{vendor.PrenomVendeur}</td>
                  <td>{vendor.CIN}</td>
                  <td>{vendor.Email}</td>
                  <td>{vendor.Telephone}</td>
                  <td>{vendor.Adresse}</td>
                  <td>
                    {vendor.PhotoVendeur && (
                      <img
                        src={vendor.PhotoVendeur.startsWith('http') ? vendor.PhotoVendeur : `/images/${vendor.PhotoVendeur}`}
                        alt={vendor.NomVendeur + ' ' + vendor.PrenomVendeur}
                        width={60}
                      />
                    )}
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(vendor)}>Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vendor.ID_VENDEUR)}>Supprimer</button>
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

export default Vendors; 