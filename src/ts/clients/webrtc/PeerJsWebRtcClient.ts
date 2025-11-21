import type { WebRtcClient } from "./WebRtcClient"
import Peer, { PeerError, PeerErrorType } from "peerjs"
import type { DataConnection, MediaConnection } from "peerjs"
import { LogService } from "../../service/LogService"

export class PeerJsWebRtcClient implements WebRtcClient {

  private peer: Peer = new Peer()

  private ownId: string | undefined

  constructor(private readonly log: LogService) {
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
    }
  }

  close() {
    this.peer.destroy()
  }


  private setUpPeer() {
    this.peer.on("open", id => {
      this.log.info("Connection successfully opened, others can now connect to you by id", id)
    })

    this.peer.on("connection", connection => {
      this.log.info("Peer connected", connection.peer, connection)

      this.connectionCreated(connection)
    })

    this.peer.on("call", (mediaConnection: MediaConnection) => {
      this.log.info(`Received call`, mediaConnection.peer, mediaConnection)
    })

    this.peer.on("error", (error: PeerError<`${PeerErrorType}`>) => {
      this.log.error("Error occurred on peer", error.type, error)
    })

    this.peer.on("disconnected", (peerId: string) => {
      this.log.info("Disconnected from Peer", peerId)
    })

    this.peer.on("error", error => {
      this.log.error("Peer error", error)
    })
  }

  private connectionCreated(connection: DataConnection) {
    connection.on("open", () => {
      this.log.info("Connected to Peer", connection.connectionId, connection.peer, connection)
      connection.send(`Gegrüßet seist du ${connection.peer}, ich sehe dich! Dein ${this.ownId}`)
    })

    connection.on("data", (data: any) => { // for now data will in our case always be a string
      this.log.info(`Received data from Peer`, connection.peer, data)
    })

    connection.on("iceStateChanged", (state: RTCIceConnectionState) => {
      this.log.debug(`ICE state changed`, state)
    })

    connection.on("error", (error: PeerError<"not-open-yet" | "message-too-big" | "negotiation-failed" | "connection-closed">) => {
      this.log.error("Error occurred on connection", connection.peer, error, connection)
    })

    connection.on("close", () => {
      this.log.info("Connection closed", connection.peer, connection)
    })
  }
}