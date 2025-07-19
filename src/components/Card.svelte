<script lang="ts">
  import { messages } from "../stores/messages";

  export let card;

  function onClick() {
    $messages = [`You clicked on ${card.name}.`, ...$messages];
  }
</script>

<button
  on:click={onClick}
  class="relative flex hover:shadow-2xl cursor-pointer justify-center items-center w-[120px] h-[180px] p-2 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-3"
>
  <img
    class="absolute inset-0 w-full h-full object-cover rounded-lg shadow-xl"
    src={"/cards/" + card.name + ".jpg"}
    alt={card.name}
  />
</button>
