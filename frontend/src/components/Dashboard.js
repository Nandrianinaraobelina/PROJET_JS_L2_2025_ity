import React, { useEffect, useState } from 'react';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import { getVendors } from '../services/vendorService';
import { getSales } from '../services/saleService';
import { getPurchases } from '../services/purchaseService';
import { Bar, Line, Pie } from 'react-chartjs-2';
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
    <div className="section-card-modern fade-in">
      <h2 className="section-title-modern">
        <i className="bi bi-speedometer2" style={{marginRight: '0.5rem'}}></i>
        Tableau de bord
      </h2>
      <div className="row text-center mb-4 justify-content-center">
        <div className="col-6 col-md-3 mb-4">
          <div className="data-card-modern">
            <div className="data-header-modern">
              <div>
                <div className="data-title-modern">Clients</div>
                <div className="data-subtitle-modern">Total enregistré</div>
              </div>
              <div className="data-icon-modern">
                <i className="bi bi-people"></i>
              </div>
            </div>
            <div className="data-value-modern">{stats.clients}</div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-4">
          <div className="data-card-modern">
            <div className="data-header-modern">
              <div>
                <div className="data-title-modern">Films</div>
                <div className="data-subtitle-modern">En stock</div>
              </div>
              <div className="data-icon-modern">
                <i className="bi bi-film"></i>
              </div>
            </div>
            <div className="data-value-modern">{stats.films}</div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-4">
          <div className="data-card-modern">
            <div className="data-header-modern">
              <div>
                <div className="data-title-modern">Vendeurs</div>
                <div className="data-subtitle-modern">Actifs</div>
              </div>
              <div className="data-icon-modern">
                <i className="bi bi-person-badge"></i>
              </div>
            </div>
            <div className="data-value-modern">{stats.vendeurs}</div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-4">
          <div className="data-card-modern">
            <div className="data-header-modern">
              <div>
                <div className="data-title-modern">Films vendus</div>
                <div className="data-subtitle-modern">Ce mois</div>
              </div>
              <div className="data-icon-modern">
                <i className="bi bi-ticket-perforated"></i>
              </div>
            </div>
            <div className="data-value-modern">{totalFilmsVendus}</div>
          </div>
        </div>
      </div>
      <div className="row g-3 justify-content-center">
        {genreLabels.length > 0 && (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="section-card-modern">
              <h6 className="section-title-modern" style={{fontSize: '1.2rem', marginBottom: '1.5rem'}}>Répartition des films par genre</h6>
              <Bar
                data={{
                  labels: genreLabels,
                  datasets: [
                    {
                      label: 'Nombre de films',
                      data: genreData,
                      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderColor: '#667eea',
                      borderWidth: 1,
                      borderRadius: 6,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0,0,0,0.05)',
                      },
                    },
                    x: {
                      grid: {
                        color: 'rgba(0,0,0,0.05)',
                      },
                    },
                  },
                }}
                height={140}
              />
            </div>
          </div>
        )}
        {evoVentes.labels.length > 0 && (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="section-card-modern">
              <h6 className="section-title-modern" style={{fontSize: '1.2rem', marginBottom: '1.5rem'}}>Évolution des ventes par mois</h6>
              <Line
                data={{
                  labels: evoVentes.labels,
                  datasets: [
                    {
                      label: 'Ventes',
                      data: evoVentes.data,
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102,126,234,0.1)',
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: '#667eea',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0,0,0,0.05)',
                      },
                    },
                    x: {
                      grid: {
                        color: 'rgba(0,0,0,0.05)',
                      },
                    },
                  },
                }}
                height={140}
              />
            </div>
          </div>
        )}
        {topVendeurs.length > 0 && (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="section-card-modern">
              <h6 className="section-title-modern" style={{fontSize: '1.2rem', marginBottom: '1.5rem'}}>Top vendeurs</h6>
              <Bar
                data={{
                  labels: topVendeurs.map(v => v.nom),
                  datasets: [
                    {
                      label: 'Ventes',
                      data: topVendeurs.map(v => v.count),
                      backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderColor: '#f093fb',
                      borderWidth: 1,
                      borderRadius: 6,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0,0,0,0.05)',
                      },
                    },
                    x: {
                      grid: {
                        color: 'rgba(0,0,0,0.05)',
                      },
                    },
                  },
                }}
                height={140}
              />
            </div>
          </div>
        )}
        {repartitionFilms.labels.length > 0 && (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="section-card-modern">
              <h6 className="section-title-modern" style={{fontSize: '1.2rem', marginBottom: '1.5rem'}}>Répartition des ventes par film</h6>
              <Pie
                data={{
                  labels: repartitionFilms.labels,
                  datasets: [
                    {
                      label: 'Ventes',
                      data: repartitionFilms.data,
                      backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(240, 147, 251, 0.8)',
                        'rgba(79, 172, 254, 0.8)',
                        'rgba(67, 233, 123, 0.8)',
                        'rgba(245, 87, 108, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                      ],
                      borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(240, 147, 251, 1)',
                        'rgba(79, 172, 254, 1)',
                        'rgba(67, 233, 123, 1)',
                        'rgba(245, 87, 108, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(139, 92, 246, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                      },
                    },
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