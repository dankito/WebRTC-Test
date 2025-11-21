export interface WebRtcClient {

  openForConnections(ownId: string): void

  connectTo(id: string): void

  close(): void

}