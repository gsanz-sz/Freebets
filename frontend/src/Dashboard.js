import React, { useState, useEffect } from "react";
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
import * as api from "./apiService";
import BetForm from "./BetForm"; // Continuamos importando o BetForm

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ stats, onSubmit }) => {
  const [history, setHistory] = useState([]);
  // 1. Estado para controlar se o modal está aberto ou fechado
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      console.log("--- [Dashboard.js] Buscando histórico para o gráfico ---");
      try {
        const historyData = await api.getHistory();
        setHistory(historyData);
        console.log("+++ [Dashboard.js] Histórico carregado com sucesso! +++");
      } catch (error) {
        console.error("!!! [Dashboard.js] Falha ao buscar histórico:", error);
      }
    };
    fetchHistory();
  }, []);

  const handleFormSubmit = async (formData) => {
    const success = await onSubmit(formData);
    if (success) {
      setIsModalOpen(false); // Fecha o modal se o envio for bem-sucedido
    }
    return success;
  };

  const chartData = {
    labels: history.map((h) => h.date),
    datasets: [
      {
        label: "Bankroll Over Time",
        data: history.map((h) => h.bankroll),
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  return (
    <div>
      {/* 2. Botão para abrir o modal */}
      <button className="add-bet-button" onClick={() => setIsModalOpen(true)}>
        Adicionar Nova Aposta
      </button>

      {/* 3. Renderização condicional do Modal */}
      {isModalOpen && (
        <BetForm
          onSubmit={handleFormSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <hr style={{ margin: "40px 0", border: "1px solid #eee" }} />

      <h2>Estatísticas</h2>
      {stats ? (
        <p>Banca Total: ${stats.totalBankroll}</p>
      ) : (
        <p>Carregando estatísticas...</p>
      )}

      <div className="chart-container">
        {history.length > 0 ? (
          <Line data={chartData} />
        ) : (
          <p>Carregando histórico do gráfico...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
