const express = require('express');
const mongoose = require('mongoose');
const betRoutes = require('./routes/betRoutes'); // Importa as rotas
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dbURI = 'mongodb+srv://admin:admin@freebet.zgzqjvm.mongodb.net/?retryWrites=true&w=majority&appName=Freebet';

mongoose.connect(dbURI)
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
  .catch(err => console.error('Erro ao conectar com o banco de dados:', err));

// Usando as rotas
app.use('/api', betRoutes);
app.use('/api', transactionRoutes); // Usando a nova rota

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});