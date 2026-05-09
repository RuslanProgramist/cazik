import { motion } from 'framer-motion'
import { useCasinoStore } from '../store'
import { formatTON } from '../utils'
import type { GameType } from '../types'

const GAME_LABELS: Record<GameType, string> = {
  slots: '🎰 Слоты',
  dice: '🎲 Кости',
  roulette: '🎡 Рулетка',
  crash: '🚀 Краш',
  coinflip: '🪙 Монетка',
  mines: '💎 Мины',
}

export default function History() {
  const { transactions } = useCasinoStore()

  return (
    <div className="px-4 pt-2 pb-6 max-w-lg mx-auto">
      <h1 className="font-display font-bold text-2xl text-white mb-2">История</h1>
      <p className="text-sm text-slate-500 mb-6">Последние {transactions.length} транзакций</p>

      {transactions.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-5xl mb-4">📋</div>
          <div>Нет транзакций</div>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx, i) => (
            <motion.div key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3.5 rounded-xl card-glass">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${tx.type === 'win' ? 'bg-emerald-500/15' : tx.type === 'deposit' ? 'bg-blue-500/15' : tx.type === 'withdraw' ? 'bg-orange-500/15' : 'bg-red-500/15'}`}>
                {tx.type === 'win' ? '🏆' : tx.type === 'deposit' ? '⬇️' : tx.type === 'withdraw' ? '⬆️' : '🎮'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {tx.game ? GAME_LABELS[tx.game] : tx.type === 'deposit' ? 'Пополнение' : tx.type === 'withdraw' ? 'Вывод' : 'Ставка'}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(tx.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className={`text-sm font-bold font-mono shrink-0 ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''}{formatTON(tx.amount)} TON
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
