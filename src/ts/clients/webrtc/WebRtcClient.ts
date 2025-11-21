import type { ConnectedPeer } from "../../model/ConnectedPeer"

export interface WebRtcClient {

  openForConnections(ownId: string): void

  connectTo(id: string): void

  sendMessageToAllPeers(message: string): void

  sendMessageToPeer(peer: ConnectedPeer, message: string): void

  close(): void

}