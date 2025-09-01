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
    <div className="section-card-modern fade-in">
      <div className="d-flex justify-content-between align-items-center mb-6" style={{marginBottom: '2rem'}}>
        <h2 className="section-title-modern">
          <i className="bi bi-person-badge" style={{marginRight: '0.5rem'}}></i>
          Gestion des Vendeurs
          <span className="badge bg-primary" style={{marginLeft: '1rem', fontSize: '0.8rem'}}>{vendors.length}</span>
        </h2>
        <div className="search-container-modern" style={{maxWidth: '300px', marginBottom: '0'}}>
        <input
          type="text"
            className="search-input-modern"
            placeholder="Rechercher un vendeur..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        />
          <div className="search-icon-modern">
            <i className="bi bi-search"></i>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      <form className="row g-3 mb-6 fade-in" style={{marginBottom: '2rem'}} onSubmit={handleSubmit}>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Nom</label>
            <input
              type="text"
              className="form-input-modern"
              name="NomVendeur"
              placeholder="Nom du vendeur"
              value={form.NomVendeur}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Prénom</label>
            <input
              type="text"
              className="form-input-modern"
              name="PrenomVendeur"
              placeholder="Prénom du vendeur"
              value={form.PrenomVendeur}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">CIN</label>
            <input
              type="text"
              className="form-input-modern"
              name="CIN"
              placeholder="Numéro CIN"
              value={form.CIN}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Email</label>
            <input
              type="email"
              className="form-input-modern"
              name="Email"
              placeholder="email@exemple.com"
              value={form.Email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Téléphone</label>
            <input
              type="tel"
              className="form-input-modern"
              name="Telephone"
              placeholder="+261 XX XX XXX XX"
              value={form.Telephone}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Adresse</label>
            <input
              type="text"
              className="form-input-modern"
              name="Adresse"
              placeholder="Adresse complète"
              value={form.Adresse}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Photo</label>
            <input
              type="text"
              className="form-input-modern"
              name="PhotoVendeur"
              placeholder="URL ou nom de fichier"
              value={form.PhotoVendeur}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-12">
          <div className="d-flex gap-3">
                        <button
              type="submit"
              className={`btn-success-modern flex-fill ${formLoading ? 'btn-loading' : ''}`}
              disabled={formLoading}
              style={{maxWidth: '250px'}}
            >
              {formLoading ? (
                <>
                  <div className="spinner-modern" style={{width: '1rem', height: '1rem', marginRight: '0.5rem'}}></div>
                  {editId ? 'Modification...' : 'Ajout...'}
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus" style={{marginRight: '0.5rem'}}></i>
                  {editId ? 'Modifier le vendeur' : 'Ajouter le vendeur'}
                </>
              )}
            </button>
            {editId && (
              <button
                type="button"
                className="btn-ghost-modern"
                onClick={handleCancelEdit}
                style={{maxWidth: '120px'}}
              >
                <i className="bi bi-x-circle" style={{marginRight: '0.5rem'}}></i>
                Annuler
              </button>
            )}
          </div>
          {formError && (
            <div className="mt-3 p-3 border-radius-lg" style={{
              background: 'var(--error-50)',
              border: '1px solid var(--error-200)',
              color: 'var(--error-700)'
            }}>
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <span>{formError}</span>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* États de chargement et d'erreur */}
      {loading ? (
        <div className="d-flex align-items-center justify-content-center p-6">
          <div className="spinner-modern me-3"></div>
          <span className="text-muted">Chargement des vendeurs...</span>
        </div>
      ) : error ? (
        <div className="p-4 border-radius-lg" style={{
          background: 'var(--error-50)',
          border: '1px solid var(--error-200)',
          color: 'var(--error-700)'
        }}>
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-3" style={{fontSize: '1.5rem'}}></i>
            <div>
              <div className="font-semibold">Erreur de chargement</div>
              <div>{error}</div>
            </div>
          </div>
        </div>
      ) : (
        <React.Fragment>
          {/* Table moderne des vendeurs */}
          <div className="section-card-modern fade-in" style={{padding: '0', marginTop: '2rem'}}>
            <div className="p-4 border-bottom" style={{borderColor: 'var(--neutral-200) !important'}}>
              <h6 className="font-semibold mb-0" style={{color: 'var(--neutral-700)'}}>
                Liste des vendeurs ({paginatedVendors.length} sur {filteredVendors.length})
              </h6>
            </div>

            {/* En-têtes de la table */}
            <div className="d-none d-md-flex p-3 border-bottom" style={{
              background: 'var(--neutral-50)',
              borderColor: 'var(--neutral-200) !important',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: 'var(--neutral-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <div className="col-1">ID</div>
              <div className="col-2">Nom</div>
              <div className="col-2">Prénom</div>
              <div className="col-2">CIN</div>
              <div className="col-3">Email</div>
              <div className="col-2 text-center">Actions</div>
            </div>

            {/* Corps de la table moderne */}
            <div className="p-0">
              {paginatedVendors.length === 0 ? (
                <div className="text-center p-6">
                  <i className="bi bi-person-badge" style={{fontSize: '3rem', color: 'var(--neutral-400)'}}></i>
                  <div className="mt-3 text-muted">Aucun vendeur trouvé</div>
                  <div className="text-sm text-muted mt-1">
                    {search ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un vendeur'}
                  </div>
                </div>
              ) : (
                paginatedVendors.map((vendor, index) => (
                  <div
                    key={vendor.ID_VENDEUR}
                    className={`d-flex align-items-center p-3 border-bottom hover-lift ${index % 2 === 0 ? '' : ''}`}
                    style={{
                      borderColor: 'var(--neutral-200) !important',
                      transition: 'all var(--duration-normal) var(--easing)',
                      background: index % 2 === 0 ? 'transparent' : 'var(--neutral-50)'
                    }}
                  >
                    {/* Version mobile - Carte */}
                    <div className="d-md-none w-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="font-semibold text-primary">{vendor.NomVendeur} {vendor.PrenomVendeur}</div>
                          <div className="text-sm text-muted">
                            CIN: {vendor.CIN}
                          </div>
                          <div className="text-sm text-muted">
                            {vendor.Email}
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleEdit(vendor)}
                            title="Modifier"
                            style={{background: 'var(--warning-50)', color: 'var(--warning-600)', borderColor: 'var(--warning-200)'}}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleDelete(vendor.ID_VENDEUR)}
                            title="Supprimer"
                            style={{background: 'var(--error-50)', color: 'var(--error-600)', borderColor: 'var(--error-200)'}}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      {vendor.Adresse && (
                        <div className="text-sm text-muted">
                          <i className="bi bi-geo-alt me-2"></i>
                          {vendor.Adresse}
                        </div>
                      )}
                    </div>

                    {/* Version desktop - Ligne de table */}
                    <div className="d-none d-md-flex w-100 align-items-center">
                      <div className="col-1 text-muted font-mono" style={{fontSize: '0.875rem'}}>
                        #{vendor.ID_VENDEUR}
                      </div>
                      <div className="col-2 font-semibold">
                        {vendor.NomVendeur}
                      </div>
                      <div className="col-2">
                        {vendor.PrenomVendeur}
                      </div>
                      <div className="col-2 text-sm">
                        {vendor.CIN}
                      </div>
                      <div className="col-3 text-sm">
                        {vendor.Email}
                      </div>
                      <div className="col-2">
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleEdit(vendor)}
                            title="Modifier"
                            style={{background: 'var(--warning-50)', color: 'var(--warning-600)', borderColor: 'var(--warning-200)'}}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleDelete(vendor.ID_VENDEUR)}
                            title="Supprimer"
                            style={{background: 'var(--error-50)', color: 'var(--error-600)', borderColor: 'var(--error-200)'}}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination moderne */}
          {filteredVendors.length > 0 && (
            <div className="d-flex justify-content-center align-items-center mt-4">
              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn-icon-modern"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage-1)}
                  title="Page précédente"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className="text-sm font-semibold px-3 py-2 border-radius-lg" style={{
                  background: 'var(--neutral-100)',
                  color: 'var(--neutral-700)',
                  minWidth: '80px',
                  textAlign: 'center'
                }}>
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  className="btn-icon-modern"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(currentPage+1)}
                  title="Page suivante"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

export default Vendors; 