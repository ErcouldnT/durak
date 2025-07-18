<script lang="ts">
  // console.log("Welcome!");

  let messages: string[] = [
    "Welcome to the Durak game!",
    "Your opponent is waiting for you.",
    "You can start playing by clicking on your cards.",
  ];

  const yourHand = [
    { suit: "Clubs", label: "Ace", name: "Ace of Clubs", value: 14 },
    { suit: "Hearts", label: "King", name: "King of Hearts", value: 13 },
    { suit: "Diamonds", label: "Queen", name: "Queen of Diamonds", value: 12 },
    { suit: "Spades", label: "Jack", name: "Jack of Spades", value: 11 },
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
  class="relative bg-gradient-to-br text-amber-200 from-yellow-400 via-amber-500 to-orange-400 h-screen w-screen flex flex-col justify-center items-center"
>
  {#if initialGame.state === "WELCOME_SCREEN"}
    <h1 class="font-bold text-9xl text-shadow-lg">Durak</h1>
  {/if}

  {#if initialGame.state === "GAME_STARTED"}
    <div class="p-10 flex flex-col justify-center items-center">
      <div class="bg-green-500 p-5 rounded-2xl">
        <h1 class="text-white">Game is started</h1>
      </div>
      <div class="p-10">Opponent hand</div>
      <div class="p-10">Middle deck</div>
      <div class="p-10 rounded-2xl">
        <div class="flex space-x-5 space-y-2">
          {#each yourHand as card}
            <button
              on:click={() => {
                messages = [...messages, `You clicked on ${card.name}`];
              }}
              class="relative flex hover:border-green-500 border-transparent border-2 cursor-pointer justify-center items-center w-[120px] h-[180px] p-2 rounded-lg transition-all duration-300"
            >
              <img
                class="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl"
                src={"/cards/" + card.name + ".jpg"}
                alt={card.name}
              />
            </button>
          {/each}
        </div>
        <p class="text-center">Your hand</p>
      </div>
    </div>
  {/if}

  <div
    class="bg-black/70 w-1/4 rounded-tl-2xl absolute bottom-0 right-0 text-white h-64 flex flex-col"
  >
    <div class="flex-1 overflow-y-auto p-2">
      {#each messages.reverse() as msg}
        <p class="text-sm">{msg}</p>
      {/each}
    </div>
    <input
      type="text"
      class="bg-gray-800/70 text-white text-sm p-2 outline-none"
      placeholder="Send a message..."
      on:keydown={(e) => {
        const input = e.target as HTMLInputElement;
        if (e.key === "Enter" && input.value.trim() !== "") {
          messages = [...messages, input.value.trim()];
          input.value = "";
        }
      }}
    />
  </div>
</main>
