import type { WebRtcClient } from "./WebRtcClient"
import Peer from "peerjs"
import { LogService } from "../../service/LogService"

export class PeerJsWebRtcClient implements WebRtcClient {

  private readonly peer: Peer

  constructor(ownId: string, private readonly log: LogService) {
    this.peer = new Peer(ownId)

    this.waitForConnections()
  }


  waitForConnections() {
    this.peer.on("open", id => {
      this.log.info("Opened connection to peer", id)
    })

    this.peer.on("connection", connection => {
      this.log.info("Peer connected", typeof connection, connection)

      this.connectionOpened(connection)

      connection.send("Gegrüßet seist du Maria!")
    })
  }

  connectTo(id: string): void {
    try {
      const connection = this.peer.connect(id)

      connection.on("open", e => {
        this.log.info("Connected to Peer", e, connection.connectionId, connection.peer, connection.provider, connection.label, connection.metadata, connection.options)
        connection.send("Servus")
      })

      this.connectionOpened(connection)
    } catch (e) {
      this.log.error(`Could not connect to peer '${id}'`, e)
    }
  }

  private connectionOpened(connection: any) {
    connection.on("data", data => {
      this.log.info("Connected to Peer", data)
    })

    connection.on("error", error => {
      this.log.error("Error occurred on connection", error, connection)
    })

    connection.on("close", () => {
      this.log.info("Connection closed", connection)
    })
  }
}