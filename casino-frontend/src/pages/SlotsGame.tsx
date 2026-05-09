import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BetControls from '../components/BetControls'
import ResultOverlay from '../components/ResultOverlay'
import { useCasinoStore } from '../store'
import { getSlotSymbol, checkSlotWin, sleep, SLOT_SYMBOLS } from '../utils'
import { useTelegram } from '../hooks/useTelegram'

const REEL_COUNT = 3
const VISIBLE_ROWS = 3

function generateReelStrip(): string[] {
  const strip: string[] = []
  for (let i = 0; i < 30; i++) strip.push(getSlotSymbol())
  return strip
}

export default function SlotsGame() {
  const navigate = useNavigate()
  const { haptic } = useTelegram()
  const { user, updateBalance, addTransaction } = useCasinoStore()
  const [bet, setBet] = useState(0.1)
  const [spinning, setSpinning] = useState(false)
  const [reels, setReels] = useState<string[][]>([
    ['🍒', '7️⃣', '⭐'],
    ['🍋', '💎', '🍊'],
    ['🍇', '🃏', '🍒'],
  ])
  const [result, setResult] = useState<{ show: boolean; won: boolean; amount: number; multi: number }>({
    show: false, won: false, amount: 0, multi: 0,
  })
  const [lastWins, setLastWins] = useState<string[]>(['💎💎💎', '🍒🍒🍒', '7️⃣7️⃣⭐'])
  const [offsets, setOffsets] = useState([0, 0, 0])
  const [isAnimating, setIsAnimating] = useState([false, false, false])

  const spin = async () => {
    if (spinning || user.balance < bet) return
    haptic.medium()
    setSpinning(true)
    updateBalance(-bet)

    const finalReels: string[][] = []
    for (let r = 0; r < REEL_COUNT; r++) {
      const strip: string[] = []
      for (let i = 0; i < VISIBLE_ROWS; i++) strip.push(getSlotSymbol())
      finalReels.push(strip)
    }

    setIsAnimating([true, true, true])

    for (let r = 0; r < REEL_COUNT; r++) {
      await sleep(300 * r)
      await sleep(600)
      setReels(prev => {
        const next = [...prev]
        next[r] = finalReels[r]
        return next
      })
      setIsAnimating(prev => {
        const next = [...prev]
        next[r] = false
        return next
      })
      haptic.light()
    }

    const middleRow = finalReels.map(reel => reel[1])
    const multiplier = checkSlotWin(middleRow)
    const won = multiplier > 0
    const winAmount = won ? bet * multiplier : 0

    if (won) {
      updateBalance(winAmount)
      haptic.success()
      addTransaction({ type: 'win', amount: winAmount, game: 'slots' })
      setLastWins(prev => [middleRow.join(''), ...prev.slice(0, 4)])
    } else {
      addTransaction({ type: 'bet', amount: -bet, game: 'slots' })
    }

    await sleep(300)
    setResult({ show: true, won, amount: won ? winAmount : bet, multi: multiplier })
    setSpinning(false)
  }

  return (
    <div className="min-h-screen px-4 pt-2 pb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl card-glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-400" />
        </motion.button>
        <div>
          <h1 className="font-display font-bold text-xl text-white">Слоты</h1>
          <p className="text-xs text-slate-500">Совпади 3 символа</p>
        </div>
      </div>

      {/* Recent wins ticker */}
      <div className="flex items-center gap-2 mb-4 overflow-hidden">
        <span className="text-xs text-slate-500 shrink-0">Недавно:</span>
        <div className="flex gap-2">
          {lastWins.map((w, i) => (
            <motion.span key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="text-sm px-2 py-0.5 rounded-lg bg-gold-400/10 border border-gold-400/20 font-mono whitespace-nowrap">
              {w}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Slot Machine */}
      <div className="relative mb-6">
        <div className="p-1 rounded-3xl" style={{ background: 'linear-gradient(135deg, #c9a227, #80620f, #c9a227)', boxShadow: '0 0 40px rgba(201,162,39,0.3)' }}>
          <div className="rounded-[22px] p-4" style={{ background: 'linear-gradient(180deg, #0d1424 0%, #080c14 100%)' }}>
            {/* Reels */}
            <div className="flex gap-3 justify-center mb-4">
              {reels.map((reel, ri) => (
                <div key={ri} className="flex-1 rounded-xl overflow-hidden relative"
                  style={{ background: '#050810', border: '1px solid rgba(201,162,39,0.2)', height: '168px' }}>
                  {/* Center highlight */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 z-10 pointer-events-none"
                    style={{ background: 'rgba(201,162,39,0.06)', borderTop: '1px solid rgba(201,162,39,0.2)', borderBottom: '1px solid rgba(201,162,39,0.2)' }} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isAnimating[ri] ? 'spinning' : reel.join('')}
                      className="absolute inset-0 flex flex-col"
                    >
                      {isAnimating[ri] ? (
                        <motion.div
                          animate={{ y: [0, -56, 0, -56, 0] }}
                          transition={{ duration: 0.15, repeat: Infinity }}
                          className="flex flex-col"
                        >
                          {SLOT_SYMBOLS.concat(SLOT_SYMBOLS).map((s, i) => (
                            <div key={i} className="h-14 flex items-center justify-center text-4xl">{s}</div>
                          ))}
                        </motion.div>
                      ) : (
                        reel.map((sym, si) => (
                          <motion.div
                            key={si}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: si * 0.05 }}
                            className="h-14 flex items-center justify-center text-4xl"
                          >
                            {sym}
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Paylines indicator */}
            <div className="flex justify-center gap-1 mb-2">
              {[0,1,2].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? 'bg-gold-400' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Decorative coins */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-3xl opacity-30 animate-float">🪙</div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>🪙</div>
      </div>

      {/* Paytable */}
      <div className="mb-4 p-3 rounded-xl card-glass">
        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Выплаты (за 1 TON)</div>
        <div className="grid grid-cols-2 gap-1.5">
          {[['7️⃣7️⃣7️⃣', '×50'], ['💎💎💎', '×25'], ['🃏🃏🃏', '×15'], ['⭐⭐⭐', '×10']].map(([combo, pay]) => (
            <div key={combo} className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/5">
              <span className="text-sm font-mono">{combo}</span>
              <span className="text-sm font-bold text-gold-400">{pay}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bet Controls */}
      <div className="card-glass rounded-2xl p-4 mb-4">
        <BetControls bet={bet} setBet={setBet} disabled={spinning} />
      </div>

      {/* Spin Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={spin}
        disabled={spinning || user.balance < bet}
        className="w-full py-4 rounded-2xl font-display font-bold text-xl text-black btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <RotateCcw size={22} className={spinning ? 'animate-spin' : ''} />
        {spinning ? 'Крутим...' : 'КРУТИТЬ'}
      </motion.button>

      <ResultOverlay
        show={result.show}
        won={result.won}
        amount={result.amount}
        multiplier={result.multi}
        onClose={() => setResult(r => ({ ...r, show: false }))}
      />
    </div>
  )
}
