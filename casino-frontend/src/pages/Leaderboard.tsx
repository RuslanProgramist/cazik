import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatTON } from '../utils'

const MOCK_LEADERS = [
  { rank: 1, name: 'CryptoKing', avatar: '👑', won: 4821.5, bets: 3200, game: '🎰' },
  { rank: 2, name: 'LuckyTON', avatar: '🦅', won: 3102.1, bets: 2800, game: '🚀' },
  { rank: 3, name: 'DiamondHands', avatar: '💎', won: 2456.8, bets: 1950, game: '💎' },
  { rank: 4, name: 'RocketMan', avatar: '🚀', won: 1823.3, bets: 1600, game: '🎲' },
  { rank: 5, name: 'GoldRush', avatar: '⭐', won: 1445.0, bets: 1200, game: '🎡' },
  { rank: 6, name: 'TonWizard', avatar: '🧙', won: 1230.7, bets: 1100, game: '🪙' },
  { rank: 7, name: 'MoonShot', avatar: '🌙', won: 987.4, bets: 900, game: '🚀' },
  { rank: 8, name: 'JackpotJoe', avatar: '🎰', won: 765.2, bets: 750, game: '🎰' },
  { rank: 9, name: 'CoinFlipPro', avatar: '🪙', won: 542.1, bets: 600, game: '🪙' },
  { rank: 10, name: 'DiceRoller', avatar: '🎲', won: 421.8, bets: 500, game: '🎲' },
]

type SortKey = 'won' | 'bets'

export default function Leaderboard() {
  const [sort, setSort] = useState<SortKey>('won')

  const sorted = [...MOCK_LEADERS].sort((a, b) => b[sort] - a[sort])
    .map((p, i) => ({ ...p, rank: i + 1 }))

  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <div className="px-4 pt-2 pb-6 max-w-lg mx-auto">
      <h1 className="font-display font-bold text-2xl text-white mb-2">Топ игроков</h1>
      <p className="text-sm text-slate-500 mb-4">Лидеры недели</p>

      {/* Sort */}
      <div className="flex gap-2 mb-6">
        {([['won', '💰 По выигрышу'], ['bets', '🎮 По ставкам']] as [SortKey, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setSort(k)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: sort === k ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)',
              border: sort === k ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.06)',
              color: sort === k ? '#fbbf24' : '#94a3b8',
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-6 pt-4">
        {[podium[1], podium[0], podium[2]].map((p, i) => {
          const isFirst = i === 1
          const height = isFirst ? 'h-28' : 'h-20'
          const medalColors = ['bg-slate-500', 'bg-gold-500', 'bg-amber-700']
          const medals = ['🥈', '🥇', '🥉']
          const medalIdx = i === 0 ? 1 : i === 1 ? 0 : 2

          return (
            <motion.div key={p?.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 flex-1">
              <div className="text-3xl">{p?.avatar}</div>
              <div className="text-sm font-semibold text-white truncate max-w-full px-1 text-center">{p?.name}</div>
              <div className="text-xs text-gold-400 font-mono font-bold">{formatTON(p?.[sort] || 0)} TON</div>
              <div className={`w-full ${height} rounded-t-xl flex items-start justify-center pt-2`}
                style={{
                  background: isFirst
                    ? 'linear-gradient(180deg, rgba(201,162,39,0.3), rgba(201,162,39,0.1))'
                    : i === 0
                    ? 'linear-gradient(180deg, rgba(148,163,184,0.2), rgba(148,163,184,0.05))'
                    : 'linear-gradient(180deg, rgba(180,100,30,0.2), rgba(180,100,30,0.05))',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                <span className="text-xl">{medals[medalIdx]}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Rest of leaderboard */}
      <div className="space-y-2">
        {rest.map((p, i) => (
          <motion.div key={p.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="flex items-center gap-3 p-3.5 rounded-xl card-glass">
            <div className="w-7 text-center font-bold text-slate-500 text-sm">#{p.rank}</div>
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-xl">{p.avatar}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{p.name}</div>
              <div className="text-xs text-slate-500">Любимая: {p.game}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-gold-400">{formatTON(p[sort])} TON</div>
              <div className="text-xs text-slate-500">{p.bets} ставок</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My rank */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="mt-4 p-4 rounded-2xl text-center"
        style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <div className="text-sm text-slate-400">Твоя позиция</div>
        <div className="text-2xl font-bold text-gold-400 mt-1">#247</div>
        <div className="text-xs text-slate-500 mt-0.5">Сыграй больше чтобы подняться в топ</div>
      </motion.div>
    </div>
  )
}
