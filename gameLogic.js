class Durak {
  static MAX_PLAYERS = 2;

  constructor() {
    this.players = new Map();
    this.deck = [];
    this.tableCards = [];
    this.playedCards = [];
    this.turn = 0;
    this.state = "WAITING_FOR_PLAYERS";
    this.currentPlayerId = null;
    this.attackerId = null;
    this.strongestCard = null;
  }

  getGame() {
    return {
      turn: this.turn,
      state: this.state,
      currentPlayerId: this.currentPlayerId,
      attackerId: this.attackerId,
      players: Array.from(this.players.values()),
      deck: this.deck,
      tableCards: this.tableCards,
      playedCards: this.playedCards,
      strongestCard: this.strongestCard,
    };
  }

  takeCardFromDeck(playerId) {
    if (this.deck.length === 0) return null;
    const card = this.deck.pop();
    const player = this.players.get(playerId);
    if (player) {
      player.hand.push(card);
      return this.getGame();
    }
    return null;
  }

  putCardOnTable(playerId, card) {
    const player = this.players.get(playerId);
    if (!player) return null;

    const cardInHand = player.hand.find((c) => c.name === card.name);
    if (!cardInHand) return null;

    if (this.attackerId !== playerId) {
      // Defender's move
      for (const tableCard of this.tableCards) {
        if (tableCard.defendedWith) continue;

        const isKoz = card.suit === this.strongestCard.suit;
        const isSameSuit = card.suit === tableCard.suit;

        const canDefend =
          (isSameSuit && card.value > tableCard.value) ||
          (isKoz && card.value > tableCard.value);

        if (canDefend) {
          tableCard.defendedWith = card;
          player.hand = player.hand.filter((c) => c.name !== card.name);
          return this.getGame();
        }
      }

      return null; // no valid tableCard to defend
    }

    // Attacker's move
    const defenderId = Array.from(this.players.keys()).find(
      (id) => id !== this.attackerId
    );
    const defender = this.players.get(defenderId);
    const attackCount = this.tableCards.length;
    const maxAllowed = Math.min(6, defender.hand.length);

    // Prevent too many attacks
    if (attackCount >= maxAllowed) return null;

    // Allow first card or any card whose label matches an existing label
    if (
      attackCount > 0 &&
      !this.tableCards.some(
        (tableCard) =>
          tableCard.label === card.label ||
          (tableCard.defendedWith &&
            tableCard.defendedWith.label === card.label)
      )
    ) {
      return null;
    }

    this.tableCards.push({ ...card, defendedWith: null });
    player.hand = player.hand.filter((c) => c.name !== card.name);
    return this.getGame();
  }

  findNextPlayer(currentPlayerId) {
    const playerIds = Array.from(this.players.keys());
    const currentIndex = playerIds.indexOf(currentPlayerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    // this.turn++;
    this.currentPlayerId = playerIds[nextIndex];
    return playerIds[nextIndex];
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
    this.attackerId = this.currentPlayerId; // set the first player as the attacker
    this.state = "GAME_STARTED";
    this.turn = 1;
    this.tableCards = [];
    this.playedCards = [];

    return this.getGame();
  }

  resetGame() {
    // reset game state
    this.state = "WAITING_FOR_PLAYERS";
    this.turn = 0;
    this.currentPlayerId = null;
    this.attackerId = null;
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
