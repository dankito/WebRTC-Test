<script lang="ts">
  import { WebRtcService } from "../../ts/service/WebRtcService"
  import { DI } from "../../ts/service/DI"
  import TextInput from "../common/forms/TextInput.svelte"
  import Button from "../common/forms/Button.svelte"
  import { onMount } from "svelte"
  import Card from "../common/forms/Card.svelte"
  import SectionHeader from "../common/forms/SectionHeader.svelte"
  import type { WebRtcListener } from "../../ts/clients/webrtc/WebRtcListener"
  import type { ConnectedPeer } from "../../ts/model/ConnectedPeer"
  import { WebRtcErrorDomain } from "../../ts/clients/webrtc/WebRtcErrorDomain"

  let isConnected: boolean = $state(false)

  let ownId: string = $state("")
  let openButtonDisabled: boolean = $derived(ownId.trim().length == 0)

  let idToConnectTo: string = $state("")
  let connectButtonDisabled: boolean = $derived(isConnected == false || idToConnectTo.trim().length == 0)

  let connectedPeers: ConnectedPeer[] = $state([])
  let noPeersConnected: boolean = $derived(connectedPeers.length == 0)

  let receivedMessages: string[] = $state([])

  let messageToSend: string = $state("")

  const log = DI.log

  const listener: WebRtcListener = {
    connectionOpened(ownId: string): void {
      isConnected = true
      receivedMessage(`Connection successfully opened, others can now connect to you by id '${ownId}'`)
    },

    peerConnected(peer: ConnectedPeer): void {
      connectedPeers.push(peer)
      receivedMessage(`Peer connected: ${peer}`)
    },

    messageReceived(message: string, peer: ConnectedPeer): void {
      receivedMessage(`Received message from '${peer}': ${message}`)
    },

    peerDisconnected(peer: ConnectedPeer): void {
      connectedPeers = connectedPeers.filter(it => it != peer)
      receivedMessage(`Peer disconnected: ${peer}`)
    },

    errorOccurred(domain: WebRtcErrorDomain, errorType: string, error: Error, peer?: ConnectedPeer): void {
      if (domain == WebRtcErrorDomain.Connecting) {
        if (errorType == "IdIsAlreadyTaken") {
          receivedMessage("This ID is already taken, please choose another.")
        } else if (errorType == "IdContainsInvalidCharacters") {
          receivedMessage("This ID contains invalid characters (like Umlaute etc.), please choose another.")
        } else {
          receivedMessage(`Connecting failed with error type '${errorType}': ${error}`)
        }
      } else if (domain == WebRtcErrorDomain.Connection) {
        receivedMessage(`Connection error of type '${errorType}' occurred: ${error}`)
      } else if (domain == WebRtcErrorDomain.ConnectingToPeer) {
        if (errorType == "PeerWithIdNotAvailable") {
          receivedMessage(`Peer with ID '${peer}' is not available.`)
        } else {
          receivedMessage(`Could not connect to peer '${peer}: ${error}`)
        }
      } else if (domain == WebRtcErrorDomain.ErrorOnConnectionToPeer) {
        receivedMessage(`Error of type '${errorType}' occurred on connection to peer '${peer}': ${error}`)
      }
    },

    disconnected(): void {
      isConnected = false
      connectedPeers = []
      receivedMessage("Disconnected. Sending and receiving messages is not possible anymore.")
    },
  }

  let webRtc = new WebRtcService(listener, log)


  onMount(() => {
    return () => {
      webRtc.close()
    }
  })

  function openForConnections() {
    webRtc.openForConnections(ownId)
  }

  function disconnect() {
    webRtc.close()
  }

  function connectTo() {
    webRtc.connectTo(idToConnectTo)
  }

  function sendMessage() {
    if (messageToSend.trim().length > 0) {
      webRtc.sendMessageToAllPeers(messageToSend)

      messageToSend = ""
    }
  }

  function receivedMessage(message: string) {
    receivedMessages.push(message)
  }
</script>


<div class="w-full h-full flex flex-col items-center justify-center p-2">
  <div class="w-full max-w-[500px] mx-auto h-fit bg-white rounded-xl p-2">
    {#if isConnected === false}
      <div class="flex items-center h-10 my-1">
        <div class="shrink-0 w-[74px] md:w-[92px] mr-2">Set your ID</div>
        <TextInput inputClasses="grow min-w-0 h-full" placeholder="ID by which others can connect to you" bind:value={ownId} onEnterPressed={openForConnections} />
        <Button title="Open" classes="shrink-0 !w-[105px] md:!w-[115px] h-10 ml-2" disabled={openButtonDisabled} onClick={openForConnections} />
      </div>
    {:else}
      <div class="flex items-center justify-end h-10 my-1">
        <Button title="Close" classes="w-[105px] md:w-[115px] h-10" onClick={disconnect} />
      </div>
    {/if}

    <div class="flex items-center h-10 my-1">
      <div class="shrink-0 w-[74px] md:w-[92px] mr-2">Connect to</div>
      <TextInput inputClasses="grow min-w-0 h-full" bind:value={idToConnectTo} placeholder={ isConnected ? "Peer ID" : "Connect first" } onEnterPressed={connectTo} />
      <Button title="Connect" classes="shrink-0 w-[105px] md:w-[115px] h-10 ml-2" disabled={connectButtonDisabled} onClick={connectTo} />
    </div>
  </div>

  <Card classes="w-full max-w-[500px] mt-4 px-3">
    <div class="flex flex-col">
      <SectionHeader title="Messages" addTopMargin={false} classes="mt-1" />

      <div class="w-full min-h-4 max-h-[70dvh] flex flex-col gap-2 mt-0.5 overflow-y-auto">
        {#each receivedMessages as message, index (index)}
          <div class="max-w-[90%] bg-[#f1f1f1] rounded-lg px-4 py-2">
            { message }
          </div>
        {/each}
      </div>

      <div class="w-full mt-2 mb-3.5 flex items-center">
        <TextInput inputClasses="grow min-w-0 h-full" bind:value={messageToSend} disabled={noPeersConnected} onEnterPressed={sendMessage}
                   placeholder={ noPeersConnected ? "Connect to a peer first" : "Send message to all connected peers" } />
        <Button title="Send" classes="shrink-0 w-[105px] md:w-[115px] h-10 ml-2" disabled={noPeersConnected || messageToSend.trim().length === 0} onClick={sendMessage} />
      </div>
    </div>
  </Card>
</div>