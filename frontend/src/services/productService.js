import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/produits';

export async function getProducts() {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
  return response.json();
}

export async function addProduct(formData) {
  const response = await fetch('http://localhost:5000/api/produits', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    // Token invalide ou manquant
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirige vers la page de login
    return;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de l’ajout du produit');
  }
  return response.json();
}

export async function updateProduct(id, product) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken(),
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de la modification du produit');
  }
  return response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression du produit');
  return response.json();
} 