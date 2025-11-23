# CLAUDE.md - WaveWarz Analytics Codebase Guide

> **Last Updated:** 2025-11-23
> **Purpose:** This document provides AI assistants with comprehensive context about the WaveWarz Analytics codebase structure, conventions, and development workflows.

---

## Project Overview

**WaveWarz Analytics** is a real-time analytics and statistics dashboard for WaveWarz - a live-traded music battle platform built on Solana. The application tracks battles, transaction volumes, artist earnings, and provides comprehensive statistics about the platform's activity.

### Key Features
- Real-time battle tracking and statistics
- Solana blockchain integration via Helius RPC
- Artist leaderboards and earnings tracking
- Platform-wide volume and engagement metrics
- Event grouping and historical battle data
- Live transaction feed from on-chain activity

### Production Links
- **AI Studio:** https://ai.studio/apps/drive/1DxqHUxlHfgabXiLMnyNSY-8J8yy2sTPR
- **Live Platform:** https://wavewarz.com
- **Program ID:** `9TUfEHvk5fN5vogtQyrefgNqzKy2Bqb4nWVhSFUg2fYo`

---

## Architecture & Tech Stack

### Core Technologies
- **Framework:** React 19.2.0 (latest)
- **Build Tool:** Vite 6.2.0
- **Language:** TypeScript 5.8.2
- **Routing:** React Router DOM 7.9.6
- **Styling:** Tailwind CSS (via CDN)
- **Blockchain:** Solana (Mainnet)
- **RPC Provider:** Helius + Alchemy

### Architecture Pattern
This is a **frontend-only** Single Page Application (SPA) with:
- Client-side routing (HashRouter)
- Static data imported from constants
- Real-time data fetched from Helius API
- No backend server required
- Import maps for dependency loading

### Deployment Model
- Runs on port 3000 (dev server)
- Designed for AI Studio deployment
- Uses import maps instead of node_modules in production
- Environment variables loaded via Vite

---

## Codebase Structure

### Directory Layout
```
/home/user/WaveWarz-Stats-App/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with stats & live feed
│   ├── BattleList.tsx   # Battle history & event grouping
│   ├── Layout.tsx       # App shell with nav & footer
│   └── StatsCard.tsx    # Reusable stat display component
├── services/            # Business logic & API integrations
│   ├── solanaService.ts # Helius API integration
│   └── statsService.ts  # Data aggregation & calculations
├── App.tsx              # Root component with routing
├── index.tsx            # React app entry point
├── types.ts             # TypeScript interfaces
├── constants.ts         # Static data & configuration (80KB!)
├── index.html           # HTML shell with Tailwind config
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies & scripts
└── metadata.json        # AI Studio metadata

**Note:** There is NO traditional `src/` directory - all source files are at the root level.
```

### File Descriptions

#### Root Components
- **App.tsx** - Main application component; sets up React Router with HashRouter and defines routes (`/` → Dashboard, `/battles` → BattleList)
- **index.tsx** - React 19 entry point; renders app in StrictMode
- **index.html** - HTML shell with Tailwind CDN configuration, custom color palette, import maps, and font loading

#### Components (`/components/`)
- **Dashboard.tsx** (195 lines) - Primary dashboard view displaying:
  - Platform statistics (volume, earnings, battles)
  - Recent battles table
  - Top artist leaderboard
  - Live transaction feed from Helius
- **BattleList.tsx** - Battle history page with event grouping by date and filtering (test battles vs main battles)
- **Layout.tsx** - Application shell providing navigation bar, footer, and consistent page structure
- **StatsCard.tsx** - Reusable component for displaying statistics with icons, trends, and formatting

#### Services (`/services/`)
- **solanaService.ts** - Helius API integration:
  - `fetchProgramTransactions()` - Fetches recent transactions for the WaveWarz program
  - `getAccountInfo()` - Retrieves account data via RPC
- **statsService.ts** - Data aggregation and calculations:
  - `getPlatformStats()` - Computes total volume, earnings, battle counts
  - `getBattles()` - Returns filtered battle list
  - `getEvents()` - Groups battles by date
  - `getTopArtists()` - Calculates artist leaderboard
  - Helper functions for Lamports→SOL conversion and Spotify stream equivalents

#### Core Files
- **types.ts** - TypeScript interfaces for:
  - `BattleRecord` - Complete battle data structure
  - `EventGroup` - Date-grouped battles
  - `PlatformStats` - Aggregate platform statistics
  - `ArtistStats` - Artist earnings and performance
  - `BattleAccount` - On-chain battle account structure
  - `TransactionState` - Transaction state enum
- **constants.ts** (80KB) - Contains:
  - Solana Program ID and API keys
  - RPC endpoints (Helius, Alchemy)
  - Economic constants (SOL price, fees, streaming rates)
  - `INITIAL_BATTLES` - Full database export of battles
  - `isTestBattle()` - Logic to identify test battles

---

## Development Workflow

### Setup & Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → Starts Vite dev server on http://localhost:3000

# Build for production
npm run build
# → Outputs to /dist

# Preview production build
npm preview
```

### Environment Variables
The app expects a `.env.local` file with:
```
GEMINI_API_KEY=your_api_key_here
```

**Note:** Currently the Gemini API key is referenced in README but not actively used in the codebase. The main API integrations use hardcoded Helius/Alchemy keys in `constants.ts`.

### Development Commands
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - TypeScript compilation + Vite build
- `npm run preview` - Preview production build locally

---

## Coding Conventions & Patterns

### TypeScript Guidelines
- **Strict typing** - All components use typed props interfaces
- **Type imports** - Import types from `types.ts` centrally
- **No any types** - Avoid `any`; use proper type definitions
- **React.FC** - Use `React.FC<Props>` pattern for components

### Component Patterns
```typescript
// Standard component structure
import React, { useState, useEffect } from 'react';
import { ComponentProps } from '../types';

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Styling Conventions
- **Tailwind CSS** - All styling via utility classes
- **Custom color palette** (defined in `index.html`):
  - `wave-950` - Background (#020617)
  - `wave-900` - Card backgrounds (#0f172a)
  - `wave-800` - Borders (#1e293b)
  - `wave-700` - Hover states (#334155)
  - `wave-accent` - Primary accent (#06b6d4 - cyan)
  - `wave-secondary` - Secondary accent (#d946ef - fuchsia)
  - `wave-success` - Success states (#10b981 - green)
- **Responsive design** - Use `sm:`, `md:`, `lg:` breakpoints
- **Dark theme** - Entire app uses dark color scheme

### Data Flow Patterns
1. **Static data** - Imported from `constants.ts` (INITIAL_BATTLES)
2. **Derived data** - Calculated in `statsService.ts` functions
3. **Live data** - Fetched from Helius API in `solanaService.ts`
4. **State management** - Local React state (no global state library)

### Naming Conventions
- **Files:** PascalCase for components (`Dashboard.tsx`), camelCase for services (`statsService.ts`)
- **Components:** PascalCase (`BattleList`)
- **Functions:** camelCase (`getPlatformStats`)
- **Constants:** SCREAMING_SNAKE_CASE (`PROGRAM_ID`, `SOL_PRICE_USD`)
- **Interfaces:** PascalCase with descriptive names (`BattleRecord`, `PlatformStats`)

---

## Important Technical Details

### Battle Detection & Filtering
The app distinguishes between **test battles** and **production battles**:

```typescript
// Logic in constants.ts
const isTestBattle = (artist1: string, artist2: string): boolean => {
  // Hurric4n3Ike vs Zaal battles
  if (artist1.includes('hurric4n3ike') && artist2.includes('zaal')) return true;

  // Any battle involving Joov
  if (artist1.includes('joov') || artist2.includes('joov')) return true;

  // Generic test flags
  if (artist1.includes('test') || artist2.includes('test')) return true;

  return false;
};
```

All `statsService.ts` functions accept an `includeTests` parameter to filter data.

### Economic Calculations
```typescript
// Lamports to SOL conversion
const lamportsToSol = (lamports: number) => lamports / 1_000_000_000;

// Artist earns 1% of total pool (100 basis points)
const ARTIST_FEE_BPS = 100;
const artistEarnings = totalVolumeSol * (ARTIST_FEE_BPS / 10000);

// Spotify stream equivalence
const STREAMING_RATE_USD = 0.003; // $0.003 per stream
const streams = Math.floor(usdEarnings / 0.003);
```

### API Integration
**Helius RPC:**
- **Enhanced Transactions API:** `GET /addresses/{PROGRAM_ID}/transactions`
- **Standard RPC:** `POST` with `getAccountInfo` method
- **Rate limits:** Not currently handled (consider adding retry logic)

**Configuration:**
```typescript
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_API_URL = "https://api-mainnet.helius-rpc.com/v0";
```

### Router Configuration
Uses **HashRouter** instead of BrowserRouter for AI Studio compatibility:
```typescript
<HashRouter>  {/* ← Important for static hosting */}
  <Layout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/battles" element={<BattleList />} />
    </Routes>
  </Layout>
</HashRouter>
```

---

## Common Tasks for AI Assistants

### Adding a New Component
1. Create file in `/components/` with PascalCase name
2. Import React and relevant types
3. Define props interface
4. Implement component with `React.FC<Props>` pattern
5. Export default
6. Import and use in parent component

### Adding a New Route
1. Create component in `/components/`
2. Import in `App.tsx`
3. Add `<Route path="/new-route" element={<NewComponent />} />` to Routes
4. Update navigation in `Layout.tsx` if needed

### Modifying Statistics
1. Update calculation logic in `services/statsService.ts`
2. Update `PlatformStats` interface in `types.ts` if adding new fields
3. Update `Dashboard.tsx` or `BattleList.tsx` to display new stats
4. Ensure test battles are properly filtered

### Adding New Battle Data
1. Add raw battle entries to `rawBattles` array in `constants.ts`
2. Ensure data follows the structure in the transformation logic
3. Run `isTestBattle()` check if needed
4. Data will automatically flow to all components

### Working with Helius API
1. All Helius interactions go through `services/solanaService.ts`
2. Use existing functions or add new ones following the pattern
3. Handle errors gracefully (return empty arrays/null on failure)
4. Consider caching for performance

### Styling Updates
1. Use existing Tailwind classes and custom `wave-*` colors
2. Maintain responsive design with breakpoints
3. Keep dark theme consistency
4. Test on multiple screen sizes

---

## Key Dependencies

### Production Dependencies
```json
{
  "react": "^19.2.0",          // Latest React with new features
  "react-dom": "^19.2.0",      // React DOM renderer
  "react-router-dom": "^7.9.6" // Client-side routing
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^5.0.0", // Vite React plugin
  "@types/node": "^22.14.0",        // Node type definitions
  "typescript": "~5.8.2",           // TypeScript compiler
  "vite": "^6.2.0"                  // Build tool
}
```

### CDN Dependencies (via index.html)
- Tailwind CSS (latest via CDN)
- Google Fonts (Inter + JetBrains Mono)
- React packages (via import maps in production)

---

## Configuration Files

### vite.config.ts
- **Port:** 3000
- **Host:** 0.0.0.0 (accessible externally)
- **Path alias:** `@` → project root
- **Env loading:** GEMINI_API_KEY exposed as `process.env.API_KEY`

### tsconfig.json
- **Target:** ES2022
- **Module:** ESNext with bundler resolution
- **JSX:** react-jsx (new transform)
- **Experimental decorators:** Enabled
- **Path alias:** `@/*` → `./*`
- **No emit:** true (Vite handles compilation)

### index.html Tailwind Config
```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        wave: { /* custom palette */ }
      }
    }
  }
}
```

---

## Data Structures Reference

### BattleRecord Interface
```typescript
interface BattleRecord {
  id: string;                    // UUID
  battle_id: number;             // Numeric battle ID
  created_at: string;            // ISO timestamp
  status: 'Active' | 'Completed' | 'Pending';
  artist1_name: string;
  artist2_name: string;
  artist1_wallet: string;        // Solana address
  artist2_wallet: string;
  wavewarz_wallet: string;
  artist1_music_link: string;    // URL
  artist2_music_link: string;
  image_url: string;             // Battle artwork
  artist1_pool: number;          // In Lamports
  artist2_pool: number;          // In Lamports
  artist1_supply: number;        // Token supply
  artist2_supply: number;
  battle_duration: number;       // Seconds
  winner_decided: boolean;
  winner_artist_a: boolean | null;
  artist1_twitter: string | null;
  artist2_twitter: string | null;
  stream_link: string | null;
  isTest?: boolean;              // Derived flag
}
```

### PlatformStats Interface
```typescript
interface PlatformStats {
  totalVolumeSol: number;
  totalVolumeUsd: number;
  totalBattles: number;
  totalArtistEarningsUsd: number;
  totalSpotifyStreamsEquivalent: number;
  activeBattles: number;
  totalTestVolumeSol: number;
}
```

---

## Testing & Quality Assurance

### Manual Testing Checklist
- [ ] Dashboard loads with correct statistics
- [ ] Battle list displays and filters correctly
- [ ] Test battles can be toggled on/off
- [ ] Navigation between routes works
- [ ] Live transaction feed connects to Helius
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All monetary values display correctly
- [ ] Artist leaderboard calculates properly

### Known Limitations
1. **No automated tests** - Consider adding Jest + React Testing Library
2. **Hardcoded API keys** - Move to environment variables
3. **No error boundaries** - Add React error boundaries
4. **No loading states** - Improve UX with skeleton loaders
5. **No pagination** - Large battle lists may impact performance
6. **Static SOL price** - Consider real-time price feed
7. **No caching** - Helius API calls could be cached

---

## Git Workflow

### Branch Strategy
- **Main branch:** Production-ready code
- **Feature branches:** Use pattern `claude/claude-md-{session-id}`
- **Commit messages:** Follow conventional commits format
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `docs:` - Documentation
  - `refactor:` - Code refactoring
  - `style:` - Formatting changes

### Recent Commits
```
0d2744f feat: Enhance RPC configurations and test battle detection
4cf6329 feat: Initialize WaveWarz Analytics project
1206146 Initial commit
```

### Git Commands
```bash
# Push to feature branch
git push -u origin claude/claude-md-{session-id}

# Create commit
git add .
git commit -m "feat: Add new feature"

# Check status
git status
```

---

## Troubleshooting

### Common Issues

**Issue:** "Could not find root element to mount to"
- **Solution:** Ensure `<div id="root">` exists in `index.html`

**Issue:** Helius API returns 401/403
- **Solution:** Check `HELIUS_API_KEY` in `constants.ts` is valid

**Issue:** Styles not applying
- **Solution:** Verify Tailwind CDN loads in `index.html` and custom config is present

**Issue:** Router not working
- **Solution:** Ensure HashRouter is used (not BrowserRouter) for static hosting

**Issue:** TypeScript errors on build
- **Solution:** Run `npm install` and check `tsconfig.json` paths configuration

---

## Performance Considerations

### Optimization Opportunities
1. **Memoization** - Use `React.memo` for `StatsCard` and battle list items
2. **Lazy loading** - Code-split routes with `React.lazy`
3. **Virtual scrolling** - Implement for large battle lists
4. **API caching** - Cache Helius responses with TTL
5. **Image optimization** - Lazy load battle images
6. **Bundle size** - Consider replacing Tailwind CDN with PostCSS build

### Current Performance Metrics
- **Bundle size:** Not measured (no production build analytics)
- **Load time:** Fast on modern connections
- **RPC latency:** Depends on Helius/Alchemy response times
- **Data size:** ~80KB constants file loads immediately

---

## Security Considerations

### Current State
⚠️ **API keys are exposed in source code** (`constants.ts`)
- Helius API key is publicly visible
- Alchemy API key is publicly visible
- These should be moved to environment variables

### Recommendations
1. Move API keys to `.env.local`
2. Use Vite environment variable pattern (`import.meta.env.VITE_*`)
3. Add `.env.local` to `.gitignore` (already done)
4. Implement rate limiting on client side
5. Consider backend proxy for API calls in production

### Safe Practices
- No user authentication (public dashboard)
- No sensitive data storage
- Read-only blockchain interactions
- No direct wallet connections

---

## Future Enhancement Ideas

### Feature Roadmap
- [ ] Real-time WebSocket integration for live battles
- [ ] Historical price charts for battle pools
- [ ] Artist profile pages with detailed statistics
- [ ] Battle search and filtering
- [ ] CSV/JSON export functionality
- [ ] Social sharing capabilities
- [ ] Battle notifications/alerts
- [ ] Mobile app version

### Technical Improvements
- [ ] Add unit tests with Jest
- [ ] Add E2E tests with Playwright
- [ ] Implement proper error boundaries
- [ ] Add analytics tracking
- [ ] Optimize bundle size
- [ ] Add PWA capabilities
- [ ] Implement proper caching strategy
- [ ] Add Sentry for error tracking

---

## Resources & References

### External Documentation
- [React 19 Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Helius API Documentation](https://docs.helius.dev)
- [Solana Documentation](https://docs.solana.com)

### Project Contacts
- **Platform:** https://wavewarz.com
- **AI Studio:** https://ai.studio/apps/drive/1DxqHUxlHfgabXiLMnyNSY-8J8yy2sTPR

---

## AI Assistant Guidelines

### When Working on This Codebase

✅ **DO:**
- Read existing code before making changes
- Follow established patterns and conventions
- Maintain TypeScript type safety
- Test changes locally with `npm run dev`
- Keep styling consistent with the wave-* color palette
- Filter test battles appropriately
- Handle errors gracefully
- Update this CLAUDE.md when making architectural changes

❌ **DON'T:**
- Create new folders without good reason (keep flat structure)
- Use `any` types in TypeScript
- Add dependencies without justification
- Break the HashRouter pattern
- Expose new API keys in source code
- Remove test battle filtering logic
- Ignore responsive design
- Skip TypeScript compilation checks

### Best Practices for AI Code Generation
1. **Read first, code second** - Always read relevant files before modifying
2. **Preserve patterns** - Match existing code style and structure
3. **Type everything** - Maintain strict TypeScript typing
4. **Test interactively** - Use the dev server to verify changes
5. **Document changes** - Update comments and this file as needed
6. **Think responsive** - All UI changes should work on mobile
7. **Consider performance** - Large lists need virtualization
8. **Handle edge cases** - Empty states, loading states, errors

---

**End of CLAUDE.md** - This document should be updated as the codebase evolves.
