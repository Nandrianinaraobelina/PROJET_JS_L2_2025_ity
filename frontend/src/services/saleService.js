import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/ventes';

export async function getSales() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Erreur lors de la récupération des ventes');
  return response.json();
}

export async function addSale(sale) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sale),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de l’ajout de la vente');
  }
  return response.json();
}

export async function updateSale(id, sale) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sale),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de la modification de la vente');
  }
  return response.json();
}

export async function deleteSale(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression de la vente');
  return response.json();
} 