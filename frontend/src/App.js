import React, { useState, useEffect, useCallback } from "react"; // 1. Adicionado 'useCallback'
import "./App.css";

//import BetList from "./BetList";
import Dashboard from "./Dashboard";
import Bankrolls from "./Bankrolls";
import Performance from "./Performance";
import * as api from "./apiService";
import BetsCalendar from "./BetsCalendar";

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

  // 2. Função "memorizada" com useCallback para estabilidade
  const fetchAllData = useCallback(async () => {
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
  }, []); // Array de dependências vazio

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]); // 3. Adicionada a dependência aqui

  const handleAction = async (action) => {
    // setLoading(true); // Opcional: remover o piscar da tela em cada ação
    setError(null);
    try {
      await action();
      await fetchAllData(); // Recarrega os dados após a ação
    } catch (err) {
      setError(`${err.message}. Por favor, tente novamente.`);
    } finally {
      // setLoading(false);
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

  const handleUpdateBetEntry = (betId, entryToUpdate, newValues) => {
    const updatedEntry = {
      responsavel: entryToUpdate.responsavel,
      conta: entryToUpdate.conta,
      originalOdd: entryToUpdate.odd,
      valor: newValues.valor,
      odd: newValues.odd,
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
          <BetsCalendar
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
      case "performance":
        return <Performance />;
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
        <button
          onClick={() => setCurrentPage("dashboard")}
          className={currentPage === "dashboard" ? "active" : ""}
        >
          Dashboard (Gráfico)
        </button>
        <button
          onClick={() => setCurrentPage("apostas")}
          className={currentPage === "apostas" ? "active" : ""}
        >
          Apostas Pendentes
        </button>
        <button
          onClick={() => setCurrentPage("bancas")}
          className={currentPage === "bancas" ? "active" : ""}
        >
          Bancas
        </button>
        <button
          onClick={() => setCurrentPage("performance")}
          className={currentPage === "performance" ? "active" : ""}
        >
          Desempenho
        </button>
      </div>

      <div className="content">
        <main>{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
