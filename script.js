const EMPTY = "";
const PLAYER_META = {
  cat: {
    label: "小猫",
    image: "assets/cat.jpg",
  },
  dog: {
    label: "小狗",
    image: "assets/dog.jpg",
  },
};
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const cells = Array.from(document.querySelectorAll(".cell"));
const statusEl = document.querySelector("#status");
const resetButton = document.querySelector("#resetButton");
const modeButtons = Array.from(document.querySelectorAll(".mode"));
const pieceButtons = Array.from(document.querySelectorAll(".pet-frame"));
const humanCard = document.querySelector("#humanCard");
const aiCard = document.querySelector("#aiCard");
const humanAvatar = document.querySelector("#humanAvatar");
const aiAvatar = document.querySelector("#aiAvatar");
const humanName = document.querySelector("#humanName");
const aiName = document.querySelector("#aiName");
const humanScoreEl = document.querySelector("#humanScore");
const aiScoreEl = document.querySelector("#aiScore");
const drawScoreEl = document.querySelector("#drawScore");

let board = Array(9).fill(EMPTY);
let difficulty = "easy";
let HUMAN = "cat";
let AI = "dog";
let currentTurn = HUMAN;
let locked = false;
let gameOver = false;
let gameToken = 0;
let scores = {
  human: 0,
  ai: 0,
  draw: 0,
};

function render() {
  const result = getResult(board);

  cells.forEach((cell, index) => {
    const value = board[index];
    cell.innerHTML = "";
    cell.classList.remove("win");
    cell.disabled = locked || gameOver || Boolean(value);

    if (value) {
      const mark = document.createElement("span");
      mark.className = `mark mark-${value}`;
      const image = document.createElement("img");
      image.src = PLAYER_META[value].image;
      image.alt = "";
      mark.append(image);
      cell.append(mark);
      cell.setAttribute("aria-label", `第 ${index + 1} 格，${PLAYER_META[value].label}`);
    } else {
      cell.setAttribute("aria-label", `第 ${index + 1} 格，空`);
    }
  });

  if (result?.line) {
    result.line.forEach((index) => cells[index].classList.add("win"));
  }

  updatePlayerViews();
  humanCard.classList.toggle("active", currentTurn === HUMAN && !gameOver);
  aiCard.classList.toggle("active", currentTurn === AI && !gameOver);
  humanScoreEl.textContent = scores.human;
  aiScoreEl.textContent = scores.ai;
  drawScoreEl.textContent = scores.draw;
}

function startGame() {
  gameToken += 1;
  board = Array(9).fill(EMPTY);
  currentTurn = HUMAN;
  locked = false;
  gameOver = false;
  statusEl.textContent = `${PLAYER_META[HUMAN].label}先手，点一个格子开始。`;
  render();
}

function choosePiece(piece) {
  HUMAN = piece;
  AI = piece === "cat" ? "dog" : "cat";
  scores = {
    human: 0,
    ai: 0,
    draw: 0,
  };
  startGame();
}

function updatePlayerViews() {
  humanAvatar.src = PLAYER_META[HUMAN].image;
  aiAvatar.src = PLAYER_META[AI].image;
  humanName.textContent = PLAYER_META[HUMAN].label;
  aiName.textContent = PLAYER_META[AI].label;
  humanCard.classList.toggle("player-human-cat", HUMAN === "cat");
  humanCard.classList.toggle("player-human-dog", HUMAN === "dog");
  aiCard.classList.toggle("player-ai-cat", AI === "cat");
  aiCard.classList.toggle("player-ai-dog", AI === "dog");

  pieceButtons.forEach((button) => {
    const isSelected = button.dataset.piece === HUMAN;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (locked || gameOver || board[index]) {
    return;
  }

  placeMark(index, HUMAN);
  const ended = finishTurn();

  if (!ended) {
    currentTurn = AI;
    locked = true;
    statusEl.textContent =
      difficulty === "easy"
        ? `${PLAYER_META[AI].label}在闻一闻棋盘...`
        : `${PLAYER_META[AI].label}正在认真思考...`;
    render();
    const turnToken = gameToken;
    window.setTimeout(() => makeAiMove(turnToken), 420);
  } else {
    render();
  }
}

function makeAiMove(turnToken) {
  if (turnToken !== gameToken || gameOver || currentTurn !== AI) {
    return;
  }

  const move = difficulty === "hard" ? findBestMove(board) : findEasyMove(board);
  placeMark(move, AI);
  const ended = finishTurn();

  if (!ended) {
    currentTurn = HUMAN;
    locked = false;
    statusEl.textContent = `轮到${PLAYER_META[HUMAN].label}了。`;
  }

  render();
}

function placeMark(index, player) {
  board[index] = player;
}

function finishTurn() {
  const result = getResult(board);

  if (!result) {
    return false;
  }

  gameOver = true;
  locked = false;

  if (result.winner === HUMAN) {
    scores.human += 1;
    statusEl.textContent = `${PLAYER_META[HUMAN].label}连成一线，赢啦！`;
  } else if (result.winner === AI) {
    scores.ai += 1;
    statusEl.textContent = `${PLAYER_META[AI].label}赢了，再来一局扳回来。`;
  } else {
    scores.draw += 1;
    statusEl.textContent = "棋盘满了，平局。";
  }

  return true;
}

function getResult(nextBoard) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[b] === nextBoard[c]) {
      return {
        winner: nextBoard[a],
        line,
      };
    }
  }

  if (nextBoard.every(Boolean)) {
    return {
      winner: "draw",
      line: null,
    };
  }

  return null;
}

function getAvailableMoves(nextBoard) {
  return nextBoard
    .map((value, index) => (value ? null : index))
    .filter((index) => index !== null);
}

function findEasyMove(nextBoard) {
  const available = getAvailableMoves(nextBoard);

  if (Math.random() < 0.35) {
    return findTacticalMove(nextBoard) ?? randomMove(available);
  }

  return randomMove(available);
}

function findTacticalMove(nextBoard) {
  return findWinningMove(nextBoard, AI) ?? findWinningMove(nextBoard, HUMAN);
}

function findWinningMove(nextBoard, player) {
  return getAvailableMoves(nextBoard).find((index) => {
    const trial = [...nextBoard];
    trial[index] = player;
    return getResult(trial)?.winner === player;
  });
}

function randomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

function findBestMove(nextBoard) {
  let bestScore = -Infinity;
  let bestMove = null;

  for (const move of getAvailableMoves(nextBoard)) {
    const trial = [...nextBoard];
    trial[move] = AI;
    const score = minimax(trial, 0, false);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(nextBoard, depth, isAiTurn) {
  const result = getResult(nextBoard);

  if (result?.winner === AI) {
    return 10 - depth;
  }

  if (result?.winner === HUMAN) {
    return depth - 10;
  }

  if (result?.winner === "draw") {
    return 0;
  }

  if (isAiTurn) {
    let bestScore = -Infinity;

    for (const move of getAvailableMoves(nextBoard)) {
      const trial = [...nextBoard];
      trial[move] = AI;
      bestScore = Math.max(bestScore, minimax(trial, depth + 1, false));
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const move of getAvailableMoves(nextBoard)) {
    const trial = [...nextBoard];
    trial[move] = HUMAN;
    bestScore = Math.min(bestScore, minimax(trial, depth + 1, true));
  }

  return bestScore;
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", startGame);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    difficulty = button.dataset.difficulty;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    startGame();
  });
});

pieceButtons.forEach((button) => {
  button.addEventListener("click", () => choosePiece(button.dataset.piece));
});

startGame();
