<script lang="ts">
  import { WebRtcService } from "../../ts/service/WebRtcService"
  import { DI } from "../../ts/service/DI"
  import TextInput from "../common/forms/TextInput.svelte"
  import Button from "../common/forms/Button.svelte"
  import { onMount } from "svelte"

  let ownId: string = $state("")
  let openButtonDisabled: boolean = $derived(ownId.trim().length == 0)

  let idToConnectTo: string = $state("")
  let connectButtonDisabled: boolean = $derived(idToConnectTo.trim().length == 0)

  const log = DI.log

  let webRtc = new WebRtcService(log)


  onMount(() => {
    return () => {
      webRtc.close()
    }
  })

  function openForConnections() {
    webRtc.openForConnections(ownId)
  }

  function connectTo() {
    webRtc.connectTo(idToConnectTo)
  }
</script>


<div class="w-full h-full flex flex-col items-center justify-center p-2">
  <div class="w-full max-w-[500px] mx-auto h-fit bg-white rounded-xl p-2">
    <div class="flex items-center h-10 my-1">
      <div class="shrink-0 w-[74px] md:w-[92px] mr-2">Set your ID</div>
      <TextInput inputClasses="grow min-w-0 h-full" placeholder="ID by which others can connect to you" bind:value={ownId} onEnterPressed={openForConnections} />
      <Button title="Open" classes="shrink-0 !w-[105px] md:!w-[115px] h-10 ml-2" disabled={openButtonDisabled} onClick={openForConnections} />
    </div>

    <div>
      <div class="flex items-center h-10 my-1">
        <div class="shrink-0 w-[74px] md:w-[92px] mr-2">Connect to</div>
        <TextInput inputClasses="grow min-w-0 h-full" placeholder="Peer ID" bind:value={idToConnectTo} onEnterPressed={connectTo} />
        <Button title="Connect" classes="shrink-0 !w-[105px] md:!w-[115px] h-10 ml-2" disabled={connectButtonDisabled} onClick={connectTo} />
      </div>
    </div>
  </div>
</div>