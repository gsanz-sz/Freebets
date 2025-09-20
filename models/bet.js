const mongoose = require("mongoose");

// Define um esquema para cada entrada de aposta
const entrySchema = new mongoose.Schema({
  responsavel: {
    type: String,
    required: true,
  },
  conta: {
    type: String,
    required: true,
  },
  valor: {
    type: Number,
    required: true,
  },
  odd: {
    type: Number,
    required: true,
  },
});

// Define o Schema da Aposta principal
const betSchema = new mongoose.Schema({
  nomeAposta: {
    type: String,
    required: true,
  },
  data: {
    type: Date,
    default: Date.now,
  },
  // O novo campo que irá armazenar todas as entradas
  entradas: {
    type: [entrySchema],
    required: true,
  },
  finished: {
    type: Boolean,
    default: false,
  },
  contaVencedora: {
    type: String,
    required: function () {
      return this.finished === true;
    },
  },
  lucro: {
    type: Number,
    required: function () {
      return this.finished === true;
    },
  },
  plataformaPrincipal: {
    type: String,
    required: true,
  },
});

// Cria o Model
const Bet = mongoose.model("Bet", betSchema);

module.exports = Bet;
