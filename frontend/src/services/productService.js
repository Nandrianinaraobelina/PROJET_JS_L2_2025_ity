import { getToken } from "./authService";

const API_URL = "http://localhost:5000/api/produits";

export async function getProducts() {
  const token = getToken();
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok)
    throw new Error("Erreur lors de la récupération des produits");
  return response.json();
}

export async function addProduct(formData) {
  const token = getToken();
  const response = await fetch("http://localhost:5000/api/produits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.errors ? error.errors[0].msg : "Erreur lors de l’ajout du produit"
    );
  }
  return response.json();
}

export async function updateProduct(id, product) {
  const token = getToken();
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.errors
        ? error.errors[0].msg
        : "Erreur lors de la modification du produit"
    );
  }
  return response.json();
}

export async function deleteProduct(id) {
  const token = getToken();
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression du produit");
  return response.json();
}
