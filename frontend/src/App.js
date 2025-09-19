import { useState, useEffect } from "react";
import "./App.css";

import BetList from "./BetList";
import Dashboard from "./Dashboard";
import Bankrolls from "./Bankrolls";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState(null);
  const [detailedBancas, setDetailedBancas] = useState({});
  const [detailedBancasByPerson, setDetailedBancasByPerson] = useState({});

  const fetchBets = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/bets");
      if (response.ok) {
        const data = await response.json();
        setBets(data);
      } else {
        console.error("Falha ao buscar apostas.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Falha ao buscar estatísticas.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  const fetchDetailedBancas = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/stats/detailed-bancas"
      );
      if (response.ok) {
        const data = await response.json();
        setDetailedBancas(data);
      } else {
        console.error("Falha ao buscar bancas detalhadas.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  const fetchDetailedBancasByPerson = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/stats/detailed-bancas-by-person"
      );
      if (response.ok) {
        const data = await response.json();
        setDetailedBancasByPerson(data);
      } else {
        console.error("Falha ao buscar bancas por pessoa.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  useEffect(() => {
    fetchBets();
    fetchStats();
    fetchDetailedBancas();
    fetchDetailedBancasByPerson();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchBets();
        fetchStats();
        fetchDetailedBancas();
        fetchDetailedBancasByPerson();
        return true;
      } else {
        console.error("Falha ao salvar a aposta.");
        return false;
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      return false;
    }
  };

  const handleFinishBet = async (id, winningAccount, profit) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/bets/finish/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contaVencedora: winningAccount,
            lucro: profit,
          }),
        }
      );

      if (response.ok) {
        fetchBets();
        fetchStats();
        fetchDetailedBancas();
        fetchDetailedBancasByPerson();
      } else {
        console.error("Falha ao atualizar aposta.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  const handleTransactionSubmit = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Transação salva com sucesso!");
        fetchStats();
        fetchDetailedBancas();
        fetchDetailedBancasByPerson();
      } else {
        console.error("Falha ao salvar a transação.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  };

  // A função que estava faltando
  const handleDeleteBet = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta aposta?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/bets/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchBets();
          fetchStats();
          fetchDetailedBancas();
          fetchDetailedBancasByPerson();
        } else {
          console.error("Falha ao excluir a aposta.");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
      }
    }
  };

  const handleUpdateBetEntry = async (betId, entryToUpdate, newValue) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/bets/adjust/${betId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updatedEntry: {
              responsavel: entryToUpdate.responsavel,
              conta: entryToUpdate.conta,
              valor: newValue,
            },
          }),
        }
      );

      if (response.ok) {
        await fetchBets();
        await fetchStats();
        await fetchDetailedBancas();
        await fetchDetailedBancasByPerson();
        return true; // Retorna true em caso de sucesso
      } else {
        console.error("Falha ao atualizar a aposta.");
        return false; // Retorna false em caso de falha
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      return false; // Retorna false em caso de erro
    }
  };

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
