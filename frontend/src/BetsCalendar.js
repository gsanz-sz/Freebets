import React, { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import BetDetailsModal from "./BetDetailsModal";

const renderEventoAposta = (eventInfo) => {
  const { bet } = eventInfo.event.extendedProps;
  const valorTotal = bet.entradas.reduce((sum, entry) => sum + entry.valor, 0);
  const isFinished = bet.finished;
  const lucro = bet.lucro;
  const corLucro = lucro >= 0 ? "lucro-positivo" : "lucro-negativo";

  // Usa o campo 'createdAt' para uma hora fiável, livre de fuso horário
  const dataCriacao = new Date(bet.createdAt);
  const horaFormatada = dataCriacao.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dataFormatada = dataCriacao.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className={`evento-aposta ${isFinished ? "finalizada" : "pendente"}`}>
      <div className="evento-header">
        <strong>{bet.nomeAposta}</strong>
        <span className="evento-hora">
          {dataFormatada} - {horaFormatada}
        </span>
      </div>
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

  const eventos = useMemo(() => {
    return bets.map((bet) => ({
      id: bet._id,
      title: bet.nomeAposta,
      date: bet.data, // Agora, o FullCalendar vai ler a string 'AAAA-MM-DD'
      extendedProps: { bet: bet },
    }));
  }, [bets]);

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
        eventContent={renderEventoAposta}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        height="auto"
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
