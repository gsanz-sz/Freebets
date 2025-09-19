const express = require("express");
const router = express.Router();
const Bet = require("../models/bet");
const Transaction = require("../models/transaction");
const { betSchema } = require("../validators/betValidator");

// --- MIDDLEWARE ---
async function getBet(req, res, next) {
  let bet;
  try {
    bet = await Bet.findById(req.params.id);
    if (bet == null) {
      return res.status(404).json({ message: "Aposta não encontrada." });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.locals.bet = bet;
  next();
}

// --- ROTAS DE APOSTAS (BETS) ---

// Rota para obter todas as apostas
router.get("/bets", async (req, res) => {
  try {
    const bets = await Bet.find();
    res.status(200).json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para criar uma nova aposta
router.post("/bets", async (req, res) => {
  console.log("-------------------------------------------");
  console.log(">>> REQUISIÇÃO CHEGOU NA ROTA: POST /api/bets");
  console.log(">>> Corpo da requisição recebido:", req.body);
  console.log("-------------------------------------------");
  try {
    const { error, value } = betSchema.validate(req.body);
    if (error) {
      console.error("!!! ERRO DE VALIDAÇÃO DO JOI:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }
    const newBet = new Bet(value);
    const savedBet = await newBet.save();
    console.log("+++ Aposta salva no banco de dados com sucesso!");
    res.status(201).json(savedBet);
  } catch (err) {
    console.error("!!! ERRO CAPTURADO NO BLOCO CATCH:", err);
    res.status(500).json({ message: err.message });
  }
});

// Rota para excluir uma aposta
router.delete("/bets/:id", getBet, async (req, res) => {
  // --- RASTREADORES PARA DEBUG ---
  console.log("-------------------------------------------");
  console.log(">>> REQUISIÇÃO CHEGOU NA ROTA: DELETE /api/bets/:id");
  console.log(">>> ID da Aposta para deletar:", req.params.id);
  console.log("-------------------------------------------");
  try {
    await res.locals.bet.deleteOne();
    console.log(`+++ Aposta com ID ${req.params.id} foi excluída com sucesso.`);
    res.status(200).json({ message: "Aposta excluída com sucesso." });
  } catch (err) {
    console.error(`!!! ERRO AO DELETAR APOSTA ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para ajustar o valor de uma entrada em uma aposta pendente
router.put("/bets/adjust/:id", getBet, async (req, res) => {
  // --- RASTREADORES PARA DEBUG ---
  console.log("-------------------------------------------");
  console.log(">>> REQUISIÇÃO CHEGOU NA ROTA: PUT /api/bets/adjust/:id");
  console.log(">>> ID da Aposta para ajustar:", req.params.id);
  console.log(">>> Dados de ajuste recebidos:", req.body);
  console.log("-------------------------------------------");

  const { updatedEntry } = req.body;
  const bet = res.locals.bet;

  try {
    const entryIndex = bet.entradas.findIndex(
      (entry) =>
        entry.responsavel === updatedEntry.responsavel &&
        entry.conta === updatedEntry.conta
    );

    if (entryIndex === -1) {
      console.error(
        `!!! Entrada não encontrada para ajuste na aposta ${req.params.id}.`
      );
      return res
        .status(404)
        .json({ message: "Entrada da aposta não encontrada." });
    }

    bet.entradas[entryIndex].valor = parseFloat(updatedEntry.valor);

    const updatedBet = await bet.save();
    console.log(`+++ Aposta com ID ${req.params.id} foi ajustada com sucesso.`);
    res.status(200).json(updatedBet);
  } catch (err) {
    console.error(`!!! ERRO AO AJUSTAR APOSTA ${req.params.id}:`, err);
    res.status(500).json({ message: "Erro ao ajustar a aposta." });
  }
});

// Rota para finalizar uma aposta
router.put("/bets/finish/:id", getBet, async (req, res) => {
  // --- RASTREADORES PARA DEBUG ---
  console.log("-------------------------------------------");
  console.log(">>> REQUISIÇÃO CHEGOU NA ROTA: PUT /api/bets/finish/:id");
  console.log(">>> ID da Aposta para finalizar:", req.params.id);
  console.log(">>> Dados de finalização recebidos:", req.body);
  console.log("-------------------------------------------");

  const { contaVencedora, lucro } = req.body;
  const bet = res.locals.bet;

  try {
    if (contaVencedora && typeof lucro === "number") {
      bet.finished = true;
      bet.contaVencedora = contaVencedora;
      bet.lucro = lucro;
    } else {
      console.error(
        `!!! Dados inválidos para finalizar aposta ${req.params.id}.`
      );
      return res
        .status(400)
        .json({ message: "Dados de finalização inválidos." });
    }

    const updatedBet = await bet.save();
    console.log(
      `+++ Aposta com ID ${req.params.id} foi finalizada com sucesso.`
    );
    res.status(200).json(updatedBet);
  } catch (err) {
    console.error(`!!! ERRO AO FINALIZAR APOSTA ${req.params.id}:`, err);
    res.status(500).json({ message: "Erro ao finalizar aposta." });
  }
});

// --- ROTAS DE ESTATÍSTICAS (STATS) ---
// (O restante do arquivo continua o mesmo)

// Rota para obter estatísticas da banca
router.get("/stats", async (req, res) => {
  try {
    const bets = await Bet.find();
    const transactions = await Transaction.find();

    let totalBankroll = 0;
    const profitByAccount = {};
    const bankrollByPlatform = {};

    transactions.forEach((transacao) => {
      const valor =
        transacao.tipo === "deposito" ? transacao.valor : -transacao.valor;
      totalBankroll += valor;
      bankrollByPlatform[transacao.plataforma] =
        (bankrollByPlatform[transacao.plataforma] || 0) + valor;
    });

    bets.forEach((bet) => {
      let totalInvestedInBet = 0;
      bet.entradas.forEach((entrada) => {
        totalInvestedInBet += entrada.valor;
        bankrollByPlatform[entrada.conta] =
          (bankrollByPlatform[entrada.conta] || 0) - entrada.valor;
      });

      totalBankroll -= totalInvestedInBet;

      if (bet.finished && typeof bet.lucro === "number") {
        const payout = bet.lucro + totalInvestedInBet;
        totalBankroll += payout;

        bankrollByPlatform[bet.contaVencedora] =
          (bankrollByPlatform[bet.contaVencedora] || 0) + payout;
        profitByAccount[bet.contaVencedora] =
          (profitByAccount[bet.contaVencedora] || 0) + bet.lucro;
      }
    });

    res.status(200).json({
      totalBankroll: totalBankroll.toFixed(2),
      profitByAccount,
      bankrollByPlatform,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para o histórico da banca
router.get("/stats/history", async (req, res) => {
  try {
    const bets = await Bet.find().sort({ data: 1 });
    const transactions = await Transaction.find().sort({ data: 1 });
    const allEvents = [...bets, ...transactions].sort(
      (a, b) => new Date(a.data) - new Date(b.data)
    );

    let cumulativeBankroll = 0;
    const bankrollHistory = [];

    allEvents.forEach((event) => {
      if (event.tipo) {
        // É uma transação
        cumulativeBankroll +=
          event.tipo === "deposito" ? event.valor : -event.valor;
      } else {
        // É uma aposta
        const totalInvestedInBet = event.entradas.reduce(
          (sum, entrada) => sum + entrada.valor,
          0
        );
        cumulativeBankroll -= totalInvestedInBet;
        if (event.finished && typeof event.lucro === "number") {
          cumulativeBankroll += event.lucro + totalInvestedInBet;
        }
      }
      const eventDate = new Date(event.data);
      bankrollHistory.push({
        date: eventDate.toISOString().split("T")[0],
        bankroll: cumulativeBankroll.toFixed(2),
      });
    });
    res.status(200).json(bankrollHistory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para obter o saldo detalhado de cada plataforma
router.get("/stats/detailed-bancas", async (req, res) => {
  try {
    const bets = await Bet.find();
    const transactions = await Transaction.find();
    const detailedBancas = {};

    const initPlatform = (platform) => {
      if (!detailedBancas[platform]) {
        detailedBancas[platform] = { banca: 0, emAposta: 0 };
      }
    };

    transactions.forEach((transacao) => {
      initPlatform(transacao.plataforma);
      const valor =
        transacao.tipo === "deposito" ? transacao.valor : -transacao.valor;
      detailedBancas[transacao.plataforma].banca += valor;
    });

    bets.forEach((bet) => {
      let totalInvestidoNaAposta = 0;
      bet.entradas.forEach((entrada) => {
        initPlatform(entrada.conta);
        const valor = parseFloat(entrada.valor);
        detailedBancas[entrada.conta].banca -= valor;
        detailedBancas[entrada.conta].emAposta += valor;
        totalInvestidoNaAposta += valor;
      });

      if (bet.finished && typeof bet.lucro === "number") {
        initPlatform(bet.contaVencedora);
        detailedBancas[bet.contaVencedora].emAposta -= totalInvestidoNaAposta;
        detailedBancas[bet.contaVencedora].banca +=
          bet.lucro + totalInvestidoNaAposta;
      }
    });
    res.status(200).json(detailedBancas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nova rota para obter o saldo detalhado por pessoa e plataforma
router.get("/stats/detailed-bancas-by-person", async (req, res) => {
  try {
    const bets = await Bet.find();
    const transactions = await Transaction.find();
    const detailedBancas = {};

    const initPersonPlatform = (person, platform) => {
      if (!detailedBancas[person]) detailedBancas[person] = {};
      if (!detailedBancas[person][platform])
        detailedBancas[person][platform] = { banca: 0, emAposta: 0 };
    };

    transactions.forEach((transacao) => {
      initPersonPlatform(transacao.responsavel, transacao.plataforma);
      const valor =
        transacao.tipo === "deposito" ? transacao.valor : -transacao.valor;
      detailedBancas[transacao.responsavel][transacao.plataforma].banca +=
        valor;
    });

    bets.forEach((bet) => {
      bet.entradas.forEach((entrada) => {
        initPersonPlatform(entrada.responsavel, entrada.conta);
        const valor = parseFloat(entrada.valor);
        detailedBancas[entrada.responsavel][entrada.conta].banca -= valor;
        detailedBancas[entrada.responsavel][entrada.conta].emAposta += valor;
      });

      if (bet.finished && typeof bet.lucro === "number") {
        bet.entradas.forEach((entrada) => {
          initPersonPlatform(entrada.responsavel, entrada.conta);
          const valor = parseFloat(entrada.valor);
          detailedBancas[entrada.responsavel][entrada.conta].emAposta -= valor;

          if (entrada.conta === bet.contaVencedora) {
            const payout = entrada.odd * valor;
            detailedBancas[entrada.responsavel][entrada.conta].banca += payout;
          }
        });
      }
    });
    res.status(200).json(detailedBancas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
