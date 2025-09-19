import { useState } from "react";
import React from "react";

function BetList({ bets, onFinishBet, onDeleteBet, onUpdateBetEntry }) {
  const [editingBetId, setEditingBetId] = useState(null);
  const [winningEntries, setWinningEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newValue, setNewValue] = useState("");

  const getTotalValue = (entries) => {
    return entries.reduce((sum, entry) => sum + parseFloat(entry.valor), 0);
  };

  const getCalculatedProfit = (bet, winners) => {
    const totalInvestment = getTotalValue(bet.entradas);
    let totalPayout = 0;

    winners.forEach((winner) => {
      const winningEntry = bet.entradas.find(
        (entry) =>
          entry.conta === winner.conta &&
          entry.responsavel === winner.responsavel
      );
      if (winningEntry) {
        totalPayout += winningEntry.odd * winningEntry.valor;
      }
    });

    return totalPayout - totalInvestment;
  };

  const handleWinnerToggle = (entry) => {
    const isWinner = winningEntries.some(
      (w) => w.conta === entry.conta && w.responsavel === entry.responsavel
    );
    if (isWinner) {
      setWinningEntries(
        winningEntries.filter(
          (w) => w.conta !== entry.conta || w.responsavel !== entry.responsavel
        )
      );
    } else {
      setWinningEntries([...winningEntries, entry]);
    }
  };

  const handleFinishSubmit = (betId, bet) => {
    if (winningEntries.length === 0) {
      alert("Por favor, selecione pelo menos uma aposta vencedora.");
      return;
    }

    const calculatedProfit = getCalculatedProfit(bet, winningEntries);
    const mainWinningAccount = winningEntries[0].conta;

    onFinishBet(betId, mainWinningAccount, calculatedProfit);

    setEditingBetId(null);
    setWinningEntries([]);
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setNewValue(entry.valor);
  };

  const handleUpdateSubmit = async (betId, entry) => {
    if (newValue === "" || isNaN(newValue) || parseFloat(newValue) <= 0) {
      alert("Por favor, insira um valor válido para a aposta.");
      return;
    }

    const success = await onUpdateBetEntry(betId, entry, newValue);

    if (success) {
      setEditingEntry(null);
      setNewValue("");
      setEditingBetId(null);
    }
  };

  return (
    <div>
      <h1>Minhas Apostas</h1>
      {bets.length > 0 ? (
        <ul>
          {bets.map((bet) => (
            <li key={bet._id}>
              <h3>{bet.nomeAposta}</h3>

              <p>Valor total: R$ {getTotalValue(bet.entradas).toFixed(2)}</p>
              <p>Status: {bet.finished ? "Concluída" : "Pendente"}</p>

              <div style={{ marginLeft: "20px" }}>
                <h4>Detalhes:</h4>
                <ul>
                  {bet.entradas.map((entry, index) => (
                    <li key={index}>
                      {editingEntry &&
                      editingEntry.responsavel === entry.responsavel &&
                      editingEntry.conta === entry.conta ? (
                        <div>
                          <input
                            type="number"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            placeholder="Novo valor"
                          />
                          <button
                            onClick={() => handleUpdateSubmit(bet._id, entry)}
                          >
                            Salvar
                          </button>
                          <button onClick={() => setEditingEntry(null)}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div>
                          {entry.responsavel} - {entry.conta}: R$ {entry.valor}{" "}
                          (Odd: {entry.odd})
                          {!bet.finished && (
                            <button onClick={() => handleEditClick(entry)}>
                              Ajustar
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {!bet.finished ? (
                <div>
                  {editingBetId === bet._id ? (
                    <div>
                      <h4>Finalizar Aposta</h4>
                      <p>Selecione as apostas vencedoras:</p>
                      <ul>
                        {bet.entradas.map((entry, index) => (
                          <li key={index}>
                            <label>
                              <input
                                type="checkbox"
                                checked={winningEntries.some(
                                  (w) =>
                                    w.conta === entry.conta &&
                                    w.responsavel === entry.responsavel
                                )}
                                onChange={() => handleWinnerToggle(entry)}
                              />
                              {entry.responsavel} - {entry.conta} (Odd:{" "}
                              {entry.odd}, R$ {entry.valor})
                            </label>
                          </li>
                        ))}
                      </ul>
                      <div>
                        {winningEntries.length > 0 && (
                          <p>
                            Lucro Calculado: R${" "}
                            {getCalculatedProfit(bet, winningEntries).toFixed(
                              2
                            )}
                          </p>
                        )}
                      </div>
                      <button onClick={() => handleFinishSubmit(bet._id, bet)}>
                        Confirmar
                      </button>
                      <button onClick={() => setEditingBetId(null)}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingBetId(bet._id)}>
                      Finalizar Aposta
                    </button>
                  )}
                </div>
              ) : (
                <p>
                  Aposta concluída na conta:{" "}
                  <strong>{bet.contaVencedora}</strong> com lucro de:{" "}
                  <strong>
                    R$ {bet.lucro ? bet.lucro.toFixed(2) : "0.00"}
                  </strong>
                </p>
              )}

              <button onClick={() => onDeleteBet(bet._id)}>
                Excluir Aposta
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma aposta encontrada. Adicione uma para começar!</p>
      )}
    </div>
  );
}

export default BetList;
