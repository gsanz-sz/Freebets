require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const betRoutes = require("./routes/betRoutes"); // Importa as rotas
const cors = require("cors");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

// Usando as rotas
app.use("/api", betRoutes);
app.use("/api", transactionRoutes); // Usando a nova rota

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
