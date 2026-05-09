import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BetControls from '../components/BetControls'
import ResultOverlay from '../components/ResultOverlay'
import { useCasinoStore } from '../store'
import { sleep } from '../utils'
import { useTelegram } from '../hooks/useTelegram'

export default function CoinFlipGame() {
  const navigate = useNavigate()
  const { haptic } = useTelegram()
  const { user, updateBalance, addTransaction } = useCasinoStore()
  const [bet, setBet] = useState(0.1)
  const [flipping, setFlipping] = useState(false)
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads')
  const [coinSide, setCoinSide] = useState<'heads' | 'tails'>('heads')
  const [isFlipAnim, setIsFlipAnim] = useState(false)
  const [history, setHistory] = useState<('heads' | 'tails')[]>(['heads', 'tails', 'heads', 'tails', 'heads'])
  const [result, setResult] = useState({ show: false, won: false, amount: 0 })
  const [streak, setStreak] = useState(0)

  const flip = async () => {
    if (flipping || user.balance < bet) return
    haptic.medium()
    setFlipping(true)
    setIsFlipAnim(true)
    updateBalance(-bet)

    await sleep(1200)

    const landed: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails'
    setCoinSide(landed)
    setIsFlipAnim(false)
    haptic.heavy()

    const won = landed === choice
    const winAmt = won ? bet * 1.95 : 0

    if (won) {
      updateBalance(winAmt)
      haptic.success()
      addTransaction({ type: 'win', amount: winAmt, game: 'coinflip' })
      setStreak(s => s + 1)
    } else {
      addTransaction({ type: 'bet', amount: -bet, game: 'coinflip' })
      setStreak(0)
    }

    setHistory(h => [landed, ...h.slice(0, 9)])
    await sleep(300)
    setResult({ show: true, won, amount: won ? winAmt : bet })
    setFlipping(false)
  }

  return (
    <div className="min-h-screen px-4 pt-2 pb-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl card-glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-400" />
        </motion.button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-xl text-white">Монетка</h1>
          <p className="text-xs text-slate-500">×1.95 | Орёл или решка</p>
        </div>
        {streak > 1 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="px-3 py-1 rounded-full text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20">
            🔥 {streak} в ряд
          </motion.div>
        )}
      </div>

      {/* History */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {history.map((h, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 ${h === 'heads' ? 'border-gold-400/50 bg-gold-400/10' : 'border-slate-500/50 bg-slate-700/30'}`}>
            {h === 'heads' ? '🦅' : '🏛️'}
          </motion.div>
        ))}
      </div>

      {/* Coin */}
      <div className="flex justify-center mb-8">
        <div style={{ perspective: '600px' }}>
          <motion.div
            animate={isFlipAnim ? {
              rotateY: [0, 180, 360, 540, 720, 900, 1080],
              scale: [1, 1.1, 1, 1.1, 1, 1.1, 1],
            } : {}}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="w-44 h-44 rounded-full flex items-center justify-center relative"
            style={{
              background: coinSide === 'heads'
                ? 'radial-gradient(circle at 35% 35%, #fde68a, #c9a227 40%, #80620f)'
                : 'radial-gradient(circle at 35% 35%, #cbd5e1, #94a3b8 40%, #475569)',
              boxShadow: coinSide === 'heads'
                ? '0 0 40px rgba(201,162,39,0.5), inset 0 -4px 10px rgba(0,0,0,0.3)'
                : '0 0 20px rgba(148,163,184,0.3), inset 0 -4px 10px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-7xl select-none">{coinSide === 'heads' ? '🦅' : '🏛️'}</span>
          </motion.div>
        </div>
      </div>

      {/* Choice */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {(['heads', 'tails'] as const).map(side => (
          <motion.button key={side} whileTap={{ scale: 0.97 }}
            onClick={() => setChoice(side)}
            className="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all"
            style={{
              background: choice === side ? side === 'heads' ? 'rgba(201,162,39,0.15)' : 'rgba(148,163,184,0.1)' : 'rgba(255,255,255,0.04)',
              border: choice === side ? side === 'heads' ? '2px solid rgba(201,162,39,0.5)' : '2px solid rgba(148,163,184,0.4)' : '2px solid rgba(255,255,255,0.06)',
            }}>
            <span className="text-4xl">{side === 'heads' ? '🦅' : '🏛️'}</span>
            <div className={`font-semibold ${choice === side ? (side === 'heads' ? 'text-gold-400' : 'text-slate-300') : 'text-slate-500'}`}>
              {side === 'heads' ? 'Орёл' : 'Решка'}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="card-glass rounded-2xl p-4 mb-4">
        <BetControls bet={bet} setBet={setBet} disabled={flipping} />
        <div className="mt-2 text-center text-xs text-slate-500">
          Выигрыш: <span className="text-emerald-400 font-semibold">{(bet * 1.95).toFixed(4)} TON</span>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.97 }} onClick={flip}
        disabled={flipping || user.balance < bet}
        className="w-full py-4 rounded-2xl font-display font-bold text-xl text-black btn-gold disabled:opacity-50">
        🪙 {flipping ? 'Бросаем...' : 'БРОСИТЬ'}
      </motion.button>

      <ResultOverlay show={result.show} won={result.won} amount={result.amount}
        label={`Выпало: ${coinSide === 'heads' ? 'Орёл' : 'Решка'}`}
        onClose={() => setResult(r => ({ ...r, show: false }))} />
    </div>
  )
}
