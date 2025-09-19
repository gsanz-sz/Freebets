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
import * as api from "./apiService"; // Importando nosso serviço

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ stats }) => {
  const [history, setHistory] = useState([]);

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
      <h2>Dashboard</h2>
      <p>Banca Total: ${stats.totalBankroll}</p>
      {/* O resto do seu componente JSX continua o mesmo */}
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
