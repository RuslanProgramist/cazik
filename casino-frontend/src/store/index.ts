import { create } from 'zustand'
import type { User, Transaction, GameType } from '../types'

interface CasinoStore {
  user: User
  transactions: Transaction[]
  isWalletConnected: boolean
  walletAddress: string | null
  currentGame: GameType | null
  soundEnabled: boolean

  // Actions
  updateBalance: (delta: number) => void
  setBalance: (balance: number) => void
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void
  setWalletConnected: (connected: boolean, address?: string) => void
  setCurrentGame: (game: GameType | null) => void
  toggleSound: () => void
}

const mockUser: User = {
  id: 123456789,
  username: 'player',
  firstName: 'Игрок',
  balance: 10.5,
  totalWon: 42.3,
  totalBet: 38.1,
  level: 7,
}

export const useCasinoStore = create<CasinoStore>((set) => ({
  user: mockUser,
  transactions: [
    { id: '1', type: 'deposit', amount: 5, timestamp: Date.now() - 86400000 },
    { id: '2', type: 'win', amount: 12.5, game: 'slots', timestamp: Date.now() - 3600000 },
    { id: '3', type: 'bet', amount: -3, game: 'roulette', timestamp: Date.now() - 1800000 },
  ],
  isWalletConnected: false,
  walletAddress: null,
  currentGame: null,
  soundEnabled: true,

  updateBalance: (delta) =>
    set((state) => ({
      user: {
        ...state.user,
        balance: Math.max(0, parseFloat((state.user.balance + delta).toFixed(4))),
        totalBet: delta < 0 ? state.user.totalBet + Math.abs(delta) : state.user.totalBet,
        totalWon: delta > 0 ? state.user.totalWon + delta : state.user.totalWon,
      },
    })),

  setBalance: (balance) =>
    set((state) => ({ user: { ...state.user, balance } })),

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [
        {
          ...tx,
          id: Math.random().toString(36).slice(2),
          timestamp: Date.now(),
        },
        ...state.transactions.slice(0, 49),
      ],
    })),

  setWalletConnected: (connected, address) =>
    set({ isWalletConnected: connected, walletAddress: address || null }),

  setCurrentGame: (game) => set({ currentGame: game }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}))
