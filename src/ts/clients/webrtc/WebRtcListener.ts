import type { ConnectedPeer } from "../../model/ConnectedPeer"
import { WebRtcErrorDomain } from "./WebRtcErrorDomain"

export interface WebRtcListener {

  connectionOpened(ownId: string): void

  peerConnected(peer: ConnectedPeer): void

  messageReceived(message: string, peer: ConnectedPeer): void

  peerDisconnected(peer: ConnectedPeer): void

  errorOccurred(domain: WebRtcErrorDomain, errorType: string, error: Error, peer?: ConnectedPeer): void

  disconnected(): void

}