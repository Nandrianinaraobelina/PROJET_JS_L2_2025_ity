-- Données de test pour vérifier le fonctionnement
-- À exécuter après avoir créé les tables avec database.sql

-- Insérer des clients de test
INSERT INTO CLIENT (NomCli, PrenomCli, EmailCli, AdresseCli, Ville, Pays, TelephoneCli) VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '123 Rue de la Paix', 'Paris', 'France', '+33123456789'),
('Martin', 'Marie', 'marie.martin@email.com', '456 Avenue des Champs', 'Lyon', 'France', '+33234567890'),
('Dubois', 'Pierre', 'pierre.dubois@email.com', '789 Boulevard Saint-Michel', 'Marseille', 'France', '+33345678901'),
('Garcia', 'Sophie', 'sophie.garcia@email.com', '321 Rue Victor Hugo', 'Toulouse', 'France', '+33456789012'),
('Lefebvre', 'Antoine', 'antoine.lefebvre@email.com', '654 Avenue de la République', 'Nice', 'France', '+33567890123');

-- Insérer des vendeurs de test
INSERT INTO VENDEUR (NomVendeur, PrenomVendeur, CIN, Email, Telephone, Adresse) VALUES
('Smith', 'John', 'CIN001', 'john.smith@vendeur.com', '+33678901234', '10 Rue du Commerce, Paris'),
('Johnson', 'Emma', 'CIN002', 'emma.johnson@vendeur.com', '+33789012345', '25 Avenue des Ventes, Lyon'),
('Williams', 'David', 'CIN003', 'david.williams@vendeur.com', '+33890123456', '40 Boulevard des Affaires, Marseille'),
('Brown', 'Sarah', 'CIN004', 'sarah.brown@vendeur.com', '+33901234567', '55 Rue des Marchands, Toulouse'),
('Davis', 'Michael', 'CIN005', 'michael.davis@vendeur.com', '+33123456789', '70 Avenue des Commerçants, Nice');

-- Insérer des produits (films) de test
INSERT INTO PRODUIT (Titre, Realisateur, DateSortie, Prix_unitaire, Langue, Genre) VALUES
('Inception', 'Christopher Nolan', '2010-07-16', 500, 'Anglais', 'Science-Fiction'),
('The Dark Knight', 'Christopher Nolan', '2008-07-18', 500, 'Anglais', 'Action'),
('Pulp Fiction', 'Quentin Tarantino', '1994-10-14', 500, 'Anglais', 'Crime'),
('Forrest Gump', 'Robert Zemeckis', '1994-07-06', 500, 'Anglais', 'Drame'),
('The Matrix', 'Wachowski Sisters', '1999-03-31', 500, 'Anglais', 'Science-Fiction'),
('Interstellar', 'Christopher Nolan', '2014-11-07', 500, 'Anglais', 'Science-Fiction'),
('The Shawshank Redemption', 'Frank Darabont', '1994-09-23', 500, 'Anglais', 'Drame'),
('Fight Club', 'David Fincher', '1999-10-15', 500, 'Anglais', 'Drame'),
('The Godfather', 'Francis Ford Coppola', '1972-03-24', 500, 'Anglais', 'Crime'),
('Schindler\'s List', 'Steven Spielberg', '1993-12-15', 500, 'Anglais', 'Historique');

-- Mettre à jour tous les films existants à 500 Ariary
UPDATE PRODUIT SET Prix_unitaire = 500;

SELECT CONCAT('✅ Prix de ', ROW_COUNT(), ' films mis à jour à 500 Ariary!') as Message;

-- Vérifier les prix mis à jour
SELECT ID_PROD, Titre, Prix_unitaire FROM PRODUIT ORDER BY Titre;
