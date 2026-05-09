# TON Casino — Telegram Web App Frontend

## Игры
- 🎰 Слоты — 8 символов, выплаты до ×50
- 🎲 Кости — 5 видов ставок, Provably Fair
- 🎡 Рулетка — Европейская, 7 видов ставок
- 🚀 Краш — Живой граф, авто-вывод
- 🪙 Монетка — Орёл/Решка, ×1.95
- 💎 Мины — 5×5 сетка, выбор мин

## Установка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Папка `dist/` — загрузи на хостинг (Vercel, Netlify, и т.д.)

## Настройка бота

1. Создай бота через @BotFather
2. Включи Web App: `/newapp` → укажи URL твоего деплоя
3. Обнови манифест TON Connect в `App.tsx` на свой URL

## Структура

```
src/
├── components/     # Переиспользуемые компоненты
├── pages/          # Страницы (игры, кошелёк, история)
├── store/          # Zustand стейт
├── hooks/          # useTelegram хук
├── utils/          # Игровая логика, утилиты
└── types/          # TypeScript типы
```

## Переменные окружения (для бэкенда)

```env
VITE_API_URL=https://your-backend.com
VITE_TON_MANIFEST=https://your-site.com/tonconnect-manifest.json
```
