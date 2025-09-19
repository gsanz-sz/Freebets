import { useState, useEffect } from "react";
import "./App.css";
import BetList from "./BetList";
import Dashboard from "./Dashboard";
import Bankrolls from "./Bankrolls";
import * as api from "./apiService"; // Nosso novo serviço de API!

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState({
    totalBankroll: 0,
    profitByAccount: {},
    bankrollByPlatform: {},
  });
  const [detailedBancas, setDetailedBancas] = useState({});
  const [detailedBancasByPerson, setDetailedBancasByPerson] = useState({});

  // Função central para buscar e atualizar todos os dados da aplicação
  const fetchAllData = async () => {
    console.log("--- [App.js] Iniciando atualização de todos os dados ---");
    try {
      // Promise.all executa todas as chamadas em paralelo, é mais rápido!
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
    } catch (error) {
      console.error("!!! [App.js] Falha ao buscar dados da API:", error);
    }
  };

  // Roda apenas uma vez quando o componente é montado
  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSubmit = async (formData) => {
    console.log("--- [App.js] Tentando submeter nova aposta ---");
    try {
      await api.createBet(formData);
      console.log(
        "+++ [App.js] Aposta criada com sucesso! Atualizando dados..."
      );
      fetchAllData();
      return true;
    } catch (error) {
      console.error("!!! [App.js] Falha ao criar aposta:", error);
      return false;
    }
  };

  const handleFinishBet = async (id, winningAccount, profit) => {
    console.log(`--- [App.js] Tentando finalizar aposta ID: ${id} ---`);
    try {
      await api.finishBet(id, {
        contaVencedora: winningAccount,
        lucro: profit,
      });
      console.log(
        `+++ [App.js] Aposta ${id} finalizada com sucesso! Atualizando dados...`
      );
      fetchAllData();
    } catch (error) {
      console.error(`!!! [App.js] Falha ao finalizar aposta ${id}:`, error);
    }
  };

  const handleTransactionSubmit = async (formData) => {
    console.log("--- [App.js] Tentando submeter nova transação ---");
    try {
      await api.createTransaction(formData);
      console.log(
        "+++ [App.js] Transação criada com sucesso! Atualizando dados..."
      );
      // Apenas transações não precisam recarregar a lista de apostas, só as estatísticas
      // Para simplificar e garantir consistência, vamos recarregar tudo por enquanto.
      fetchAllData();
    } catch (error) {
      console.error("!!! [App.js] Falha ao criar transação:", error);
    }
  };

  const handleDeleteBet = async (id) => {
    // Mantendo o seu window.confirm original!
    if (window.confirm("Tem certeza que deseja excluir esta aposta?")) {
      console.log(`--- [App.js] Tentando deletar aposta ID: ${id} ---`);
      try {
        await api.deleteBet(id);
        console.log(
          `+++ [App.js] Aposta ${id} deletada com sucesso! Atualizando dados...`
        );
        fetchAllData();
      } catch (error) {
        console.error(`!!! [App.js] Falha ao deletar aposta ${id}:`, error);
      }
    }
  };

  const handleUpdateBetEntry = async (betId, entryToUpdate, newValue) => {
    console.log(`--- [App.js] Tentando ajustar aposta ID: ${betId} ---`);
    try {
      const updatedEntry = {
        responsavel: entryToUpdate.responsavel,
        conta: entryToUpdate.conta,
        valor: newValue,
      };
      await api.adjustBet(betId, { updatedEntry });
      console.log(
        `+++ [App.js] Aposta ${betId} ajustada com sucesso! Atualizando dados...`
      );
      fetchAllData();
      return true;
    } catch (error) {
      console.error(`!!! [App.js] Falha ao ajustar aposta ${betId}:`, error);
      return false;
    }
  };

  // Seu renderPage original, preservado 100%
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard stats={stats} onSubmit={handleSubmit} />;
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
        return <Dashboard stats={stats} onSubmit={handleSubmit} />;
    }
  };

  // Seu JSX original, preservado 100%
  return (
    <div className="container">
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
