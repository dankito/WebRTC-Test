import type { WebRtcClient } from "./WebRtcClient"
import Peer from "peerjs"

export class PeerJsWebRtcClient implements WebRtcClient {

  private readonly peer: Peer

  constructor(ownId: string) {
    this.peer = new Peer(ownId)

    this.waitForConnections()
  }


  waitForConnections() {
    this.peer.on("open", id => {
      console.log("Opened connection to peer", id)
    })

    this.peer.on("connection", connection => {
      console.log("Peer connected", typeof connection, connection)

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
      console.log(`Could not connect to peer '${id}'`, e)
    }
  }

  private connectionOpened(connection: any) {
    connection.on("data", data => {
      console.log("Connected to Peer", data)
    })

    connection.on("error", error => {
      console.error("Error occurred on connection", error, connection)
    })

    connection.on("close", () => {
      console.log("Connection closed", connection)
    })
  }
}