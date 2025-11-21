import type { WebRtcClient } from "../clients/webrtc/WebRtcClient"
import { PeerJsWebRtcClient } from "../clients/webrtc/PeerJsWebRtcClient"
import type { LogService } from "./LogService"
import type { WebRtcListener } from "../clients/webrtc/WebRtcListener"

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

  close() {
    this.client.close()
  }

}