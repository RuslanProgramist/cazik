import { useEffect, useState } from 'react'

export const useTelegram = () => {
  const [tg, setTg] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const webApp = (window as any).Telegram?.WebApp
    if (webApp) {
      webApp.ready()
      webApp.expand()
      setTg(webApp)
      setUser(webApp.initDataUnsafe?.user || null)
    }
  }, [])

  const haptic = {
    light: () => tg?.HapticFeedback?.impactOccurred('light'),
    medium: () => tg?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => tg?.HapticFeedback?.impactOccurred('heavy'),
    success: () => tg?.HapticFeedback?.notificationOccurred('success'),
    error: () => tg?.HapticFeedback?.notificationOccurred('error'),
    warning: () => tg?.HapticFeedback?.notificationOccurred('warning'),
  }

  return { tg, user, haptic }
}