// ゲーム全体のコイン管理や各ラウンドの変数
let coins = 100;
let currentDeck = [];
let playerHand = [];
let cpuHand = [];
let playerHandEvaluation;
let cpuHandEvaluation;
let currentPlayerAction = null;
let currentCpuAction = null;

const coinCountEl = document.getElementById('coinCount');
const cpuDifficultyEl = document.getElementById('cpuDifficulty');
const difficultyValueEl = document.getElementById('difficultyValue');
const dealButton = document.getElementById('dealButton');
const raiseButton = document.getElementById('raiseButton');
const callButton = document.getElementById('callButton');
const playerHandDiv = document.getElementById('playerHand');
const cpuHandDiv = document.getElementById('cpuHand');
const playerHandNameEl = document.getElementById('playerHandName');
const cpuHandNameEl = document.getElementById('cpuHandName');
const cpuDecisionEl = document.getElementById('cpuDecision');
const cpuAreaDiv = document.getElementById('cpuArea');
const messageEl = document.getElementById('message');

// CPU難易度表示更新
cpuDifficultyEl.addEventListener('input', () => {
  difficultyValueEl.textContent = cpuDifficultyEl.value;
});

// イベント登録
dealButton.addEventListener('click', startRound);
raiseButton.addEventListener('click', () => { finishRound('raise'); });
callButton.addEventListener('click', () => { finishRound('call'); });

// カード情報（スートとランク）
// スートは記号、ランクは数値（11=J, 12=Q, 13=K, 14=A）
const suits = ['♠', '♥', '♦', '♣'];
const ranks = [2,3,4,5,6,7,8,9,10,11,12,13,14];

// 表示用：カードオブジェクトを文字列（例："A♠"）に変換
function cardToString(card) {
  let rankStr = card.rank;
  if(card.rank === 11) rankStr = 'J';
  else if(card.rank === 12) rankStr = 'Q';
  else if(card.rank === 13) rankStr = 'K';
  else if(card.rank === 14) rankStr = 'A';
  return rankStr + card.suit;
}

// 52枚デッキの作成
function createDeck() {
  let deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit: suit, rank: rank });
    }
  }
  return deck;
}

// フィッシャー–イェーツのシャッフル
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// 指定枚数のカードをデッキから配る
function dealHand(deck, count) {
  return deck.splice(0, count);
}

// 5枚ポーカーハンドの評価（シンプルな実装）
// 戻り値は、{ rank, name, tieBreakers } となり、rank は数値で手の強さ（1～10）を表現
function evaluateHand(hand) {
  let counts = {};
  let suitsCount = {};
  let ranksArr = [];
  for (let card of hand) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
    suitsCount[card.suit] = (suitsCount[card.suit] || 0) + 1;
    ranksArr.push(card.rank);
  }
  // 降順ソート
  ranksArr.sort((a, b) => b - a);
  
  const isFlush = Object.values(suitsCount).some(count => count === 5);
  const uniqueRanks = Object.keys(counts).map(Number).sort((a, b) => a - b);
  
  let isStraight = false;
  if (uniqueRanks.length === 5) {
    // 通常の連続
    if (uniqueRanks[4] - uniqueRanks[0] === 4) {
      isStraight = true;
    } else {
      // A,2,3,4,5 の特例（Ace を1として扱う）
      if (uniqueRanks.includes(14) && uniqueRanks[0] === 2 && uniqueRanks[1] === 3 &&
          uniqueRanks[2] === 4 && uniqueRanks[3] === 5) {
        isStraight = true;
        ranksArr = [5,4,3,2,1];
      }
    }
  }
  
  // カウント結果を配列化（[rank, count] の配列）し、出現数、ランクでソート
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

// 手札の比較（正の値ならプレイヤー勝ち、負ならCPU勝ち、0なら引き分け）
function compareHands(handA, handB) {
  if (handA.rank !== handB.rank) return handA.rank - handB.rank;
  for (let i = 0; i < handA.tieBreakers.length; i++) {
    if (handA.tieBreakers[i] !== handB.tieBreakers[i])
      return handA.tieBreakers[i] - handB.tieBreakers[i];
  }
  return 0;
}

// CPUのアクション選択（手札評価とCPU難易度による）
// 例：難易度が低いときは強い手（ほぼRoyal～Straight Flush）のみraise、難易度が高いと幅広くraiseする
function cpuSelectAction(evaluation, difficulty) {
  let threshold = 4 + (11 - difficulty) / 2;
  if (evaluation.rank >= threshold) {
    return 'raise';
  } else {
    return 'call';
  }
}

// ボタンの有効／無効処理
function resetButtons() {
  raiseButton.disabled = true;
  callButton.disabled = true;
}

// 新しいラウンドの開始
function startRound() {
  messageEl.textContent = '';
  cpuAreaDiv.style.display = 'none';
  resetButtons();

  // デッキ作成＆シャッフル、各5枚配布
  currentDeck = createDeck();
  shuffle(currentDeck);
  playerHand = dealHand(currentDeck, 5);
  cpuHand = dealHand(currentDeck, 5);
  
  // プレイヤーの手札表示
  playerHandDiv.innerHTML = '';
  playerHand.forEach(card => {
    const span = document.createElement('span');
    span.textContent = cardToString(card);
    playerHandDiv.appendChild(span);
  });
  
  // 手札評価
  playerHandEvaluation = evaluateHand(playerHand);
  cpuHandEvaluation = evaluateHand(cpuHand);
  
  // プレイヤーには評価結果を表示（実際は隠して自分で考えても良いが、ここでは参考表示）
  playerHandNameEl.textContent = playerHandEvaluation.name;
  
  // CPUは内部でアクションを決定（難易度に応じた基準でraiseかcall）
  let difficulty = parseInt(cpuDifficultyEl.value);
  currentCpuAction = cpuSelectAction(cpuHandEvaluation, difficulty);
  
  // プレイヤーの選択ボタンを有効化
  raiseButton.disabled = false;
  callButton.disabled = false;
  messageEl.textContent = 'あなたは Raise か Call を選んでください。';
}

// プレイヤーの選択後の決着処理
function finishRound(playerAction) {
  currentPlayerAction = playerAction;
  resetButtons();
  
  // CPUの手札を表示
  cpuAreaDiv.style.display = 'block';
  cpuHandDiv.innerHTML = '';
  cpuHand.forEach(card => {
    const span = document.createElement('span');
    span.textContent = cardToString(card);
    cpuHandDiv.appendChild(span);
  });
  cpuHandNameEl.textContent = cpuHandEvaluation.name;
  cpuDecisionEl.textContent = currentCpuAction;
  
  // 両者のアクションでポットサイズを決定
  let pot = 0;
  if (currentPlayerAction === 'call' && currentCpuAction === 'call') {
    pot = 20;
  } else if (currentPlayerAction === 'raise' && currentCpuAction === 'raise') {
    pot = 40;
  } else {
    pot = 30;
  }
  
  // ショーダウン：手札評価の比較
  let result = compareHands(playerHandEvaluation, cpuHandEvaluation);
  let outcome = '';
  if (result > 0) {
    outcome = 'あなたの勝ちです！';
    coins += pot;
  } else if (result < 0) {
    outcome = 'CPUの勝ちです…';
    coins -= pot;
  } else {
    outcome = '引き分けです。';
  }
  coinCountEl.textContent = coins;
  messageEl.textContent = `あなたは ${currentPlayerAction.toUpperCase()}、CPUは ${currentCpuAction.toUpperCase()}。
  ショーダウンの結果 → ${outcome} (ポット: ${pot} コイン)`;
}
