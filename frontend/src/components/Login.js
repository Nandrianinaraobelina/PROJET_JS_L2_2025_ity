// import React, { useState } from 'react';
// import { login } from '../services/authService';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './Login.css'; // pour l'animation

// function Login({ onLogin }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       await login(username, password);
//       if (onLogin) onLogin();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
//       <div className="login-card p-4 shadow-lg" style={{borderRadius:22, minWidth:340, maxWidth:410, background:'#18181b', color:'#f4f4f4'}}>
//         <div className="text-center mb-4 position-relative">
//           <span className="login-flash-animation">
//             <i className="bi bi-lightning-charge-fill text-warning" style={{fontSize:'2.3rem',position:'absolute',left:'-32px',top:'-14px',filter:'drop-shadow(0 0 10px #ffd700)'}}></i>
//           </span>
//           <h2 className="fw-bold mb-1" style={{letterSpacing:'.03em'}}>Connexion administrateur</h2>
//         </div>
//         <form onSubmit={handleSubmit} autoComplete="on">
//           <div className="mb-3">
//             <label className="form-label" style={{color:'#fff'}}>Nom d'utilisateur</label>
//             <input
//               type="text"
//               className="form-control form-control-lg"
//               value={username}
//               onChange={e => setUsername(e.target.value)}
//               required
//               autoFocus
//               style={{background:'#23232b',borderRadius:12, color:'#fff', border:'1px solid #222'}}
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label" style={{color:'#fff'}}>Mot de passe</label>
//             <input
//               type="password"
//               className="form-control form-control-lg"
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               required
//               style={{background:'#23232b',borderRadius:12, color:'#fff', border:'1px solid #222'}}
//             />
//           </div>
//           {error && <div className="alert alert-danger text-center py-2">{error}</div>}
//           <button type="submit" className="btn btn-warning w-100 fw-bold py-2 mb-2" style={{fontSize:'1.16rem',borderRadius:12,boxShadow:'0 2px 12px #ffe066'}} disabled={loading}>
//             {loading ? 'Connexion...' : 'Se connecter'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Login;