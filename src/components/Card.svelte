<script lang="ts">
  import { messages } from "../stores/messages";

  export let card = null;
  export let backSide = false;
  export let isPlayable = true;

  function onClick() {
    // todo: send card information to server
    // $messages = [`You clicked on ${card.name}.`, ...$messages];
  }
</script>

{#if card}
  <button
    on:click={onClick}
    class="relative flex hover:shadow-2xl cursor-pointer justify-center items-center w-[120px] h-[180px] p-2 rounded-lg transition-all duration-300 transform
    {isPlayable && 'hover:scale-110 hover:rotate-3'}"
  >
    <img
      class="absolute inset-0 w-full h-full object-cover rounded-lg shadow-xl"
      src={!backSide ? card.image : "/cards/back.jpg"}
      alt={card.name}
    />
  </button>
{:else}
  <card
    class="relative flex justify-center items-center w-[120px] h-[180px] p-2 rounded-lg transition-all duration-300 transform"
  >
    <img
      class="absolute inset-0 w-full h-full object-cover rounded-lg shadow-xl"
      src={"/cards/back.jpg"}
      alt={"Back side of a card"}
    />
  </card>
{/if}
