// Global game state variables
let coins = 100;
let currentDeck = [];
let playerHand = [];
let cpuHand = [];
let playerHandEvaluation;
let cpuHandEvaluation;
let currentCpuAction = null;

const coinCountEl = document.getElementById('coinCount');
const cpuDifficultyEl = document.getElementById('cpuDifficulty');
const difficultyValueEl = document.getElementById('difficultyValue');
const dealButton = document.getElementById('dealButton');
const raiseButton = document.getElementById('raiseButton');
const callButton = document.getElementById('callButton');
const playerHandDiv = document.getElementById('playerHand');
const cpuHandDiv = document.getElementById('cpuHand');
const playerHandEvaluationEl = document.getElementById('playerHandEvaluation');
const cpuHandEvaluationEl = document.getElementById('cpuHandEvaluation');
const cpuDecisionEl = document.getElementById('cpuDecision');
const cpuAreaDiv = document.getElementById('cpuArea');
const messageEl = document.getElementById('message');

// Update CPU difficulty display
cpuDifficultyEl.addEventListener('input', () => {
  difficultyValueEl.textContent = cpuDifficultyEl.value;
});

// Event listeners
dealButton.addEventListener('click', startRound);
raiseButton.addEventListener('click', () => { finishRound('raise'); });
callButton.addEventListener('click', () => { finishRound('call'); });

// Card information (suit and rank)
// Suits are symbols, and ranks are numbers (11 = J, 12 = Q, 13 = K, 14 = A)
const suits = ['♠', '♥', '♦', '♣'];
const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

// Convert a card object to a display-friendly format (e.g., "A♠")
function cardToString(card) {
  let rankStr = card.rank;
  if (card.rank === 11) rankStr = 'J';
  else if (card.rank === 12) rankStr = 'Q';
  else if (card.rank === 13) rankStr = 'K';
  else if (card.rank === 14) rankStr = 'A';
  return { rank: rankStr, suit: card.suit };
}

// Create a 52-card deck
function createDeck() {
  let deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit: suit, rank: rank });
    }
  }
  return deck;
}

// Shuffle the deck using the Fisher–Yates algorithm
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Deal a specified number of cards from the deck
function dealHand(deck, count) {
  return deck.splice(0, count);
}

// Evaluate a 5-card poker hand.
// Returns an object: { rank, name, tieBreakers }
// where rank is a numerical strength (1–10) and name is a text description.
function evaluateHand(hand) {
  let counts = {};
  let suitsCount = {};
  let ranksArr = [];
  for (let card of hand) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
    suitsCount[card.suit] = (suitsCount[card.suit] || 0) + 1;
    ranksArr.push(card.rank);
  }
  ranksArr.sort((a, b) => b - a);
  
  const isFlush = Object.values(suitsCount).some(count => count === 5);
  const uniqueRanks = Object.keys(counts).map(Number).sort((a, b) => a - b);
  
  let isStraight = false;
  if (uniqueRanks.length === 5) {
    if (uniqueRanks[4] - uniqueRanks[0] === 4) {
      isStraight = true;
    } else {
      // Special case: A,2,3,4,5
      if (uniqueRanks.includes(14) && uniqueRanks[0] === 2 && uniqueRanks[1] === 3 &&
          uniqueRanks[2] === 4 && uniqueRanks[3] === 5) {
        isStraight = true;
        ranksArr = [5, 4, 3, 2, 1];
      }
    }
  }
  
  let countArr = Object.entries(counts).map(([r, c]) => [Number(r), c]);
  countArr.sort((a, b) => {
    if (b[1] === a[1]) return b[0] - a[0];
    return b[1] - a[1];
  });
  
  let handRank = 1;
  let handName = 'High Card';
  let tieBreakers = ranksArr.slice();
  
  if (isFlush && isStraight) {
    if (Math.max(...ranksArr) === 14 && Math.min(...ranksArr) === 10) {
      handRank = 10;
      handName = 'Royal Flush';
    } else {
      handRank = 9;
      handName = 'Straight Flush';
    }
  } else if (countArr[0][1] === 4) {
    handRank = 8;
    handName = 'Four of a Kind';
    tieBreakers = [countArr[0][0], ...ranksArr.filter(r => r !== countArr[0][0])];
  } else if (countArr[0][1] === 3 && countArr[1] && countArr[1][1] === 2) {
    handRank = 7;
    handName = 'Full House';
    tieBreakers = [countArr[0][0], countArr[1][0]];
  } else if (isFlush) {
    handRank = 6;
    handName = 'Flush';
  } else if (isStraight) {
    handRank = 5;
    handName = 'Straight';
  } else if (countArr[0][1] === 3) {
    handRank = 4;
    handName = 'Three of a Kind';
    tieBreakers = [countArr[0][0], ...ranksArr.filter(r => r !== countArr[0][0])];
  } else if (countArr[0][1] === 2 && countArr.length === 3) {
    handRank = 3;
    handName = 'Two Pair';
    const pairs = countArr.filter(item => item[1] === 2).map(item => item[0]).sort((a, b) => b - a);
    const kicker = countArr.filter(item => item[1] === 1)[0][0];
    tieBreakers = [...pairs, kicker];
  } else if (countArr[0][1] === 2) {
    handRank = 2;
    handName = 'One Pair';
    tieBreakers = [countArr[0][0], ...ranksArr.filter(r => r !== countArr[0][0])];
  }
  
  return { rank: handRank, name: handName, tieBreakers: tieBreakers };
}

// Compare two evaluated hands.
// Returns a positive value if handA wins, negative if handB wins, or 0 for a tie.
function compareHands(handA, handB) {
  if (handA.rank !== handB.rank) return handA.rank - handB.rank;
  for (let i = 0; i < handA.tieBreakers.length; i++) {
    if (handA.tieBreakers[i] !== handB.tieBreakers[i])
      return handA.tieBreakers[i] - handB.tieBreakers[i];
  }
  return 0;
}

// CPU action selection based on hand evaluation and CPU difficulty.
// For example, with higher difficulty the CPU may raise with a wider range of hands.
function cpuSelectAction(evaluation, difficulty) {
  let threshold = 4 + (11 - difficulty) / 2;
  if (evaluation.rank >= threshold) {
    return 'raise';
  } else {
    return 'call';
  }
}

// Disable action buttons.
function resetButtons() {
  raiseButton.disabled = true;
  callButton.disabled = true;
}

// Display a hand (array of cards) in the specified container.
function displayHand(hand, container) {
  container.innerHTML = '';
  hand.forEach(card => {
    const cardElem = document.createElement('div');
    cardElem.classList.add('card-item');
    const cardInfo = cardToString(card);
    
    const rankElem = document.createElement('div');
    rankElem.textContent = cardInfo.rank;
    rankElem.classList.add('rank');
    
    const suitElem = document.createElement('div');
    suitElem.textContent = cardInfo.suit;
    suitElem.classList.add('suit');
    
    // Red for hearts and diamonds.
    if (card.suit === '♥' || card.suit === '♦') {
      rankElem.classList.add('red');
      suitElem.classList.add('red');
    }
    
    cardElem.appendChild(rankElem);
    cardElem.appendChild(suitElem);
    container.appendChild(cardElem);
  });
}

// Start a new round.
function startRound() {
  messageEl.textContent = '';
  cpuAreaDiv.style.display = 'none';
  resetButtons();

  currentDeck = createDeck();
  shuffle(currentDeck);
  playerHand = dealHand(currentDeck, 5);
  cpuHand = dealHand(currentDeck, 5);

  displayHand(playerHand, playerHandDiv);
  playerHandEvaluation = evaluateHand(playerHand);
  playerHandEvaluationEl.textContent = "Your Hand: " + playerHandEvaluation.name;

  cpuHandEvaluation = evaluateHand(cpuHand);
  const difficulty = parseInt(cpuDifficultyEl.value);
  currentCpuAction = cpuSelectAction(cpuHandEvaluation, difficulty);

  raiseButton.disabled = false;
  callButton.disabled = false;
  messageEl.textContent = 'Choose to RAISE or CALL.';
}

// Process the round outcome after the player chooses an action.
function finishRound(playerAction) {
  resetButtons();
  
  cpuAreaDiv.style.display = 'block';
  displayHand(cpuHand, cpuHandDiv);
  cpuHandEvaluationEl.textContent = "CPU Hand: " + cpuHandEvaluation.name;
  cpuDecisionEl.textContent = currentCpuAction.toUpperCase();

  // Determine pot size based on both actions.
  let pot = 0;
  if (playerAction === 'call' && currentCpuAction === 'call') {
    pot = 20;
  } else if (playerAction === 'raise' && currentCpuAction === 'raise') {
    pot = 40;
  } else {
    pot = 30;
  }

  const result = compareHands(playerHandEvaluation, cpuHandEvaluation);
  let outcome = '';
  if (result > 0) {
    outcome = 'You win!';
    coins += pot;
  } else if (result < 0) {
    outcome = 'CPU wins...';
    coins -= pot;
  } else {
    outcome = 'It’s a tie.';
  }
  coinCountEl.textContent = coins;
  messageEl.textContent = `You chose ${playerAction.toUpperCase()}, CPU chose ${currentCpuAction.toUpperCase()}.
Showdown Result → ${outcome} (Pot: ${pot} coins)`;
}
