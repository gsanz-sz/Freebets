const Joi = require('joi');

const betSchema = Joi.object({
    // 'nomeAposta' é uma string, sem espaços extras no início/fim, e é obrigatório.
    nomeAposta: Joi.string().trim().required(),

    // 'entradas' deve ser um array de objetos e é obrigatório.
    entradas: Joi.array().items(
        Joi.object({
            // Cada entrada deve ter esses campos
            responsavel: Joi.string().required(),   // <-- CORRIGIDO
            conta: Joi.string().required(),         // <-- CORRIGIDO
            valor: Joi.number().positive().required(),
            odd: Joi.number().positive().required()
        })
    ).min(1).required(), // O array de entradas deve ter pelo menos 1 item.
    
    // O campo finished não é obrigatório no envio inicial
    finished: Joi.boolean().optional()
});

module.exports = {
    betSchema
};