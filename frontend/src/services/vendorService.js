import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/vendeurs';

export async function getVendors() {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la récupération des vendeurs');
  return response.json();
}

export async function addVendor(vendor) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken(),
    },
    body: JSON.stringify(vendor),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de l’ajout du vendeur');
  }
  return response.json();
}

export async function updateVendor(id, vendor) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken(),
    },
    body: JSON.stringify(vendor),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de la modification du vendeur');
  }
  return response.json();
}

export async function deleteVendor(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression du vendeur');
  return response.json();
} 