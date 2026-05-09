export const formatTON = (amount: number): string => {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
  if (amount >= 1) return amount.toFixed(2)
  return amount.toFixed(4)
}

export const formatAddress = (address: string): string => {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

// Provably fair RNG (demo version)
export const generateSeed = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

export const vibrate = (pattern: number | number[]) => {
  if (navigator.vibrate) navigator.vibrate(pattern)
}

export const ROULETTE_NUMBERS: { number: number; color: 'red' | 'black' | 'green' }[] = [
  { number: 0, color: 'green' },
  { number: 32, color: 'red' }, { number: 15, color: 'black' },
  { number: 19, color: 'red' }, { number: 4, color: 'black' },
  { number: 21, color: 'red' }, { number: 2, color: 'black' },
  { number: 25, color: 'red' }, { number: 17, color: 'black' },
  { number: 34, color: 'red' }, { number: 6, color: 'black' },
  { number: 27, color: 'red' }, { number: 13, color: 'black' },
  { number: 36, color: 'red' }, { number: 11, color: 'black' },
  { number: 30, color: 'red' }, { number: 8, color: 'black' },
  { number: 23, color: 'red' }, { number: 10, color: 'black' },
  { number: 5, color: 'red' }, { number: 24, color: 'black' },
  { number: 16, color: 'red' }, { number: 33, color: 'black' },
  { number: 1, color: 'red' }, { number: 20, color: 'black' },
  { number: 14, color: 'red' }, { number: 31, color: 'black' },
  { number: 9, color: 'red' }, { number: 22, color: 'black' },
  { number: 18, color: 'red' }, { number: 29, color: 'black' },
  { number: 7, color: 'red' }, { number: 28, color: 'black' },
  { number: 12, color: 'red' }, { number: 35, color: 'black' },
  { number: 3, color: 'red' }, { number: 26, color: 'black' },
]

export const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🃏']
export const SLOT_WEIGHTS = [20, 18, 15, 12, 10, 8, 5, 2]

export const getSlotSymbol = (): string => {
  const total = SLOT_WEIGHTS.reduce((a, b) => a + b, 0)
  let rand = randomInt(0, total - 1)
  for (let i = 0; i < SLOT_SYMBOLS.length; i++) {
    rand -= SLOT_WEIGHTS[i]
    if (rand < 0) return SLOT_SYMBOLS[i]
  }
  return SLOT_SYMBOLS[0]
}

export const SLOT_PAYOUTS: Record<string, number> = {
  '7️⃣7️⃣7️⃣': 50,
  '💎💎💎': 25,
  '⭐⭐⭐': 10,
  '🍇🍇🍇': 5,
  '🍊🍊🍊': 4,
  '🍋🍋🍋': 3,
  '🍒🍒🍒': 2,
  '🃏🃏🃏': 15,
}

export const checkSlotWin = (reels: string[]): number => {
  const combo = reels.join('')
  if (SLOT_PAYOUTS[combo]) return SLOT_PAYOUTS[combo]
  if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) return 1.5
  return 0
}
