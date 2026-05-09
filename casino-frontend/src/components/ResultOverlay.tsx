import { motion, AnimatePresence } from 'framer-motion'
import { formatTON } from '../utils'

interface ResultOverlayProps {
  show: boolean
  won: boolean
  amount: number
  multiplier?: number
  onClose: () => void
  label?: string
}

export default function ResultOverlay({ show, won, amount, multiplier, onClose, label }: ResultOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center px-8 py-10 rounded-3xl max-w-xs mx-4"
            style={{
              background: won
                ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.05))',
              border: won ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <motion.div
              animate={{ rotate: won ? [0, -10, 10, -5, 5, 0] : [0, -3, 3, 0] }}
              transition={{ duration: 0.5 }}
              className="text-7xl mb-4"
            >
              {won ? '🏆' : '💸'}
            </motion.div>

            <div className={`text-2xl font-display font-bold mb-1 ${won ? 'text-emerald-400' : 'text-red-400'}`}>
              {won ? 'ПОБЕДА!' : 'ПРОИГРЫШ'}
            </div>

            {label && <div className="text-sm text-slate-400 mb-3">{label}</div>}

            <div className={`text-4xl font-mono font-bold ${won ? 'text-gold-400' : 'text-slate-400'}`}>
              {won ? '+' : '-'}{formatTON(Math.abs(amount))} TON
            </div>

            {multiplier && won && (
              <div className="mt-2 text-sm text-emerald-400 font-semibold">
                × {multiplier} множитель
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl font-semibold text-sm btn-gold text-black"
            >
              Продолжить
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
