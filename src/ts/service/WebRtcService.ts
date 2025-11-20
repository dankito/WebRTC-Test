import type { WebRtcClient } from "../clients/webrtc/WebRtcClient"
import { PeerJsWebRtcClient } from "../clients/webrtc/PeerJsWebRtcClient"

export class WebRtcService {

  private readonly client: WebRtcClient

  constructor(ownId: string) {
    this.client = new PeerJsWebRtcClient(ownId)
  }


  connectTo(id: string) {
    this.client.connectTo(id)
  }

}