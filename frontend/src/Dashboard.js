import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import BetForm from "./BetForm";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ stats, onSubmit }) {
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [showForm, setShowForm] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/stats/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Erro ao buscar o histórico:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      const labels = history.map((item) => item.date);
      const data = history.map((item) => parseFloat(item.bankroll));

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Evolução da Banca",
            data: data,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          },
        ],
      });
    }
  }, [history]);

  if (!stats) {
    return <div>Carregando estatísticas...</div>;
  }

  // Função para fechar o formulário (passada para o BetForm)
  const closeForm = () => {
    setShowForm(false);
  };

  return (
    <div>
      <div className="stats-container">
        <h2>Banca Total: R$ {stats.totalBankroll}</h2>
        <h3>Lucro por Conta:</h3>
        <ul>
          {Object.entries(stats.profitByAccount).map(([account, profit]) => (
            <li key={account}>
              {account}: R$ {profit.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <hr />

      {/* O gráfico agora aparece primeiro */}
      {history.length > 0 && (
        <div style={{ width: "100%", maxWidth: "800px", margin: "auto" }}>
          <h2>Evolução da Banca</h2>
          <Line data={chartData} />
        </div>
      )}

      {/* E o botão para abrir o formulário fica abaixo do gráfico */}
      <button onClick={() => setShowForm(true)} style={{ marginTop: "20px" }}>
        Adicionar nova aposta
      </button>

      {/* O formulário aparece como um pop-up condicionalmente */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <BetForm onSubmit={onSubmit} onClose={closeForm} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
