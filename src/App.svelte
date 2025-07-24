<script lang="ts">
  import { onMount } from "svelte";
  import { socket } from "./lib/socket";
  import { messages } from "./stores/messages";

  import Card from "./components/Card.svelte";

  let chatInput: HTMLInputElement;
  let nameInput: HTMLInputElement;
  let yourSocketId: string | undefined;
  let yourName = "";
  let yourTurn = true;
  let yourHand = [];
  let opponentHand = [];
  let game = {
    state: "WAITING_FOR_YOUR_NAME",
    turn: 0,
    // currentPlayerId: "0",
    attackerId: "0",
    players: [],
    deck: [],
    strongestCard: {},
    tableCards: [],
    playedCards: [],
  };

  $: yourHand = [
    ...(game.players.find((p: any) => p.id === yourSocketId)?.hand || []),
  ];

  $: opponentHand = [
    ...(game.players.find((p: any) => p.id !== yourSocketId)?.hand || []),
  ];

  // $: yourTurn = game.currentPlayerId === yourSocketId;

  // $: if (game.attackerId === yourSocketId && game.state === "GAME_STARTED") {
  //   if (!$messages.includes("You are the attacker.")) {
  //     $messages = [`You are the attacker.`, ...$messages];
  //   }
  // }

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

  function getNewCard() {
    return null;
    // if (!yourTurn || game.state !== "GAME_STARTED") return;
    socket.emit("getNewCard", yourSocketId);
    // $messages = [`You drew a new card.`, ...$messages];
  }

  function putCardOnTable(card) {
    // if (!yourTurn || game.state !== "GAME_STARTED") return;
    socket.emit("putCardOnTable", { playerId: yourSocketId, card });
    // $messages = [`You put ${card.name} on the table.`, ...$messages];
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
          {#each opponentHand as card}
            <Card {card} isPlayable={false} />
          {/each}
        </hand>
      </div>
      <div
        class="flex w-full space-x-4 flex-row justify-between items-center p-5"
      >
        <div class="p-4 rounded-xl border-dotted border-4">
          <div class="flex space-x-2 min-w-[120px] min-h-[180px]">
            {#each game.playedCards as card}
              <Card {card} isPlayable={false} />
            {/each}
          </div>
          <p class="text-center">Played cards</p>
        </div>
        <div class="p-6 rounded-xl border-dotted border-4">
          <div class="flex space-x-6 min-w-[120px] min-h-[180px]">
            {#each game.tableCards as card}
              <div class="relative">
                <Card {card} isPlayable={false} />
                <div class="z-50 absolute -top-5 -left-5">
                  {#if card.defendedWith}
                    <Card card={card.defendedWith} isPlayable={false} />
                  {/if}
                </div>
              </div>
            {/each}
          </div>
          <p class="text-center">Table cards</p>
        </div>
        <div>
          <div
            class="cursor-pointer flex space-x-4 relative w-[120px] h-[180px]"
          >
            <!-- {#each game.deck as card, i}
              <div
                class="absolute top-0 left-0"
                style="z-index: {i}; box-shadow: none;"
              >
                <Card {card} />
              </div>
            {/each} -->
            <button on:click={getNewCard} class="absolute top-0 left-0 z-10">
              <Card card={game.deck[game.deck.length - 1]} isPlayable={false} />
            </button>
            <div class="absolute top-0 left-10 rotate-90">
              <Card card={game.strongestCard} isPlayable={false} />
            </div>
          </div>
          <p class="text-xs text-center mt-2">Card count: {game.deck.length}</p>
        </div>
      </div>
      <div class="mt-5">
        <hand class="flex space-x-5 space-y-2">
          {#each yourHand as card}
            <button on:click={() => putCardOnTable(card)}>
              <Card {card} />
            </button>
          {/each}
        </hand>
        <p class="text-center">Your hand</p>
      </div>
      <!-- {#if yourTurn}
        <button
          on:click={() => socket.emit("endTurn", yourSocketId)}
          class="cursor-pointer px-4 my-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-all duration-300"
          >END TURN</button
        >
      {/if} -->
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
