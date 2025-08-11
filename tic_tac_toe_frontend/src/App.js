import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'ttt_game_state_v1';

/**
 * PUBLIC_INTERFACE
 * calculateWinner
 * Determines if there is a winning combination on the board.
 * @param {Array<string|null>} squares - The current 3x3 board state as a flat array of length 9.
 * @returns {{player: 'X'|'O', line: number[]} | null} Returns the winning player and the winning line indices, or null if no winner yet.
 */
function calculateWinner(squares) {
  const lines = [
    // rows
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    // columns
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    // diagonals
    [0, 4, 8], [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * App
 * The main Tic Tac Toe application component. Provides:
 * - Two-player gameplay (X and O)
 * - Interactive 3x3 board
 * - Winner and draw detection
 * - Restart and auto-resume using localStorage
 * - Responsive, modern, minimalistic light-themed UI
 */
function App() {
  // Initialize from localStorage (resume support)
  const initialState = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { squares: Array(9).fill(null), xIsNext: true };
      }
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.squares) &&
        parsed.squares.length === 9 &&
        typeof parsed.xIsNext === 'boolean'
      ) {
        return { squares: parsed.squares, xIsNext: parsed.xIsNext };
      }
    } catch {
      // ignore and fall back to defaults
    }
    return { squares: Array(9).fill(null), xIsNext: true };
  }, []);

  const [squares, setSquares] = useState(initialState.squares);
  const [xIsNext, setXIsNext] = useState(initialState.xIsNext);

  // Persist to localStorage (auto-save/resume)
  useEffect(() => {
    const payload = JSON.stringify({ squares, xIsNext });
    localStorage.setItem(STORAGE_KEY, payload);
  }, [squares, xIsNext]);

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo?.player ?? null;
  const isBoardFull = squares.every((sq) => sq !== null);
  const isDraw = !winner && isBoardFull;

  /**
   * PUBLIC_INTERFACE
   * handleSquareClick
   * Handles a click on a specific square index.
   * @param {number} index - The 0-based index of the square (0..8).
   */
  const handleSquareClick = (index) => {
    if (squares[index] || winner || isDraw) return;
    const next = squares.slice();
    next[index] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext((prev) => !prev);
  };

  /**
   * PUBLIC_INTERFACE
   * resetGame
   * Resets the game to its initial state and clears persisted state.
   */
  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    localStorage.removeItem(STORAGE_KEY);
  };

  const statusText = winner
    ? `Winner: Player ${winner}`
    : isDraw
      ? "It's a draw!"
      : `Player ${xIsNext ? 'X' : 'O'}'s turn`;

  const isActiveX = !winner && !isDraw && xIsNext;
  const isActiveO = !winner && !isDraw && !xIsNext;

  return (
    <div className="app">
      <div className="game-container">
        <header className="game-header">
          <h1 className="title">Tic Tac Toe</h1>
          <p className="subtitle">Two players. One winner. Minimal and modern.</p>
        </header>

        <div className="status-panel" role="status" aria-live="polite">
          <div className="players">
            <div className={`player player-x ${isActiveX ? 'active' : ''}`} aria-label={`Player X ${isActiveX ? 'active turn' : ''}`}>
              <span className="badge badge-x">X</span>
              <span className="player-label">Player X</span>
            </div>
            <div className={`player player-o ${isActiveO ? 'active' : ''}`} aria-label={`Player O ${isActiveO ? 'active turn' : ''}`}>
              <span className="badge badge-o">O</span>
              <span className="player-label">Player O</span>
            </div>
          </div>
          <div className="status-text">{statusText}</div>
        </div>

        <div className="board" role="grid" aria-label="Tic Tac Toe Board">
          {squares.map((value, idx) => {
            const isWinnerSq = winnerInfo?.line?.includes(idx);
            const nextSymbol = xIsNext ? 'X' : 'O';
            return (
              <button
                key={idx}
                className={`square ${isWinnerSq ? 'square-winner' : ''} ${value === 'X' ? 'square-x' : value === 'O' ? 'square-o' : ''}`}
                onClick={() => handleSquareClick(idx)}
                data-testid={`square-${idx}`}
                role="gridcell"
                aria-label={`Square ${idx + 1} ${value ? `occupied by ${value}` : `empty, ${nextSymbol} to play`}`}
                disabled={Boolean(value) || Boolean(winner) || Boolean(isDraw)}
              >
                {value}
              </button>
            );
          })}
        </div>

        <div className="controls">
          <button className="reset-btn" onClick={resetGame} aria-label="Reset the game">
            Reset Game
          </button>
          <div className="hint">Autosaves your progress. Refresh to resume.</div>
        </div>
      </div>
    </div>
  );
}

export default App;
