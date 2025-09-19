import React, { useState, useEffect } from "react";
import "./App.css";

import BetList from "./BetList";
import Dashboard from "./Dashboard";
import Bankrolls from "./Bankrolls";
import * as api from "./apiService";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState({
    totalBankroll: 0,
    profitByAccount: {},
    bankrollByPlatform: {},
    profitByResponsavel: {},
  });
  const [detailedBancas, setDetailedBancas] = useState({});
  const [detailedBancasByPerson, setDetailedBancasByPerson] = useState({});

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        betsData,
        statsData,
        detailedBancasData,
        detailedBancasByPersonData,
      ] = await Promise.all([
        api.getBets(),
        api.getStats(),
        api.getDetailedBancas(),
        api.getDetailedBancasByPerson(),
      ]);

      setBets(betsData);
      setStats(statsData);
      setDetailedBancas(detailedBancasData);
      setDetailedBancasByPerson(detailedBancasByPersonData);
    } catch (err) {
      setError(
        "Não foi possível carregar os dados. Verifique o servidor e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAction = async (action) => {
    setLoading(true);
    setError(null);
    try {
      await action();
      await fetchAllData();
    } catch (err) {
      setError(`${err.message}. Por favor, tente novamente.`);
    }
  };

  const handleBetSubmit = (newBet) => {
    handleAction(() => api.createBet(newBet));
  };

  const handleTransactionSubmit = (newTransaction) => {
    handleAction(() => api.createTransaction(newTransaction));
  };

  const handleDeleteBet = (betId) => {
    if (window.confirm("Tem certeza que deseja excluir esta aposta?")) {
      handleAction(() => api.deleteBet(betId));
    }
  };

  const handleFinishBet = (betId, contaVencedora, lucro) => {
    handleAction(() => api.finishBet(betId, { contaVencedora, lucro }));
  };

  const handleUpdateBetEntry = (betId, entryToUpdate, newValue) => {
    const updatedEntry = {
      responsavel: entryToUpdate.responsavel,
      conta: entryToUpdate.conta,
      valor: newValue,
    };
    handleAction(() => api.adjustBet(betId, { updatedEntry }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard stats={stats} onSubmit={handleBetSubmit} bets={bets} />
        );
      case "apostas":
        return (
          <BetList
            bets={bets}
            onFinishBet={handleFinishBet}
            onDeleteBet={handleDeleteBet}
            onUpdateBetEntry={handleUpdateBetEntry}
          />
        );
      case "bancas":
        return (
          <Bankrolls
            stats={stats}
            detailedBancas={detailedBancas}
            detailedBancasByPerson={detailedBancasByPerson}
            onSubmitTransaction={handleTransactionSubmit}
          />
        );
      default:
        return (
          <Dashboard stats={stats} onSubmit={handleBetSubmit} bets={bets} />
        );
    }
  };

  return (
    <div className="container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && (
        <div className="error-notification">
          {error}
          <button onClick={() => setError(null)} className="close-error-btn">
            &times;
          </button>
        </div>
      )}

      <div className="sidebar">
        {/* Título "Freebets" removido daqui */}
        <button onClick={() => setCurrentPage("dashboard")}>
          Dashboard (Gráfico)
        </button>
        <button onClick={() => setCurrentPage("apostas")}>
          Apostas Pendentes
        </button>
        <button onClick={() => setCurrentPage("bancas")}>Bancas</button>
      </div>

      <div className="content">
        {/* Cabeçalho com o título da página foi removido */}
        <main>{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
