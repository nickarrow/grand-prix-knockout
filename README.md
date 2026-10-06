# Grand Prix Knockout

> Reimagining the Formula 1 Drivers' Championship as a true elimination battle.

<!-- Domain flip pending the external-rename stage: this moves to grandprixknockout.com once the owner sets up the domain and the redirect. See docs/decisions/0008. -->

**Live at [grandprixplayoffs.com](https://grandprixplayoffs.com)**

Grand Prix Knockout is an independent, fan-made web application that restructures the F1 World Drivers' Championship into a knockout format. Using official Grand Prix results, the season culminates in a winner-take-all final race among four drivers.

## How It Works

The last 7 races of the F1 season become a knockout:

| Phase          | Races           | Drivers | Outcome             |
| -------------- | --------------- | ------- | ------------------- |
| Regular Season | 1 through (N-7) | All     | Top 10 qualify      |
| Round 1        | 2 races         | 10 → 8  | Bottom 2 eliminated |
| Round 2        | 2 races         | 8 → 6   | Bottom 2 eliminated |
| Round 3        | 2 races         | 6 → 4   | Bottom 2 eliminated |
| Final          | 1 race          | 4       | Winner takes title  |

Points reset at the start of each knockout round. Each season's official F1 points apply as awarded: race and sprint points, plus the fastest-lap point in the seasons that had one. There is no pole-position point.

## Features

- **Knockout Standings**: See who's advancing, eliminated, or crowned champion
- **Instant Loads**: Pre-cached race data for fast performance
- **Live Updates**: GitHub Actions refreshes data weekly during active seasons
- **Mobile-First**: Responsive design for all devices
- **Dark/Light Mode**: Toggle between themes
- **Accessible**: WCAG AA color contrast compliance

## Tech Stack

- React 19 + TypeScript (strict mode)
- Material UI v7
- TanStack Query v5
- Vite
- Cloudflare Pages

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (102 tests across 7 files, covering the knockout engine and its helpers)
npm test

# Build for production
npm run build

# Update season data from API
npm run update-data
```

## Project Structure

```
src/
├── components/     # UI components (standings, layout)
├── pages/          # Route pages (Home, Season, About)
├── engine/         # Knockout calculation logic
├── services/       # API clients + static data loader
├── hooks/          # Custom React hooks
├── store/          # Zustand state (theme)
├── theme/          # MUI theme + color palette
├── constants/      # Points, knockout, config
└── types/          # TypeScript interfaces
data/
├── 2020.json       # Cached 2020 season data
├── ...             # One file per season
└── 2026.json       # Cached 2026 season data
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

Grand Prix Knockout is an independent fan project and is not affiliated with, endorsed by, or associated with Formula One Group, the FIA, or Formula 1.
