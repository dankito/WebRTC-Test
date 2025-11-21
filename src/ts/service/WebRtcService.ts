import type { WebRtcClient } from "../clients/webrtc/WebRtcClient"
import { PeerJsWebRtcClient } from "../clients/webrtc/PeerJsWebRtcClient"
import type { LogService } from "./LogService"

export class WebRtcService {

  private readonly client: WebRtcClient

  constructor(private readonly log: LogService) {
    this.client = new PeerJsWebRtcClient(log)
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