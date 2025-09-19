const express = require("express");
const router = express.Router();
const Bet = require("../models/bet");
const Transaction = require("../models/transaction");

// Rota para criar uma nova aposta
router.post("/bets", async (req, res) => {
  console.log("Dados que o back-end recebeu:", req.body);
  try {
    if (!req.body.entradas || req.body.entradas.length === 0) {
      return res
        .status(400)
        .json({ error: "É necessário ter pelo menos uma aposta para salvar." });
    }

    const newBet = new Bet(req.body);
    await newBet.save();
    res.status(201).json(newBet);
  } catch (err) {
    console.error("Erro de validação do Mongoose:", err.message); // <-- ADICIONAR ESTA LINHA
    res.status(400).json({ error: err.message });
  }
});

// Rota para obter todas as apostas
router.get("/bets", async (req, res) => {
  try {
    const bets = await Bet.find();
    res.status(200).json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para atualizar uma aposta (marcar como concluída)
router.put("/bets/:id", async (req, res) => {
  try {
    const betId = req.params.id;
    const { contaVencedora, lucro, updatedEntry } = req.body;

    const bet = await Bet.findById(betId);
    if (!bet) {
      return res.status(404).json({ message: "Aposta não encontrada." });
    }

    if (updatedEntry) {
      // Lógica para atualizar uma entrada
      const entryIndex = bet.entradas.findIndex(
        (entry) =>
          entry.responsavel === updatedEntry.responsavel &&
          entry.conta === updatedEntry.conta
      );

      if (entryIndex === -1) {
        return res
          .status(404)
          .json({ message: "Entrada da aposta não encontrada." });
      }

      // Garante que o valor é um número
      bet.entradas[entryIndex].valor = parseFloat(updatedEntry.valor);
    } else if (contaVencedora && typeof lucro === "number") {
      // Lógica para finalizar a aposta
      bet.finished = true;
      bet.contaVencedora = contaVencedora;
      bet.lucro = lucro;
    } else {
      return res
        .status(400)
        .json({ message: "Dados de atualização inválidos." });
    }

    await bet.save(); // Salva a alteração no banco de dados
    res.status(200).json(bet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar a aposta." });
  }
});

// Rota para excluir uma aposta
router.delete("/bets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBet = await Bet.findByIdAndDelete(id);

    if (!deletedBet) {
      return res.status(404).json({ message: "Aposta não encontrada." });
    }

    res.status(200).json({ message: "Aposta excluída com sucesso." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para ajustar o valor de uma entrada em uma aposta pendente
router.put("/bets/adjust/:id", async (req, res) => {
  try {
    const betId = req.params.id;
    const { updatedEntry } = req.body;

    const bet = await Bet.findById(betId);
    if (!bet) {
      return res.status(404).json({ message: "Aposta não encontrada." });
    }

    // Encontra e atualiza a entrada específica
    const entryIndex = bet.entradas.findIndex(
      (entry) =>
        entry.responsavel === updatedEntry.responsavel &&
        entry.conta === updatedEntry.conta
    );

    if (entryIndex === -1) {
      return res
        .status(404)
        .json({ message: "Entrada da aposta não encontrada." });
    }

    // Garante que o valor é um número
    bet.entradas[entryIndex].valor = parseFloat(updatedEntry.valor);

    // O save() estava causando o erro, vamos usar o findByIdAndUpdate para ignorar a validação
    const updatedBet = await Bet.findByIdAndUpdate(
      betId,
      { $set: { entradas: bet.entradas } },
      { new: true, runValidators: true } // new: true retorna o documento atualizado
    );

    res.status(200).json(updatedBet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao ajustar a aposta." });
  }
});

// Rota para finalizar uma aposta
router.put("/bets/finish/:id", async (req, res) => {
  try {
    const betId = req.params.id;
    const { contaVencedora, lucro } = req.body;

    const bet = await Bet.findById(betId);
    if (!bet) {
      return res.status(404).json({ message: "Aposta não encontrada." });
    }

    // Lógica para finalizar a aposta
    if (contaVencedora && typeof lucro === "number") {
      bet.finished = true;
      bet.contaVencedora = contaVencedora;
      bet.lucro = lucro;
    } else {
      return res
        .status(400)
        .json({ message: "Dados de finalização inválidos." });
    }

    await bet.save(); // Salva a alteração no banco de dados
    res.status(200).json(bet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao finalizar a aposta." });
  }
});

// Rota para obter estatísticas da banca (agora incluindo transações)
router.get("/stats", async (req, res) => {
  try {
    const bets = await Bet.find();
    const transactions = await Transaction.find();

    let totalBankroll = 0;
    const profitByAccount = {};
    const bankrollByPlatform = {}; // Objeto para o saldo por plataforma

    // Processa as transações primeiro
    transactions.forEach((transacao) => {
      totalBankroll +=
        transacao.tipo === "deposito" ? transacao.valor : -transacao.valor;
      if (!bankrollByPlatform[transacao.plataforma]) {
        bankrollByPlatform[transacao.plataforma] = 0;
      }
      bankrollByPlatform[transacao.plataforma] +=
        transacao.tipo === "deposito" ? transacao.valor : -transacao.valor;
    });

    // Processa as apostas em seguida
    bets.forEach((bet) => {
      let totalInvestedInBet = 0;
      let totalPayout = 0;

      bet.entradas.forEach((entrada) => {
        totalInvestedInBet += entrada.valor;
        if (!bankrollByPlatform[entrada.conta]) {
          // Usa 'entrada.conta'
          bankrollByPlatform[entrada.conta] = 0;
        }
        bankrollByPlatform[entrada.conta] -= entrada.valor; // Subtrai o valor apostado da banca
      });

      totalBankroll -= totalInvestedInBet;

      if (bet.finished && typeof bet.lucro === "number") {
        const payout = bet.lucro + totalInvestedInBet;
        totalBankroll += payout;

        // Adiciona o retorno à banca da plataforma vencedora
        if (!bankrollByPlatform[bet.contaVencedora]) {
          bankrollByPlatform[bet.contaVencedora] = 0;
        }
        bankrollByPlatform[bet.contaVencedora] += payout;

        if (profitByAccount[bet.contaVencedora]) {
          profitByAccount[bet.contaVencedora] += bet.lucro;
        } else {
          profitByAccount[bet.contaVencedora] = bet.lucro;
        }
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

// Rota para o histórico da banca (atualizada para o novo esquema)
router.get("/stats/history", async (req, res) => {
  try {
    const bets = await Bet.find().sort({ data: 1 });
    const transactions = await Transaction.find().sort({ data: 1 });

    // Combina bets e transactions e ordena por data
    const allEvents = [...bets, ...transactions].sort(
      (a, b) => a.data - b.data
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
        let totalInvestedInBet = 0;
        event.entradas.forEach((entrada) => {
          totalInvestedInBet += entrada.valor;
        });
        cumulativeBankroll -= totalInvestedInBet;

        if (event.finished && typeof event.lucro === "number") {
          const payout = event.lucro + totalInvestedInBet;
          cumulativeBankroll += payout;
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

// Nova Rota para obter o saldo detalhado de cada plataforma
router.get("/stats/detailed-bancas", async (req, res) => {
  try {
    const bets = await Bet.find();
    const transactions = await Transaction.find();

    const detailedBancas = {}; // Objeto para armazenar o saldo detalhado

    // Função para inicializar o objeto de uma plataforma
    const initPlatform = (platform) => {
      if (!detailedBancas[platform]) {
        detailedBancas[platform] = { banca: 0, emAposta: 0 };
      }
    };

    // Processa as transações primeiro
    transactions.forEach((transacao) => {
      initPlatform(transacao.plataforma);
      const valor =
        transacao.tipo === "deposito" ? transacao.valor : -transacao.valor;
      detailedBancas[transacao.plataforma].banca += valor;
    });

    // Processa as apostas
    bets.forEach((bet) => {
      // Para cada entrada da aposta, move o dinheiro da banca para "emAposta"
      bet.entradas.forEach((entrada) => {
        initPlatform(entrada.conta);
        const valor = parseFloat(entrada.valor);
        detailedBancas[entrada.conta].banca -= valor;
        detailedBancas[entrada.conta].emAposta += valor;
      });

      // Se a aposta estiver concluída, devolve o dinheiro e adiciona o lucro
      if (bet.finished && typeof bet.lucro === "number") {
        // Encontra o valor total investido na aposta para calcular o retorno
        const totalInvestidoNaAposta = bet.entradas.reduce(
          (sum, entry) => sum + parseFloat(entry.valor),
          0
        );
        const payout = bet.lucro + totalInvestidoNaAposta;

        // Retira da aposta e adiciona de volta à banca, com o lucro
        initPlatform(bet.contaVencedora);
        detailedBancas[bet.contaVencedora].emAposta -= totalInvestidoNaAposta;
        detailedBancas[bet.contaVencedora].banca += payout;
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

    const initPerson = (person) => {
      if (!detailedBancas[person]) {
        detailedBancas[person] = {};
      }
    };

    const initPlatform = (person, platform) => {
      if (!detailedBancas[person][platform]) {
        detailedBancas[person][platform] = { banca: 0, emAposta: 0 };
      }
    };

    transactions.forEach((transacao) => {
      initPerson(transacao.responsavel);
      initPlatform(transacao.responsavel, transacao.plataforma);
      const valor =
        transacao.tipo === "deposito" ? transacao.valor : -transacao.valor;
      detailedBancas[transacao.responsavel][transacao.plataforma].banca +=
        valor;
    });

    bets.forEach((bet) => {
      const totalInvestment = bet.entradas.reduce(
        (sum, entry) => sum + parseFloat(entry.valor),
        0
      );

      bet.entradas.forEach((entrada) => {
        initPerson(entrada.responsavel);
        initPlatform(entrada.responsavel, entrada.conta);

        const valor = parseFloat(entrada.valor);

        // Dinheiro sai da banca para "em aposta"
        detailedBancas[entrada.responsavel][entrada.conta].banca -= valor;
        detailedBancas[entrada.responsavel][entrada.conta].emAposta += valor;
      });

      if (bet.finished && typeof bet.lucro === "number") {
        bet.entradas.forEach((entrada) => {
          const valor = parseFloat(entrada.valor);

          // O dinheiro investido sai de "em aposta"
          detailedBancas[entrada.responsavel][entrada.conta].emAposta -= valor;

          // Se for a conta vencedora, adiciona o retorno total à banca
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
