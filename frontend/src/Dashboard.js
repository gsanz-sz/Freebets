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

// Função para gerar cores consistentes para os responsáveis
const getColorForResponsavel = (responsavel, index) => {
  const colors = [
    "rgba(231, 76, 60, 1)", // Vermelho
    "rgba(52, 152, 219, 1)", // Azul
    "rgba(46, 204, 113, 1)", // Verde
    "rgba(241, 196, 15, 1)", // Amarelo
    "rgba(155, 89, 182, 1)", // Roxo
  ];
  return colors[index % colors.length];
};

const Dashboard = ({ stats, onSubmit, bets }) => {
  const [history, setHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await api.getHistory();
        setHistory(historyData);
      } catch (error) {
        console.error("!!! [Dashboard.js] Falha ao buscar histórico:", error);
      }
    };
    fetchHistory();
  }, []);

  // Efeito para construir os dados do gráfico quando o histórico muda
  useEffect(() => {
    if (history.length > 0) {
      const labels = history.map((h) => h.date);
      const datasets = [];

      // Adiciona a linha da Banca Total
      datasets.push({
        label: "Banca Total",
        data: history.map((h) => parseFloat(h.totalBankroll).toFixed(2)),
        borderColor: "rgba(44, 62, 80, 1)", // Cor mais escura para destaque
        backgroundColor: "rgba(44, 62, 80, 0.1)",
        fill: true,
        tension: 0.1,
        yAxisID: "y-bankroll", // Associa a um eixo Y
      });

      // Adiciona uma linha para cada responsável
      const responsaveis = Object.keys(history[0] || {}).filter(
        (key) => key !== "date" && key !== "totalBankroll"
      );

      responsaveis.forEach((responsavel, index) => {
        const color = getColorForResponsavel(responsavel, index);
        datasets.push({
          label: `Lucro ${responsavel}`,
          data: history.map((h) => parseFloat(h[responsavel]).toFixed(2)),
          borderColor: color,
          backgroundColor: color.replace("1)", "0.1)"),
          fill: false,
          tension: 0.1,
          yAxisID: "y-profit", // Associa a outro eixo Y
        });
      });

      setChartData({ labels, datasets });
    }
  }, [history]);

  const totalProfit = Object.values(stats.profitByAccount || {}).reduce(
    (sum, profit) => sum + profit,
    0
  );
  const totalBets = bets ? bets.length : 0;
  const finishedBets = bets ? bets.filter((b) => b.finished).length : 0;

  const handleFormSubmit = async (formData) => {
    await onSubmit(formData);
    setIsModalOpen(false);
  };

  // Opções do Gráfico para adicionar um segundo eixo Y
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
        display: false, // Oculta o eixo principal para evitar confusão visual
        position: "left",
      },
      "y-bankroll": {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Banca Total (R$)",
        },
      },
      "y-profit": {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Lucro Individual (R$)",
        },
        grid: {
          drawOnChartArea: false, // Não desenha a grelha para o eixo de lucro
        },
      },
    },
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
        {chartData.datasets.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>A carregar o histórico do gráfico...</p>
        )}
      </div>

      <div className="profit-by-person-card">
        <h3>Lucro por Responsável</h3>
        <ul>
          {stats.profitByResponsavel &&
          Object.keys(stats.profitByResponsavel).length > 0 ? (
            Object.entries(stats.profitByResponsavel).map(
              ([responsavel, lucro]) => (
                <li key={responsavel}>
                  <span>{responsavel}</span>
                  <span
                    className={
                      lucro >= 0 ? "stat-value-positive" : "stat-value-negative"
                    }
                  >
                    R$ {lucro.toFixed(2)}
                  </span>
                </li>
              )
            )
          ) : (
            <p className="no-data-message">Nenhum lucro a ser exibido.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
