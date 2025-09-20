// A URL base da nossa API. Se um dia mudar, só alteramos aqui.
const API_BASE_URL = "http://localhost:3000/api";

/**
 * Função auxiliar para lidar com as respostas do fetch.
 * Se a resposta não for 'ok', ela tenta extrair a mensagem de erro do corpo da resposta.
 * Se for 'ok', ela retorna o JSON.
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    console.error("!!! Erro retornado pela API:", data);
    throw new Error(data.message || "Ocorreu um erro na chamada da API");
  }
  return data;
};

// --- Funções para Apostas (Bets) ---

export const getBets = async () => {
  console.log(">>> [API Service] Buscando todas as apostas...");
  const response = await fetch(`${API_BASE_URL}/bets`);
  return handleResponse(response);
};

export const createBet = async (betData) => {
  console.log(">>> [API Service] Criando nova aposta:", betData);
  const response = await fetch(`${API_BASE_URL}/bets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(betData),
  });
  return handleResponse(response);
};

export const deleteBet = async (betId) => {
  console.log(`>>> [API Service] Deletando aposta com ID: ${betId}`);
  const response = await fetch(`${API_BASE_URL}/bets/${betId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
};

export const finishBet = async (betId, finishData) => {
  console.log(
    `>>> [API Service] Finalizando aposta ${betId} com dados:`,
    finishData
  );
  const response = await fetch(`${API_BASE_URL}/bets/finish/${betId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(finishData),
  });
  return handleResponse(response);
};

export const adjustBet = async (betId, adjustData) => {
  console.log(
    `>>> [API Service] Ajustando aposta ${betId} com dados:`,
    adjustData
  );
  const response = await fetch(`${API_BASE_URL}/bets/adjust/${betId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adjustData),
  });
  return handleResponse(response);
};

// --- Funções para Transações ---

export const createTransaction = async (transactionData) => {
  console.log(">>> [API Service] Criando nova transação:", transactionData);
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transactionData),
  });
  return handleResponse(response);
};

// --- Funções para Estatísticas (Stats) ---

export const getStats = async () => {
  console.log(">>> [API Service] Buscando estatísticas gerais...");
  const response = await fetch(`${API_BASE_URL}/stats`);
  return handleResponse(response);
};

export const getDetailedBancas = async () => {
  console.log(">>> [API Service] Buscando bancas detalhadas...");
  const response = await fetch(`${API_BASE_URL}/stats/detailed-bancas`);
  return handleResponse(response);
};

export const getDetailedBancasByPerson = async () => {
  console.log(">>> [API Service] Buscando bancas detalhadas por pessoa...");
  const response = await fetch(
    `${API_BASE_URL}/stats/detailed-bancas-by-person`
  );
  return handleResponse(response);
};

export const getHistory = async () => {
  console.log(">>> [API Service] Buscando histórico da banca...");
  const response = await fetch(`${API_BASE_URL}/stats/history`);
  return handleResponse(response);
};

export const getDailyProfit = async () => {
  console.log(">>> [API Service] Buscando lucro do dia...");
  const response = await fetch(`${API_BASE_URL}/stats/daily-profit`);
  return handleResponse(response);
};
