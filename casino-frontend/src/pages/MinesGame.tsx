import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Bomb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BetControls from '../components/BetControls'
import { useCasinoStore } from '../store'
import { useTelegram } from '../hooks/useTelegram'

type Cell = 'hidden' | 'gem' | 'mine' | 'revealed_gem'

const GRID_SIZE = 25
const MINE_COUNTS = [3, 5, 7, 10, 15, 20]

function calcMultiplier(revealed: number, mines: number): number {
  const safe = GRID_SIZE - mines
  let multi = 1
  for (let i = 0; i < revealed; i++) {
    multi *= (safe - i) / (GRID_SIZE - i)
  }
  return Math.max(1, (1 / multi) * 0.97)
}

export default function MinesGame() {
  const navigate = useNavigate()
  const { haptic } = useTelegram()
  const { user, updateBalance, addTransaction } = useCasinoStore()
  const [bet, setBet] = useState(0.1)
  const [mineCount, setMineCount] = useState(5)
  const [grid, setGrid] = useState<Cell[]>(Array(GRID_SIZE).fill('hidden'))
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const [currentMulti, setCurrentMulti] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const [profit, setProfit] = useState(0)

  const startGame = () => {
    if (user.balance < bet) return
    haptic.medium()
    updateBalance(-bet)

    // Place mines
    const newGrid: Cell[] = Array(GRID_SIZE).fill('gem')
    const minePositions = new Set<number>()
    while (minePositions.size < mineCount) {
      minePositions.add(Math.floor(Math.random() * GRID_SIZE))
    }
    minePositions.forEach(pos => { newGrid[pos] = 'mine' })
    setGrid(newGrid.map(c => c === 'mine' ? 'mine' : 'hidden') as Cell[])
    // Store actual grid
    setGrid(newGrid.map(() => 'hidden') as Cell[])

    // Store mines in ref-like way via closure
    const mineArr = Array.from(minePositions)
    ;(window as any).__minesGrid = newGrid

    setGameActive(true)
    setGameOver(false)
    setRevealedCount(0)
    setCurrentMulti(1)
    setShowAll(false)
    setProfit(0)
  }

  const revealCell = (idx: number) => {
    if (!gameActive || gameOver || grid[idx] !== 'hidden') return
    const actualGrid: Cell[] = (window as any).__minesGrid
    const actual = actualGrid[idx]

    if (actual === 'mine') {
      haptic.error()
      // Reveal all
      setShowAll(true)
      setGrid(actualGrid.map((c, i) => i === idx ? 'mine' : c))
      setGameActive(false)
      setGameOver(true)
      addTransaction({ type: 'bet', amount: -bet, game: 'mines' })
    } else {
      haptic.light()
      const newRevealed = revealedCount + 1
      setRevealedCount(newRevealed)
      const multi = calcMultiplier(newRevealed, mineCount)
      setCurrentMulti(multi)
      setProfit(bet * multi - bet)
      setGrid(prev => {
        const next = [...prev]
        next[idx] = 'revealed_gem'
        return next
      })

      // Auto win if all safe cells revealed
      if (newRevealed === GRID_SIZE - mineCount) {
        cashout()
      }
    }
  }

  const cashout = () => {
    if (!gameActive || revealedCount === 0) return
    haptic.success()
    const win = bet * currentMulti
    updateBalance(win)
    addTransaction({ type: 'win', amount: win, game: 'mines' })
    setGameActive(false)
    setShowAll(true)
    const actualGrid: Cell[] = (window as any).__minesGrid
    setGrid(actualGrid)
  }

  return (
    <div className="min-h-screen px-4 pt-2 pb-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl card-glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-400" />
        </motion.button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-xl text-white">Мины</h1>
          <p className="text-xs text-slate-500">Найди все алмазы</p>
        </div>
        {gameActive && revealedCount > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-right">
            <div className="text-xs text-slate-500">Множитель</div>
            <div className="text-lg font-bold text-gold-400">{currentMulti.toFixed(2)}×</div>
          </motion.div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {grid.map((cell, i) => {
          const actualGrid: Cell[] | undefined = (window as any).__minesGrid
          const showMine = showAll && actualGrid?.[i] === 'mine'

          return (
            <motion.button
              key={i}
              whileTap={gameActive && cell === 'hidden' ? { scale: 0.9 } : {}}
              onClick={() => revealCell(i)}
              disabled={!gameActive || cell !== 'hidden'}
              className="aspect-square rounded-xl flex items-center justify-center text-2xl relative overflow-hidden transition-all"
              style={{
                background: cell === 'revealed_gem'
                  ? 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(6,182,212,0.15))'
                  : showMine
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(185,28,28,0.15))'
                  : gameOver && cell === 'mine'
                  ? 'rgba(239,68,68,0.3)'
                  : 'rgba(255,255,255,0.05)',
                border: cell === 'revealed_gem'
                  ? '1px solid rgba(20,184,166,0.4)'
                  : showMine
                  ? '1px solid rgba(239,68,68,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <AnimatePresence>
                {cell === 'revealed_gem' && (
                  <motion.span key="gem" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                    💎
                  </motion.span>
                )}
                {(showMine && actualGrid?.[i] === 'mine') && (
                  <motion.span key="mine" initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}>
                    💣
                  </motion.span>
                )}
                {cell === 'hidden' && !showMine && (
                  <motion.span key="hidden" className="text-slate-600">?</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Stats bar */}
      {gameActive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card-glass rounded-xl p-3 mb-3 flex items-center justify-between">
          <div className="text-center">
            <div className="text-xs text-slate-500">Открыто</div>
            <div className="text-lg font-bold text-white">{revealedCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Мины</div>
            <div className="text-lg font-bold text-red-400">{mineCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Прибыль</div>
            <div className={`text-lg font-bold ${profit > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {profit > 0 ? '+' : ''}{profit.toFixed(4)} TON
            </div>
          </div>
        </motion.div>
      )}

      {/* Mine count selector */}
      {!gameActive && (
        <>
          <div className="card-glass rounded-2xl p-4 mb-3">
            <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Количество мин</div>
            <div className="flex gap-2">
              {MINE_COUNTS.map(n => (
                <motion.button key={n} whileTap={{ scale: 0.9 }}
                  onClick={() => setMineCount(n)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: mineCount === n ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                    border: mineCount === n ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    color: mineCount === n ? '#f87171' : '#94a3b8',
                  }}>
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="card-glass rounded-2xl p-4 mb-4">
            <BetControls bet={bet} setBet={setBet} />
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={startGame}
            disabled={user.balance < bet}
            className="w-full py-4 rounded-2xl font-display font-bold text-xl text-black btn-gold disabled:opacity-50">
            💎 НАЧАТЬ ИГРУ
          </motion.button>
        </>
      )}

      {/* Cashout button */}
      {gameActive && revealedCount > 0 && (
        <motion.button whileTap={{ scale: 0.97 }} onClick={cashout}
          className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white mt-2"
          style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
          💰 ЗАБРАТЬ {(bet * currentMulti).toFixed(4)} TON
        </motion.button>
      )}

      {gameOver && (
        <motion.button whileTap={{ scale: 0.97 }} onClick={startGame}
          disabled={user.balance < bet}
          className="w-full py-4 rounded-2xl font-display font-bold text-xl text-black btn-gold disabled:opacity-50 mt-2">
          🔄 ИГРАТЬ СНОВА
        </motion.button>
      )}
    </div>
  )
}
