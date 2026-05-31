const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Check for winner
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// Minimax Algorithm
function minimax(squares, depth, isMaximizing) {
  const winner = calculateWinner(squares);
  if (winner === 'O') return 10 - depth; // AI wins
  if (winner === 'X') return depth - 10; // Player wins
  if (!squares.includes(null)) return 0; // Draw

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        let score = minimax(squares, depth + 1, false);
        squares[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        squares[i] = 'X';
        let score = minimax(squares, depth + 1, true);
        squares[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Endpoint to calculate AI move
app.post('/api/move', (req, res) => {
  const { squares } = req.body;
  if (!squares || !Array.isArray(squares) || squares.length !== 9) {
    return res.status(400).json({ error: 'Invalid board state' });
  }

  // Prevent moving if game is already over
  const winner = calculateWinner(squares);
  if (winner || !squares.includes(null)) {
    return res.json({ move: -1 });
  }

  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      squares[i] = 'O';
      let score = minimax(squares, 0, false);
      squares[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  res.json({ move });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Backend running on port ${PORT}`);
});
