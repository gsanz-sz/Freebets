import React, { useState, useEffect } from "react";
import "./App.css";

import BetList from "./BetList";
import Dashboard from "./Dashboard";
import Bankrolls from "./Bankrolls";
import * as api from "./apiService";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState({
    totalBankroll: 0,
    profitByAccount: {},
    bankrollByPlatform: {},
  });
  const [detailedBancas, setDetailedBancas] = useState({});
  const [detailedBancasByPerson, setDetailedBancasByPerson] = useState({});
  const [currentPage, setCurrentPage] = useState("dashboard");

  const fetchAllData = async () => {
    console.log("--- [App.js] Iniciando atualização de todos os dados ---");
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
      console.log(
        "+++ [App.js] Todos os dados foram atualizados com sucesso! +++"
      );
    } catch (err) {
      console.error("!!! [App.js] Falha ao buscar dados da API:", err);
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

  const handleAction = async (action, successMessage, errorMessage) => {
    console.log(`--- [App.js] Executando ação: ${successMessage} ---`);
    setLoading(true);
    setError(null);
    try {
      await action();
      console.log(`+++ [App.js] Ação executada com sucesso! +++`);
      await fetchAllData();
    } catch (err) {
      console.error(`!!! [App.js] Falha ao executar ação:`, err);
      setError(`${errorMessage}. Por favor, tente novamente.`);
      // Mantém o loading ativo se a busca falhar, para que o usuário veja o erro.
      // A busca de dados (fetchAllData) já lida com o estado de loading no final.
    }
  };

  const handleBetSubmit = (newBet) => {
    handleAction(
      () => api.createBet(newBet),
      "Aposta criada com sucesso!",
      "Falha ao criar aposta"
    );
  };

  const handleTransactionSubmit = (newTransaction) => {
    handleAction(
      () => api.createTransaction(newTransaction),
      "Transação criada com sucesso!",
      "Falha ao criar transação"
    );
  };

  const handleDeleteBet = (betId) => {
    if (window.confirm("Tem certeza que deseja excluir esta aposta?")) {
      handleAction(
        () => api.deleteBet(betId),
        `Aposta ${betId} deletada!`,
        `Falha ao deletar aposta ${betId}`
      );
    }
  };

  const handleFinishBet = (betId, contaVencedora, lucro) => {
    handleAction(
      () => api.finishBet(betId, { contaVencedora, lucro }),
      `Aposta ${betId} finalizada!`,
      `Falha ao finalizar aposta ${betId}`
    );
  };

  const handleUpdateBetEntry = (betId, updatedEntry) => {
    handleAction(
      () => api.adjustBet(betId, { updatedEntry }),
      `Aposta ${betId} ajustada!`,
      `Falha ao ajustar aposta ${betId}`
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard stats={stats} onSubmit={handleBetSubmit} bets={bets} />
        );
      case "calendar":
        return (
          <BetList
            bets={bets}
            onFinishBet={handleFinishBet}
            onDeleteBet={handleDeleteBet}
            onUpdateBetEntry={handleUpdateBetEntry}
          />
        );
      case "bankrolls":
        return (
          <Bankrolls
            stats={stats}
            onSubmitTransaction={handleTransactionSubmit}
            detailedBancas={detailedBancas}
            detailedBancasByPerson={detailedBancasByPerson}
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
        <button onClick={() => setCurrentPage("dashboard")}>
          Dashboard (Gráfico)
        </button>
        <button onClick={() => setCurrentPage("calendar")}>
          Apostas Pendentes
        </button>
        <button onClick={() => setCurrentPage("bankrolls")}>Bancas</button>
      </div>

      <div className="content">{renderPage()}</div>
    </div>
  );
}

export default App;
