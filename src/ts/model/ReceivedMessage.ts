import type { ConnectedPeer } from "./ConnectedPeer"
import type { ReceivedMessageType } from "./ReceivedMessageType"

export class ReceivedMessage {

  constructor(
    readonly timestamp: Date,
    readonly type: ReceivedMessageType,
    readonly message: string,
    readonly peer?: ConnectedPeer,
  ) { }

}