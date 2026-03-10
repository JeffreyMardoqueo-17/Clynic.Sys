import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr"

import { getApiUrl } from "@/services/api.utils"

export type DoctorQueueRealtimeEvent = {
  idDoctor: number
  idCita: number
  evento: string
  mensaje: string
  fecha: string
}

export type AppointmentRealtimeEvent = {
  idClinica: number
  idSucursal: number
  idCita: number
  evento: string
  mensaje: string
  fecha: string
}

const HUB_URL = `${getApiUrl()}/hubs/doctor-queue`

class DoctorRealtimeService {
  private connection: HubConnection | null = null
  private startingPromise: Promise<void> | null = null

  async connect(
    onQueueUpdated?: (payload: DoctorQueueRealtimeEvent) => void,
    onAppointmentUpdated?: (payload: AppointmentRealtimeEvent) => void
  ) {
    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(HUB_URL, { withCredentials: true })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(LogLevel.Warning)
        .build()
    }

    this.connection.off("doctor-queue-updated")
    if (onQueueUpdated) {
      this.connection.on("doctor-queue-updated", onQueueUpdated)
    }

    this.connection.off("appointment-updated")
    if (onAppointmentUpdated) {
      this.connection.on("appointment-updated", onAppointmentUpdated)
    }

    if (this.connection.state === HubConnectionState.Connected || this.connection.state === HubConnectionState.Connecting) {
      return
    }

    if (!this.startingPromise) {
      this.startingPromise = this.connection.start().finally(() => {
        this.startingPromise = null
      })
    }

    try {
      await this.startingPromise
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!message.includes("before stop() was called")) {
        throw error
      }
    }
  }

  async disconnect() {
    if (!this.connection) {
      return
    }

    this.connection.off("doctor-queue-updated")
    this.connection.off("appointment-updated")

    if (this.connection.state === HubConnectionState.Connecting) {
      return
    }

    if (this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop()
    }
  }
}

export const doctorRealtimeService = new DoctorRealtimeService()
