import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";

function BetForm({ onSubmit, onClose }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nomeAposta: "",
      entradas: [{ responsavel: "", conta: "", valor: "", odd: "" }],
      plataformaPrincipal: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entradas",
  });

  const entradas = useWatch({
    control,
    name: "entradas",
  });

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

  // --- FUNÇÃO DE SUBMISSÃO ATUALIZADA ---
  const onFormSubmit = (data) => {
    // Pega a data de hoje e formata para 'AAAA-MM-DD'
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split("T")[0];

    const formattedData = {
      ...data,
      data: dataFormatada, // Adiciona o campo de data formatado
      entradas: data.entradas.map((entry) => ({
        ...entry,
        valor: parseFloat(entry.valor),
        odd: parseFloat(entry.odd),
      })),
      finished: false,
    };
    onSubmit(formattedData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form className="bet-form" onSubmit={handleSubmit(onFormSubmit)}>
          {/* O resto do seu formulário continua exatamente igual */}
          <button type="button" onClick={onClose} className="close-modal-btn">
            &times;
          </button>
          <h2>Adicionar Nova Aposta</h2>

          <div className="form-group">
            <label>Nome da Aposta</label>
            <input
              className="form-input"
              {...register("nomeAposta", {
                required: "O nome da aposta é obrigatório.",
              })}
            />
            {errors.nomeAposta && (
              <p className="error-message">{errors.nomeAposta.message}</p>
            )}
          </div>

          <hr className="form-divider" />

          {fields.map((item, index) => (
            <div key={item.id} className="entry-container">
              <div className="entry-header">
                <h4>Entrada {index + 1}</h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="remove-entry-btn"
                    onClick={() => remove(index)}
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Responsável</label>
                  <select
                    className="form-select"
                    {...register(`entradas.${index}.responsavel`, {
                      required: "Selecione um responsável.",
                    })}
                  >
                    <option value="">Selecione...</option>
                    {responsaveis.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {errors.entradas?.[index]?.responsavel && (
                    <p className="error-message">
                      {errors.entradas[index].responsavel.message}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Conta/Casa</label>
                  <select
                    className="form-select"
                    {...register(`entradas.${index}.conta`, {
                      required: "Selecione uma conta.",
                    })}
                  >
                    <option value="">Selecione...</option>
                    {accounts.map((acc) => (
                      <option key={acc} value={acc}>
                        {acc}
                      </option>
                    ))}
                  </select>
                  {errors.entradas?.[index]?.conta && (
                    <p className="error-message">
                      {errors.entradas[index].conta.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor (R$)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    {...register(`entradas.${index}.valor`, {
                      required: "O valor é obrigatório.",
                      valueAsNumber: true,
                      min: {
                        value: 0.01,
                        message: "O valor deve ser positivo.",
                      },
                    })}
                  />
                  {errors.entradas?.[index]?.valor && (
                    <p className="error-message">
                      {errors.entradas[index].valor.message}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Odd</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.001"
                    {...register(`entradas.${index}.odd`, {
                      required: "A odd é obrigatória.",
                      valueAsNumber: true,
                      min: {
                        value: 1.01,
                        message: "A odd deve ser maior que 1.",
                      },
                    })}
                  />
                  {errors.entradas?.[index]?.odd && (
                    <p className="error-message">
                      {errors.entradas[index].odd.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {entradas && entradas.length > 1 && (
            <div className="form-group principal-platform-selector">
              <hr className="form-divider" />
              <label>Qual plataforma gerou a oportunidade?</label>
              <div className="radio-group">
                {entradas.map((entrada, index) =>
                  entrada.conta ? (
                    <div key={index} className="radio-option">
                      <input
                        type="radio"
                        id={`plataforma-${index}`}
                        {...register("plataformaPrincipal", {
                          required: "Selecione a plataforma principal.",
                        })}
                        value={entrada.conta}
                      />
                      <label htmlFor={`plataforma-${index}`}>
                        {entrada.conta}
                      </label>
                    </div>
                  ) : null
                )}
              </div>
              {errors.plataformaPrincipal && (
                <p className="error-message">
                  {errors.plataformaPrincipal.message}
                </p>
              )}
            </div>
          )}

          <div className="form-button-group">
            <button
              type="button"
              className="form-button secondary"
              onClick={() =>
                append({ responsavel: "", conta: "", valor: "", odd: "" })
              }
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
