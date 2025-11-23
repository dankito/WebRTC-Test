import type { WebRtcClient } from "./WebRtcClient"
import { type DataConnection, type MediaConnection, type PeerOptions } from "peerjs"
import Peer, { PeerError, PeerErrorType } from "peerjs"
import { LogService } from "../../service/LogService"
import type { WebRtcListener } from "./WebRtcListener"
import { ConnectedPeer } from "../../model/ConnectedPeer"
import { WebRtcErrorDomain } from "./WebRtcErrorDomain"
import { ConnectedPeerState } from "./ConnectedPeerState"
import { ConnectionMetadata } from "./ConnectionMetadata"

export class PeerJsWebRtcClient implements WebRtcClient {

  private static config: PeerOptions = {
    config: {
      iceServers: [
        { urls: "stun:stun.nextcloud.com:3478" },
        { urls: "stun:stun.threema.ch:3478" },
      ]
    }
  }

  private peer: Peer = new Peer(PeerJsWebRtcClient.config)

  private ownId: string | undefined

  private connectedPeers = new Map<string, ConnectedPeerState>()

  constructor(private readonly listener: WebRtcListener, private readonly log: LogService, private readonly idPrefix = "mamelodi-webrtc-test-") {
    this.setUpPeer()
  }


  openForConnections(ownId: string) {
    this.close()

    this.ownId = ownId
    this.peer = new Peer(this.addIdPrefix(ownId), PeerJsWebRtcClient.config)

    this.setUpPeer()
  }

  connectTo(id: string) {
    const idToConnectTo = this.addIdPrefix(id)

    try {
      const connection = this.peer.connect(idToConnectTo, {
        metadata: new ConnectionMetadata(id)
      })

      this.connectionCreated(connection)
    } catch (e) {
      this.log.error(`Could not connect to peer '${id}' (${idToConnectTo})`, e)
      this.listener.errorOccurred(WebRtcErrorDomain.ConnectingToPeer, "Connecting failed", e as Error, new ConnectedPeer(id))
    }
  }

  sendMessageToAllPeers(message: string) {
    this.connectedPeers.forEach(state => this.sendMessageToPeer(state.peer, message))
  }

  sendMessageToPeer(peer: ConnectedPeer, message: string) {
    this.getConnectionForPeerOrLogError(peer, connection => {
      connection.send(message)
    })
  }

  close() {
    this.peer.destroy()
  }


  private setUpPeer() {
    this.peer.on("open", id => {
      if (this.isOwnId(id)) {
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
        const peerId = error.message.replace("Could not connect to peer ", "")
        this.listener.errorOccurred(WebRtcErrorDomain.ConnectingToPeer, "PeerWithIdNotAvailable", error, new ConnectedPeer(this.stripIdPrefix(peerId)))
      } else if (error.type == PeerErrorType.UnavailableID) {
        this.listener.errorOccurred(WebRtcErrorDomain.Connecting, "IdIsAlreadyTaken", error)
      } else if (error.type == PeerErrorType.InvalidID) {
        this.listener.errorOccurred(WebRtcErrorDomain.Connecting, "IdContainsInvalidCharacters", error)
      } else {
        this.listener.errorOccurred(WebRtcErrorDomain.Connection, error.type, error)
      }
    })

    this.peer.on("disconnected", (id: string) => {
      if (this.isOwnId(id)) {
        this.listener.disconnected()
      } else {
        this.log.warn("Disconnected from unknown Peer ID", this.stripIdPrefix(id), id)
      }
    })
  }

  private connectionCreated(connection: DataConnection) {
    const prefixedId = connection.peer
    const peerId = this.getPeerId(connection)

    connection.on("open", () => {
      const peer = new ConnectedPeer(peerId)
      this.connectedPeers.set(peerId, new ConnectedPeerState(peer, connection))
      this.listener.peerConnected(peer)

      connection.send(`Gegrüßet seist du ${peerId}, ich sehe dich! Dein(e) ${this.ownId}`)
    })

    connection.on("data", (data: any) => { // for now data will in our case always be a string
      this.listener.messageReceived(data, this.getPeerForConnection(connection))
    })

    connection.on("iceStateChanged", (state: RTCIceConnectionState) => {
      this.log.debug(`ICE state changed`, state)
    })

    connection.on("error", (error: PeerError<"not-open-yet" | "message-too-big" | "negotiation-failed" | "connection-closed">) => {
      this.log.error("Error occurred on connection", prefixedId, peerId, error, connection)

      this.listener.errorOccurred(WebRtcErrorDomain.ErrorOnConnectionToPeer, error.type, error, this.getPeerForConnection(connection))

      // TODO: remove peer from connectedPeers then?
    })

    connection.on("close", () => {
      this.listener.peerDisconnected(this.getPeerForConnection(connection))

      this.connectedPeers.delete(peerId)
    })
  }


  private addIdPrefix(id: string): string {
    return this.idPrefix + id
  }

  private stripIdPrefix(id: string): string {
    if (id.startsWith(this.idPrefix)) {
      return id.substring(this.idPrefix.length)
    } else {
      return id
    }
  }

  private isOwnId(peerId: string): boolean {
    return this.stripIdPrefix(peerId) === this.ownId
  }

  private getPeerId(connection: DataConnection): string {
    if (connection.metadata instanceof ConnectionMetadata && connection.metadata?.peerId) {
      return connection.metadata.peerId
    }

    return this.stripIdPrefix(connection.peer)
  }


  private getPeerForConnection(connection: DataConnection): ConnectedPeer {
    return this.getPeerForId(this.getPeerId(connection))
  }

  private getPeerForId(peerId: string): ConnectedPeer {
    return this.connectedPeers.get(peerId)!!.peer
  }

  private getConnectionForPeerOrLogError(peer: ConnectedPeer, found: (connection: DataConnection) => void) {
    const state = this.connectedPeers.get(peer.id)
    if (state == null) {
      this.log.error(`No connected peer with id '${peer.id}' found. Connected peers: ${this.connectedPeers.keys()}`)
    } else {
      found(state.connection)
    }
  }

}