export interface User {
  id: number
  username: string
  firstName: string
  balance: number
  totalWon: number
  totalBet: number
  level: number
  avatar?: string
}

export interface GameResult {
  won: boolean
  amount: number
  multiplier: number
  details: Record<string, unknown>
}

export type GameType = 'slots' | 'dice' | 'roulette' | 'crash' | 'coinflip' | 'mines'

export interface Transaction {
  id: string
  type: 'bet' | 'win' | 'deposit' | 'withdraw'
  amount: number
  game?: GameType
  timestamp: number
}

export interface RouletteNumber {
  number: number
  color: 'red' | 'black' | 'green'
}

export type MinesGrid = ('hidden' | 'mine' | 'gem' | 'revealed')[]

export interface CrashPoint {
  multiplier: number
  timestamp: number
}
