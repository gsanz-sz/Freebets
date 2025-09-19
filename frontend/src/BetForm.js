import { useState } from "react";

function BetForm({ onSubmit }) {
  const [nomeAposta, setNomeAposta] = useState("");
  const [entries, setEntries] = useState([
    { responsavel: "", account: "", valor: "", odd: "" },
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
    newEntries[index] = {
      ...newEntries[index],
      [name]: value,
    };
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      { responsavel: "", account: "", valor: "", odd: "" },
    ]);
  };

  const handleRemoveEntry = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalEntries = entries.filter((entry) => {
      const isAccountValid =
        entry.account && entry.account !== "Selecione a Conta";
      const isValorValid = entry.valor && !isNaN(parseFloat(entry.valor));
      const isOddValid = entry.odd && !isNaN(parseFloat(entry.odd));
      const isResponsavelValid = entry.responsavel;

      return isAccountValid && isValorValid && isOddValid && isResponsavelValid;
    });

    if (finalEntries.length === 0) {
      alert("Por favor, preencha pelo menos uma aposta válida.");
      return;
    }

    // Mapeia as entradas para o formato correto do backend
    const entradasFormatadas = finalEntries.map((entry) => ({
      responsavel: entry.responsavel,
      conta: entry.account, // Nome do campo alterado para 'conta'
      valor: parseFloat(entry.valor),
      odd: parseFloat(entry.odd),
    }));

    const newBet = {
      nomeAposta,
      entradas: entradasFormatadas,
      finished: false,
    };

    console.log("Dados que o front-end vai enviar:", newBet);
    onSubmit(newBet);

    setNomeAposta("");
    setEntries([{ responsavel: "", account: "", valor: "", odd: "" }]);
  };

  return (
    <div>
      <h1>Adicionar Nova Aposta</h1>
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
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "10px 0",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => handleRemoveEntry(index)}
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                width: "25px",
                height: "25px",
              }}
            >
              X
            </button>

            <div>
              <label>
                Pessoa Responsável:
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
                Conta:
                <select
                  name="account"
                  value={entry.account}
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
          Adicionar Outra Aposta
        </button>
        <button type="submit">Finalizar e Salvar Aposta</button>
      </form>
    </div>
  );
}

export default BetForm;
