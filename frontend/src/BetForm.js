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

  const removeEntry = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const entradasFormatadas = entries.map((entry) => ({
      ...entry,
      valor: parseFloat(entry.valor),
      odd: parseFloat(entry.odd),
    }));
    onSubmit({ nomeAposta, entradas: entradasFormatadas, finished: false });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal-btn" onClick={onClose}>
          &times;
        </button>
        <form onSubmit={handleSubmit} className="bet-form">
          <h2>Nova Aposta</h2>

          <div className="form-group">
            <label htmlFor="nomeAposta">Nome da Aposta</label>
            <input
              id="nomeAposta"
              type="text"
              className="form-input"
              value={nomeAposta}
              onChange={(e) => setNomeAposta(e.target.value)}
              placeholder="Ex: Real Madrid x Barcelona"
              required
            />
          </div>

          <hr className="form-divider" />

          {entries.map((entry, index) => (
            <div key={index} className="entry-container">
              <div className="entry-header">
                <h4>Entrada {index + 1}</h4>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="remove-entry-btn"
                  >
                    &times;
                  </button>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Responsável</label>
                  <select
                    name="responsavel"
                    value={entry.responsavel}
                    onChange={(e) => handleEntryChange(e, index)}
                    required
                    className="form-select"
                  >
                    <option value="">Selecione</option>
                    {responsaveis.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Conta</label>
                  <select
                    name="conta"
                    value={entry.conta}
                    onChange={(e) => handleEntryChange(e, index)}
                    required
                    className="form-select"
                  >
                    <option value="">Selecione</option>
                    {accounts.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Valor</label>
                  <input
                    type="number"
                    name="valor"
                    value={entry.valor}
                    onChange={(e) => handleEntryChange(e, index)}
                    required
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Odd</label>
                  <input
                    type="number"
                    name="odd"
                    value={entry.odd}
                    onChange={(e) => handleEntryChange(e, index)}
                    required
                    step="0.01"
                    className="form-input"
                    placeholder="1.00"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="form-button-group">
            <button
              type="button"
              onClick={addEntry}
              className="form-button secondary"
            >
              Adicionar Entrada
            </button>
            <button type="submit" className="form-button primary">
              Salvar Aposta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BetForm;
