import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/clients';

export async function getClients() {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la récupération des clients');
  return response.json();
}

export async function addClient(client) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken(),
    },
    body: JSON.stringify(client),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de l’ajout du client');
  }
  return response.json();
}

export async function updateClient(id, client) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken(),
    },
    body: JSON.stringify(client),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors ? error.errors[0].msg : 'Erreur lors de la modification du client');
  }
  return response.json();
}

export async function deleteClient(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression du client');
  return response.json();
}

// Tu pourras ajouter ici updateClient et deleteClient plus tard 