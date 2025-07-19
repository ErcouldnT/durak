class Durak {
  static MAX_PLAYERS = 2;

  constructor() {
    this.players = new Map();
    this.deck = [];
    this.turn = 0;
    this.state = "WAITING_FOR_PLAYERS";
    this.currentPlayerId = null;
    this.strongestCard = null;
  }

  getGame() {
    return {
      turn: this.turn,
      state: this.state,
      currentPlayerId: this.currentPlayerId,
      players: Array.from(this.players.values()),
      deck: this.deck,
      strongestCard: this.strongestCard,
    };
  }

  createGameDeck() {
    // reset deck
    this.deck.length = 0;

    const suits = ["Hearts", "Clubs", "Diamonds", "Spades"];
    const labels = ["6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];

    // create the deck
    this.deck = suits.flatMap((suit) =>
      labels.map((label) => ({
        name: `${label} of ${suit}`,
        suit,
        label,
        value: this.findRealCardValue(label),
        image: `/cards/${encodeURIComponent(`${label} of ${suit}`)}.jpg`,
      }))
    );

    // shuffle the deck
    this.shuffleDeck();
  }

  findRealCardValue(label) {
    switch (label) {
      case "Jack":
        return 11;
      case "Queen":
        return 12;
      case "King":
        return 13;
      case "Ace":
        return 14;
      default:
        return Number(label);
    }
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  lookAtPlayersHandForValue(value, strongestCard) {
    for (const player of this.players.values()) {
      for (const card of player.hand) {
        if (card.suit === strongestCard.suit && card.value === value) {
          return player;
        }
      }
    }
    return null;
  }

  findFirstPlayer(strongestCard) {
    for (let val = 6; val <= 14; val++) {
      const player = this.lookAtPlayersHandForValue(val, strongestCard);
      // if a player has the card with the same suit and value, return him
      if (player) return player;
    }
    // if no player has the card, return the first player
    return this.players.values().next().value;
  }

  giveSixCardsToPlayers() {
    for (const player of this.players.values()) {
      // take the last 6 cards from the deck
      player.hand = this.deck.splice(-6);
    }
  }

  addPlayer(player) {
    // max 2 players allowed
    if (this.players.size >= Durak.MAX_PLAYERS) return;

    // add to players
    this.players.set(player.id, player);

    if (this.players.size === Durak.MAX_PLAYERS) {
      // if the game is ready to start, start the game
      this.startGame();
    }

    return this.getGame();
  }

  removePlayer(player) {
    this.players.delete(player.id);

    // if the game is started, reset the game
    if (this.state === "GAME_STARTED") {
      this.resetGame();
    }

    return this.getGame();
  }

  startGame() {
    // if the game is not in the waiting state or there are not exactly 2 players, do nothing
    if (
      this.state !== "WAITING_FOR_PLAYERS" ||
      this.players.size !== Durak.MAX_PLAYERS
    )
      return;

    this.createGameDeck();
    this.giveSixCardsToPlayers();
    this.strongestCard = this.deck[0]; // choose the first card as the strongest card (:
    this.currentPlayerId = this.findFirstPlayer(this.strongestCard).id;
    this.state = "GAME_STARTED";
    this.turn = 1;

    return this.getGame();
  }

  resetGame() {
    // reset game state
    this.state = "WAITING_FOR_PLAYERS";
    this.turn = 0;
    this.currentPlayerId = null;
    this.strongestCard = null;

    // reset players' hands
    for (const player of this.players.values()) {
      player.hand = [];
    }

    // reset deck
    this.deck.length = 0;
  }
}

export default Durak;
