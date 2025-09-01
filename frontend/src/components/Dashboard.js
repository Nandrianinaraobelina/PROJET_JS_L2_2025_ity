import React, { useEffect, useState } from 'react';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import { getVendors } from '../services/vendorService';
import { getSales } from '../services/saleService';
import { getPurchases } from '../services/purchaseService';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function Dashboard() {
  // Ajout du design blur sur le conteneur principal

  const [stats, setStats] = useState({ clients: 0, films: 0, vendeurs: 0 });
  const [genres, setGenres] = useState({});
  const [evoVentes, setEvoVentes] = useState({ labels: [], data: [] });
  const [topVendeurs, setTopVendeurs] = useState([]);
  const [repartitionFilms, setRepartitionFilms] = useState({ labels: [], data: [] });
  const [totalFilmsVendus, setTotalFilmsVendus] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      const clients = await getClients();
      const films = await getProducts();
      const vendeurs = await getVendors();
      const ventes = await getSales();
      const achats = await getPurchases();
      setStats({ clients: clients.length, films: films.length, vendeurs: vendeurs.length });
      // Total films vendus (somme des Quantite)
      setTotalFilmsVendus(achats.reduce((sum, achat) => sum + (achat.Quantite || 0), 0));
      // Stat films par genre
      const genreCount = {};
      films.forEach(f => {
        if (f.Genre) genreCount[f.Genre] = (genreCount[f.Genre] || 0) + 1;
      });
      setGenres(genreCount);
      // Evolution des ventes par mois
      const ventesParMois = {};
      ventes.forEach(v => {
        const mois = v.DateVente ? v.DateVente.substring(0,7) : 'Inconnu';
        ventesParMois[mois] = (ventesParMois[mois] || 0) + 1;
      });
      setEvoVentes({
        labels: Object.keys(ventesParMois),
        data: Object.values(ventesParMois)
      });
      // Top vendeurs
      const vendeurCount = {};
      ventes.forEach(v => {
        vendeurCount[v.ID_VENDEUR] = (vendeurCount[v.ID_VENDEUR] || 0) + 1;
      });
      const top = Object.entries(vendeurCount)
        .map(([id, count]) => ({
          nom: (vendeurs.find(v => v.ID_VENDEUR === Number(id)) || {}).NomVendeur || 'Inconnu',
          count
        }))
        .sort((a,b) => b.count - a.count)
        .slice(0,5);
      setTopVendeurs(top);
      // Répartition des ventes par film
      const filmCount = {};
      ventes.forEach(v => {
        filmCount[v.ID_PROD] = (filmCount[v.ID_PROD] || 0) + 1;
      });
      setRepartitionFilms({
        labels: Object.keys(filmCount).map(id => (films.find(f => f.ID_PROD === Number(id)) || {}).Titre || 'Inconnu'),
        data: Object.values(filmCount)
      });
    }
    fetchStats();
  }, []);

  const genreLabels = Object.keys(genres);
  const genreData = Object.values(genres);

  return (
    <div className="section-card fade-in">
      <h2 className="section-title"><i className="bi bi-speedometer2 me-2"></i>Tableau de bord</h2>
      <div className="row text-center mb-4 justify-content-center">
        <div className="col-6 col-md-3 mb-2">
          <div className="card shadow-sm border-0">
            <div className="card-body py-3 px-2">
              <i className="bi bi-people fs-3 text-primary"></i>
              <h6 className="mt-2 mb-1">Clients</h6>
              <span className="badge bg-primary fs-6">{stats.clients}</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-2">
          <div className="card shadow-sm border-0">
            <div className="card-body py-3 px-2">
              <i className="bi bi-film fs-3 text-info"></i>
              <h6 className="mt-2 mb-1">Films</h6>
              <span className="badge bg-info fs-6">{stats.films}</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-2">
          <div className="card shadow-sm border-0">
            <div className="card-body py-3 px-2">
              <i className="bi bi-person-badge fs-3 text-success"></i>
              <h6 className="mt-2 mb-1">Vendeurs</h6>
              <span className="badge bg-success fs-6">{stats.vendeurs}</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-2">
          <div className="card shadow-sm border-0">
            <div className="card-body py-3 px-2">
              <i className="bi bi-ticket-perforated fs-3 text-warning"></i>
              <h6 className="mt-2 mb-1">Total films vendus</h6>
              <span className="badge bg-warning text-dark fs-6">{totalFilmsVendus}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 justify-content-center">
        {genreLabels.length > 0 && (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card p-2 mb-2">
              <h6 className="mb-2">Répartition des films par genre</h6>
              <Bar
                data={{
                  labels: genreLabels,
                  datasets: [
                    {
                      label: 'Nombre de films',
                      data: genreData,
                      backgroundColor: '#0d6efd',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                }}
                height={140}
              />
            </div>
          </div>
        )}
        {evoVentes.labels.length > 0 && (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card p-2 mb-2">
              <h6 className="mb-2">Évolution des ventes par mois</h6>
              <Line
                data={{
                  labels: evoVentes.labels,
                  datasets: [
                    {
                      label: 'Ventes',
                      data: evoVentes.data,
                      borderColor: '#198754',
                      backgroundColor: 'rgba(25,135,84,0.2)',
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                }}
                height={140}
              />
            </div>
          </div>
        )}
        {topVendeurs.length > 0 && (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card p-2 mb-2">
              <h6 className="mb-2">Top vendeurs</h6>
              <Bar
                data={{
                  labels: topVendeurs.map(v => v.nom),
                  datasets: [
                    {
                      label: 'Ventes',
                      data: topVendeurs.map(v => v.count),
                      backgroundColor: '#ffc107',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                }}
                height={140}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 