import { useState } from 'react'
import { motion } from 'framer-motion'
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react'
import { Copy, ExternalLink, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useCasinoStore } from '../store'
import { formatTON, formatAddress } from '../utils'

const DEPOSIT_AMOUNTS = [1, 5, 10, 50, 100]

export default function Wallet() {
  const { user, isWalletConnected } = useCasinoStore()
  const address = useTonAddress()
  const [copied, setCopied] = useState(false)
  const [depositAmount, setDepositAmount] = useState(10)
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit')

  const copy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="px-4 pt-2 pb-6 max-w-lg mx-auto">
      <h1 className="font-display font-bold text-2xl text-white mb-6">Кошелёк</h1>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(13,20,36,0.9) 100%)', border: '1px solid rgba(201,162,39,0.25)' }}>
        <div className="absolute top-0 right-0 text-8xl opacity-5 -mt-4 -mr-4">💰</div>
        <div className="text-slate-400 text-sm mb-1">Баланс</div>
        <div className="text-4xl font-display font-bold text-gold-400 mb-1">{formatTON(user.balance)}</div>
        <div className="text-slate-500 text-sm">TON</div>
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
          <div>
            <div className="text-xs text-slate-500">Выиграно</div>
            <div className="text-sm font-semibold text-emerald-400">+{formatTON(user.totalWon)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Потрачено</div>
            <div className="text-sm font-semibold text-red-400">-{formatTON(user.totalBet)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Профит</div>
            <div className={`text-sm font-semibold ${user.totalWon - user.totalBet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {user.totalWon - user.totalBet >= 0 ? '+' : ''}{formatTON(user.totalWon - user.totalBet)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* TON Connect */}
      <div className="card-glass rounded-2xl p-4 mb-4">
        <div className="text-sm text-slate-400 mb-3 font-semibold">Подключить кошелёк</div>
        <div className="flex items-center gap-3">
          <TonConnectButton />
          {address && (
            <button onClick={copy}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Copy size={14} />
              {copied ? 'Скопировано!' : formatAddress(address)}
            </button>
          )}
        </div>
      </div>

      {/* Deposit / Withdraw Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {(['deposit', 'withdraw'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === t ? 'rgba(201,162,39,0.2)' : 'transparent',
              color: tab === t ? '#fbbf24' : '#64748b',
            }}>
            {t === 'deposit' ? '⬇️ Пополнить' : '⬆️ Вывести'}
          </button>
        ))}
      </div>

      {tab === 'deposit' ? (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="card-glass rounded-2xl p-4">
            <div className="text-sm text-slate-400 mb-3">Сумма пополнения</div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {DEPOSIT_AMOUNTS.map(a => (
                <motion.button key={a} whileTap={{ scale: 0.95 }}
                  onClick={() => setDepositAmount(a)}
                  className="py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: depositAmount === a ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)',
                    border: depositAmount === a ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    color: depositAmount === a ? '#fbbf24' : '#94a3b8',
                  }}>
                  {a}
                </motion.button>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl font-bold text-black btn-gold flex items-center justify-center gap-2">
              <ArrowDownCircle size={18} />
              Пополнить {depositAmount} TON
            </motion.button>
          </div>

          {/* QR / Address */}
          <div className="card-glass rounded-2xl p-4 text-center">
            <div className="text-sm text-slate-400 mb-3">Или отправь TON напрямую</div>
            <div className="w-32 h-32 mx-auto mb-3 rounded-xl bg-white flex items-center justify-center text-4xl">
              📱
            </div>
            <div className="text-xs text-slate-500 font-mono break-all px-4">
              {address || 'Подключи кошелёк для получения адреса'}
            </div>
          </div>

          {/* Payment methods */}
          <div className="card-glass rounded-2xl p-4">
            <div className="text-sm text-slate-400 mb-3">Другие способы оплаты</div>
            <div className="space-y-2">
              {[
                { icon: '🤖', name: 'Crypto Pay', desc: 'Через @CryptoBot', badge: 'Рекомендуем' },
                { icon: '⭐', name: 'Telegram Stars', desc: 'Встроенная оплата', badge: '' },
                { icon: '💵', name: 'USDT', desc: 'TRC-20 & ERC-20', badge: 'Скоро' },
              ].map(m => (
                <div key={m.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.desc}</div>
                  </div>
                  {m.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold-400/10 text-gold-400 border border-gold-400/20">{m.badge}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="card-glass rounded-2xl p-4">
            <div className="text-sm text-slate-400 mb-3">Сумма вывода</div>
            <div className="flex items-center gap-3 mb-4">
              <input type="number" min="0.1" max={user.balance} step="0.1"
                className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg outline-none focus:border-gold-400/50"
                placeholder="0.00" />
              <span className="text-slate-500 font-semibold">TON</span>
            </div>
            <div className="flex gap-2 mb-4">
              {[25, 50, 75, 100].map(pct => (
                <button key={pct} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {pct}%
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-500 mb-3">
              Доступно: <span className="text-white">{formatTON(user.balance)} TON</span> • Комиссия: ~0.005 TON
            </div>
            <motion.button whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', border: '1px solid rgba(37,99,235,0.4)' }}>
              <ArrowUpCircle size={18} />
              Вывести средства
            </motion.button>
          </div>

          <div className="p-3 rounded-xl text-xs text-slate-500 flex gap-2"
            style={{ background: 'rgba(255,165,0,0.05)', border: '1px solid rgba(255,165,0,0.1)' }}>
            ⚠️ Минимальный вывод: 0.1 TON. Обработка до 24 часов.
          </div>
        </motion.div>
      )}
    </div>
  )
}
