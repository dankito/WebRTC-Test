<script lang="ts">
  import { WebRtcService } from "../../ts/service/WebRtcService"
  import { DI } from "../../ts/service/DI"
  import TextInput from "../common/forms/TextInput.svelte"
  import Button from "../common/forms/Button.svelte"
  import { onMount } from "svelte"
  import Card from "../common/forms/Card.svelte"
  import SectionHeader from "../common/forms/SectionHeader.svelte"
  import type { WebRtcListener } from "../../ts/clients/webrtc/WebRtcListener"
  import { ConnectedPeer } from "../../ts/model/ConnectedPeer"
  import { WebRtcErrorDomain } from "../../ts/clients/webrtc/WebRtcErrorDomain"
  import { ReceivedMessage } from "../../ts/model/ReceivedMessage"
  import { ReceivedMessageType } from "../../ts/model/ReceivedMessageType"

  let isConnected: boolean = $state(false)

  let ownId: string = $state("")
  let openButtonDisabled: boolean = $derived(ownId.trim().length == 0)

  let idToConnectTo: string = $state("")
  let connectButtonDisabled: boolean = $derived(isConnected == false || idToConnectTo.trim().length == 0)

  let connectedPeers: ConnectedPeer[] = $state([])
  let noPeersConnected: boolean = $derived(connectedPeers.length == 0)

  let receivedMessages: ReceivedMessage[] = $state([])

  let messageToSend: string = $state("")

  const log = DI.log

  const listener: WebRtcListener = {
    connectionOpened(ownId: string): void {
      isConnected = true
      receivedMessage(ReceivedMessageType.Info, `Connection successfully opened, others can now connect to you by id '${ownId}'`)
    },

    peerConnected(peer: ConnectedPeer): void {
      connectedPeers.push(peer)
      receivedMessage(ReceivedMessageType.Info, `Peer connected: ${peer}`, peer)
    },

    messageReceived(message: string, peer: ConnectedPeer): void {
      receivedMessage(ReceivedMessageType.MessageFromPeer, message, peer)
    },

    peerDisconnected(peer: ConnectedPeer): void {
      connectedPeers = connectedPeers.filter(it => it != peer)
      receivedMessage(ReceivedMessageType.Info, `Peer disconnected: ${peer}`, peer)
    },

    errorOccurred(domain: WebRtcErrorDomain, errorType: string, error: Error, peer?: ConnectedPeer): void {
      if (domain == WebRtcErrorDomain.Connecting) {
        if (errorType == "IdIsAlreadyTaken") {
          receivedMessage(ReceivedMessageType.Error, "This ID is already taken, please choose another.", peer)
        } else if (errorType == "IdContainsInvalidCharacters") {
          receivedMessage(ReceivedMessageType.Error, "This ID contains invalid characters (like Umlaute etc.), please choose another.", peer)
        } else {
          receivedMessage(ReceivedMessageType.Error, `Connecting failed with error type '${errorType}': ${error}`, peer)
        }
      } else if (domain == WebRtcErrorDomain.Connection) {
        receivedMessage(ReceivedMessageType.Error, `Connection error of type '${errorType}' occurred: ${error}`, peer)
      } else if (domain == WebRtcErrorDomain.ConnectingToPeer) {
        if (errorType == "PeerWithIdNotAvailable") {
          receivedMessage(ReceivedMessageType.Error, `Peer with ID '${peer}' is not available.`, peer)
        } else {
          receivedMessage(ReceivedMessageType.Error, `Could not connect to peer '${peer}: ${error}`, peer)
        }
      } else if (domain == WebRtcErrorDomain.ErrorOnConnectionToPeer) {
        receivedMessage(ReceivedMessageType.Error, `Error of type '${errorType}' occurred on connection to peer '${peer}': ${error}`, peer)
      }
    },

    disconnected(): void {
      isConnected = false
      connectedPeers = []
      receivedMessage(ReceivedMessageType.Info, "Disconnected. Sending and receiving messages is not possible anymore.")
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

      receivedMessage(ReceivedMessageType.SentMessage, messageToSend)

      messageToSend = ""
    }
  }

  function receivedMessage(type: ReceivedMessageType, message: string, peer?: ConnectedPeer) {
    receivedMessages.push(new ReceivedMessage(new Date(), type, message, peer))

    scrollToEnd()
  }

  function scrollToEnd() {
    setTimeout(() => {
      const list = document.querySelector(".overflow-y-auto")
      list?.scrollTo(0, list?.scrollHeight)
    }, 100) // give DOM same time to add new message and render before scrolling to the new message
  }
</script>


<div class="w-full h-dvh flex flex-col items-center justify-center p-2">
  <div class="shrink-0 w-full max-w-[500px] mx-auto h-fit bg-white rounded-xl p-2">
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

  <Card classes="grow flex flex-col w-full max-w-[500px] min-h-0 mt-4 px-3">
    <div class="flex-1 flex flex-col min-h-0">
      <SectionHeader title="Messages" addTopMargin={false} classes="mt-1" />

      <div class="flex-1 w-full min-h-4 flex flex-col gap-2 mt-0.5 overflow-y-auto">
        {#each receivedMessages as message, index (index)}
          {#if message.type === ReceivedMessageType.SentMessage}
            <div class="w-full flex justify-end">
              <div class="flex max-w-[90%] bg-blue-600 text-white rounded-2xl px-3 py-1.5">
                { message.message }
              </div>
            </div>
          {:else if message.type === ReceivedMessageType.MessageFromPeer}
            <div class="flex flex-col max-w-[90%] bg-amber-300 rounded-2xl px-3 py-1.5">
              <div class="text-amber-600 font-medium mb-0.5">{ message.peer }</div>
              <div class="">{ message.message }</div>
            </div>
          {:else if message.type === ReceivedMessageType.Error}
            <div class="w-full flex justify-center">
              <div class="max-w-[80%] bg-red-400/50 text-red-800 text-center rounded-2xl px-3 py-1.5">
                { message.message }
              </div>
            </div>
          {:else}
            <div class="w-full flex justify-center">
              <div class="w-[80%] bg-[#f1f1f1] text-center rounded-2xl px-3 py-1.5">
                { message.message }
              </div>
            </div>
          {/if}
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