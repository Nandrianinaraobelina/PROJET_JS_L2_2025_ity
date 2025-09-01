import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/vendeurs';

export async function getVendors() {
  console.log('🔍 getVendors() appelé - URL:', API_URL);
  try {
    const response = await fetch(API_URL);
    console.log('📡 Réponse API vendeurs:', response.status, response.statusText);
    if (!response.ok) throw new Error('Erreur lors de la récupération des vendeurs');
    const data = await response.json();
    console.log('✅ Données vendeurs reçues:', data.length, 'éléments');
    return data;
  } catch (error) {
    console.error('❌ Erreur dans getVendors():', error);
    throw error;
  }
}

export async function addVendor(vendor) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression du vendeur');
  return response.json();
} 