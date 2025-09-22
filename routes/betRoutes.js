const express = require("express");
const router = express.Router();
const Bet = require("../models/bet");
const Transaction = require("../models/transaction");
const asyncHandler = require("express-async-handler");
const {
  betSchema,
  finishBetSchema,
  adjustBetSchema,
} = require("../validators/betValidator");

// --- MIDDLEWARE ---
const getBet = asyncHandler(async (req, res, next) => {
  const bet = await Bet.findById(req.params.id);
  if (bet == null) {
    res.status(404);
    throw new Error("Aposta não encontrada.");
  }
  res.locals.bet = bet;
  next();
});

// --- ROTAS DE APOSTAS (BETS) ---

router.get(
  "/bets",
  asyncHandler(async (req, res) => {
    const bets = await Bet.find().sort({ createdAt: 1 });
    res.status(200).json(bets);
  })
);

router.post(
  "/bets",
  asyncHandler(async (req, res) => {
    console.log("-------------------------------------------");
    console.log(">>> REQUISIÇÃO CHEGOU NA ROTA: POST /api/bets");
    console.log(">>> Corpo da requisição recebido:", req.body);
    console.log("-------------------------------------------");

    const { error, value } = betSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }
    const newBet = new Bet(value);
    const savedBet = await newBet.save();
    console.log("+++ Aposta salva no banco de dados com sucesso!");
    res.status(201).json(savedBet);
  })
);

router.delete(
  "/bets/:id",
  getBet,
  asyncHandler(async (req, res) => {
    console.log("-------------------------------------------");
    console.log(">>> REQUISIÇÃO CHEGOU NA ROTA: DELETE /api/bets/:id");
    console.log(">>> ID da Aposta para deletar:", req.params.id);
    console.log("-------------------------------------------");

    await res.locals.bet.deleteOne();
    console.log(`+++ Aposta com ID ${req.params.id} foi excluída com sucesso.`);
    res.status(200).json({ message: "Aposta excluída com sucesso." });
  })
);

router.put(
  "/bets/adjust/:id",
  getBet,
  asyncHandler(async (req, res) => {
    console.log("-------------------------------------------");
    console.log(">>> REQUISIÇÃO CHEGOU NA ROTA: PUT /api/bets/adjust/:id");
    console.log(">>> Dados de ajuste recebidos:", req.body);
    console.log("-------------------------------------------");

    const { error, value } = adjustBetSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { updatedEntry } = value;
    const bet = res.locals.bet;

    // Lógica de busca corrigida para ser mais específica e evitar erros.
    // O frontend deve enviar a 'odd' original para identificar a entrada correta.
    const entryIndex = bet.entradas.findIndex(
      (entry) =>
        entry.responsavel === updatedEntry.responsavel &&
        entry.conta === updatedEntry.conta &&
        // Usar a odd original é crucial para identificar a entrada correta
        entry.odd.toString() === updatedEntry.originalOdd.toString()
    );

    if (entryIndex === -1) {
      res.status(404);
      throw new Error("Entrada da aposta não encontrada para ajuste.");
    }

    // --- ALTERAÇÃO PRINCIPAL AQUI ---
    // Atualiza tanto o valor quanto a nova odd
    bet.entradas[entryIndex].valor = parseFloat(updatedEntry.valor);
    bet.entradas[entryIndex].odd = parseFloat(updatedEntry.odd); // Adiciona a atualização da odd

    const updatedBet = await bet.save();
    console.log(`+++ Aposta com ID ${req.params.id} foi ajustada com sucesso.`);
    res.status(200).json(updatedBet);
  })
);

router.put(
  "/bets/finish/:id",
  getBet,
  asyncHandler(async (req, res) => {
    console.log("-------------------------------------------");
    console.log(">>> REQUISIÇÃO CHEGOU NA ROTA: PUT /api/bets/finish/:id");
    console.log(">>> Dados de finalização recebidos:", req.body);
    console.log("-------------------------------------------");

    const { error, value } = finishBetSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { contaVencedora, lucro } = value;
    const bet = res.locals.bet;
    bet.finished = true;
    bet.contaVencedora = contaVencedora;
    bet.lucro = lucro;

    const updatedBet = await bet.save();
    console.log(
      `+++ Aposta com ID ${req.params.id} foi finalizada com sucesso.`
    );
    res.status(200).json(updatedBet);
  })
);

// --- ROTAS DE ESTATÍSTICAS (STATS) ---

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const bets = await Bet.find();
    const transactions = await Transaction.find();
    let totalBankroll = 0;
    const profitByAccount = {};
    const profitByResponsavel = {};
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
        if (!profitByResponsavel[entrada.responsavel]) {
          profitByResponsavel[entrada.responsavel] = 0;
        }
      });

      totalBankroll -= totalInvestedInBet;

      if (bet.finished && typeof bet.lucro === "number") {
        const payout = bet.lucro + totalInvestedInBet;
        totalBankroll += payout;
        bankrollByPlatform[bet.contaVencedora] =
          (bankrollByPlatform[bet.contaVencedora] || 0) + payout;
        profitByAccount[bet.contaVencedora] =
          (profitByAccount[bet.contaVencedora] || 0) + bet.lucro;

        const responsaveisNaAposta = new Set(
          bet.entradas.map((e) => e.responsavel)
        );
        if (responsaveisNaAposta.size > 0) {
          const lucroPorResponsavelNaAposta =
            bet.lucro / responsaveisNaAposta.size;
          responsaveisNaAposta.forEach((responsavel) => {
            profitByResponsavel[responsavel] =
              (profitByResponsavel[responsavel] || 0) +
              lucroPorResponsavelNaAposta;
          });
        }
      }
    });

    res.status(200).json({
      totalBankroll: totalBankroll.toFixed(2),
      profitByAccount,
      profitByResponsavel,
      bankrollByPlatform,
    });
  })
);

// --- ROTA DE HISTÓRICO ATUALIZADA ---
router.get(
  "/stats/history",
  asyncHandler(async (req, res) => {
    const bets = await Bet.find().sort({ data: 1 });
    const transactions = await Transaction.find().sort({ data: 1 });
    const allEvents = [...bets, ...transactions].sort(
      (a, b) => new Date(a.data) - new Date(b.data)
    );

    let cumulativeBankroll = 0;
    const profitHistoryByResponsavel = {};
    const history = [];

    // Inicializa todos os responsáveis
    const allResponsaveis = new Set();
    bets.forEach((bet) =>
      bet.entradas.forEach((e) => allResponsaveis.add(e.responsavel))
    );
    transactions.forEach((t) => allResponsaveis.add(t.responsavel));
    allResponsaveis.forEach((r) => {
      if (r) profitHistoryByResponsavel[r] = 0;
    });

    allEvents.forEach((event) => {
      const eventDate = new Date(event.data).toISOString().split("T")[0];

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

          const responsaveisNaAposta = new Set(
            event.entradas.map((e) => e.responsavel)
          );
          if (responsaveisNaAposta.size > 0) {
            const lucroPorResponsavelNaAposta =
              event.lucro / responsaveisNaAposta.size;
            responsaveisNaAposta.forEach((responsavel) => {
              profitHistoryByResponsavel[responsavel] +=
                lucroPorResponsavelNaAposta;
            });
          }
        }
      }

      const dailyData = {
        date: eventDate,
        totalBankroll: cumulativeBankroll,
        ...profitHistoryByResponsavel,
      };

      // Agrupa os dados por dia
      const existingEntryIndex = history.findIndex((h) => h.date === eventDate);
      if (existingEntryIndex > -1) {
        history[existingEntryIndex] = dailyData;
      } else {
        history.push(dailyData);
      }
    });
    res.status(200).json(history);
  })
);

router.get(
  "/stats/detailed-bancas",
  asyncHandler(async (req, res) => {
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
  })
);

router.get(
  "/stats/detailed-bancas-by-person",
  asyncHandler(async (req, res) => {
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
  })
);

router.get(
  "/stats/daily-profit",
  asyncHandler(async (req, res) => {
    // Pega a data de hoje e formata para o padrão 'AAAA-MM-DD'
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0"); // Adiciona zero à esquerda se necessário
    const dia = String(hoje.getDate()).padStart(2, "0"); // Adiciona zero à esquerda se necessário
    const dataDeHojeString = `${ano}-${mes}-${dia}`;

    // Busca as apostas finalizadas que pertencem à data de hoje
    const apostasDeHoje = await Bet.find({
      finished: true,
      data: dataDeHojeString, // <<< USA O CAMPO CORRETO (data)
    });

    // Soma o lucro de todas as apostas encontradas
    const lucroDoDia = apostasDeHoje.reduce(
      (total, aposta) => total + aposta.lucro,
      0
    );

    res.status(200).json({ dailyProfit: lucroDoDia });
  })
);

module.exports = router;
