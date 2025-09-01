import React, { useEffect, useState } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/productService';

function validatePrice(price) {
  return !isNaN(price) && Number(price) >= 0;
}

function isAlpha(str) {
  return /^[A-Za-zÀ-ÿ\s'-]+$/.test(str);
}

function Products() {
  // Ajout du design blur sur le conteneur principal

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    Titre: '',
    Realisateur: '',
    DateSortie: '',
    Duree: '',
    Prix_unitaire: '',
    Genre: '',
    Langue: '',
    PaysOrigine: '',
    ActeursPrincipaux: '',
    Photo: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let valid = true;
    let error = '';
    if (["Titre", "Realisateur", "Genre", "Langue", "PaysOrigine", "ActeursPrincipaux"].includes(name)) {
      valid = isAlpha(value);
      if (!valid) error = 'Seules les lettres sont autorisées';
    }
    // La logique pour type='file' a été enlevée car Photo est maintenant un champ texte
    // pour entrer le chemin de l'image, ex: /images/mon_film.jpg
    if (!valid) {
      setFormError(error);
      return;
    }
    setFormError('');
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.Titre) {
      setFormError('Le titre est obligatoire');
      return;
    }
    if (!validatePrice(form.Prix_unitaire)) {
      setFormError('Le prix doit être un nombre positif');
      return;
    }
    setFormLoading(true);
    try {
      let formData;
      if (editId) {
        // Pour la modification, on n'autorise pas le changement d'image ici (optionnel: à implémenter si besoin)
        await updateProduct(editId, { ...form, Photo: undefined });
      } else {
        formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (key === 'Photo' && value instanceof File) {
            formData.append('Photo', value);
          } else {
            formData.append(key, value);
          }
        });
        await addProduct(formData);
      }
      setForm({ Titre: '', Realisateur: '', DateSortie: '', Duree: '', Prix_unitaire: '', Genre: '', Langue: '', PaysOrigine: '', ActeursPrincipaux: '', Photo: '' });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };


  const handleEdit = (prod) => {
    setForm({
      Titre: prod.Titre,
      Realisateur: prod.Realisateur || '',
      DateSortie: prod.DateSortie ? prod.DateSortie.substring(0, 10) : '',
      Duree: prod.Duree || '',
      Prix_unitaire: prod.Prix_unitaire,
      Genre: prod.Genre || '',
      Langue: prod.Langue || '',
      PaysOrigine: prod.PaysOrigine || '',
      ActeursPrincipaux: prod.ActeursPrincipaux || '',
      Photo: prod.Photo || '',
    });
    setEditId(prod.ID_PROD);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce film ?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setForm({ Titre: '', Realisateur: '', DateSortie: '', Duree: '', Prix_unitaire: '', Genre: '', Langue: '', PaysOrigine: '', ActeursPrincipaux: '', Photo: '' });
    setEditId(null);
    setFormError('');
  };

  const filteredProducts = products.filter(prod =>
    prod.Titre.toLowerCase().includes(search.toLowerCase()) ||
    (prod.Realisateur || '').toLowerCase().includes(search.toLowerCase()) ||
    (prod.Genre || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  return (
    <div className="section-card-modern fade-in">
      <div className="d-flex justify-content-between align-items-center mb-6" style={{marginBottom: '2rem'}}>
        <h2 className="section-title-modern">
          <i className="bi bi-film" style={{marginRight: '0.5rem'}}></i>
          Gestion des Produits
          <span className="badge bg-primary" style={{marginLeft: '1rem', fontSize: '0.8rem'}}>{products.length}</span>
        </h2>
        <div className="search-container-modern" style={{maxWidth: '300px', marginBottom: '0'}}>
        <input
          type="text"
            className="search-input-modern"
            placeholder="Rechercher un produit..."
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
        <div className="col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Titre</label>
            <input
              type="text"
              className="form-input-modern"
              name="Titre"
              placeholder="Titre du film"
              value={form.Titre}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Réalisateur</label>
            <input
              type="text"
              className="form-input-modern"
              name="Realisateur"
              placeholder="Nom du réalisateur"
              value={form.Realisateur}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Date de sortie</label>
            <input
              type="date"
              className="form-input-modern"
              name="DateSortie"
              value={form.DateSortie}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Durée</label>
            <input
              type="number"
              className="form-input-modern"
              name="Duree"
              placeholder="120"
              value={form.Duree}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group-modern">
            <label className="form-label-modern">Prix</label>
            <input
              type="number"
              className="form-input-modern"
              name="Prix_unitaire"
              placeholder="50000"
              value={form.Prix_unitaire}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Genre</label>
            <input
              type="text"
              className="form-input-modern"
              name="Genre"
              placeholder="Action, Comédie..."
              value={form.Genre}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Langue</label>
            <input
              type="text"
              className="form-input-modern"
              name="Langue"
              placeholder="Français"
              value={form.Langue}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Pays d'origine</label>
            <input
              type="text"
              className="form-input-modern"
              name="PaysOrigine"
              placeholder="France"
              value={form.PaysOrigine}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Acteurs principaux</label>
            <input
              type="text"
              className="form-input-modern"
              name="ActeursPrincipaux"
              placeholder="Acteur 1, Acteur 2..."
              value={form.ActeursPrincipaux}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Photo (optionnel)</label>
            <input
              type="file"
              className="form-input-modern"
              name="Photo"
              accept="image/*"
              onChange={e => {
  const file = e.target.files[0];
  if (file) {
    setForm({ ...form, Photo: file });
  }
              }}
              style={{padding: '0.5rem'}}
            />
          </div>
        </div>
        <div className="col-12">
          <div className="d-flex gap-3">
                        <button
              type="submit"
              className={`btn-success-modern flex-fill ${formLoading ? 'btn-loading' : ''}`}
              disabled={formLoading}
              style={{maxWidth: '200px'}}
            >
              {formLoading ? (
                <>
                  <div className="spinner-modern" style={{width: '1rem', height: '1rem', marginRight: '0.5rem'}}></div>
                  {editId ? 'Modification...' : 'Ajout...'}
                </>
              ) : (
                <>
                  <i className="bi bi-film" style={{marginRight: '0.5rem'}}></i>
                  {editId ? 'Modifier le film' : 'Ajouter le film'}
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
      {loading ? (
        <div className="d-flex align-items-center justify-content-center p-6">
          <div className="spinner-modern me-3"></div>
          <span className="text-muted">Chargement des produits...</span>
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
          {/* Table moderne des produits */}
          <div className="section-card-modern fade-in" style={{padding: '0', marginTop: '2rem'}}>
            <div className="p-4 border-bottom" style={{borderColor: 'var(--neutral-200) !important'}}>
              <h6 className="font-semibold mb-0" style={{color: 'var(--neutral-700)'}}>
                Liste des produits ({paginatedProducts.length} sur {filteredProducts.length})
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
              <div className="col-2">Titre</div>
              <div className="col-2">Réalisateur</div>
              <div className="col-1">Année</div>
              <div className="col-1">Durée</div>
              <div className="col-1">Prix</div>
              <div className="col-2">Genre</div>
              <div className="col-2 text-center">Actions</div>
            </div>

            {/* Corps de la table moderne */}
            <div className="p-0">
              {paginatedProducts.length === 0 ? (
                <div className="text-center p-6">
                  <i className="bi bi-film" style={{fontSize: '3rem', color: 'var(--neutral-400)'}}></i>
                  <div className="mt-3 text-muted">Aucun produit trouvé</div>
                  <div className="text-sm text-muted mt-1">
                    {search ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un produit'}
                  </div>
                </div>
              ) : (
                paginatedProducts.map((prod, index) => (
                  <div
                    key={prod.ID_PROD}
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
                          <div className="font-semibold text-primary">{prod.Titre}</div>
                          <div className="text-sm text-muted">
                            {prod.Realisateur && `Par ${prod.Realisateur}`}
                            {prod.DateSortie && ` • ${prod.DateSortie.substring(0, 4)}`}
                          </div>
                          <div className="text-sm font-semibold" style={{color: 'var(--success-600)'}}>
                            {prod.Prix_unitaire} ARIARY
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleEdit(prod)}
                            title="Modifier"
                            style={{background: 'var(--warning-50)', color: 'var(--warning-600)', borderColor: 'var(--warning-200)'}}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleDelete(prod.ID_PROD)}
                            title="Supprimer"
                            style={{background: 'var(--error-50)', color: 'var(--error-600)', borderColor: 'var(--error-200)'}}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-muted">
                        {prod.Genre && (
                          <div className="mb-1">
                            <i className="bi bi-tag me-2"></i>
                            {prod.Genre}
                          </div>
                        )}
                        {prod.Duree && (
                          <div>
                            <i className="bi bi-clock me-2"></i>
                            {prod.Duree} min
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Version desktop - Ligne de table */}
                    <div className="d-none d-md-flex w-100 align-items-center">
                      <div className="col-1 text-muted font-mono" style={{fontSize: '0.875rem'}}>
                        #{prod.ID_PROD}
                      </div>
                      <div className="col-2">
                        <div className="font-semibold">{prod.Titre}</div>
                        {prod.Realisateur && (
                          <div className="text-sm text-muted">{prod.Realisateur}</div>
                        )}
                      </div>
                      <div className="col-2 text-sm">
                        {prod.Realisateur || <span className="text-muted">—</span>}
                      </div>
                      <div className="col-1 text-sm">
                        {prod.DateSortie ? prod.DateSortie.substring(0, 4) : <span className="text-muted">—</span>}
                      </div>
                      <div className="col-1 text-sm">
                        {prod.Duree ? `${prod.Duree}min` : <span className="text-muted">—</span>}
                      </div>
                      <div className="col-1 font-semibold" style={{color: 'var(--success-600)'}}>
                        {prod.Prix_unitaire}
                      </div>
                      <div className="col-2 text-sm">
                        {prod.Genre || <span className="text-muted">—</span>}
                      </div>
                      <div className="col-2">
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleEdit(prod)}
                            title="Modifier"
                            style={{background: 'var(--warning-50)', color: 'var(--warning-600)', borderColor: 'var(--warning-200)'}}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleDelete(prod.ID_PROD)}
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
          {filteredProducts.length > 0 && (
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

export default Products; 