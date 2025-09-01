import React, { useEffect, useState } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '../services/clientService';

function validateEmail(email) {
  // Validation simple d'email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  // Accepte vide ou chiffres uniquement
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
  // Ajout du design blur sur le conteneur principal

  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleView = (cli) => {
    setSelectedClient(cli);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
  };

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    NomCli: '',
    PrenomCli: '',
    EmailCli: '',
    TelephoneCli: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let valid = true;
    let error = '';
    if (name === 'NomCli' || name === 'PrenomCli') {
      valid = isAlpha(value);
      if (!valid) error = 'Seules les lettres sont autorisées';
    }
    if (name === 'EmailCli') {
      valid = isAlpha(value.split('@')[0]) || isEmail(value);
      if (!valid) error = 'Email invalide (lettres uniquement avant le @)';
    }
    if (name === 'TelephoneCli') {
      valid = isPhone(value);
      if (!valid) error = 'Seuls les chiffres sont autorisés';
    }
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
    // Contrôle de champ côté client
    if (!form.NomCli || !form.PrenomCli) {
      setFormError('Nom et prénom obligatoires');
      return;
    }
    if (!validateEmail(form.EmailCli)) {
      setFormError('Email invalide');
      return;
    }
    if (!validatePhone(form.TelephoneCli)) {
      setFormError('Téléphone invalide (chiffres uniquement)');
      return;
    }
    setFormLoading(true);
    try {
      if (editId) {
        await updateClient(editId, form);
      } else {
        await addClient(form);
      }
      setForm({ NomCli: '', PrenomCli: '', EmailCli: '', TelephoneCli: '' });
      setEditId(null);
      fetchClients();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (client) => {
    setForm({
      NomCli: client.NomCli,
      PrenomCli: client.PrenomCli,
      EmailCli: client.EmailCli,
      TelephoneCli: client.TelephoneCli || '',
    });
    setEditId(client.ID_CLIENT);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce client ?')) {
      try {
        await deleteClient(id);
        fetchClients();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setForm({ NomCli: '', PrenomCli: '', EmailCli: '', TelephoneCli: '' });
    setEditId(null);
    setFormError('');
  };

  const filteredClients = clients.filter(cli =>
    cli.NomCli.toLowerCase().includes(search.toLowerCase()) ||
    cli.PrenomCli.toLowerCase().includes(search.toLowerCase()) ||
    cli.EmailCli.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-title"><i className="bi bi-people me-2"></i>Gestion des clients <span className="badge bg-primary">{clients.length}</span></h2>
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
          <input type="text" className="form-control" name="NomCli" placeholder="Nom" value={form.NomCli} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="PrenomCli" placeholder="Prénom" value={form.PrenomCli} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <input type="email" className="form-control" name="EmailCli" placeholder="Email" value={form.EmailCli} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="TelephoneCli" placeholder="Téléphone" value={form.TelephoneCli} onChange={handleChange} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success me-2" disabled={formLoading}>
            {formLoading ? (editId ? 'Modification...' : 'Ajout...') : (editId ? 'Modifier' : 'Ajouter client')}
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
            <thead style={{backgroundColor:'#111', color:'#fff'}}>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((cli) => (
                <tr key={cli.ID_CLIENT}>
                  <td>{cli.ID_CLIENT}</td>
                  <td>{cli.NomCli}</td>
                  <td>{cli.PrenomCli}</td>
                  <td>{cli.EmailCli}</td>
                  <td>{cli.TelephoneCli}</td>
                  <td>
                    <div className="d-flex flex-column gap-1 align-items-start">
  <div className="d-flex gap-2 mb-1">
    <button className="btn client-btn-view" onClick={() => handleView(cli)}><i className="bi bi-eye"></i> Voir</button>
    <button className="btn client-btn-edit" onClick={() => handleEdit(cli)}><i className="bi bi-pencil"></i> Modifier</button>
  </div>
  <div className="d-flex gap-2">
    <button className="btn client-btn-del" onClick={() => handleDelete(cli.ID_CLIENT)}><i className="bi bi-trash"></i> Supprimer</button>
  </div>
</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {showModal && selectedClient && (
            <div className="modal fade show" tabIndex="-1" style={{display:'block',background:'rgba(0,0,0,0.35)'}}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content p-0" style={{borderRadius:22,overflow:'hidden',background:'linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)',color:'#fff',boxShadow:'0 8px 32px rgba(44,0,80,0.18)'}}>
                  <div className="modal-header border-0" style={{background:'rgba(0,0,0,0.10)'}}>
                    <h5 className="modal-title"><i className="bi bi-person-circle me-2"></i>Profil du client</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="d-flex flex-column align-items-center mb-3">
                      <div style={{width:90,height:90,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,boxShadow:'0 4px 18px rgba(60,0,120,0.10)',border:'4px solid #2563eb'}}>
                        <i className="bi bi-person-fill text-primary"></i>
                      </div>
                      <div className="mt-3 mb-1 fw-bold" style={{fontSize:'1.5rem',color:'#fff',textShadow:'0 1px 6px #1e293b'}}>{selectedClient.NomCli} {selectedClient.PrenomCli}</div>
                      <span className="badge bg-dark mb-2" style={{fontSize:'1rem'}}>ID: {selectedClient.ID_CLIENT}</span>
                    </div>
                    <div className="mb-2"><i className="bi bi-envelope me-2 text-warning"></i>
                      <span className="badge bg-light text-dark border" style={{fontSize:'1rem'}}>{selectedClient.EmailCli}</span>
                    </div>
                    <div className="mb-2"><i className="bi bi-telephone me-2 text-info"></i>
                      <span className="badge bg-light text-dark border" style={{fontSize:'1rem'}}>{selectedClient.TelephoneCli || <span className="text-muted">Non renseigné</span>}</span>
                    </div>
                    <div className="mb-2"><i className="bi bi-award me-2 text-success"></i>
                      <span className="badge bg-success" style={{fontSize:'1rem'}}>Statut : Nouveau client</span>
                    </div>
                    <div className="mb-2"><i className="bi bi-cart-check me-2 text-light"></i>
                      <span className="badge bg-secondary" style={{fontSize:'1rem'}}>Nombre d'achats : 0</span>
                    </div>
                  </div>
                  <div className="modal-footer border-0" style={{background:'rgba(0,0,0,0.10)'}}>
                    <button type="button" className="btn btn-warning w-100 py-2 fw-bold" style={{fontSize:'1.15rem',borderRadius:12}} onClick={closeModal}>Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
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

export default Clients; 