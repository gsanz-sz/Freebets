require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Conectado ao MongoDB"));

// Rotas
const betRoutes = require("./routes/betRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api", betRoutes);
app.use("/api", transactionRoutes);

// --- NOVO MIDDLEWARE DE TRATAMENTO DE ERROS ---
// Esta função irá capturar todos os erros que ocorrerem nas rotas.
// É importante que venha DEPOIS das suas rotas.
const errorHandler = (err, req, res, next) => {
  console.error("!!! ERRO CAPTURADO PELO HANDLER CENTRAL:", err.stack);
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Em ambiente de produção, não se deve enviar o 'stack' do erro.
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
