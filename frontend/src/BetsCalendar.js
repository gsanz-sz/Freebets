import React, { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // Para o clique nos eventos
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import BetDetailsModal from "./BetDetailsModal";

// --- COMPONENTE PARA RENDERIZAR O CARD DA APOSTA ---
// O FullCalendar nos dá mais controle sobre o HTML do evento.
const renderEventoAposta = (eventInfo) => {
  const { bet } = eventInfo.event.extendedProps;
  const valorTotal = bet.entradas.reduce((sum, entry) => sum + entry.valor, 0);
  const isFinished = bet.finished;
  const lucro = bet.lucro;
  const corLucro = lucro >= 0 ? "lucro-positivo" : "lucro-negativo";

  return (
    <div className={`evento-aposta ${isFinished ? "finalizada" : "pendente"}`}>
      <strong>{bet.nomeAposta}</strong>
      {isFinished ? (
        <p>
          R$ {valorTotal.toFixed(2)} -{" "}
          <span className={corLucro}>R$ {lucro.toFixed(2)}</span>
        </p>
      ) : (
        <p>R$ {valorTotal.toFixed(2)}</p>
      )}
    </div>
  );
};

function BetsCalendar({ bets, onFinishBet, onDeleteBet, onUpdateBetEntry }) {
  const [selectedBet, setSelectedBet] = useState(null);

  // Formata as apostas para o formato que o FullCalendar entende
  const eventos = useMemo(() => {
    return bets.map((bet) => ({
      id: bet._id,
      title: bet.nomeAposta,
      date: bet.data,
      extendedProps: {
        // Guarda a aposta completa aqui
        bet: bet,
      },
    }));
  }, [bets]);

  // Função para abrir o modal ao clicar em um evento
  const handleEventClick = (clickInfo) => {
    setSelectedBet(clickInfo.event.extendedProps.bet);
  };

  return (
    <div className="calendario-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={ptBrLocale}
        events={eventos}
        eventContent={renderEventoAposta} // Usa nossa função para renderizar o card
        eventClick={handleEventClick} // Ação de clique
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        height="auto" // <-- A MÁGICA ACONTECE AQUI!
      />

      {selectedBet && (
        <BetDetailsModal
          bet={selectedBet}
          onClose={() => setSelectedBet(null)}
          onFinishBet={onFinishBet}
          onDeleteBet={onDeleteBet}
          onUpdateBetEntry={onUpdateBetEntry}
        />
      )}
    </div>
  );
}

export default BetsCalendar;
