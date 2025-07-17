<script lang="ts">
  // console.log("Welcome!");

  const messages: string[] = ["selam, naber?", "game-started"];

  const yourHand = [
    { suit: "Clubs", label: "Ace", name: "Ace of Clubs", value: 14 },
    { suit: "Hearts", label: "King", name: "King of Clubs", value: 13 },
    { suit: "Diamonds", label: "Queen", name: "Queen of Clubs", value: 12 },
    { suit: "Spades", label: "Jack", name: "Jack of Clubs", value: 11 },
    { suit: "Clubs", label: "10", name: "10 of Clubs", value: 10 },
  ];

  const initialGame = {
    state: "GAME_STARTED",
    turn: 0,
    currentPlayerId: 0,
    players: [],
    totalCardCountInMiddle: 0,
  };
</script>

<main
  class="bg-gradient-to-br text-amber-200 from-yellow-400 via-amber-500 to-orange-400 h-screen w-screen flex flex-col justify-center items-center"
>
  {#if initialGame.state === "WELCOME_SCREEN"}
    <h1 class="font-bold text-9xl text-shadow-lg">Durak</h1>
  {/if}

  {#if initialGame.state === "GAME_STARTED"}
    <div class="flex-grow p-10 flex flex-col justify-center items-center">
      <div class="bg-green-500 p-5 rounded-2xl">
        <h1 class="text-white">Game is started</h1>
      </div>
      <div class="p-10">Opponent hand</div>
      <div class="p-10">Middle deck</div>
      <div class="p-10 rounded-2xl">
        <div class="flex space-x-5 space-y-2">
          {#each yourHand as card}
            <div
              class="relative flex justify-center items-center w-[120px] h-[180px] shadow-2xl p-2 border border-b-4 border-transparent rounded-md bg-white hover:border-green-500 transition-all duration-300"
            >
              <!-- <p>{card.suit}</p>
              <p>{card.label}</p> -->
              <p class="text-center">{card.name}</p>
            </div>
          {/each}
        </div>
        <p class="text-center">Your hand</p>
      </div>
    </div>
  {/if}

  <pre class="bg-black w-full p-5">
    {#each messages as msg}
      <p>{msg}</p>
    {/each}
  </pre>
</main>
