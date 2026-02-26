"use client"

import { useMemo, useState } from "react"
import moment from "moment"
import { Calendar, momentLocalizer, View } from "react-big-calendar"
import { CitaResponseDto } from "@/types/cita"
import { SucursalResponseDto } from "@/types/sucursal"

moment.locale("es")
const localizer = momentLocalizer(moment)

type AppointmentBigCalendarProps = {
  citas: CitaResponseDto[]
  sucursales: SucursalResponseDto[]
  onSelectCita?: (cita: CitaResponseDto) => void
}

type CalendarCitaEvent = {
  id: number
  title: string
  start: Date
  end: Date
  estado: number
  resource: CitaResponseDto
}

function estadoClassName(estado: number) {
  if (estado === 1) return "calendar-event-pendiente"
  if (estado === 2) return "calendar-event-confirmada"
  if (estado === 3) return "calendar-event-cancelada"
  if (estado === 4) return "calendar-event-completada"
  return ""
}

export function AppointmentBigCalendar({ citas, sucursales, onSelectCita }: AppointmentBigCalendarProps) {
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  const [calendarView, setCalendarView] = useState<View>("week")

  const events = useMemo<CalendarCitaEvent[]>(() => {
    return citas.map((cita) => {
      const inicio = new Date(cita.fechaHoraInicioPlan)
      const fin = new Date(cita.fechaHoraFinPlan)
      const sucursalNombre = sucursales.find((sucursal) => sucursal.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`

      return {
        id: cita.id,
        title: `${cita.nombrePaciente} · ${sucursalNombre}`,
        start: inicio,
        end: fin,
        estado: cita.estado,
        resource: cita,
      }
    })
  }, [citas, sucursales])

  return (
    <div className="calendar-shell h-192">
      <Calendar<CalendarCitaEvent>
        localizer={localizer}
        events={events}
        date={calendarDate}
        onNavigate={(nextDate: Date) => setCalendarDate(nextDate)}
        view={calendarView}
        onView={(nextView: View) => setCalendarView(nextView)}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        defaultView="week"
        views={["month", "week", "day", "agenda"]}
        popup
        step={30}
        timeslots={2}
        min={new Date(1970, 1, 1, 6, 0, 0)}
        max={new Date(1970, 1, 1, 21, 0, 0)}
        messages={{
          allDay: "Todo el día",
          previous: "Anterior",
          next: "Siguiente",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Cita",
          showMore: (total: number) => `+${total} más`,
        }}
        formats={{
          timeGutterFormat: "HH:mm",
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture, localizerInstance) =>
            `${(localizerInstance ?? localizer).format(start, "HH:mm", culture)} - ${(localizerInstance ?? localizer).format(end, "HH:mm", culture)}`,
          dayHeaderFormat: "dddd DD/MM",
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }, culture, localizerInstance) =>
            `${(localizerInstance ?? localizer).format(start, "DD MMM", culture)} - ${(localizerInstance ?? localizer).format(end, "DD MMM", culture)}`,
          agendaDateFormat: "ddd DD/MM",
          agendaTimeFormat: "HH:mm",
        }}
        eventPropGetter={(event: CalendarCitaEvent) => ({
          className: `calendar-event ${estadoClassName(event.estado)}`,
        })}
        onSelectEvent={(event: CalendarCitaEvent) => onSelectCita?.(event.resource)}
      />
    </div>
  )
}
