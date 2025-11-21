import type { WebRtcClient } from "./WebRtcClient"
import type { DataConnection, MediaConnection } from "peerjs"
import Peer, { PeerError, PeerErrorType } from "peerjs"
import { LogService } from "../../service/LogService"
import type { WebRtcListener } from "./WebRtcListener"
import { ConnectedPeer } from "../../model/ConnectedPeer"
import { WebRtcErrorDomain } from "./WebRtcErrorDomain"
import { ConnectedPeerState } from "./ConnectedPeerState"

export class PeerJsWebRtcClient implements WebRtcClient {

  private peer: Peer = new Peer()

  private ownId: string | undefined

  private connectedPeers = new Map<string, ConnectedPeerState>()

  constructor(private readonly listener: WebRtcListener, private readonly log: LogService) {
    this.setUpPeer()
  }


  openForConnections(ownId: string) {
    this.close()

    this.ownId = ownId
    this.peer = new Peer(ownId)

    this.setUpPeer()
  }

  connectTo(id: string) {
    try {
      const connection = this.peer.connect(id)

      this.connectionCreated(connection)
    } catch (e) {
      this.log.error(`Could not connect to peer '${id}'`, e)
      this.listener.errorOccurred(WebRtcErrorDomain.ConnectingToPeer, "Connecting failed", e as Error, new ConnectedPeer(id))
    }
  }

  close() {
    this.peer.destroy()
  }


  private setUpPeer() {
    this.peer.on("open", id => {
      if (id === this.ownId) {
        this.listener.connectionOpened(id)
      }
    })

    this.peer.on("connection", connection => {
      this.connectionCreated(connection)
    })

    this.peer.on("call", (mediaConnection: MediaConnection) => {
      this.log.info(`Received call`, mediaConnection.peer, mediaConnection)
    })

    this.peer.on("error", (error: PeerError<`${PeerErrorType}`>) => {
      this.log.error("Error occurred on peer", error.type, error.name, error.message, error)

      if (error.type == PeerErrorType.PeerUnavailable) {
        this.listener.errorOccurred(WebRtcErrorDomain.ConnectingToPeer, "PeerWithIdNotAvailable", error, new ConnectedPeer(error.message.replace("Could not connect to peer ", "")))
      } else if (error.type == PeerErrorType.UnavailableID) {
        this.listener.errorOccurred(WebRtcErrorDomain.Connecting, "IdIsAlreadyTaken", error)
      } else if (error.type == PeerErrorType.InvalidID) {
        this.listener.errorOccurred(WebRtcErrorDomain.Connecting, "IdContainsInvalidCharacters", error)
      } else {
        this.listener.errorOccurred(WebRtcErrorDomain.Connection, error.type, error)
      }
    })

    this.peer.on("disconnected", (peerId: string) => {
      if (peerId == this.ownId) {
        this.listener.disconnected()
      } else {
        this.log.warn("Disconnected from unknown Peer ID", peerId)
      }
    })
  }

  private connectionCreated(connection: DataConnection) {
    connection.on("open", () => {
      const peer = new ConnectedPeer(connection.peer)
      this.connectedPeers.set(connection.peer, new ConnectedPeerState(peer, connection))
      this.listener.peerConnected(peer)

      connection.send(`Gegrüßet seist du ${connection.peer}, ich sehe dich! Dein ${this.ownId}`)
    })

    connection.on("data", (data: any) => { // for now data will in our case always be a string
      this.listener.messageReceived(data, this.getPeerForConnection(connection))
    })

    connection.on("iceStateChanged", (state: RTCIceConnectionState) => {
      this.log.debug(`ICE state changed`, state)
    })

    connection.on("error", (error: PeerError<"not-open-yet" | "message-too-big" | "negotiation-failed" | "connection-closed">) => {
      this.log.error("Error occurred on connection", connection.peer, error, connection)

      this.listener.errorOccurred(WebRtcErrorDomain.ErrorOnConnectionToPeer, error.type, error, this.getPeerForConnection(connection))

      // TODO: remove peer from connectedPeers then?
    })

    connection.on("close", () => {
      this.listener.peerDisconnected(this.getPeerForConnection(connection))

      this.connectedPeers.delete(connection.peer)
    })
  }

  private getPeerForConnection(connection: DataConnection): ConnectedPeer {
    return this.getPeerForId(connection.peer)
  }

  private getPeerForId(peerId: string): ConnectedPeer {
    return this.connectedPeers.get(peerId)!!.peer
  }

}