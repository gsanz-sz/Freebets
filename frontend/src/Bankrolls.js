import { useState } from "react";
import TransactionForm from "./TransactionForm";
import React from "react"; // Adicionado para evitar erros de lint

// Componente para exibir o valor com cor dinâmica
const ValorDisplay = ({ valor }) => {
  const cor = valor > 0 ? "valor-positivo" : valor < 0 ? "valor-negativo" : "";
  return <span className={`valor ${cor}`}>R$ {valor.toFixed(2)}</span>;
};

// Componente para um card de casa de aposta individual
const CardBanca = ({ nomeCasa, banca, emAposta }) => (
  <div className="card-banca">
    <h4>{nomeCasa}</h4>
    <div className="info-banca">
      <span>Saldo:</span>
      <ValorDisplay valor={banca} />
    </div>
    <div className="info-banca">
      <span>Em Aposta:</span>
      <span className="valor">R$ {emAposta.toFixed(2)}</span>
    </div>
  </div>
);

function Bankrolls({ onSubmitTransaction, detailedBancasByPerson }) {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState("deposito");

  if (!detailedBancasByPerson) {
    return <div>Carregando estatísticas...</div>;
  }

  const handleFormSubmit = (formData) => {
    onSubmitTransaction(formData);
    setShowTransactionForm(false);
  };

  const openForm = (type) => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  const calcularTotalPorResponsavel = (plataformas) => {
    return Object.values(plataformas).reduce(
      (acc, { banca, emAposta }) => {
        acc.totalBanca += banca;
        acc.totalEmAposta += emAposta;
        return acc;
      },
      { totalBanca: 0, totalEmAposta: 0 }
    );
  };

  return (
    <div className="bankrolls-container">
      <div className="bankrolls-header">
        <h1>Minhas Bancas</h1>
        <div className="header-buttons">
          <button
            className="btn btn-deposito"
            onClick={() => openForm("deposito")}
          >
            Adicionar Depósito
          </button>
          <button className="btn btn-saque" onClick={() => openForm("saque")}>
            Adicionar Saque
          </button>
        </div>
      </div>

      <div className="responsaveis-grid">
        {Object.entries(detailedBancasByPerson).map(
          ([responsavel, plataformas]) => {
            const { totalBanca, totalEmAposta } =
              calcularTotalPorResponsavel(plataformas);
            return (
              <div className="card-responsavel" key={responsavel}>
                <div className="responsavel-header">
                  <h3>{responsavel}</h3>
                  <div className="responsavel-total">
                    <span>Total: </span>
                    <ValorDisplay valor={totalBanca + totalEmAposta} />
                  </div>
                </div>
                <div className="bancas-grid">
                  {Object.entries(plataformas).map(([nomeCasa, dados]) => (
                    <CardBanca
                      key={nomeCasa}
                      nomeCasa={nomeCasa}
                      banca={dados.banca}
                      emAposta={dados.emAposta}
                    />
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>

      {showTransactionForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TransactionForm
              onSubmit={handleFormSubmit}
              onClose={() => setShowTransactionForm(false)}
              type={transactionType}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Bankrolls;
