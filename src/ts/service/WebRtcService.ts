import type { WebRtcClient } from "../clients/webrtc/WebRtcClient"
import { PeerJsWebRtcClient } from "../clients/webrtc/PeerJsWebRtcClient"
import type { LogService } from "./LogService"
import type { WebRtcListener } from "../clients/webrtc/WebRtcListener"
import type { ConnectedPeer } from "../model/ConnectedPeer"

export class WebRtcService {

  private readonly client: WebRtcClient

  constructor(listener: WebRtcListener, private readonly log: LogService) {
    this.client = new PeerJsWebRtcClient(listener, log)
  }


  openForConnections(ownId: string) {
    this.client.openForConnections(ownId)
  }

  connectTo(id: string) {
    this.client.connectTo(id)
  }

  sendMessageToAllPeers(message: string) {
    this.client.sendMessageToAllPeers(message)
  }

  sendMessageToPeer(peer: ConnectedPeer, message: string) {
    this.client.sendMessageToPeer(peer, message)
  }

  close() {
    this.client.close()
  }

}