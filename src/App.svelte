<script lang="ts">
  import { onMount } from "svelte";
  import { socket } from "./lib/socket";
  import { messages } from "./stores/messages";

  import Card from "./components/Card.svelte";

  let chatInput: HTMLInputElement;
  let nameInput: HTMLInputElement;
  let yourSocketId: string | undefined;
  let yourName = "";
  let yourHand = [];
  let game = {
    state: "WAITING_FOR_YOUR_NAME",
    turn: 0,
    currentPlayerId: 0,
    players: [],
    deck: [],
    strongestCard: {},
  };

  $: yourHand = [
    ...(game.players.find((p: any) => p.id === yourSocketId)?.hand || []),
  ];

  onMount(() => {
    // focus name input automatically when the page loads
    nameInput?.focus();

    // focus chat input automatically if you press Enter
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && document.activeElement !== chatInput) {
        e.preventDefault();
        chatInput?.focus();
      }
    });
  });

  function setupSocket() {
    socket.connect();

    socket.on("connect", () => {
      yourSocketId = socket.id;
    });

    socket.on("message", (msg: string) => {
      $messages = [`${msg}`, ...$messages];
    });

    socket.on("gameState", (gameState: any) => {
      game = gameState;
    });
  }
</script>

<main
  class="relative bg-gradient-to-br text-amber-200 from-yellow-400 via-amber-500 to-orange-400 h-screen w-screen flex flex-col justify-center items-center"
>
  {#if game.state === "WAITING_FOR_YOUR_NAME"}
    <h1 class="font-bold text-9xl text-shadow-lg">Durak</h1>
    {#if yourSocketId}
      <p class="text-sm mt-2">Your socket ID</p>
      <p class="text-sm">{yourSocketId}</p>
    {/if}
    <div class="p-10">
      <!-- <h2 class="text-3xl">Waiting for players to join...</h2> -->
      <div class="flex flex-col space-y-2">
        <input
          bind:this={nameInput}
          type="text"
          placeholder="Enter your name"
          bind:value={yourName}
          class="p-2 rounded-lg bg-gray-800/70 text-white outline-none"
          on:keydown={(e) => {
            if (e.key === "Enter" && yourName.trim() !== "") {
              setupSocket();
              socket.emit("joinGame", yourName);
              $messages = [`You joined the game as ${yourName}.`, ...$messages];
            }
          }}
        />
        <button
          on:click={() => {
            if (yourName.trim() !== "") {
              setupSocket();
              socket.emit("joinGame", yourName);
              $messages = [`You joined the game as ${yourName}.`, ...$messages];
            }
          }}
          class="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-all duration-300"
        >
          Join Game
        </button>
      </div>
    </div>
  {/if}

  {#if game.state === "WAITING_FOR_PLAYERS"}
    <div class="p-10 flex flex-col justify-center items-center">
      <h2 class="text-3xl">
        Waiting for players to join ({game.players.length}/2)
      </h2>
      <div class="mt-4">
        {#each game.players as player}
          <p class="text-xl">
            {player.name} <span class="text-xs">{player.id}</span>
          </p>
        {/each}
      </div>
    </div>
  {/if}

  {#if game.state === "GAME_STARTED"}
    <div class="flex flex-col justify-center items-center rounded-2xl">
      <div class="mb-5">
        <p class="text-center mb-2">Opponent hand</p>
        <hand class="flex space-x-5 space-y-2">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </hand>
      </div>
      <div class="p-10">
        <Card />
      </div>
      <div class="mt-5">
        <hand class="flex space-x-5 space-y-2">
          {#each yourHand as card}
            <Card {card} />
          {/each}
        </hand>
        <p class="text-center">Your hand</p>
      </div>
    </div>
  {/if}

  {#if game.state !== "WAITING_FOR_YOUR_NAME"}
    <div
      class="bg-black/70 w-1/4 rounded-tl-2xl absolute bottom-0 right-0 text-white h-64 flex flex-col"
    >
      <div class="flex-1 overflow-y-auto p-2">
        {#each $messages as msg}
          <p class="text-sm">{msg}</p>
        {/each}
      </div>
      <input
        type="text"
        class="bg-gray-800/70 text-white text-sm p-2 outline-none"
        placeholder="Send a message..."
        bind:this={chatInput}
        on:keydown={(e) => {
          const input = e.target as HTMLInputElement;
          if (e.key === "Enter" && input.value.trim() !== "") {
            const message = input.value.trim();
            $messages = [message, ...$messages];
            socket.emit("message", message);
            input.value = "";
          }
        }}
      />
    </div>
  {/if}
</main>
