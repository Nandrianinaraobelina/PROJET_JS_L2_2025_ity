import React, { useState, useEffect } from "react";
import { getToken } from "../services/authService";

function Admin() {
  const [adminInfo, setAdminInfo] = useState({
    username: "Administrateur",
    email: "admin@ventefilms.com",
    role: "Administrateur",
    lastLogin: new Date().toLocaleString(),
    sessionStart: new Date().toLocaleString(),
  });
  const [sessionDuration, setSessionDuration] = useState(0);

  // Calculer la durée de session
  useEffect(() => {
    const startTime = new Date();
    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now - startTime) / 1000);
      setSessionDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Formater la durée de session
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Récupérer les informations du token
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        // Décoder le token JWT (partie payload)
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdminInfo((prev) => ({
          ...prev,
          username: payload.username || "Administrateur",
          email: payload.email || "admin@ventefilms.com",
          lastLogin: new Date(payload.iat * 1000).toLocaleString(),
        }));
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
      }
    }
  }, []);

  return (
    <div className="section-card-modern fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="section-title-modern">
          <i
            className="bi bi-person-gear"
            style={{ marginRight: "0.5rem" }}
          ></i>
          Profil Administrateur
        </h2>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success" style={{ fontSize: "0.8rem" }}>
            <i className="bi bi-shield-check me-1"></i>
            Session Active
          </span>
        </div>
      </div>

      {/* Informations de session */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div
            className="section-card-modern"
            style={{
              padding: "1.5rem",
              background: "var(--success-50)",
              border: "1px solid var(--success-200)",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-1" style={{ color: "var(--success-700)" }}>
                  <i className="bi bi-shield-check me-2"></i>
                  ADMIN Connecté
                </h5>
                <p className="mb-0 text-muted">Session administrateur active</p>
              </div>
              <div className="text-end">
                <div
                  className="h4 mb-0"
                  style={{ color: "var(--success-600)" }}
                >
                  {formatDuration(sessionDuration)}
                </div>
                <small className="text-muted">Durée de session</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations du profil */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="section-card-modern" style={{ padding: "1.5rem" }}>
            <h5 className="mb-3">
              <i className="bi bi-person-circle me-2"></i>
              Informations du compte
            </h5>
            <div className="space-y-3">
              <div
                className="d-flex align-items-center p-3 border-radius-lg"
                style={{
                  background: "var(--neutral-50)",
                  border: "1px solid var(--neutral-200)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center border-radius-lg me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--primary-100)",
                    color: "var(--primary-600)",
                  }}
                >
                  <i className="bi bi-person"></i>
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--neutral-700)" }}
                  >
                    Nom d'utilisateur
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--neutral-600)" }}
                  >
                    {adminInfo.username}
                  </div>
                </div>
              </div>

              <div
                className="d-flex align-items-center p-3 border-radius-lg"
                style={{
                  background: "var(--neutral-50)",
                  border: "1px solid var(--neutral-200)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center border-radius-lg me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--warning-100)",
                    color: "var(--warning-600)",
                  }}
                >
                  <i className="bi bi-envelope"></i>
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--neutral-700)" }}
                  >
                    Email
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--neutral-600)" }}
                  >
                    {adminInfo.email}
                  </div>
                </div>
              </div>

              <div
                className="d-flex align-items-center p-3 border-radius-lg"
                style={{
                  background: "var(--neutral-50)",
                  border: "1px solid var(--neutral-200)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center border-radius-lg me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--error-100)",
                    color: "var(--error-600)",
                  }}
                >
                  <i className="bi bi-shield-lock"></i>
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--neutral-700)" }}
                  >
                    Rôle
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--neutral-600)" }}
                  >
                    {adminInfo.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="section-card-modern" style={{ padding: "1.5rem" }}>
            <h5 className="mb-3">
              <i className="bi bi-clock-history me-2"></i>
              Informations de session
            </h5>
            <div className="space-y-3">
              <div
                className="d-flex align-items-center p-3 border-radius-lg"
                style={{
                  background: "var(--neutral-50)",
                  border: "1px solid var(--neutral-200)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center border-radius-lg me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--success-100)",
                    color: "var(--success-600)",
                  }}
                >
                  <i className="bi bi-play-circle"></i>
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--neutral-700)" }}
                  >
                    Début de session
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--neutral-600)" }}
                  >
                    {adminInfo.sessionStart}
                  </div>
                </div>
              </div>

              <div
                className="d-flex align-items-center p-3 border-radius-lg"
                style={{
                  background: "var(--neutral-50)",
                  border: "1px solid var(--neutral-200)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center border-radius-lg me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--info-100)",
                    color: "var(--info-600)",
                  }}
                >
                  <i className="bi bi-clock"></i>
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--neutral-700)" }}
                  >
                    Dernière connexion
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--neutral-600)" }}
                  >
                    {adminInfo.lastLogin}
                  </div>
                </div>
              </div>

              <div
                className="d-flex align-items-center p-3 border-radius-lg"
                style={{
                  background: "var(--neutral-50)",
                  border: "1px solid var(--neutral-200)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center border-radius-lg me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--warning-100)",
                    color: "var(--warning-600)",
                  }}
                >
                  <i className="bi bi-stopwatch"></i>
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--neutral-700)" }}
                  >
                    Durée de session
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--warning-600)" }}
                  >
                    {formatDuration(sessionDuration)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions administrateur */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="section-card-modern" style={{ padding: "1.5rem" }}>
            <h5 className="mb-3">
              <i className="bi bi-gear me-2"></i>
              Actions administrateur
            </h5>
            <div className="row g-3">
              <div className="col-md-4">
                <button
                  className="btn btn-outline-primary btn-modern w-100"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Actualiser l'application
                </button>
              </div>
              <div className="col-md-4">
                <button
                  className="btn btn-outline-info btn-modern w-100"
                  onClick={() => window.open("/api-docs", "_blank")}
                >
                  <i className="bi bi-book me-2"></i>
                  Documentation API
                </button>
              </div>
              <div className="col-md-4">
                <button
                  className="btn btn-outline-warning btn-modern w-100"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Voulez-vous vider le cache de l'application ?"
                      )
                    ) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  <i className="bi bi-trash me-2"></i>
                  Vider le cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
