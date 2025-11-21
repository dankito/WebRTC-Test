<script lang="ts">
  let { value = $bindable(), id, placeholder, inputClasses, disabled = false, onChange, onEnterPressed, enterKeyType = "next" }:
      { value: string, id?: string, placeholder?: string, inputClasses?: string, disabled?: boolean, onChange?: (value: string) => void, onEnterPressed?: () => void,
        enterKeyType?: "next" | "previous" | "enter" | "search" | "done" | "go" | "send" } = $props()

  function valueChanged(e: Event) {
      const target = e.target as HTMLInputElement

      value = target.value

      if (onChange) {
          onChange(value)
      }
  }

  function keyDown(event: KeyboardEvent) {
    if (onEnterPressed && event.key === "Enter") {
      onEnterPressed()
    }
  }
</script>


<input type="text" {id} value={value} placeholder={ placeholder ?? '' } {disabled}
       class={[ "bg-[#FBFCFC] focus:bg-white border border-[#CFD5E2] focus:border-highlight rounded",
          "outline-none outline-[#23262C] px-2 py-1.5", inputClasses ?? "" ]}
       enterkeyhint={enterKeyType} oninput={valueChanged} onkeydown={keyDown}>
