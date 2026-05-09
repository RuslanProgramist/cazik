import { HashRouter, Routes, Route } from 'react-router-dom'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { useTelegram } from './hooks/useTelegram'
import Layout from './components/Layout'
import Home from './pages/Home'
import SlotsGame from './pages/SlotsGame'
import DiceGame from './pages/DiceGame'
import RouletteGame from './pages/RouletteGame'
import CrashGame from './pages/CrashGame'
import CoinFlipGame from './pages/CoinFlipGame'
import MinesGame from './pages/MinesGame'
import Wallet from './pages/Wallet'
import History from './pages/History'
import Leaderboard from './pages/Leaderboard'

const MANIFEST_URL = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json'

function AppInner() {
  useTelegram()
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/slots" element={<SlotsGame />} />
          <Route path="/dice" element={<DiceGame />} />
          <Route path="/roulette" element={<RouletteGame />} />
          <Route path="/crash" element={<CrashGame />} />
          <Route path="/coinflip" element={<CoinFlipGame />} />
          <Route path="/mines" element={<MinesGame />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/history" element={<History />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default function App() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <AppInner />
    </TonConnectUIProvider>
  )
}
