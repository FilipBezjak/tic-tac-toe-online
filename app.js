const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const modeEl = document.getElementById("mode");
const resetBtn = document.getElementById("reset");
const clearScoreBtn = document.getElementById("clear-score");
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreDrawEl = document.getElementById("score-draw");

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

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let mode = "human";
let scores = { X: 0, O: 0, draw: 0 };

function evaluate(state) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (state[a] && state[a] === state[b] && state[b] === state[c]) {
      return { winner: state[a], line };
    }
  }
  if (state.every((c) => c)) {
    return { winner: "draw", line: [] };
  }
  return null;
}

function render() {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.textContent = board[i];
    cell.classList.remove("win");
    cell.disabled = !!board[i] || gameOver;
  });

  const result = evaluate(board);
  if (result?.winner === "X" || result?.winner === "O") {
    result.line.forEach((idx) => cells[idx].classList.add("win"));
    statusEl.textContent = `Player ${result.winner} wins!`;
    statusEl.style.color = "var(--ok)";
  } else if (result?.winner === "draw") {
    statusEl.textContent = "Draw.";
    statusEl.style.color = "var(--accent-2)";
  } else {
    statusEl.textContent = `Player ${currentPlayer}'s turn`;
    statusEl.style.color = "var(--accent)";
  }

  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

function minimax(state, player) {
  const result = evaluate(state);
  if (result?.winner === "O") return { score: 1 };
  if (result?.winner === "X") return { score: -1 };
  if (result?.winner === "draw") return { score: 0 };

  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (state[i]) continue;
    const next = [...state];
    next[i] = player;
    const outcome = minimax(next, player === "O" ? "X" : "O");
    moves.push({ index: i, score: outcome.score });
  }

  if (player === "O") {
    return moves.reduce((best, m) => (m.score > best.score ? m : best));
  }
  return moves.reduce((best, m) => (m.score < best.score ? m : best));
}

function finishIfNeeded() {
  const result = evaluate(board);
  if (!result) return false;
  gameOver = true;
  scores[result.winner] += 1;
  render();
  return true;
}

function aiTurn() {
  if (gameOver || mode !== "ai" || currentPlayer !== "O") return;
  const move = minimax(board, "O");
  if (move.index == null) return;
  board[move.index] = "O";
  if (!finishIfNeeded()) {
    currentPlayer = "X";
    render();
  }
}

function handleCellClick(e) {
  const btn = e.target.closest(".cell");
  if (!btn || gameOver) return;

  const idx = Number(btn.dataset.index);
  if (board[idx]) return;

  board[idx] = currentPlayer;
  if (finishIfNeeded()) return;

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  render();

  if (mode === "ai") {
    setTimeout(aiTurn, 180);
  }
}

function newRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  render();
}

boardEl.addEventListener("click", handleCellClick);
resetBtn.addEventListener("click", newRound);
clearScoreBtn.addEventListener("click", () => {
  scores = { X: 0, O: 0, draw: 0 };
  newRound();
});
modeEl.addEventListener("change", () => {
  mode = modeEl.value;
  newRound();
});

render();
