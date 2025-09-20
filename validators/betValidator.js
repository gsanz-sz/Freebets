const Joi = require("joi");

// Esquema para criar uma nova aposta (já existente)
const betSchema = Joi.object({
  nomeAposta: Joi.string().trim().required(),
  entradas: Joi.array()
    .items(
      Joi.object({
        responsavel: Joi.string().required(),
        conta: Joi.string().required(),
        valor: Joi.number().positive().required(),
        odd: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required(),
  finished: Joi.boolean().optional(),

  plataformaPrincipal: Joi.string().trim().required(),
});

// --- NOVO ESQUEMA PARA FINALIZAR UMA APOSTA ---
const finishBetSchema = Joi.object({
  // Exige que a conta vencedora seja uma string e o lucro seja um número
  contaVencedora: Joi.string().required(),
  lucro: Joi.number().required(),
});

const adjustBetSchema = Joi.object({
  updatedEntry: Joi.object({
    responsavel: Joi.string().required(),
    conta: Joi.string().required(),
    originalOdd: Joi.number().positive().required(), // Aceita a odd original
    valor: Joi.number().positive().required(), // Aceita o novo valor
    odd: Joi.number().positive().required(), // Aceita a nova odd
  }).required(),
});

module.exports = {
  betSchema,
  finishBetSchema,
  adjustBetSchema, // Garanta que o schema atualizado seja exportado
};
