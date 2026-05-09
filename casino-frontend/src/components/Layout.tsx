import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Wallet, History, Trophy, Gamepad2 } from 'lucide-react'
import { useCasinoStore } from '../store'
import { formatTON } from '../utils'

const navItems = [
  { path: '/', icon: Home, label: 'Игры' },
  { path: '/leaderboard', icon: Trophy, label: 'Топ' },
  { path: '/history', icon: History, label: 'История' },
  { path: '/wallet', icon: Wallet, label: 'Кошелёк' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useCasinoStore()

  const isGamePage = ['/slots', '/dice', '/roulette', '/crash', '/coinflip', '/mines'].includes(location.pathname)

  return (
    <div className="min-h-screen stars-bg flex flex-col noise-bg">
      {/* Top Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, rgba(8,12,20,0.98) 0%, rgba(8,12,20,0.0) 100%)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-sm font-bold text-black">
            🎰
          </div>
          <span className="font-display font-bold text-lg shimmer-text">TON Casino</span>
        </div>

        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full card-glass cursor-pointer"
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/wallet')}
        >
          <img
            src="https://ton.org/download/ton_symbol.svg"
            alt="TON"
            className="w-4 h-4"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span className="font-mono font-semibold text-sm text-gold-400">
            {formatTON(user.balance)} TON
          </span>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{
          background: 'linear-gradient(0deg, rgba(8,12,20,1) 70%, rgba(8,12,20,0) 100%)',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}>
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  size={20}
                  className={isActive ? 'text-gold-400' : 'text-slate-500'}
                />
                <span className={`text-xs font-medium ${isActive ? 'text-gold-400' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
