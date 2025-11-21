<script lang="ts">
  import type { Snippet } from "svelte"

  let { children, classes }: { children: Snippet, classes?: string } = $props()
</script>

<div class={[ "bg-white rounded-xl shadow-xl", classes ]}>
  {@render children()}
</div>