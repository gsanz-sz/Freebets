import { useState, useEffect } from 'react';

function TransactionForm({ onSubmit, onClose, type }) {
  const [formData, setFormData] = useState({
    responsavel: '',
    plataforma: '',
    valor: '',
    tipo: type, // Usa a prop 'type' para definir o valor inicial
  });
  
  // Atualiza o tipo se a prop mudar
  useEffect(() => {
    setFormData(prevData => ({ ...prevData, tipo: type }));
  }, [type]);

  const accounts = ['Betano', 'Betfair', 'Bet365', 'Novibet', 'Estrelabet', 'Sportingbet', 'Betnacional', 'Superbet', 'Betvip', 'Bet7k', 'Cassinopix', 'Verabet', 'Pixbet', 'McGames', 'Esportivabet', 'BetEsporte', 'Rei do Pitaco', 'Multibet', 'Bet-Bra', 'Alfabet', 'Fullbet', 'Aposta1', 'Matchbook', 'BrBet', 'Flabet'];
  const responsaveis = ['Gabriel', 'Giovanna', 'Leleco'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>{formData.tipo === 'deposito' ? 'Adicionar Depósito' : 'Adicionar Saque'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Pessoa Responsável:
            <select name="responsavel" value={formData.responsavel} onChange={handleChange} required>
              <option value="">Selecione o Responsável</option>
              {responsaveis.map(resp => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Plataforma:
            <select name="plataforma" value={formData.plataforma} onChange={handleChange} required>
              <option value="">Selecione a Plataforma</option>
              {accounts.map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Valor:
            <input type="number" name="valor" value={formData.valor} onChange={handleChange} required />
          </label>
        </div>
        
        <input type="hidden" name="tipo" value={formData.tipo} /> {/* Campo hidden para o tipo */}
        
        <button type="submit">Salvar Transação</button>
        <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancelar</button>
      </form>
    </div>
  );
}

export default TransactionForm;