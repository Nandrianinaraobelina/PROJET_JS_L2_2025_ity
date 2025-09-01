import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/produits';

export async function getProducts() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
  return response.json();
}

export async function addProduct(formData) {
  const response = await fetch('http://localhost:5000/api/produits', {
    method: 'POST',
    body: formData,
  });

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
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression du produit');
  return response.json();
} 