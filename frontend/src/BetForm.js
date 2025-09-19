import { useState } from "react";

function BetForm({ onSubmit, onClose }) {
  const [nomeAposta, setNomeAposta] = useState("");
  const [entries, setEntries] = useState([
    { responsavel: "", conta: "", valor: "", odd: "" },
  ]);

  const accounts = [
    "Betano",
    "Betfair",
    "Bet365",
    "Novibet",
    "Estrelabet",
    "Sportingbet",
    "Betnacional",
    "Superbet",
    "Betvip",
    "Bet7k",
    "Cassinopix",
    "Verabet",
    "Pixbet",
    "McGames",
    "Esportivabet",
    "BetEsporte",
    "Rei do Pitaco",
    "Multibet",
    "Bet-Bra",
    "Alfabet",
    "Fullbet",
    "Aposta1",
    "Matchbook",
    "BrBet",
    "Flabet",
  ];
  const responsaveis = ["Gabriel", "Giovanna", "Leleco"];

  const handleEntryChange = (e, index) => {
    const { name, value } = e.target;
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [name]: value };
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      { responsavel: "", conta: "", valor: "", odd: "" },
    ]);
  };

  // --- NOVA FUNÇÃO ---
  // Função para remover uma entrada da lista pelo seu índice
  const removeEntry = (indexToRemove) => {
    // Só permite remover se houver mais de uma entrada
    if (entries.length > 1) {
      setEntries(entries.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedEntries = entries.map((entry) => ({
      ...entry,
      valor: parseFloat(entry.valor),
      odd: parseFloat(entry.odd),
    }));
    const formData = {
      nomeAposta,
      entradas: formattedEntries,
      finished: false,
    };

    const success = await onSubmit(formData);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Adicionar Nova Aposta</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Nome da Aposta:
              <input
                type="text"
                name="nomeAposta"
                value={nomeAposta}
                onChange={(e) => setNomeAposta(e.target.value)}
                required
              />
            </label>
          </div>

          {entries.map((entry, index) => (
            <div key={index} className="form-entry">
              {/* --- BOTÃO DE REMOVER ADICIONADO --- */}
              {entries.length > 1 && (
                <button
                  type="button"
                  className="remove-entry-button"
                  onClick={() => removeEntry(index)}
                >
                  &times;
                </button>
              )}
              <h4>Entrada {index + 1}</h4>
              <div>
                <label>
                  Responsável:
                  <select
                    name="responsavel"
                    value={entry.responsavel}
                    onChange={(e) => handleEntryChange(e, index)}
                    required
                  >
                    <option value="">Selecione o Responsável</option>
                    {responsaveis.map((resp) => (
                      <option key={resp} value={resp}>
                        {resp}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Conta/Plataforma:
                  <select
                    name="conta"
                    value={entry.conta}
                    onChange={(e) => handleEntryChange(e, index)}
                    required
                  >
                    <option value="">Selecione a Conta</option>
                    {accounts.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Valor Apostado:
                  <input
                    type="number"
                    name="valor"
                    value={entry.valor}
                    onChange={(e) => handleEntryChange(e, index)}
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Odd:
                  <input
                    type="number"
                    step="0.01"
                    name="odd"
                    value={entry.odd}
                    onChange={(e) => handleEntryChange(e, index)}
                    required
                  />
                </label>
              </div>
            </div>
          ))}

          <button type="button" onClick={addEntry}>
            Adicionar Outra Entrada
          </button>
          <button type="submit">Finalizar e Salvar Aposta</button>
        </form>
      </div>
    </div>
  );
}

export default BetForm;
