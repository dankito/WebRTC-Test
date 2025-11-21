import type { ConnectedPeer } from "../../model/ConnectedPeer"
import type { DataConnection } from "peerjs"

export class ConnectedPeerState {

  constructor(readonly peer: ConnectedPeer, readonly connection: DataConnection) { }

}