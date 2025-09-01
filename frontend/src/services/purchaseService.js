import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/achats';

export async function getPurchases() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Erreur lors de la récupération des achats');
  return response.json();
}

export async function addPurchase(purchase) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(purchase),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de l’ajout de l’achat');
  }
  return response.json();
}

export async function updatePurchase(id, purchase) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(purchase),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de la modification de l’achat');
  }
  return response.json();
}

export async function deletePurchase(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression de l’achat');
  return response.json();
} 