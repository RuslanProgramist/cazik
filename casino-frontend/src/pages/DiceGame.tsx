import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BetControls from '../components/BetControls'
import ResultOverlay from '../components/ResultOverlay'
import { useCasinoStore } from '../store'
import { randomInt, sleep } from '../utils'
import { useTelegram } from '../hooks/useTelegram'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const MULTIPLIERS: Record<string, { label: string; multi: number; chance: number }> = {
  exact: { label: 'Точное число', multi: 5.8, chance: 16.7 },
  low: { label: '1–3', multi: 1.9, chance: 50 },
  high: { label: '4–6', multi: 1.9, chance: 50 },
  even: { label: 'Чётное', multi: 1.9, chance: 50 },
  odd: { label: 'Нечётное', multi: 1.9, chance: 50 },
}

export default function DiceGame() {
  const navigate = useNavigate()
  const { haptic } = useTelegram()
  const { user, updateBalance, addTransaction } = useCasinoStore()
  const [bet, setBet] = useState(0.1)
  const [rolling, setRolling] = useState(false)
  const [diceValue, setDiceValue] = useState(1)
  const [displayValue, setDisplayValue] = useState(1)
  const [target, setTarget] = useState(1)
  const [betType, setBetType] = useState<keyof typeof MULTIPLIERS>('exact')
  const [result, setResult] = useState({ show: false, won: false, amount: 0, multi: 0 })
  const [history, setHistory] = useState<number[]>([3, 5, 1, 6, 2, 4])

  const roll = async () => {
    if (rolling || user.balance < bet) return
    haptic.medium()
    setRolling(true)
    updateBalance(-bet)

    // Animate rolling
    for (let i = 0; i < 15; i++) {
      setDisplayValue(randomInt(1, 6))
      await sleep(50 + i * 10)
    }

    const finalVal = randomInt(1, 6)
    setDiceValue(finalVal)
    setDisplayValue(finalVal)
    haptic.heavy()

    let won = false
    if (betType === 'exact') won = finalVal === target
    else if (betType === 'low') won = finalVal <= 3
    else if (betType === 'high') won = finalVal >= 4
    else if (betType === 'even') won = finalVal % 2 === 0
    else if (betType === 'odd') won = finalVal % 2 !== 0

    const multi = MULTIPLIERS[betType].multi
    const winAmt = won ? bet * multi : 0

    if (won) { updateBalance(winAmt); haptic.success(); addTransaction({ type: 'win', amount: winAmt, game: 'dice' }) }
    else { addTransaction({ type: 'bet', amount: -bet, game: 'dice' }) }

    setHistory(h => [finalVal, ...h.slice(0, 9)])
    await sleep(200)
    setResult({ show: true, won, amount: won ? winAmt : bet, multi })
    setRolling(false)
  }

  return (
    <div className="min-h-screen px-4 pt-2 pb-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl card-glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-400" />
        </motion.button>
        <div>
          <h1 className="font-display font-bold text-xl text-white">Кости</h1>
          <p className="text-xs text-slate-500">Угадай результат броска</p>
        </div>
      </div>

      {/* Dice Display */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <motion.div
            animate={rolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
            className="w-36 h-36 rounded-3xl flex items-center justify-center text-8xl select-none"
            style={{
              background: 'linear-gradient(135deg, #1e2d45 0%, #111827 100%)',
              border: '2px solid rgba(201,162,39,0.3)',
              boxShadow: rolling ? '0 0 30px rgba(201,162,39,0.5)' : '0 0 15px rgba(201,162,39,0.2)',
            }}
          >
            {DICE_FACES[displayValue - 1]}
          </motion.div>
          {!rolling && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-sm font-bold"
              style={{ background: 'rgba(201,162,39,0.2)', border: '1px solid rgba(201,162,39,0.4)', color: '#fbbf24' }}
            >
              {diceValue}
            </motion.div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 shrink-0">История:</span>
        <div className="flex gap-1.5">
          {history.map((v, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
              style={{ background: i === 0 ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)', border: i === 0 ? '1px solid rgba(201,162,39,0.3)' : 'none' }}
            >
              {DICE_FACES[v - 1]}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bet Types */}
      <div className="card-glass rounded-2xl p-4 mb-4">
        <div className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Ставка на</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(MULTIPLIERS).map(([key, val]) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setBetType(key as keyof typeof MULTIPLIERS)}
              className="p-2.5 rounded-xl text-left transition-all"
              style={{
                background: betType === key ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)',
                border: betType === key ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className={`text-sm font-semibold ${betType === key ? 'text-gold-400' : 'text-white'}`}>{val.label}</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-slate-500">{val.chance}%</span>
                <span className="text-xs font-bold text-emerald-400">×{val.multi}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Number picker (only for exact) */}
        <AnimatePresence>
          {betType === 'exact' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="text-xs text-slate-500 mb-2">Выбери число:</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTarget(n)}
                    className="flex-1 aspect-square rounded-xl flex items-center justify-center text-xl transition-all"
                    style={{
                      background: target === n ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)',
                      border: target === n ? '1px solid rgba(201,162,39,0.5)' : '1px solid transparent',
                    }}
                  >
                    {DICE_FACES[n - 1]}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bet Controls */}
      <div className="card-glass rounded-2xl p-4 mb-4">
        <BetControls bet={bet} setBet={setBet} disabled={rolling} />
        <div className="mt-2 text-center text-xs text-slate-500">
          Возможный выигрыш: <span className="text-emerald-400 font-semibold">{(bet * MULTIPLIERS[betType].multi).toFixed(4)} TON</span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={roll}
        disabled={rolling || user.balance < bet}
        className="w-full py-4 rounded-2xl font-display font-bold text-xl text-black btn-gold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        🎲 {rolling ? 'Бросаем...' : 'БРОСИТЬ'}
      </motion.button>

      <ResultOverlay show={result.show} won={result.won} amount={result.amount} multiplier={result.multi}
        onClose={() => setResult(r => ({ ...r, show: false }))} />
    </div>
  )
}
