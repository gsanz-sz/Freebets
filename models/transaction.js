const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    responsavel: {
        type: String,
        required: true,
    },
    plataforma: {
        type: String,
        required: true,
    },
    valor: {
        type: Number,
        required: true,
    },
    tipo: { // 'deposito' ou 'saque'
        type: String,
        required: true,
        enum: ['deposito', 'saque'],
    },
    data: {
        type: Date,
        default: Date.now,
    },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;