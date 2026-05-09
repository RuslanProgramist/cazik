import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BetControls from '../components/BetControls'
import { useCasinoStore } from '../store'
import { randomBetween, sleep } from '../utils'
import { useTelegram } from '../hooks/useTelegram'

type GameState = 'waiting' | 'running' | 'crashed'

const HISTORY = [1.23, 5.67, 1.01, 12.4, 2.33, 8.9, 1.55, 3.21, 1.02, 22.1]

export default function CrashGame() {
  const navigate = useNavigate()
  const { haptic } = useTelegram()
  const { user, updateBalance, addTransaction } = useCasinoStore()
  const [bet, setBet] = useState(0.1)
  const [autoCashout, setAutoCashout] = useState(2.0)
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashPoint, setCrashPoint] = useState(0)
  const [hasBet, setHasBet] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashedOutAt, setCashedOutAt] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const [points, setPoints] = useState<{ x: number; y: number }[]>([{ x: 0, y: 200 }])
  const canvasRef = useRef<SVGSVGElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)
  const crashRef = useRef(0)

  const generateCrashPoint = () => {
    const r = Math.random()
    if (r < 0.35) return randomBetween(1.0, 1.5)
    if (r < 0.65) return randomBetween(1.5, 3)
    if (r < 0.85) return randomBetween(3, 8)
    if (r < 0.95) return randomBetween(8, 20)
    return randomBetween(20, 100)
  }

  const startGame = useCallback(async () => {
    // Countdown
    setGameState('waiting')
    for (let i = 5; i > 0; i--) {
      setCountdown(i)
      await sleep(1000)
    }

    const cp = generateCrashPoint()
    crashRef.current = cp
    setCrashPoint(cp)
    setMultiplier(1.0)
    setPoints([{ x: 0, y: 200 }])
    setGameState('running')
    startTimeRef.current = Date.now()

    let mult = 1.0
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      mult = Math.pow(Math.E, 0.15 * elapsed)

      if (mult >= crashRef.current) {
        mult = crashRef.current
        setMultiplier(mult)
        clearInterval(intervalRef.current!)
        setGameState('crashed')
        haptic.error()

        setHasBet(prev => {
          if (prev) addTransaction({ type: 'bet', amount: -bet, game: 'crash' })
          return false
        })
        setCashedOut(false)

        setTimeout(() => startGame(), 4000)
        return
      }

      setMultiplier(mult)
      setPoints(prev => {
        const t = (Date.now() - startTimeRef.current) / 50
        const x = Math.min(t * 1.5, 340)
        const y = Math.max(200 - Math.pow(mult - 1, 0.7) * 80, 10)
        return [...prev.slice(-80), { x, y }]
      })

      // Auto cashout
      setAutoCashout(ac => {
        if (mult >= ac) {
          setCashedOut(prev => {
            if (!prev) {
              setHasBet(hb => {
                if (hb) {
                  const win = bet * mult
                  updateBalance(win)
                  addTransaction({ type: 'win', amount: win, game: 'crash' })
                  haptic.success()
                  setCashedOutAt(mult)
                }
                return false
              })
            }
            return prev
          })
        }
        return ac
      })
    }, 50)
  }, [bet])

  useEffect(() => {
    startGame()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const placeBet = () => {
    if (gameState !== 'waiting' || hasBet || user.balance < bet) return
    setHasBet(true)
    updateBalance(-bet)
    haptic.medium()
  }

  const cashout = () => {
    if (!hasBet || cashedOut || gameState !== 'running') return
    setCashedOut(true)
    const win = bet * multiplier
    setCashedOutAt(multiplier)
    updateBalance(win)
    addTransaction({ type: 'win', amount: win, game: 'crash' })
    haptic.success()
    setHasBet(false)
  }

  const pathD = points.length > 1
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : 'M 0,200'

  const color = gameState === 'crashed' ? '#ef4444' : gameState === 'running' ? '#22c55e' : '#94a3b8'

  return (
    <div className="min-h-screen px-4 pt-2 pb-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl card-glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-400" />
        </motion.button>
        <div>
          <h1 className="font-display font-bold text-xl text-white">Краш</h1>
          <p className="text-xs text-slate-500">Успей вывести до краша</p>
        </div>
      </div>

      {/* History */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {HISTORY.map((h, i) => (
          <span key={i} className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${h < 2 ? 'bg-red-500/20 text-red-400' : h < 5 ? 'bg-blue-500/20 text-blue-400' : 'bg-gold-400/20 text-gold-400'}`}>
            {h.toFixed(2)}×
          </span>
        ))}
      </div>

      {/* Graph */}
      <div className="mb-4 rounded-2xl overflow-hidden relative"
        style={{ background: '#050810', border: '1px solid rgba(201,162,39,0.15)', height: '220px' }}>

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full">
          {[50, 100, 150, 200].map(y => (
            <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
        </svg>

        <svg ref={canvasRef} className="absolute inset-0 w-full h-full" viewBox="0 0 360 220" preserveAspectRatio="none">
          {/* Gradient fill */}
          <defs>
            <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {points.length > 1 && (
            <>
              <path d={`${pathD} L ${points[points.length - 1].x},220 L 0,220 Z`}
                fill="url(#fillGrad)" />
              <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          {/* Dot */}
          {points.length > 0 && gameState === 'running' && (
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill={color} />
          )}
        </svg>

        {/* Multiplier overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {gameState === 'waiting' ? (
            <div className="text-center">
              <div className="text-slate-400 text-sm mb-1">Следующий раунд через</div>
              <div className="text-5xl font-display font-bold text-white">{countdown}</div>
            </div>
          ) : (
            <motion.div
              animate={gameState === 'crashed' ? { scale: [1, 1.2, 1] } : {}}
              className="text-center"
            >
              <div className={`text-6xl font-display font-bold ${gameState === 'crashed' ? 'text-red-400' : 'text-emerald-400'}`}
                style={{ textShadow: `0 0 30px ${gameState === 'crashed' ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)'}` }}>
                {multiplier.toFixed(2)}×
              </div>
              {gameState === 'crashed' && <div className="text-red-400 font-bold text-sm mt-1">💥 КРАШ!</div>}
              {cashedOut && gameState === 'running' && (
                <div className="text-gold-400 text-sm font-bold">✅ Выведено на {cashedOutAt.toFixed(2)}×</div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Auto cashout */}
      <div className="card-glass rounded-2xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Авто-вывод</span>
          <span className="text-sm font-bold text-gold-400">{autoCashout.toFixed(2)}×</span>
        </div>
        <input type="range" min="1.1" max="20" step="0.1" value={autoCashout}
          onChange={e => setAutoCashout(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #c9a227 0%, #c9a227 ${((autoCashout - 1.1) / 18.9) * 100}%, rgba(255,255,255,0.1) ${((autoCashout - 1.1) / 18.9) * 100}%, rgba(255,255,255,0.1) 100%)` }}
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>1.1×</span><span>20×</span>
        </div>
      </div>

      <div className="card-glass rounded-2xl p-4 mb-4">
        <BetControls bet={bet} setBet={setBet} disabled={hasBet || gameState === 'running'} />
      </div>

      <div className="flex gap-3">
        {!hasBet ? (
          <motion.button whileTap={{ scale: 0.97 }} onClick={placeBet}
            disabled={gameState !== 'waiting' || user.balance < bet}
            className="flex-1 py-4 rounded-2xl font-display font-bold text-lg text-black btn-gold disabled:opacity-50">
            🚀 ПОСТАВИТЬ
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.97 }} onClick={cashout}
            disabled={gameState !== 'running' || cashedOut}
            className="flex-1 py-4 rounded-2xl font-display font-bold text-lg text-white disabled:opacity-50 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
            <TrendingUp className="inline mr-2" size={20} />
            ВЫВЕСТИ {(bet * multiplier).toFixed(3)} TON
          </motion.button>
        )}
      </div>
    </div>
  )
}
