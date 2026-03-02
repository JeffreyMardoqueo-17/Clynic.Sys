"use client"

import { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DashboardCitasSerieDto, DashboardPeriodo } from "@/types/dashboard"

type ChartAreaCitasProps = {
  serie: DashboardCitasSerieDto
  periodo: DashboardPeriodo
}

type ChartRow = {
  label: string
  totalCitas: number
  start: Date
  end: Date
}

const WEEKDAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const MONTH_LABELS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

function parseDateOnly(value: string) {
  const datePart = value.split("T")[0]
  const [year, month, day] = datePart.split("-").map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function startOfWeekMonday(date: Date) {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const result = new Date(date)
  result.setDate(date.getDate() + diff)
  return new Date(result.getFullYear(), result.getMonth(), result.getDate())
}

function endOfWeekMonday(date: Date) {
  const start = startOfWeekMonday(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

function shortDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}`
}

function formatDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const chartConfig = {
  totalCitas: {
    label: "Citas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartAreaCitas({ serie, periodo }: ChartAreaCitasProps) {
  const { data, titulo, descripcionPico } = useMemo(() => {
    if (periodo === "semanal") {
      const from = parseDateOnly(serie.fechaDesde)
      const totalsByDate = new Map<string, number>()

      for (const item of serie.serie) {
        const itemDate = parseDateOnly(item.fecha)
        totalsByDate.set(formatDateKey(itemDate), item.totalCitas)
      }

      const rows: ChartRow[] = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(from)
        date.setDate(from.getDate() + index)
        const key = formatDateKey(date)
        const weekDayIndex = (date.getDay() + 6) % 7

        return {
          label: WEEKDAY_LABELS[weekDayIndex],
          totalCitas: totalsByDate.get(key) ?? 0,
          start: date,
          end: date,
        }
      })

      return {
        data: rows,
        titulo: "Citas por día",
        descripcionPico: "Día con más citas",
      }
    }

    if (periodo === "mensual") {
      const from = parseDateOnly(serie.fechaDesde)
      const to = parseDateOnly(serie.fechaHasta)
      const totalsByDate = new Map<string, number>()

      for (const item of serie.serie) {
        const date = parseDateOnly(item.fecha)
        totalsByDate.set(formatDateKey(date), item.totalCitas)
      }

      const rows: ChartRow[] = []
      let weekIndex = 1
      let cursor = new Date(from)

      while (cursor <= to) {
        const start = new Date(cursor)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        if (end > to) {
          end.setTime(to.getTime())
        }

        let totalCitas = 0
        const dayCursor = new Date(start)
        while (dayCursor <= end) {
          totalCitas += totalsByDate.get(formatDateKey(dayCursor)) ?? 0
          dayCursor.setDate(dayCursor.getDate() + 1)
        }

        rows.push({
          label: `Semana ${weekIndex}`,
          totalCitas,
          start,
          end,
        })

        weekIndex += 1
        cursor = new Date(end)
        cursor.setDate(cursor.getDate() + 1)
      }

      return {
        data: rows,
        titulo: "Citas por semana",
        descripcionPico: "Semana con más citas",
      }
    }

    if (periodo === "anual") {
      const year = parseDateOnly(serie.fechaDesde).getFullYear()
      const monthTotals = new Array<number>(12).fill(0)

      for (const item of serie.serie) {
        const date = parseDateOnly(item.fecha)
        if (date.getFullYear() === year) {
          monthTotals[date.getMonth()] += item.totalCitas
        }
      }

      const rows: ChartRow[] = MONTH_LABELS.map((monthLabel, monthIndex) => ({
        label: monthLabel,
        totalCitas: monthTotals[monthIndex],
        start: new Date(year, monthIndex, 1),
        end: new Date(year, monthIndex + 1, 0),
      }))

      return {
        data: rows,
        titulo: "Citas por mes",
        descripcionPico: "Mes con más citas",
      }
    }

    const yearMap = new Map<string, ChartRow>()

    for (const item of serie.serie) {
      const date = parseDateOnly(item.fecha)
      const start = new Date(date.getFullYear(), 0, 1)
      const end = new Date(date.getFullYear(), 11, 31)
      const key = String(date.getFullYear())

      if (!yearMap.has(key)) {
        yearMap.set(key, {
          label: key,
          totalCitas: 0,
          start,
          end,
        })
      }

      const row = yearMap.get(key)
      if (row) {
        row.totalCitas += item.totalCitas
      }
    }

    return {
      data: Array.from(yearMap.values()).sort((a, b) => a.start.getTime() - b.start.getTime()),
      titulo: "Citas por año",
      descripcionPico: "Año con más citas",
    }
  }, [periodo, serie.serie])

  const pico = data.reduce<ChartRow>(
    (max, current) => (current.totalCitas > max.totalCitas ? current : max),
    data[0] ?? {
      label: "N/A",
      totalCitas: 0,
      start: parseDateOnly(serie.fechaDesde),
      end: parseDateOnly(serie.fechaDesde),
    }
  )

  const totalVisible = data.reduce((acc, item) => acc + item.totalCitas, 0)

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>
          Desde {parseDateOnly(serie.fechaDesde).toLocaleDateString()} hasta {parseDateOnly(serie.fechaHasta).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalVisible === 0 ? (
          <div className="rounded-md bg-muted/30 p-4 text-sm text-muted-foreground">
            No hay citas registradas en este período todavía.
          </div>
        ) : null}
        <ChartContainer config={chartConfig} className="h-70 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis allowDecimals={false} width={32} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Bar
              dataKey="totalCitas"
              fill="var(--color-totalCitas)"
              radius={[8, 8, 0, 0]}
            >
              <LabelList
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {descripcionPico}: {pico.label} ({pico.totalCitas})
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Total del período: {serie.totalPeriodo}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
