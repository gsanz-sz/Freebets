import { useState } from "react";
import React from "react";

function BetDetailsModal({
  bet,
  onClose,
  onFinishBet,
  onDeleteBet,
  onUpdateBetEntry,
}) {
  const [isFinishing, setIsFinishing] = useState(false);
  const [winningEntries, setWinningEntries] = useState([]);

  // Novos estados para controlar a edição de uma entrada
  const [editingEntry, setEditingEntry] = useState(null);
  const [newOdd, setNewOdd] = useState(""); // Estado para a nova odd
  const [newValue, setNewValue] = useState(""); // Estado para o novo valor

  const getTotalValue = (entries) =>
    entries.reduce((sum, entry) => sum + entry.valor, 0);

  const getCalculatedProfit = (currentBet, winners) => {
    const totalInvestment = getTotalValue(currentBet.entradas);
    let totalPayout = 0;

    winners.forEach((winnerInfo) => {
      const winningEntry = currentBet.entradas.find(
        (entry) =>
          entry.conta === winnerInfo.conta &&
          entry.responsavel === winnerInfo.responsavel &&
          entry.odd === winnerInfo.odd
      );

      if (winningEntry) {
        totalPayout += winningEntry.odd * winningEntry.valor;
      }
    });

    return totalPayout - totalInvestment;
  };

  const handleWinnerToggle = (entry) => {
    const entryId = `${entry.conta}-${entry.responsavel}-${entry.odd}`;
    const isWinner = winningEntries.some(
      (w) => `${w.conta}-${w.responsavel}-${w.odd}` === entryId
    );

    if (isWinner) {
      setWinningEntries(
        winningEntries.filter(
          (w) => `${w.conta}-${w.responsavel}-${w.odd}` !== entryId
        )
      );
    } else {
      setWinningEntries([...winningEntries, entry]);
    }
  };

  const handleFinishSubmit = () => {
    if (winningEntries.length === 0) {
      alert("Selecione pelo menos uma entrada vencedora.");
      return;
    }
    const calculatedProfit = getCalculatedProfit(bet, winningEntries);
    const mainWinningAccount = winningEntries[0].conta;

    onFinishBet(bet._id, mainWinningAccount, calculatedProfit);
    onClose();
  };

  // --- FUNÇÕES PARA O AJUSTE ATUALIZADAS ---
  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setNewValue(entry.valor);
    setNewOdd(entry.odd); // Preenche o campo com a odd atual
  };

  const handleUpdateSubmit = (entryToUpdate) => {
    if (
      newValue === "" ||
      isNaN(newValue) ||
      parseFloat(newValue) <= 0 ||
      newOdd === "" ||
      isNaN(newOdd) ||
      parseFloat(newOdd) < 1
    ) {
      alert("Por favor, insira um valor e uma odd válidos.");
      return;
    }
    // Passa a odd original e os novos valores para a função principal
    onUpdateBetEntry(bet._id, entryToUpdate, {
      valor: parseFloat(newValue),
      odd: parseFloat(newOdd),
    });
    setEditingEntry(null); // Fecha o modo de edição
  };

  const corLucro = bet.lucro >= 0 ? "lucro-positivo" : "lucro-negativo";

  return (
    <div className="modal-overlay">
      <div className="modal-content bet-details-modal">
        <button onClick={onClose} className="close-modal-btn">
          &times;
        </button>
        <h3>{bet.nomeAposta}</h3>

        <div className="bet-info-grid">
          <div>
            <span>Valor Total</span>
            <p>R$ {getTotalValue(bet.entradas).toFixed(2)}</p>
          </div>
          <div>
            <span>Status</span>
            <p
              className={bet.finished ? "status-concluida" : "status-pendente"}
            >
              {bet.finished ? "Concluída" : "Pendente"}
            </p>
          </div>
          {bet.finished && (
            <div>
              <span>Resultado</span>
              <p className={corLucro}>R$ {bet.lucro.toFixed(2)}</p>
            </div>
          )}
        </div>

        <h4>Detalhes das Entradas:</h4>
        <ul className="entry-list">
          {bet.entradas.map((entry, index) => {
            const entryId = `${entry.conta}-${entry.responsavel}-${entry.odd}`;
            const editingId = editingEntry
              ? `${editingEntry.conta}-${editingEntry.responsavel}-${editingEntry.odd}`
              : null;
            const isEditing = entryId === editingId;

            return (
              <li key={index} className="entry-list-item">
                {isEditing ? (
                  <div className="edit-entry-form">
                    <span>
                      {entry.responsavel} - {entry.conta}:
                    </span>
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="edit-entry-input"
                      placeholder="Valor"
                    />
                    <input
                      type="number"
                      value={newOdd}
                      onChange={(e) => setNewOdd(e.target.value)}
                      className="edit-entry-input"
                      placeholder="Odd"
                      step="0.01" // Permite 2 ou mais casas decimais
                    />
                    <button
                      onClick={() => handleUpdateSubmit(entry)}
                      className="btn-save-edit"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingEntry(null)}
                      className="btn-cancel-edit"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="view-entry-item">
                    <span>
                      {entry.responsavel} - {entry.conta}: R$ {entry.valor}{" "}
                      (Odd: {entry.odd})
                    </span>
                    {!bet.finished && (
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="btn-adjust"
                      >
                        Ajustar
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* --- Lógica de exibição dos botões de finalizar/excluir --- */}
        {bet.finished ? (
          <div className="modal-actions">
            <button
              className="btn-excluir"
              onClick={() => {
                if (
                  window.confirm("Tem certeza que deseja excluir esta aposta?")
                ) {
                  onDeleteBet(bet._id);
                  onClose();
                }
              }}
            >
              Excluir Aposta
            </button>
          </div>
        ) : (
          <>
            {!isFinishing ? (
              <div className="modal-actions">
                <button
                  className="btn-finalizar"
                  onClick={() => setIsFinishing(true)}
                >
                  Finalizar Aposta
                </button>
                <button
                  className="btn-excluir"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Tem certeza que deseja excluir esta aposta?"
                      )
                    ) {
                      onDeleteBet(bet._id);
                      onClose();
                    }
                  }}
                >
                  Excluir Aposta
                </button>
              </div>
            ) : (
              <div className="finish-section">
                <h4>Selecione as Entradas Vencedoras:</h4>
                <ul className="winner-selection-list">
                  {bet.entradas.map((entry, index) => (
                    <li key={index}>
                      <label>
                        <input
                          type="checkbox"
                          checked={winningEntries.some(
                            (w) =>
                              w.conta === entry.conta &&
                              w.responsavel === entry.responsavel &&
                              w.odd === entry.odd
                          )}
                          onChange={() => handleWinnerToggle(entry)}
                        />
                        {entry.responsavel} - {entry.conta} (Odd: {entry.odd})
                      </label>
                    </li>
                  ))}
                </ul>
                {winningEntries.length > 0 && (
                  <p className="profit-calculation">
                    <strong>Lucro Calculado:</strong> R${" "}
                    {getCalculatedProfit(bet, winningEntries).toFixed(2)}
                  </p>
                )}
                <div className="modal-actions">
                  <button
                    className="btn-confirmar"
                    onClick={handleFinishSubmit}
                  >
                    Confirmar
                  </button>
                  <button
                    className="btn-cancelar"
                    onClick={() => setIsFinishing(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BetDetailsModal;
