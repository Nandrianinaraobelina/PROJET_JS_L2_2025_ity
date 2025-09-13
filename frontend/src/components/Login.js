import React, { useState } from 'react';
import { login, register } from '../services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // pour l'animation

function Login({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isRegisterMode) {
        // Mode inscription
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }

        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          return;
        }

        await register({ username, password, email });
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsRegisterMode(false);
        // Réinitialiser les champs
        setEmail('');
        setConfirmPassword('');
      } else {
        // Mode connexion
        await login(username, password);
        if (onLogin) onLogin();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccess('');
    // Réinitialiser tous les champs
    setUsername('');
    setPassword('');
    setEmail('');
    setConfirmPassword('');
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
      <div className={`login-card p-4 shadow-lg ${isRegisterMode ? 'register-mode' : ''}`}
           style={{borderRadius:22, minWidth:360, maxWidth:450, background:'#18181b', color:'#f4f4f4'}}>
        <div className="text-center mb-4 position-relative">
          <span className="login-flash-animation">
            <i className={`bi ${isRegisterMode ? 'bi-person-plus-fill' : 'bi-lightning-charge-fill'} text-warning`}
               style={{fontSize:'2.3rem',position:'absolute',left:'-32px',top:'-14px',filter:'drop-shadow(0 0 10px #ffd700)'}}>
            </i>
          </span>
          <h2 className="fw-bold mb-1" style={{letterSpacing:'.03em'}}>
            {isRegisterMode ? 'Création de compte' : 'Connexion administrateur'}
          </h2>
    
        </div>

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="mb-3">
            <label className="form-label" style={{color:'#fff'}}>
              <i className="bi bi-person me-1"></i>Nom d'utilisateur
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus={!isRegisterMode}
              placeholder="Entrez votre nom d'utilisateur"
              style={{background:'#23232b',borderRadius:12, color:'#fff', border:'1px solid #222'}}
            />
          </div>

          {isRegisterMode && (
            <div className="mb-3">
              <label className="form-label" style={{color:'#fff'}}>
                <i className="bi bi-envelope me-1"></i>Email
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Entrez votre adresse email"
                style={{background:'#23232b',borderRadius:12, color:'#fff', border:'1px solid #222'}}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label" style={{color:'#fff'}}>
              <i className="bi bi-lock me-1"></i>Mot de passe
            </label>
            <input
              type="password"
              className="form-control form-control-lg"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={isRegisterMode ? "Minimum 6 caractères" : "Entrez votre mot de passe"}
              style={{background:'#23232b',borderRadius:12, color:'#fff', border:'1px solid #222'}}
            />
          </div>

          {isRegisterMode && (
            <div className="mb-3">
              <label className="form-label" style={{color:'#fff'}}>
                <i className="bi bi-lock-fill me-1"></i>Confirmer le mot de passe
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Répétez votre mot de passe"
                style={{background:'#23232b',borderRadius:12, color:'#fff', border:'1px solid #222'}}
              />
            </div>
          )}

          {error && <div className="alert alert-danger text-center py-2" style={{borderRadius:8}}>{error}</div>}
          {success && <div className="alert alert-success text-center py-2" style={{borderRadius:8}}>{success}</div>}

          <button
            type="submit"
            className={`btn w-100 fw-bold py-2 mb-3 ${isRegisterMode ? 'btn-success' : 'btn-warning'}`}
            style={{
              fontSize:'1.16rem',
              borderRadius:12,
              boxShadow: isRegisterMode ? '0 2px 12px rgba(40, 167, 69, 0.3)' : '0 2px 12px #ffe066'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {isRegisterMode ? 'Création...' : 'Connexion...'}
              </>
            ) : (
              <>
                <i className={`bi ${isRegisterMode ? 'bi-check-circle' : 'bi-box-arrow-in-right'} me-2`}></i>
                {isRegisterMode ? 'Créer le compte' : 'Se connecter'}
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0"
              onClick={toggleMode}
              style={{color: '#6c757d', fontSize: '0.9rem'}}
            >
              <i className={`bi ${isRegisterMode ? 'bi-box-arrow-in-right' : 'bi-person-plus'} me-1`}></i>
              {isRegisterMode ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;