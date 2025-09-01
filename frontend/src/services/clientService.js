import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api/clients';

export async function getClients() {
  console.log('🔍 getClients() appelé - URL:', API_URL);
  try {
    const response = await fetch(API_URL);
    console.log('📡 Réponse API clients:', response.status, response.statusText);
    if (!response.ok) throw new Error('Erreur lors de la récupération des clients');
    const data = await response.json();
    console.log('✅ Données clients reçues:', data.length, 'éléments');
    return data;
  } catch (error) {
    console.error('❌ Erreur dans getClients():', error);
    throw error;
  }
}

export async function addClient(client) {
  console.log('📝 addClient() appelé avec:', client);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });

    console.log('📡 Réponse addClient:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = 'Erreur lors de l\'ajout du client';
      try {
        const errorData = await response.json();
        console.log('❌ Détails erreur:', errorData);
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg || errorData.errors[0].message || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.log('❌ Impossible de parser l\'erreur:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Client ajouté:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur dans addClient():', error);
    throw error;
  }
}

export async function updateClient(id, client) {
  console.log('🔄 updateClient() appelé pour ID:', id, 'avec:', client);
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });

    console.log('📡 Réponse updateClient:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = 'Erreur lors de la modification du client';
      try {
        const errorData = await response.json();
        console.log('❌ Détails erreur:', errorData);
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg || errorData.errors[0].message || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.log('❌ Impossible de parser l\'erreur:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Client modifié:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur dans updateClient():', error);
    throw error;
  }
}

export async function deleteClient(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression du client');
  return response.json();
}

// Tu pourras ajouter ici updateClient et deleteClient plus tard 