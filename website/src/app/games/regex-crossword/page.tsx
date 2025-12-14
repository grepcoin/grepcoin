'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Trophy, Lightbulb, Check, X, Clock, Grid3X3 } from 'lucide-react'
import { useGameScore } from '@/hooks/useGameScore'
import { useAuth } from '@/context/AuthContext'
import { playSound, GREP_COLORS } from '@/lib/gameUtils'

interface Puzzle {
  size: number
  rowPatterns: string[]
  colPatterns: string[]
  solution: string[][]
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  points: number
}

// Pre-designed puzzles with known solutions
const PUZZLES: Puzzle[] = [
  // Easy 3x3 puzzles
  {
    size: 3,
    rowPatterns: ['^[abc]+$', '^[bcd]+$', '^[cde]+$'],
    colPatterns: ['^[abc]+$', '^[bcd]+$', '^[cde]+$'],
    solution: [['a', 'b', 'c'], ['b', 'c', 'd'], ['c', 'd', 'e']],
    difficulty: 'easy',
    points: 100,
  },
  {
    size: 3,
    rowPatterns: ['^[xyz]+$', '^[xy]+$', '^[yz]+$'],
    colPatterns: ['^[xy]+$', '^[xyz]+$', '^[yz]+$'],
    solution: [['x', 'y', 'z'], ['x', 'y', 'y'], ['y', 'z', 'z']],
    difficulty: 'easy',
    points: 100,
  },
  {
    size: 3,
    rowPatterns: ['^\\d+$', '^[a-z]+$', '^\\d+$'],
    colPatterns: ['^[1a2]$', '^[2b3]$', '^[3c4]$'],
    solution: [['1', '2', '3'], ['a', 'b', 'c'], ['2', '3', '4']],
    difficulty: 'easy',
    points: 100,
  },
  // Medium 3x3 puzzles
  {
    size: 3,
    rowPatterns: ['^[aeiou]+$', '^[^aeiou]+$', '^[aeiou]+$'],
    colPatterns: ['^[ae].$', '^.[bc].$', '^..[io]$'],
    solution: [['a', 'e', 'i'], ['b', 'c', 'b'], ['e', 'o', 'o']],
    difficulty: 'medium',
    points: 150,
  },
  {
    size: 3,
    rowPatterns: ['^(ab)+.$', '^.(cd)+$', '^..(ef)$'],
    colPatterns: ['^a..$', '^b.e$', '^.df$'],
    solution: [['a', 'b', 'a'], ['a', 'c', 'd'], ['c', 'd', 'f']],
    difficulty: 'medium',
    points: 150,
  },
  // Hard 4x4 puzzles
  {
    size: 4,
    rowPatterns: ['^[a-d]+$', '^[b-e]+$', '^[c-f]+$', '^[d-g]+$'],
    colPatterns: ['^[a-d]+$', '^[b-e]+$', '^[c-f]+$', '^[d-g]+$'],
    solution: [
      ['a', 'b', 'c', 'd'],
      ['b', 'c', 'd', 'e'],
      ['c', 'd', 'e', 'f'],
      ['d', 'e', 'f', 'g'],
    ],
    difficulty: 'hard',
    points: 250,
  },
  {
    size: 4,
    rowPatterns: ['^[0-3]+$', '^[1-4]+$', '^[2-5]+$', '^[3-6]+$'],
    colPatterns: ['^[0-3]+$', '^[1-4]+$', '^[2-5]+$', '^[3-6]+$'],
    solution: [
      ['0', '1', '2', '3'],
      ['1', '2', '3', '4'],
      ['2', '3', '4', '5'],
      ['3', '4', '5', '6'],
    ],
    difficulty: 'hard',
    points: 250,
  },
  // Expert 4x4 puzzle
  {
    size: 4,
    rowPatterns: ['^[aeiou]{4}$', '^[^aeiou]{4}$', '^[aeiou]{4}$', '^[^aeiou]{4}$'],
    colPatterns: ['^[ab][cd][ae][fg]$', '^[ei][mn][io][pq]$', '^[ou][rs][ou][wx]$', '^[ua][yz][ua][bc]$'],
    solution: [
      ['a', 'e', 'o', 'u'],
      ['c', 'n', 's', 'z'],
      ['a', 'i', 'o', 'u'],
      ['f', 'p', 'w', 'b'],
    ],
    difficulty: 'expert',
    points: 400,
  },
]

interface GameState {
  score: number
  puzzlesSolved: number
  hintsUsed: number
  timeRemaining: number
  currentPuzzleIndex: number
}

export default function RegExCrosswordGame() {
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'complete'>('idle')

  // Score submission hooks
  const { submitScore, isSubmitting, lastResult } = useGameScore('regex-crossword')
  const { isAuthenticated } = useAuth()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    puzzlesSolved: 0,
    hintsUsed: 0,
    timeRemaining: 300, // 5 minutes
    currentPuzzleIndex: 0,
  })
  const [muted, setMuted] = useState(false)
  const [grid, setGrid] = useState<string[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [validRows, setValidRows] = useState<boolean[]>([])
  const [validCols, setValidCols] = useState<boolean[]>([])
  const [showHint, setShowHint] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentPuzzle = PUZZLES[gameState.currentPuzzleIndex]

  // Submit score when game ends
  useEffect(() => {
    if ((gameStatus === 'gameover' || gameStatus === 'complete') && isAuthenticated && gameState.score > 0) {
      submitScore(gameState.score, gameState.puzzlesSolved, 300 - gameState.timeRemaining)
    }
  }, [gameStatus, isAuthenticated, gameState.score, gameState.puzzlesSolved, gameState.timeRemaining, submitScore])

  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'playing') return

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          setGameStatus('gameover')
          return { ...prev, timeRemaining: 0 }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameStatus])

  // Initialize grid for current puzzle
  const initializeGrid = useCallback(() => {
    const size = currentPuzzle.size
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(''))
    setGrid(newGrid)
    setValidRows(Array(size).fill(false))
    setValidCols(Array(size).fill(false))
    setSelectedCell(null)
    setShowHint(false)
  }, [currentPuzzle])

  // Check if patterns match
  const checkPatterns = useCallback(() => {
    const size = currentPuzzle.size
    const newValidRows: boolean[] = []
    const newValidCols: boolean[] = []

    // Check rows
    for (let r = 0; r < size; r++) {
      const rowStr = grid[r].join('')
      if (rowStr.length === size && rowStr.indexOf('') === -1) {
        try {
          const regex = new RegExp(currentPuzzle.rowPatterns[r])
          newValidRows.push(regex.test(rowStr))
        } catch {
          newValidRows.push(false)
        }
      } else {
        newValidRows.push(false)
      }
    }

    // Check columns
    for (let c = 0; c < size; c++) {
      const colStr = grid.map(row => row[c]).join('')
      if (colStr.length === size && colStr.indexOf('') === -1) {
        try {
          const regex = new RegExp(currentPuzzle.colPatterns[c])
          newValidCols.push(regex.test(colStr))
        } catch {
          newValidCols.push(false)
        }
      } else {
        newValidCols.push(false)
      }
    }

    setValidRows(newValidRows)
    setValidCols(newValidCols)

    // Check if puzzle is complete
    if (newValidRows.every(v => v) && newValidCols.every(v => v)) {
      if (!muted) playSound('success')

      const hintsBonus = showHint ? 0 : 50
      const timeBonus = Math.floor(gameState.timeRemaining / 10) * 5
      const puzzlePoints = currentPuzzle.points + hintsBonus + timeBonus

      setGameState(prev => ({
        ...prev,
        score: prev.score + puzzlePoints,
        puzzlesSolved: prev.puzzlesSolved + 1,
      }))

      // Move to next puzzle or complete
      setTimeout(() => {
        if (gameState.currentPuzzleIndex < PUZZLES.length - 1) {
          setGameState(prev => ({ ...prev, currentPuzzleIndex: prev.currentPuzzleIndex + 1 }))
        } else {
          setGameStatus('complete')
        }
      }, 1000)
    }
  }, [grid, currentPuzzle, gameState.timeRemaining, gameState.currentPuzzleIndex, showHint, muted])

  // Check patterns when grid changes
  useEffect(() => {
    if (gameStatus === 'playing' && grid.length > 0) {
      checkPatterns()
    }
  }, [grid, gameStatus, checkPatterns])

  // Initialize new puzzle when index changes
  useEffect(() => {
    if (gameStatus === 'playing') {
      initializeGrid()
    }
  }, [gameState.currentPuzzleIndex, initializeGrid, gameStatus])

  // Handle cell input
  const handleCellInput = useCallback((row: number, col: number, value: string) => {
    // Only allow single alphanumeric character
    const char = value.slice(-1).toLowerCase()
    if (!/^[a-z0-9]$/.test(char) && char !== '') return

    setGrid(prev => {
      const newGrid = prev.map(r => [...r])
      newGrid[row][col] = char
      return newGrid
    })

    if (!muted && char) playSound('whoosh')
  }, [muted])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    const size = currentPuzzle.size

    switch (e.key) {
      case 'ArrowUp':
        if (row > 0) setSelectedCell({ row: row - 1, col })
        break
      case 'ArrowDown':
        if (row < size - 1) setSelectedCell({ row: row + 1, col })
        break
      case 'ArrowLeft':
        if (col > 0) setSelectedCell({ row, col: col - 1 })
        break
      case 'ArrowRight':
        if (col < size - 1) setSelectedCell({ row, col: col + 1 })
        break
      case 'Backspace':
        handleCellInput(row, col, '')
        break
    }
  }, [currentPuzzle.size, handleCellInput])

  // Use hint
  const useHint = useCallback(() => {
    if (showHint) return

    setShowHint(true)
    setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }))

    // Reveal one random empty or wrong cell
    const size = currentPuzzle.size
    const emptyCells: { row: number; col: number }[] = []

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== currentPuzzle.solution[r][c]) {
          emptyCells.push({ row: r, col: c })
        }
      }
    }

    if (emptyCells.length > 0) {
      const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      handleCellInput(cell.row, cell.col, currentPuzzle.solution[cell.row][cell.col])
      if (!muted) playSound('powerup')
    }
  }, [currentPuzzle, grid, showHint, handleCellInput, muted])

  // Start game
  const startGame = useCallback(() => {
    setGameState({
      score: 0,
      puzzlesSolved: 0,
      hintsUsed: 0,
      timeRemaining: 300,
      currentPuzzleIndex: 0,
    })
    setGameStatus('playing')
    initializeGrid()

    if (!muted) playSound('levelup')
  }, [muted, initializeGrid])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <main className="min-h-screen bg-dark-900 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/games"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Arcade
          </Link>

          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-gradient">RegEx Crossword</span>
          </h1>
          <p className="text-gray-400">Fill the grid to match all regex patterns!</p>
        </div>

        {/* Game Stats Bar */}
        {gameStatus === 'playing' && (
          <div className="flex items-center justify-center gap-8 mb-4 p-4 rounded-xl bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className={`text-2xl font-bold ${gameState.timeRemaining < 60 ? 'text-red-400' : 'text-yellow-400'}`}>
                {formatTime(gameState.timeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-purple-400" />
              <span className="text-lg text-purple-400">
                {gameState.puzzlesSolved + 1}/{PUZZLES.length}
              </span>
            </div>
            <div className="text-lg text-green-400">
              Score: {gameState.score}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              currentPuzzle.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              currentPuzzle.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              currentPuzzle.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {currentPuzzle.difficulty.toUpperCase()}
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="flex flex-col items-center gap-6">
          {gameStatus === 'idle' && (
            <div className="text-center p-8 rounded-2xl bg-dark-800/50 border border-dark-700 max-w-lg">
              <div className="text-8xl mb-6">📝</div>
              <h2 className="text-3xl font-display font-bold mb-4 text-gradient">RegEx Crossword</h2>
              <p className="text-gray-400 mb-8">
                Fill in the grid so each row matches its horizontal pattern
                and each column matches its vertical pattern!
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-purple-400 font-bold mb-1">Match Patterns</div>
                  <div className="text-gray-400">Rows & columns</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-yellow-400 font-bold mb-1">Beat the Clock</div>
                  <div className="text-gray-400">5 minutes total</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-green-400 font-bold mb-1">8 Puzzles</div>
                  <div className="text-gray-400">Easy to Expert</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="text-cyan-400 font-bold mb-1">Hints Available</div>
                  <div className="text-gray-400">If you're stuck</div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold text-xl hover:scale-105 transition-transform mx-auto"
              >
                <Play className="w-6 h-6" />
                Start Puzzle
              </button>
            </div>
          )}

          {gameStatus === 'playing' && currentPuzzle && (
            <div className="flex gap-8 items-start">
              {/* Column patterns (top) */}
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-2" style={{ marginLeft: '80px' }}>
                  {currentPuzzle.colPatterns.map((pattern, i) => (
                    <div
                      key={i}
                      className={`w-16 p-2 rounded text-xs font-mono text-center border ${
                        validCols[i] ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-dark-600 bg-dark-800 text-gray-400'
                      }`}
                    >
                      {pattern.replace(/^\^/, '').replace(/\$$/, '')}
                      {validCols[i] && <Check className="w-3 h-3 mx-auto mt-1" />}
                    </div>
                  ))}
                </div>

                {/* Grid with row patterns */}
                <div className="flex">
                  {/* Row patterns (left) */}
                  <div className="flex flex-col gap-1 mr-2">
                    {currentPuzzle.rowPatterns.map((pattern, i) => (
                      <div
                        key={i}
                        className={`w-20 h-16 p-2 rounded text-xs font-mono flex items-center justify-center border ${
                          validRows[i] ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-dark-600 bg-dark-800 text-gray-400'
                        }`}
                      >
                        <span className="break-all">{pattern.replace(/^\^/, '').replace(/\$$/, '')}</span>
                        {validRows[i] && <Check className="w-3 h-3 ml-1 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>

                  {/* Grid cells */}
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${currentPuzzle.size}, 64px)`,
                    }}
                  >
                    {grid.map((row, r) =>
                      row.map((cell, c) => (
                        <input
                          key={`${r}-${c}`}
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellInput(r, c, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, r, c)}
                          onFocus={() => setSelectedCell({ row: r, col: c })}
                          className={`w-16 h-16 text-center text-2xl font-mono font-bold rounded-lg border-2 transition-all ${
                            selectedCell?.row === r && selectedCell?.col === c
                              ? 'border-purple-500 bg-purple-500/20'
                              : cell && (validRows[r] || validCols[c])
                              ? 'border-green-500/50 bg-dark-700'
                              : 'border-dark-600 bg-dark-800'
                          } focus:outline-none focus:border-purple-500`}
                          maxLength={1}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Hint button */}
                <button
                  onClick={useHint}
                  disabled={showHint}
                  className={`mt-4 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    showHint
                      ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500/20 border border-yellow-500 text-yellow-400 hover:bg-yellow-500/30'
                  }`}
                >
                  <Lightbulb className="w-5 h-5" />
                  {showHint ? 'Hint Used' : 'Use Hint'}
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameStatus === 'gameover' && (
            <div className="text-center p-8 rounded-2xl bg-dark-800/50 border border-dark-700 max-w-lg">
              <div className="text-7xl mb-4">⏰</div>
              <h2 className="text-4xl font-display font-bold mb-2 text-red-400">Time's Up!</h2>

              <div className="grid grid-cols-2 gap-4 my-8">
                <div className="p-5 rounded-xl bg-dark-800 border border-purple-500/30 text-center">
                  <div className="text-4xl font-bold text-purple-400">{gameState.score}</div>
                  <div className="text-sm text-gray-400 mt-1">Final Score</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-green-500/30 text-center">
                  <div className="text-4xl font-bold text-green-400">{gameState.puzzlesSolved}</div>
                  <div className="text-sm text-gray-400 mt-1">Puzzles Solved</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-yellow-500/30 text-center">
                  <div className="text-4xl font-bold text-yellow-400">{gameState.hintsUsed}</div>
                  <div className="text-sm text-gray-400 mt-1">Hints Used</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-cyan-500/30 text-center">
                  {isSubmitting ? (
                    <>
                      <div className="text-4xl font-bold text-cyan-400 animate-pulse">...</div>
                      <div className="text-sm text-gray-400 mt-1">Submitting...</div>
                    </>
                  ) : lastResult?.success ? (
                    <>
                      <div className="text-4xl font-bold text-cyan-400">+{lastResult.grepEarned}</div>
                      <div className="text-sm text-gray-400 mt-1">GREP Earned</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-cyan-400">+{Math.floor(gameState.score / 10)}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {isAuthenticated ? 'GREP Earned' : 'Connect wallet'}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!isAuthenticated && (
                <p className="text-sm text-yellow-400 mb-4">
                  Connect your wallet to save scores and earn GREP!
                </p>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
                <Link
                  href="/games"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-dark-700 border border-dark-600 font-bold hover:bg-dark-600 transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </Link>
              </div>
            </div>
          )}

          {/* Complete Screen */}
          {gameStatus === 'complete' && (
            <div className="text-center p-8 rounded-2xl bg-dark-800/50 border border-dark-700 max-w-lg">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-4xl font-display font-bold mb-2 text-gradient">All Puzzles Complete!</h2>

              <div className="grid grid-cols-2 gap-4 my-8">
                <div className="p-5 rounded-xl bg-dark-800 border border-purple-500/30 text-center">
                  <div className="text-4xl font-bold text-purple-400">{gameState.score}</div>
                  <div className="text-sm text-gray-400 mt-1">Final Score</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-green-500/30 text-center">
                  <div className="text-4xl font-bold text-green-400">{PUZZLES.length}/{PUZZLES.length}</div>
                  <div className="text-sm text-gray-400 mt-1">Perfect!</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-yellow-500/30 text-center">
                  <div className="text-4xl font-bold text-yellow-400">{formatTime(300 - gameState.timeRemaining)}</div>
                  <div className="text-sm text-gray-400 mt-1">Time Taken</div>
                </div>
                <div className="p-5 rounded-xl bg-dark-800 border border-cyan-500/30 text-center">
                  {isSubmitting ? (
                    <>
                      <div className="text-4xl font-bold text-cyan-400 animate-pulse">...</div>
                      <div className="text-sm text-gray-400 mt-1">Submitting...</div>
                    </>
                  ) : lastResult?.success ? (
                    <>
                      <div className="text-4xl font-bold text-cyan-400">+{lastResult.grepEarned}</div>
                      <div className="text-sm text-gray-400 mt-1">GREP Earned</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-cyan-400">+{Math.floor(gameState.score / 8)}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {isAuthenticated ? 'GREP Earned' : 'Connect wallet'}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
                <Link
                  href="/games"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-dark-700 border border-dark-600 font-bold hover:bg-dark-600 transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {gameStatus === 'playing' && (
          <div className="mt-6 p-4 rounded-xl bg-dark-800/50 border border-dark-700 max-w-2xl mx-auto">
            <h3 className="font-bold text-lg mb-2">How to Play</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>Each row must match its left-side regex pattern</li>
              <li>Each column must match its top regex pattern</li>
              <li>Type lowercase letters or digits in each cell</li>
              <li>Use arrow keys to navigate between cells</li>
              <li>Green highlights show valid patterns - complete all to win!</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
