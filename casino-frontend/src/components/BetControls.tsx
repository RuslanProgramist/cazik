import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useCasinoStore } from '../store'
import { formatTON } from '../utils'

interface BetControlsProps {
  bet: number
  setBet: (val: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const QUICK_BETS = [0.1, 0.5, 1, 5]

export default function BetControls({
  bet, setBet, min = 0.1, max = 100, step = 0.1, disabled = false
}: BetControlsProps) {
  const { user } = useCasinoStore()

  const adjust = (delta: number) => {
    const newVal = Math.min(max, Math.max(min, parseFloat((bet + delta).toFixed(4))))
    setBet(newVal)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => adjust(-step)}
          disabled={disabled || bet <= min}
          className="w-10 h-10 rounded-xl card-glass flex items-center justify-center text-gold-400 disabled:opacity-40"
        >
          <Minus size={16} />
        </motion.button>

        <div className="flex-1 text-center">
          <div className="text-2xl font-display font-bold text-gold-400">
            {formatTON(bet)}
          </div>
          <div className="text-xs text-slate-500 font-mono">TON</div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => adjust(step)}
          disabled={disabled || bet >= Math.min(max, user.balance)}
          className="w-10 h-10 rounded-xl card-glass flex items-center justify-center text-gold-400 disabled:opacity-40"
        >
          <Plus size={16} />
        </motion.button>
      </div>

      <div className="flex gap-2">
        {QUICK_BETS.map((q) => (
          <motion.button
            key={q}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBet(Math.min(q, user.balance))}
            disabled={disabled}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
            style={{
              background: bet === q ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)',
              border: bet === q ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: bet === q ? '#fbbf24' : '#94a3b8',
            }}
          >
            {q} TON
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setBet(user.balance)}
          disabled={disabled}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-gold-400 disabled:opacity-40"
          style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}
        >
          MAX
        </motion.button>
      </div>
    </div>
  )
}
