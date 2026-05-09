import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCasinoStore } from '../store'
import { formatTON } from '../utils'

const games = [
  { path: '/slots', emoji: '🎰', title: 'Слоты', desc: 'Крути барабаны', color: 'from-purple-900/40 to-purple-800/20', border: 'rgba(168,85,247,0.3)', hot: true },
  { path: '/dice', emoji: '🎲', title: 'Кости', desc: 'Угадай число', color: 'from-blue-900/40 to-blue-800/20', border: 'rgba(59,130,246,0.3)', hot: false },
  { path: '/roulette', emoji: '🎡', title: 'Рулетка', desc: 'Красное/чёрное', color: 'from-red-900/40 to-red-800/20', border: 'rgba(239,68,68,0.3)', hot: false },
  { path: '/crash', emoji: '🚀', title: 'Краш', desc: 'Успей вывести', color: 'from-orange-900/40 to-orange-800/20', border: 'rgba(249,115,22,0.3)', hot: true },
  { path: '/coinflip', emoji: '🪙', title: 'Монетка', desc: 'Орёл или решка', color: 'from-yellow-900/40 to-yellow-800/20', border: 'rgba(234,179,8,0.3)', hot: false },
  { path: '/mines', emoji: '💎', title: 'Мины', desc: 'Найди алмазы', color: 'from-teal-900/40 to-teal-800/20', border: 'rgba(20,184,166,0.3)', hot: true },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useCasinoStore()

  return (
    <div className="px-4 pt-2 pb-6 max-w-2xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-5 rounded-2xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.12) 0%, rgba(13,20,36,0.8) 100%)', border: '1px solid rgba(201,162,39,0.2)' }}
      >
        <div className="absolute top-0 right-0 text-7xl opacity-10 -mt-2 -mr-2">🎰</div>
        <div className="text-slate-400 text-sm mb-1">Привет, {user.firstName}!</div>
        <div className="text-3xl font-display font-bold text-gold-400">{formatTON(user.balance)} <span className="text-lg text-slate-400">TON</span></div>
        <div className="flex gap-4 mt-3">
          <div>
            <div className="text-xs text-slate-500">Выиграно</div>
            <div className="text-sm font-semibold text-emerald-400">+{formatTON(user.totalWon)} TON</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Поставлено</div>
            <div className="text-sm font-semibold text-slate-300">{formatTON(user.totalBet)} TON</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Уровень</div>
            <div className="text-sm font-semibold text-gold-400">⭐ {user.level}</div>
          </div>
        </div>
      </motion.div>

      {/* Games Grid */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-white">Игры</h2>
        <span className="text-xs text-slate-500">{games.length} игр</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {games.map((game, i) => (
          <motion.button
            key={game.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(game.path)}
            className={`relative p-4 rounded-2xl text-left bg-gradient-to-br ${game.color} overflow-hidden`}
            style={{ border: `1px solid ${game.border}` }}
          >
            {game.hot && (
              <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                HOT
              </span>
            )}
            <div className="text-4xl mb-2">{game.emoji}</div>
            <div className="font-display font-bold text-white text-base">{game.title}</div>
            <div className="text-xs text-slate-400 mt-0.5">{game.desc}</div>
          </motion.button>
        ))}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Онлайн', value: '1,247', icon: '🟢' },
          { label: 'Выплачено', value: '847K TON', icon: '💰' },
          { label: 'Игр сыграно', value: '2.1M', icon: '🎮' },
        ].map((stat) => (
          <div key={stat.label} className="p-3 rounded-xl card-glass text-center">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-sm font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
