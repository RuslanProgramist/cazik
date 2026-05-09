import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BetControls from '../components/BetControls'
import ResultOverlay from '../components/ResultOverlay'
import { useCasinoStore } from '../store'
import { ROULETTE_NUMBERS, randomInt, sleep } from '../utils'
import { useTelegram } from '../hooks/useTelegram'

type BetChoice = 'red' | 'black' | 'green' | 'odd' | 'even' | 'low' | 'high'

const BET_OPTIONS: { key: BetChoice; label: string; multi: number; color: string }[] = [
  { key: 'red', label: '🔴 Красное', multi: 2, color: 'from-red-900/40 to-red-800/20' },
  { key: 'black', label: '⚫ Чёрное', multi: 2, color: 'from-slate-800/40 to-slate-700/20' },
  { key: 'green', label: '💚 Зеро', multi: 14, color: 'from-green-900/40 to-green-800/20' },
  { key: 'odd', label: 'Нечётное', multi: 2, color: 'from-blue-900/40 to-blue-800/20' },
  { key: 'even', label: 'Чётное', multi: 2, color: 'from-purple-900/40 to-purple-800/20' },
  { key: 'low', label: '1–18', multi: 2, color: 'from-orange-900/40 to-orange-800/20' },
  { key: 'high', label: '19–36', multi: 2, color: 'from-teal-900/40 to-teal-800/20' },
]

export default function RouletteGame() {
  const navigate = useNavigate()
  const { haptic } = useTelegram()
  const { user, updateBalance, addTransaction } = useCasinoStore()
  const [bet, setBet] = useState(0.1)
  const [spinning, setSpinning] = useState(false)
  const [betChoice, setBetChoice] = useState<BetChoice>('red')
  const [rotation, setRotation] = useState(0)
  const [landedOn, setLandedOn] = useState<typeof ROULETTE_NUMBERS[0] | null>(null)
  const [history, setHistory] = useState<typeof ROULETTE_NUMBERS>([])
  const [result, setResult] = useState({ show: false, won: false, amount: 0, multi: 0 })

  const spin = async () => {
    if (spinning || user.balance < bet) return
    haptic.medium()
    setSpinning(true)
    setLandedOn(null)
    updateBalance(-bet)

    const idx = randomInt(0, ROULETTE_NUMBERS.length - 1)
    const num = ROULETTE_NUMBERS[idx]
    const degreesPerSlice = 360 / ROULETTE_NUMBERS.length
    const targetAngle = -(idx * degreesPerSlice)
    const spins = 5 + Math.random() * 3
    const totalRotation = rotation + spins * 360 + targetAngle - (rotation % 360)

    setRotation(totalRotation)
    await sleep(4200)
    haptic.heavy()
    setLandedOn(num)

    let won = false
    if (betChoice === 'red') won = num.color === 'red'
    else if (betChoice === 'black') won = num.color === 'black'
    else if (betChoice === 'green') won = num.color === 'green'
    else if (betChoice === 'odd') won = num.number > 0 && num.number % 2 !== 0
    else if (betChoice === 'even') won = num.number > 0 && num.number % 2 === 0
    else if (betChoice === 'low') won = num.number >= 1 && num.number <= 18
    else if (betChoice === 'high') won = num.number >= 19 && num.number <= 36

    const multi = BET_OPTIONS.find(b => b.key === betChoice)!.multi
    const winAmt = won ? bet * multi : 0

    if (won) { updateBalance(winAmt); haptic.success(); addTransaction({ type: 'win', amount: winAmt, game: 'roulette' }) }
    else { addTransaction({ type: 'bet', amount: -bet, game: 'roulette' }) }

    setHistory(h => [num, ...h.slice(0, 9)])
    await sleep(300)
    setResult({ show: true, won, amount: won ? winAmt : bet, multi })
    setSpinning(false)
  }

  return (
    <div className="min-h-screen px-4 pt-2 pb-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl card-glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-400" />
        </motion.button>
        <div>
          <h1 className="font-display font-bold text-xl text-white">Рулетка</h1>
          <p className="text-xs text-slate-500">Европейская рулетка</p>
        </div>
      </div>

      {/* Wheel */}
      <div className="flex justify-center mb-4 relative">
        <div className="relative w-64 h-64">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, #c9a227, #80620f)', padding: '6px', boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
            <div className="w-full h-full rounded-full overflow-hidden relative" style={{ background: '#080c14' }}>
              <motion.div
                className="w-full h-full rounded-full"
                style={{ rotate: rotation }}
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
              >
                {ROULETTE_NUMBERS.map((num, i) => {
                  const angle = (i / ROULETTE_NUMBERS.length) * 360
                  const rad = (angle - 90) * (Math.PI / 180)
                  const r = 90
                  const x = 128 + r * Math.cos(rad)
                  const y = 128 + r * Math.sin(rad)
                  return (
                    <div key={i} className="absolute flex items-center justify-center"
                      style={{ left: x - 14, top: y - 14, width: 28, height: 28, transform: `rotate(${angle}deg)` }}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${num.color === 'red' ? 'bg-red-600' : num.color === 'black' ? 'bg-slate-800 border border-slate-600' : 'bg-green-600'}`}>
                        {num.number}
                      </div>
                    </div>
                  )
                })}
              </motion.div>

              {/* Center hub */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl z-10"
                  style={{ background: 'linear-gradient(135deg, #c9a227, #80620f)', boxShadow: '0 0 20px rgba(201,162,39,0.5)' }}>
                  🎡
                </div>
              </div>
            </div>
          </div>

          {/* Pointer */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 text-2xl">▼</div>
        </div>
      </div>

      {/* Result display */}
      <AnimatePresence>
        {landedOn && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-3">
            <div className={`px-6 py-2 rounded-xl font-bold text-lg ${landedOn.color === 'red' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : landedOn.color === 'black' ? 'bg-slate-700/50 text-white border border-slate-600/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
              {landedOn.number} • {landedOn.color === 'red' ? 'Красное' : landedOn.color === 'black' ? 'Чёрное' : 'Зеро'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History row */}
      {history.length > 0 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {history.map((h, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${h.color === 'red' ? 'bg-red-600' : h.color === 'black' ? 'bg-slate-700 border border-slate-600' : 'bg-green-600'}`}>
              {h.number}
            </motion.div>
          ))}
        </div>
      )}

      {/* Bet Options */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {BET_OPTIONS.map(opt => (
          <motion.button key={opt.key} whileTap={{ scale: 0.97 }}
            onClick={() => setBetChoice(opt.key)}
            className={`p-3 rounded-xl text-left bg-gradient-to-br ${opt.color} transition-all`}
            style={{ border: betChoice === opt.key ? '1px solid rgba(201,162,39,0.5)' : '1px solid rgba(255,255,255,0.06)' }}>
            <div className={`text-sm font-semibold ${betChoice === opt.key ? 'text-gold-400' : 'text-white'}`}>{opt.label}</div>
            <div className="text-xs text-emerald-400 font-bold mt-0.5">×{opt.multi}</div>
          </motion.button>
        ))}
      </div>

      <div className="card-glass rounded-2xl p-4 mb-4">
        <BetControls bet={bet} setBet={setBet} disabled={spinning} />
      </div>

      <motion.button whileTap={{ scale: 0.97 }} onClick={spin}
        disabled={spinning || user.balance < bet}
        className="w-full py-4 rounded-2xl font-display font-bold text-xl text-black btn-gold disabled:opacity-50">
        🎡 {spinning ? 'Крутим...' : 'КРУТИТЬ'}
      </motion.button>

      <ResultOverlay show={result.show} won={result.won} amount={result.amount} multiplier={result.multi}
        onClose={() => setResult(r => ({ ...r, show: false }))} />
    </div>
  )
}
