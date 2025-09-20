import React, { useEffect, useState } from "react";
import * as apiService from "./apiService";

const ValorDisplay = ({ valor, label = "Lucro/Prejuízo" }) => {
  const cor = valor > 0 ? "valor-positivo" : valor < 0 ? "valor-negativo" : "";
  const sinal = valor > 0 ? "+" : "";
  return (
    <div className="info-performance">
      <span>{label}:</span>
      <span className={`valor ${cor}`}>
        {sinal} R$ {valor.toFixed(2)}
      </span>
    </div>
  );
};

function Performance() {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculatePerformance = async () => {
      try {
        const bets = await apiService.getBets();
        const performanceByPlatform = {};

        const finishedBets = bets.filter((bet) => bet.finished);

        finishedBets.forEach((bet) => {
          // **USA O DADO CORRETO ENVIADO PELO FORMULÁRIO**
          const primaryPlatform = bet.plataformaPrincipal;

          // Pula apostas antigas que não têm esse campo
          if (!primaryPlatform) return;

          // Inicializa o objeto da plataforma se for a primeira vez
          if (!performanceByPlatform[primaryPlatform]) {
            performanceByPlatform[primaryPlatform] = {
              lucro: 0,
              totalApostado: 0,
            };
          }

          // **CÁLCULO EXATO DO LUCRO**
          let betProfit = 0;
          if (bet.lucro !== undefined) {
            betProfit = bet.lucro;
          }

          // Calcula o total apostado na operação inteira
          const totalStakedInBet = bet.entradas.reduce(
            (sum, entry) => sum + entry.valor,
            0
          );

          // Acumula os valores na plataforma principal
          performanceByPlatform[primaryPlatform].totalApostado +=
            totalStakedInBet;
          performanceByPlatform[primaryPlatform].lucro += betProfit;
        });

        // Calcula o ROI
        for (const conta in performanceByPlatform) {
          const plataforma = performanceByPlatform[conta];
          if (plataforma.totalApostado > 0) {
            plataforma.roi =
              (plataforma.lucro / plataforma.totalApostado) * 100;
          } else {
            plataforma.roi = 0;
          }
        }

        setPerformanceData(performanceByPlatform);
      } catch (error) {
        console.error("Erro ao calcular desempenho:", error);
      } finally {
        setLoading(false);
      }
    };

    calculatePerformance();
  }, []);

  if (loading) {
    return <div>Calculando desempenho...</div>;
  }

  if (!performanceData || Object.keys(performanceData).length === 0) {
    return <div>Nenhuma aposta finalizada para exibir o desempenho.</div>;
  }

  return (
    <div className="performance-container">
      <h1>Desempenho por Plataforma</h1>
      <div className="performance-grid">
        {Object.entries(performanceData)
          .sort(([, a], [, b]) => b.lucro - a.lucro)
          .map(([conta, dados]) => (
            <div className="card-performance" key={conta}>
              <h3>{conta}</h3>
              <ValorDisplay valor={dados.lucro} />
              <div className="info-performance-secondary">
                <span>ROI:</span>
                <span
                  className={`valor ${
                    dados.roi > 0
                      ? "valor-positivo"
                      : dados.roi < 0
                      ? "valor-negativo"
                      : ""
                  }`}
                >
                  {dados.roi.toFixed(2)}%
                </span>
              </div>
              <div className="info-performance-secondary">
                <span>Total Apostado:</span>
                <span>R$ {dados.totalApostado.toFixed(2)}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Performance;
