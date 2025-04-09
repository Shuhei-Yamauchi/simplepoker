// 初期状態のコインやラウンド管理
let coins = 100;
let currentCpuDecision = null; // 'raise' または 'call'
let roundActive = false;

// CPU難易度の表示更新
const cpuDifficulty = document.getElementById('cpuDifficulty');
const difficultyValue = document.getElementById('difficultyValue');
cpuDifficulty.addEventListener('input', () => {
  difficultyValue.textContent = cpuDifficulty.value;
});

const coinCountEl = document.getElementById('coinCount');
const dealButton = document.getElementById('dealButton');
const gameArea = document.getElementById('gameArea');
const playerCardEl = document.getElementById('playerCard');
const cpuCardEl = document.getElementById('cpuCard');
const cpuExpressionEl = document.getElementById('cpuExpression');
const messageEl = document.getElementById('message');
const raiseButton = document.getElementById('raiseButton');
const callButton = document.getElementById('callButton');

// 各ラウンドの固定ベット（例：10コイン）
const betAmount = 10;

function updateCoins(delta) {
  coins += delta;
  coinCountEl.textContent = coins;
}

function generateRandomCard() {
  // 1～13のランダムな数値（カードの強さを簡易的に表現）
  return Math.floor(Math.random() * 13) + 1;
}

// CPUの意思決定：カードの数値と難易度によりRaiseまたはCallを決定
function computeCpuDecision(card, difficulty) {
  // 難易度が低い場合は高いカードでのみRaise、難易度が高い場合はより低い数値でもRaise
  let threshold = 11 - difficulty;
  return card > threshold ? 'raise' : 'call';
}

// CPUの表情を決定（Raiseなら自信表情、Callなら普通の顔）
function getCpuExpression(decision) {
  return decision === 'raise' ? '😎' : '😐';
}

function startRound() {
  if (coins < betAmount) {
    messageEl.textContent = 'コインが不足しています。ゲーム終了。';
    return;
  }
  roundActive = true;
  messageEl.textContent = '';
  gameArea.style.display = 'block';

  // プレイヤーのカード（結果に影響しない見た目用）
  let playerCard = generateRandomCard();
  playerCardEl.textContent = playerCard;

  // CPUのカードと意思決定
  let cpuCard = generateRandomCard();
  cpuCardEl.textContent = '?'; // 最初はCPUのカードは隠す
  let difficulty = parseInt(cpuDifficulty.value);
  currentCpuDecision = computeCpuDecision(cpuCard, difficulty);

  // CPUの表情を一瞬表示（例: 1秒間）
  cpuExpressionEl.textContent = getCpuExpression(currentCpuDecision);
  setTimeout(() => {
    cpuExpressionEl.textContent = '🤔';
  }, 1000);
  
  // CPUのカードは後で表示できるようにdata属性に保存
  gameArea.dataset.cpuCard = cpuCard;
}

function finishRound(playerGuess) {
  if (!roundActive) return;
  roundActive = false;
  // CPUのカードの値を表示
  let cpuCard = gameArea.dataset.cpuCard;
  cpuCardEl.textContent = cpuCard;

  // 判定：正解ならコイン増加、不正解なら減少
  if (playerGuess === currentCpuDecision) {
    updateCoins(betAmount);
    messageEl.textContent = '正解！ +' + betAmount + ' コイン';
  } else {
    updateCoins(-betAmount);
    messageEl.textContent = '不正解... -' + betAmount + ' コイン';
  }
  // 次のラウンドまで少し待って画面をリセット
  setTimeout(() => {
    gameArea.style.display = 'none';
  }, 2000);
}

dealButton.addEventListener('click', startRound);
raiseButton.addEventListener('click', () => finishRound('raise'));
callButton.addEventListener('click', () => finishRound('call'));
