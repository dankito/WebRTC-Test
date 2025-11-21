<script lang="ts">
  let { title, classes, disabled, onClick }:
    { title: string, width?: string, height?: string, classes?: string, disabled?: boolean, onClick: (event: Event) => void } = $props()
</script>


<button type="button" class={[ "w-[75px] h-8 border rounded focus:border-highlight hover:text-highlight ",
          "disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-none disabled:opacity-50", classes ?? "" ]}
        {disabled} onclick={onClick}>
  { title }
</button>