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
});

// --- NOVO ESQUEMA PARA FINALIZAR UMA APOSTA ---
const finishBetSchema = Joi.object({
  // Exige que a conta vencedora seja uma string e o lucro seja um número
  contaVencedora: Joi.string().required(),
  lucro: Joi.number().required(),
});

// --- NOVO ESQUEMA PARA AJUSTAR UMA ENTRADA ---
const adjustBetSchema = Joi.object({
  updatedEntry: Joi.object({
    responsavel: Joi.string().required(),
    conta: Joi.string().required(),
    valor: Joi.number().positive().required(), // Garante que o novo valor seja um número positivo
  }).required(),
});

module.exports = {
  betSchema,
  finishBetSchema,
  adjustBetSchema,
};
