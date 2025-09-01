import React, { useEffect, useState } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '../services/clientService';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return phone === '' || /^\d+$/.test(phone);
}

function isAlpha(str) {
  return /^[A-Za-zÀ-ÿ\s'-]+$/.test(str);
}

function isEmail(str) {
  return /^[A-Za-zÀ-ÿ0-9._%+-]+@[A-Za-zÀ-ÿ0-9.-]+\.[A-Za-z]{2,}$/.test(str);
}

function isPhone(str) {
  return /^\d*$/.test(str);
}

function Clients() {
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    NomCli: '',
    PrenomCli: '',
    EmailCli: '',
    TelephoneCli: '',
  });
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Handle form changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let valid = true;
    let error = '';

    if (name === 'NomCli' || name === 'PrenomCli') {
      valid = isAlpha(value);
      if (!valid && value) error = 'Seules les lettres sont autorisées';
    }
    if (name === 'EmailCli') {
      // Validation plus flexible pour l'email pendant la saisie
      if (value && !value.includes('@')) {
        valid = /^[A-Za-zÀ-ÿ0-9._%+-]+$/.test(value);
        if (!valid) error = 'Caractères non autorisés dans l\'email';
      } else if (value && value.includes('@')) {
        valid = isEmail(value);
        if (!valid) error = 'Format d\'email invalide';
      } else {
        valid = true; // Email vide est autorisé
      }
    }
    if (name === 'TelephoneCli') {
      valid = isPhone(value);
      if (!valid && value) error = 'Seuls les chiffres sont autorisés';
    }

    if (!valid) {
      setFormError(error);
      return;
    }
    setFormError('');
    setForm({ ...form, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation côté client
    if (!form.NomCli || !form.NomCli.trim()) {
      setFormError('Le nom est obligatoire');
      return;
    }
    if (!form.PrenomCli || !form.PrenomCli.trim()) {
      setFormError('Le prénom est obligatoire');
      return;
    }

    // Validation de l'email seulement si fourni
    if (form.EmailCli && form.EmailCli.trim()) {
      if (!validateEmail(form.EmailCli)) {
        setFormError('Format d\'email invalide');
        return;
      }
    }

    // Validation du téléphone seulement si fourni
    if (form.TelephoneCli && form.TelephoneCli.trim()) {
    if (!validatePhone(form.TelephoneCli)) {
        setFormError('Le téléphone ne doit contenir que des chiffres');
      return;
      }
    }

    // Nettoyer les données avant envoi
    const clientData = {
      NomCli: form.NomCli.trim(),
      PrenomCli: form.PrenomCli.trim(),
      EmailCli: form.EmailCli ? form.EmailCli.trim() : '',
      TelephoneCli: form.TelephoneCli ? form.TelephoneCli.trim() : ''
    };

    console.log('📤 Envoi des données client:', clientData);

    setFormLoading(true);
    try {
      if (editId) {
        await updateClient(editId, clientData);
        console.log('✅ Client modifié avec succès');
      } else {
        await addClient(clientData);
        console.log('✅ Client ajouté avec succès');
      }

      // Réinitialiser le formulaire
      setForm({ NomCli: '', PrenomCli: '', EmailCli: '', TelephoneCli: '' });
      setEditId(null);
      setFormError('');

      // Recharger la liste des clients
      await fetchClients();

      console.log('🔄 Liste des clients rechargée');
    } catch (err) {
      console.error('❌ Erreur lors de la soumission:', err);
      setFormError(err.message || 'Une erreur inattendue s\'est produite');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (cli) => {
    setForm({
      NomCli: cli.NomCli,
      PrenomCli: cli.PrenomCli,
      EmailCli: cli.EmailCli,
      TelephoneCli: cli.TelephoneCli,
    });
    setEditId(cli.ID_CLIENT);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setForm({ NomCli: '', PrenomCli: '', EmailCli: '', TelephoneCli: '' });
    setEditId(null);
    setFormError('');
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteClient(id);
        fetchClients();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Handle view modal
  const handleView = (cli) => {
    setSelectedClient(cli);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
  };

  // Filter clients
  const filteredClients = clients.filter(cli =>
    cli.NomCli.toLowerCase().includes(search.toLowerCase()) ||
    cli.PrenomCli.toLowerCase().includes(search.toLowerCase()) ||
    cli.EmailCli.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  return (
    <div className="section-card-modern fade-in">
      <div className="d-flex justify-content-between align-items-center mb-6" style={{marginBottom: '2rem'}}>
        <h2 className="section-title-modern">
          <i className="bi bi-people" style={{marginRight: '0.5rem'}}></i>
          Gestion des Clients
          <span className="badge bg-primary" style={{marginLeft: '1rem', fontSize: '0.8rem'}}>{clients.length}</span>
        </h2>
        <div className="search-container-modern" style={{maxWidth: '300px', marginBottom: '0'}}>
        <input
          type="text"
            className="search-input-modern"
            placeholder="Rechercher un client..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        />
          <div className="search-icon-modern">
            <i className="bi bi-search"></i>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      <form className="row g-2 g-md-3 mb-4 mb-md-6 fade-in" style={{marginBottom: '2rem'}} onSubmit={handleSubmit}>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Nom</label>
            <input
              type="text"
              className="form-input-modern"
              name="NomCli"
              placeholder="Nom du client"
              value={form.NomCli}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Prénom</label>
            <input
              type="text"
              className="form-input-modern"
              name="PrenomCli"
              placeholder="Prénom du client"
              value={form.PrenomCli}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Email</label>
            <input
              type="email"
              className="form-input-modern"
              name="EmailCli"
              placeholder="email@exemple.com"
              value={form.EmailCli}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="form-group-modern">
            <label className="form-label-modern">Téléphone</label>
            <input
              type="tel"
              className="form-input-modern"
              name="TelephoneCli"
              placeholder="+261 XX XX XXX XX"
              value={form.TelephoneCli}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-12">
          <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3">
            <button
              type="submit"
              className={`btn-success-modern flex-fill ${formLoading ? 'btn-loading' : ''}`}
              disabled={formLoading}
              style={{maxWidth: '280px'}}
            >
              {formLoading ? (
                <>
                  <div className="spinner-modern" style={{width: '1rem', height: '1rem', marginRight: '0.5rem'}}></div>
                  {editId ? 'Modification...' : 'Ajout...'}
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle" style={{marginRight: '0.5rem'}}></i>
                  {editId ? 'Modifier le client' : 'Ajouter le client'}
                </>
              )}
            </button>
            {editId && (
              <button
                type="button"
                className="btn-ghost-modern flex-fill flex-sm-shrink-0"
                onClick={handleCancelEdit}
                style={{maxWidth: '160px'}}
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
              <div className="d-flex align-items-start align-items-sm-center">
                <i className="bi bi-exclamation-triangle me-2 mt-1 mt-sm-0" style={{fontSize: '1.1rem'}}></i>
                <span className="text-sm">{formError}</span>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* États de chargement et d'erreur */}
      {loading ? (
        <div className="d-flex align-items-center justify-content-center p-6">
          <div className="spinner-modern me-3"></div>
          <span className="text-muted">Chargement des clients...</span>
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
          {/* Table moderne des clients */}
          <div className="section-card-modern fade-in" style={{padding: '0', marginTop: '2rem'}}>
            <div className="p-4 border-bottom" style={{borderColor: 'var(--neutral-200) !important'}}>
              <h6 className="font-semibold mb-0" style={{color: 'var(--neutral-700)'}}>
                Liste des clients ({paginatedClients.length} sur {filteredClients.length})
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
              <div className="col-3">Email</div>
              <div className="col-2">Téléphone</div>
              <div className="col-2 text-center">Actions</div>
  </div>

            {/* Corps de la table moderne */}
            <div className="p-0">
              {paginatedClients.length === 0 ? (
                <div className="text-center p-6">
                  <i className="bi bi-person-x" style={{fontSize: '3rem', color: 'var(--neutral-400)'}}></i>
                  <div className="mt-3 text-muted">Aucun client trouvé</div>
                  <div className="text-sm text-muted mt-1">
                    {search ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un client'}
                  </div>
                </div>
              ) : (
                paginatedClients.map((cli, index) => (
                  <div
                    key={cli.ID_CLIENT}
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
                          <div className="font-semibold text-primary">{cli.NomCli} {cli.PrenomCli}</div>
                          <div className="text-sm text-muted">ID: {cli.ID_CLIENT}</div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleView(cli)}
                            title="Voir détails"
                            style={{background: 'var(--primary-50)', color: 'var(--primary-600)', borderColor: 'var(--primary-200)'}}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleEdit(cli)}
                            title="Modifier"
                            style={{background: 'var(--warning-50)', color: 'var(--warning-600)', borderColor: 'var(--warning-200)'}}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleDelete(cli.ID_CLIENT)}
                            title="Supprimer"
                            style={{background: 'var(--error-50)', color: 'var(--error-600)', borderColor: 'var(--error-200)'}}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="mb-1">
                          <i className="bi bi-envelope me-2"></i>
                          {cli.EmailCli}
                        </div>
                        {cli.TelephoneCli && (
                          <div>
                            <i className="bi bi-telephone me-2"></i>
                            {cli.TelephoneCli}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Version desktop - Ligne de table */}
                    <div className="d-none d-md-flex w-100 align-items-center">
                      <div className="col-1 text-muted font-mono" style={{fontSize: '0.875rem'}}>
                        #{cli.ID_CLIENT}
                      </div>
                      <div className="col-2 font-semibold">
                        {cli.NomCli}
                      </div>
                      <div className="col-2">
                        {cli.PrenomCli}
                      </div>
                      <div className="col-3 text-sm">
                        {cli.EmailCli}
                      </div>
                      <div className="col-2 text-sm">
                        {cli.TelephoneCli || <span className="text-muted">—</span>}
                      </div>
                      <div className="col-2">
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleView(cli)}
                            title="Voir détails"
                            style={{background: 'var(--primary-50)', color: 'var(--primary-600)', borderColor: 'var(--primary-200)'}}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleEdit(cli)}
                            title="Modifier"
                            style={{background: 'var(--warning-50)', color: 'var(--warning-600)', borderColor: 'var(--warning-200)'}}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn-icon-modern btn-bounce"
                            onClick={() => handleDelete(cli.ID_CLIENT)}
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

          {/* Modal moderne du profil client */}
          {showModal && selectedClient && (
            <div className="position-fixed" style={{
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div
                className="section-card-modern"
                style={{maxWidth: '500px', width: '90%', margin: '2rem'}}
              >
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom" style={{borderColor: 'var(--neutral-200) !important'}}>
                  <h5 className="section-title-modern mb-0">
                    <i className="bi bi-person-circle" style={{marginRight: '0.5rem'}}></i>
                    Profil du client
                  </h5>
                  <button
                    type="button"
                    className="btn-icon-modern"
                    onClick={closeModal}
                    style={{background: 'var(--neutral-100)', color: 'var(--neutral-600)'}}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                    </div>

                {/* Corps du modal avec informations du client */}
                <div className="p-4">
                  {/* Avatar et informations principales */}
                  <div className="text-center mb-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center border-radius-full mx-auto mb-3"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                        color: 'white',
                        fontSize: '2rem',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                    >
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <h4 className="font-bold mb-1" style={{color: 'var(--neutral-800)'}}>
                      {selectedClient.NomCli} {selectedClient.PrenomCli}
                    </h4>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="badge" style={{
                        background: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        fontSize: '0.8rem'
                      }}>
                        ID: {selectedClient.ID_CLIENT}
                      </span>
                      <span className="badge" style={{
                        background: 'var(--success-100)',
                        color: 'var(--success-700)',
                        fontSize: '0.8rem'
                      }}>
                        Client actif
                      </span>
                    </div>
                  </div>

                  {/* Informations détaillées */}
                  <div className="space-y-3">
                    <div className="d-flex align-items-center p-3 border-radius-lg" style={{
                      background: 'var(--neutral-50)',
                      border: '1px solid var(--neutral-200)'
                    }}>
                      <div className="d-flex align-items-center justify-content-center border-radius-lg me-3" style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--warning-100)',
                        color: 'var(--warning-600)'
                      }}>
                        <i className="bi bi-envelope"></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{color: 'var(--neutral-700)'}}>Email</div>
                        <div className="text-sm" style={{color: 'var(--neutral-600)'}}>{selectedClient.EmailCli}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center p-3 border-radius-lg" style={{
                      background: 'var(--neutral-50)',
                      border: '1px solid var(--neutral-200)'
                    }}>
                      <div className="d-flex align-items-center justify-content-center border-radius-lg me-3" style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--primary-100)',
                        color: 'var(--primary-600)'
                      }}>
                        <i className="bi bi-telephone"></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{color: 'var(--neutral-700)'}}>Téléphone</div>
                        <div className="text-sm" style={{color: 'var(--neutral-600)'}}>
                          {selectedClient.TelephoneCli || <span className="text-muted">Non renseigné</span>}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center p-3 border-radius-lg" style={{
                      background: 'var(--neutral-50)',
                      border: '1px solid var(--neutral-200)'
                    }}>
                      <div className="d-flex align-items-center justify-content-center border-radius-lg me-3" style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--success-100)',
                        color: 'var(--success-600)'
                      }}>
                        <i className="bi bi-calendar-check"></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{color: 'var(--neutral-700)'}}>Statut</div>
                        <div className="text-sm" style={{color: 'var(--neutral-600)'}}>Client enregistré</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pied du modal */}
                <div className="p-4 border-top text-center" style={{borderColor: 'var(--neutral-200) !important'}}>
                  <button
                    type="button"
                    className="btn-secondary-modern"
                    onClick={closeModal}
                    style={{minWidth: '120px'}}
                  >
                    <i className="bi bi-check-circle" style={{marginRight: '0.5rem'}}></i>
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

                    {/* Pagination moderne */}
          {filteredClients.length > 0 && (
            <div className="d-flex justify-content-center align-items-center mt-3 mt-md-4 px-2 px-md-0">
              <div className="d-flex align-items-center gap-2 gap-md-3">
                <button
                  className="btn-icon-modern"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage-1)}
                  title="Page précédente"
                  style={{minWidth: '44px', minHeight: '44px'}}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className="text-sm font-semibold px-3 py-2 border-radius-lg d-none d-sm-inline-block" style={{
                  background: 'var(--neutral-100)',
                  color: 'var(--neutral-700)',
                  minWidth: '80px',
                  textAlign: 'center'
                }}>
                  {currentPage} / {totalPages || 1}
                </span>
                <span className="text-xs font-semibold px-2 py-1 border-radius-lg d-sm-none" style={{
                  background: 'var(--neutral-100)',
                  color: 'var(--neutral-700)',
                  minWidth: '50px',
                  textAlign: 'center'
                }}>
                  {currentPage}/{totalPages || 1}
                </span>
                <button
                  className="btn-icon-modern"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(currentPage+1)}
                  title="Page suivante"
                  style={{minWidth: '44px', minHeight: '44px'}}
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

// Fonction de test pour vérifier l'ajout de client
export const testAddClient = async () => {
  console.log('🧪 Test d\'ajout de client...');

  const testClient = {
    NomCli: 'Dupont',
    PrenomCli: 'Jean',
    EmailCli: 'jean.dupont@email.com',
    TelephoneCli: '0123456789'
  };

  try {
    const result = await addClient(testClient);
    console.log('✅ Test réussi:', result);
    return result;
  } catch (error) {
    console.error('❌ Test échoué:', error);
    throw error;
  }
};

export default Clients; 