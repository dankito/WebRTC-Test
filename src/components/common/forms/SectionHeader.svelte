<script lang="ts">
  let { title, addTopMargin = true, highlightTextColor = false, classes }:
    { title: string, addTopMargin?: boolean, highlightTextColor?: boolean, classes?: string } = $props()
</script>


<div class={[ highlightTextColor ? "text-highlight" : "text-zinc-600/90", "text-lg font-bold mb-1", addTopMargin ? "mt-4" : "", classes ?? ""]}>
  { title }
</div>