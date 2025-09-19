const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// Rota para criar uma nova transação (depósito ou saque)
router.post('/transactions', async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Nova Rota: Obter todas as transações
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ data: 1 });
        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;