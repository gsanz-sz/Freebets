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

const Dashboard = ({ stats, onSubmit, bets }) => {
  const [history, setHistory] = useState([]);
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

  // Calcula estatísticas derivadas para os cards
  const totalProfit = Object.values(stats.profitByAccount || {}).reduce(
    (sum, profit) => sum + profit,
    0
  );
  const totalBets = bets ? bets.length : 0;
  const finishedBets = bets ? bets.filter((b) => b.finished).length : 0;

  const chartData = {
    labels: history.map((h) => h.date),
    datasets: [
      {
        label: "Evolução da Banca",
        data: history.map((h) => h.bankroll),
        fill: true,
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        borderColor: "rgba(52, 152, 219, 1)",
        tension: 0.1,
      },
    ],
  };

  const handleFormSubmit = async (formData) => {
    await onSubmit(formData); // Chama a função do App.js
    setIsModalOpen(false); // Fecha o modal após o envio
  };

  return (
    <div className="dashboard-container">
      {isModalOpen && (
        <BetForm
          onSubmit={handleFormSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <div className="dashboard-header">
        <h2>Visão Geral</h2>
        <button onClick={() => setIsModalOpen(true)} className="add-bet-btn">
          Adicionar Nova Aposta
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Banca Total</h3>
          <p className="stat-value-positive">
            R$ {parseFloat(stats.totalBankroll).toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Lucro Total</h3>
          <p
            className={
              totalProfit >= 0 ? "stat-value-positive" : "stat-value-negative"
            }
          >
            R$ {totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total de Apostas</h3>
          <p className="stat-value">{totalBets}</p>
        </div>
        <div className="stat-card">
          <h3>Apostas Finalizadas</h3>
          <p className="stat-value">{finishedBets}</p>
        </div>
      </div>

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
