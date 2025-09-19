import React, { useState, useEffect } from "react";
import "./App.css";
import BetForm from "./BetForm";
import BetList from "./BetList";
import Dashboard from "./Dashboard";
import TransactionForm from "./TransactionForm";
import Bankrolls from "./Bankrolls";
import * as api from "./apiService"; // Nosso novo serviço de API!

function App() {
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState({
    totalBankroll: 0,
    profitByAccount: {},
    bankrollByPlatform: {},
  });
  const [detailedBancas, setDetailedBancas] = useState({});
  const [detailedBancasByPerson, setDetailedBancasByPerson] = useState({});
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Função central para buscar todos os dados da API
  const fetchAllData = async () => {
    console.log("--- [App.js] Iniciando atualização de todos os dados ---");
    try {
      const betsData = await api.getBets();
      const statsData = await api.getStats();
      const detailedBancasData = await api.getDetailedBancas();
      const detailedBancasByPersonData = await api.getDetailedBancasByPerson();

      setBets(betsData);
      setStats(statsData);
      setDetailedBancas(detailedBancasData);
      setDetailedBancasByPerson(detailedBancasByPersonData);
      console.log(
        "+++ [App.js] Todos os dados foram atualizados com sucesso! +++"
      );
    } catch (error) {
      console.error("!!! [App.js] Falha ao buscar dados da API:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleBetSubmit = async (newBet) => {
    console.log("--- [App.js] Tentando submeter nova aposta ---");
    try {
      await api.createBet(newBet);
      console.log(
        "+++ [App.js] Aposta criada com sucesso! Atualizando dados..."
      );
      fetchAllData();
    } catch (error) {
      console.error("!!! [App.js] Falha ao criar aposta:", error);
    }
  };

  const handleTransactionSubmit = async (newTransaction) => {
    console.log("--- [App.js] Tentando submeter nova transação ---");
    try {
      await api.createTransaction(newTransaction);
      console.log(
        "+++ [App.js] Transação criada com sucesso! Atualizando dados..."
      );
      fetchAllData();
    } catch (error) {
      console.error("!!! [App.js] Falha ao criar transação:", error);
    }
  };

  const handleDeleteBet = async (betId) => {
    console.log(`--- [App.js] Tentando deletar aposta ID: ${betId} ---`);
    try {
      await api.deleteBet(betId);
      console.log(
        `+++ [App.js] Aposta ${betId} deletada com sucesso! Atualizando dados...`
      );
      fetchAllData();
    } catch (error) {
      console.error(`!!! [App.js] Falha ao deletar aposta ${betId}:`, error);
    }
  };

  const handleFinishBet = async (betId, contaVencedora, lucro) => {
    console.log(`--- [App.js] Tentando finalizar aposta ID: ${betId} ---`);
    try {
      await api.finishBet(betId, { contaVencedora, lucro });
      console.log(
        `+++ [App.js] Aposta ${betId} finalizada com sucesso! Atualizando dados...`
      );
      fetchAllData();
    } catch (error) {
      console.error(`!!! [App.js] Falha ao finalizar aposta ${betId}:`, error);
    }
  };

  const handleUpdateBetEntry = async (betId, updatedEntry) => {
    console.log(`--- [App.js] Tentando ajustar aposta ID: ${betId} ---`);
    try {
      await api.adjustBet(betId, { updatedEntry });
      console.log(
        `+++ [App.js] Aposta ${betId} ajustada com sucesso! Atualizando dados...`
      );
      fetchAllData();
    } catch (error) {
      console.error(`!!! [App.js] Falha ao ajustar aposta ${betId}:`, error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard stats={stats} />;
      case "bets":
        return (
          <>
            <BetForm onSubmit={handleBetSubmit} />
            <BetList
              bets={bets}
              onDelete={handleDeleteBet}
              onFinish={handleFinishBet}
              onUpdateEntry={handleUpdateBetEntry}
            />
          </>
        );
      case "transactions":
        return <TransactionForm onSubmit={handleTransactionSubmit} />;
      case "bankrolls":
        return (
          <Bankrolls
            detailedBancas={detailedBancas}
            detailedBancasByPerson={detailedBancasByPerson}
          />
        );
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className="App">
      <nav>
        <button onClick={() => setCurrentPage("dashboard")}>Dashboard</button>
        <button onClick={() => setCurrentPage("bets")}>Apostas</button>
        <button onClick={() => setCurrentPage("transactions")}>
          Transações
        </button>
        <button onClick={() => setCurrentPage("bankrolls")}>Bancas</button>
      </nav>
      <header className="App-header">
        <h1>Freebets</h1>
      </header>
      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
