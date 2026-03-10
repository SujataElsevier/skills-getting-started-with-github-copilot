document.addEventListener("DOMContentLoaded", () => {
  const boardElement = document.getElementById("ttt-board");
  const statusElement = document.getElementById("ttt-status");
  const resetButton = document.getElementById("ttt-reset");

  let initialConfig = null;
  let state = null;

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getNextTurn(currentTurn) {
    return currentTurn === "X" ? "O" : "X";
  }

  function isBoardFull(cells) {
    return cells.flat().every((cell) => cell !== "");
  }

  function getWinningLine(cells, winningLines) {
    for (const line of winningLines) {
      const [[r1, c1], [r2, c2], [r3, c3]] = line;
      const a = cells[r1][c1];
      const b = cells[r2][c2];
      const c = cells[r3][c3];

      if (a !== "" && a === b && b === c) {
        return line;
      }
    }
    return null;
  }

  function setStatusText() {
    if (state.state.winner) {
      statusElement.textContent = `Winner: ${state.state.winner}`;
      return;
    }

    if (state.state.isDraw) {
      statusElement.textContent = "Draw: no spaces left.";
      return;
    }

    statusElement.textContent = `Turn: ${state.state.currentTurn}`;
  }

  function renderBoard() {
    boardElement.innerHTML = "";

    for (let row = 0; row < state.board.size; row += 1) {
      for (let col = 0; col < state.board.size; col += 1) {
        const cellButton = document.createElement("button");
        cellButton.type = "button";
        cellButton.className = "ttt-cell";
        cellButton.dataset.row = String(row);
        cellButton.dataset.col = String(col);
        cellButton.textContent = state.board.cells[row][col];

        if (state.state.isGameOver || state.board.cells[row][col] !== "") {
          cellButton.disabled = true;
        }

        boardElement.appendChild(cellButton);
      }
    }
  }

  function applyMove(row, col) {
    if (state.state.isGameOver) {
      return;
    }

    if (state.board.cells[row][col] !== "") {
      return;
    }

    const symbol = state.state.currentTurn;
    state.board.cells[row][col] = symbol;
    state.moves.push({
      moveNumber: state.moves.length + 1,
      symbol,
      position: [row, col],
    });

    const winningLine = getWinningLine(state.board.cells, state.rules.winningLines);
    if (winningLine) {
      state.state.winner = symbol;
      state.state.isGameOver = true;
      state.state.winningLine = winningLine;
      renderBoard();
      setStatusText();
      return;
    }

    if (isBoardFull(state.board.cells)) {
      state.state.isDraw = true;
      state.state.isGameOver = true;
      renderBoard();
      setStatusText();
      return;
    }

    state.state.currentTurn = getNextTurn(state.state.currentTurn);
    renderBoard();
    setStatusText();
  }

  async function loadGame() {
    const response = await fetch("tic_tac_toe_game.json");
    if (!response.ok) {
      throw new Error("Failed to load Tic-Tac-Toe JSON configuration");
    }

    initialConfig = await response.json();
    state = deepClone(initialConfig);
    // Start from a clean board even if sample moves exist in the JSON.
    state.board.cells = state.board.cells.map((row) => row.map(() => ""));
    state.moves = [];
    state.state.currentTurn = state.rules.firstTurn;
    state.state.winner = null;
    state.state.isDraw = false;
    state.state.isGameOver = false;

    renderBoard();
    setStatusText();
  }

  boardElement.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || !target.classList.contains("ttt-cell")) {
      return;
    }

    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    applyMove(row, col);
  });

  resetButton.addEventListener("click", () => {
    if (!initialConfig) {
      return;
    }

    state = deepClone(initialConfig);
    state.board.cells = state.board.cells.map((row) => row.map(() => ""));
    state.moves = [];
    state.state.currentTurn = state.rules.firstTurn;
    state.state.winner = null;
    state.state.isDraw = false;
    state.state.isGameOver = false;

    renderBoard();
    setStatusText();
  });

  loadGame().catch((error) => {
    statusElement.textContent = "Could not load game configuration.";
    console.error(error);
  });
});
