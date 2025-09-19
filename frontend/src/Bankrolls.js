import { useState } from "react";
import TransactionForm from "./TransactionForm";

function Bankrolls({
  stats,
  onSubmitTransaction,
  detailedBancas,
  detailedBancasByPerson,
}) {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState("deposito");

  if (!stats || !detailedBancas || !detailedBancasByPerson) {
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

  return (
    <div className="bankrolls-container">
      <div className="bankrolls-header">
        <h1>Minhas Bancas</h1>
        <div className="header-buttons">
          <button onClick={() => openForm("deposito")}>
            Adicionar Depósito
          </button>
          <button
            onClick={() => openForm("saque")}
            style={{ marginLeft: "10px" }}
          >
            Adicionar Saque
          </button>
        </div>
      </div>

      <hr />

      {/* Nova seção para exibir o saldo detalhado das bancas por pessoa */}
      <h3>Saldo por Responsável:</h3>
      <ul>
        {Object.entries(detailedBancasByPerson).map(([person, platforms]) => (
          <li key={person}>
            <strong>{person}:</strong>
            <ul>
              {Object.entries(platforms).map(([platform, data]) => (
                <li key={platform} style={{ marginLeft: "20px" }}>
                  {platform}
                  <ul>
                    <li>Banca: R$ {data.banca.toFixed(2)}</li>
                    <li>Em Aposta: R$ {data.emAposta.toFixed(2)}</li>
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <hr />

      <h3>Lucro por Conta:</h3>
      <ul>
        {Object.entries(stats.profitByAccount).map(([account, profit]) => (
          <li key={account}>
            {account}: R$ {profit.toFixed(2)}
          </li>
        ))}
      </ul>

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
