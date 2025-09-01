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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-title"><i className="bi bi-film me-2"></i>Gestion des films <span className="badge bg-primary">{products.length}</span></h2>
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
        <div className="col-md-3">
          <input type="text" className="form-control" name="Titre" placeholder="Titre" value={form.Titre} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="Realisateur" placeholder="Réalisateur" value={form.Realisateur} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" name="DateSortie" placeholder="Date de sortie" value={form.DateSortie} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" name="Duree" placeholder="Durée (min)" value={form.Duree} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" name="Prix_unitaire" placeholder="Prix (ARIARY)" value={form.Prix_unitaire} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="Genre" placeholder="Genre" value={form.Genre} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="Langue" placeholder="Langue" value={form.Langue} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="PaysOrigine" placeholder="Pays d'origine" value={form.PaysOrigine} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="ActeursPrincipaux" placeholder="Acteurs principaux" value={form.ActeursPrincipaux} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="file" className="form-control" name="Photo" accept="image/*" onChange={e => {
  const file = e.target.files[0];
  if (file) {
    setForm({ ...form, Photo: file });
  }
}} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success me-2" disabled={formLoading}>
            {formLoading ? (editId ? 'Modification...' : 'Ajout...') : (editId ? 'Modifier' : 'Ajouter film')}
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
                <th>Titre</th>
                <th>Réalisateur</th>
                <th>Date sortie</th>
                <th>Durée</th>
                <th>Prix (ARIARY)</th>
                <th>Genre</th>
                <th>Langue</th>
                <th>Pays</th>
                <th>Acteurs</th>
                <th>Photo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((prod) => (
                <tr key={prod.ID_PROD}>
                  <td>{prod.ID_PROD}</td>
                  <td>{prod.Titre}</td>
                  <td>{prod.Realisateur}</td>
                  <td>{prod.DateSortie ? prod.DateSortie.substring(0, 10) : ''}</td>
                  <td>{prod.Duree}</td>
                  <td>{prod.Prix_unitaire}</td>
                  <td>{prod.Genre}</td>
                  <td>{prod.Langue}</td>
                  <td>{prod.PaysOrigine}</td>
                  <td>{prod.ActeursPrincipaux}</td>
                  <td>
                    {prod.Photo && (
                      <img
                        src={prod.Photo.startsWith('http') ? prod.Photo : `/photos/films/${prod.Photo}`}
                        alt="Affiche"
                        width={60}
                        className="rounded shadow-sm"
                      />
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
  <button className="btn prod-btn-edit" onClick={() => handleEdit(prod)}><i className="bi bi-pencil"></i> Modifier</button>
  <button className="btn prod-btn-del" onClick={() => handleDelete(prod.ID_PROD)}><i className="bi bi-trash"></i> Supprimer</button>
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

export default Products; 