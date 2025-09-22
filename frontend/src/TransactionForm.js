import { useState, useEffect } from "react";
import { RESPONSAVEIS, ACCOUNTS } from "./config"; // Garanta que a importação do config.js está aqui

function TransactionForm({ onSubmit, onClose, type }) {
  const [formData, setFormData] = useState({
    responsavel: "",
    plataforma: "",
    valor: "",
    tipo: type,
  });

  useEffect(() => {
    setFormData((prevData) => ({ ...prevData, tipo: type }));
  }, [type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Converte o valor para número antes de submeter
    onSubmit({ ...formData, valor: parseFloat(formData.valor) });
    onClose();
  };

  return (
    // Reutilizando as classes do formulário de aposta para manter a consistência
    <form className="bet-form" onSubmit={handleSubmit}>
      <button type="button" onClick={onClose} className="close-modal-btn">
        &times;
      </button>

      <h2>
        {formData.tipo === "deposito"
          ? "Adicionar Depósito"
          : "Adicionar Saque"}
      </h2>

      <div className="form-group">
        <label>Pessoa Responsável</label>
        <select
          name="responsavel"
          value={formData.responsavel}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="">Selecione o Responsável</option>
          {RESPONSAVEIS.map((resp) => (
            <option key={resp} value={resp}>
              {resp}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Plataforma</label>
        <select
          name="plataforma"
          value={formData.plataforma}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="">Selecione a Plataforma</option>
          {ACCOUNTS.map((account) => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Valor (R$)</label>
        <input
          type="number"
          name="valor"
          value={formData.valor}
          onChange={handleChange}
          className="form-input"
          step="0.01"
          required
        />
      </div>

      <div className="form-button-group">
        <button
          type="button"
          onClick={onClose}
          className="form-button secondary"
        >
          Cancelar
        </button>
        <button type="submit" className="form-button primary">
          Salvar Transação
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
