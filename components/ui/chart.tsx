"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    color?: string
  }
>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none",
          className
        )}
        style={
          Object.entries(config).reduce((acc, [key, value]) => {
            if (value?.color) {
              acc[`--color-${key}`] = value.color
            }
            return acc
          }, {} as Record<string, string>) as React.CSSProperties
        }
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
}: {
  active?: boolean
  payload?: Array<{
    dataKey?: string | number
    name?: React.ReactNode
    value?: string | number
    color?: string
    payload?: Record<string, unknown>
  }>
  className?: string
  hideLabel?: boolean
  indicator?: "line" | "dot" | "dashed"
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  const rawFecha = payload[0]?.payload?.fecha
  const fechaTooltip =
    typeof rawFecha === "string" || typeof rawFecha === "number"
      ? new Date(rawFecha).toLocaleDateString()
      : null

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {payload.map((item) => {
        const dataKey = String(item.dataKey ?? "")
        const itemConfig = config[dataKey]

        return (
          <div key={dataKey} className="flex w-full items-center gap-2">
            <div
              className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                "h-2.5 w-2.5": indicator === "dot",
                "w-1": indicator === "line",
                "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
              })}
              style={
                {
                  "--color-bg": item.color,
                  "--color-border": item.color,
                } as React.CSSProperties
              }
            />
            <div className="flex flex-1 items-center justify-between gap-2 leading-none">
              <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
              <span className="font-mono font-medium text-foreground">{item.value}</span>
            </div>
          </div>
        )
      })}

      {!hideLabel && fechaTooltip && (
        <p className="text-[10px] text-muted-foreground">
          {fechaTooltip}
        </p>
      )}
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
