import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr"

import { getApiUrl } from "@/services/api.utils"

export type DoctorQueueRealtimeEvent = {
  idDoctor: number
  idCita: number
  evento: string
  mensaje: string
  fecha: string
}

const HUB_URL = `${getApiUrl()}/hubs/doctor-queue`

class DoctorRealtimeService {
  private connection: HubConnection | null = null

  async connect(onQueueUpdated: (payload: DoctorQueueRealtimeEvent) => void) {
    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(HUB_URL, { withCredentials: true })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(LogLevel.Warning)
        .build()
    }

    this.connection.off("doctor-queue-updated")
    this.connection.on("doctor-queue-updated", onQueueUpdated)

    if (this.connection.state === HubConnectionState.Disconnected) {
      await this.connection.start()
    }
  }

  async disconnect() {
    if (!this.connection) {
      return
    }

    this.connection.off("doctor-queue-updated")

    if (this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop()
    }
  }
}

export const doctorRealtimeService = new DoctorRealtimeService()
