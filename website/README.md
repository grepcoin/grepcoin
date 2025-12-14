# GrepCoin Landing Page

A playful, colorful landing page for GrepCoin built with Next.js and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
cd website
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
website/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles & Tailwind
│   │   ├── layout.tsx       # Root layout with metadata
│   │   └── page.tsx         # Main landing page
│   └── components/
│       ├── Navbar.tsx       # Navigation bar
│       ├── Hero.tsx         # Hero section with stats
│       ├── Features.tsx     # Feature cards
│       ├── Tokenomics.tsx   # Token distribution & staking
│       ├── Roadmap.tsx      # Project timeline
│       ├── Community.tsx    # CTA & social links
│       └── Footer.tsx       # Site footer
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind configuration
└── next.config.js           # Next.js configuration
```

## Sections

1. **Hero** - Main headline, stats, and CTA buttons
2. **Features** - 6 feature cards with icons
3. **Tokenomics** - Pie chart, allocations, staking tiers
4. **Roadmap** - 4-phase timeline with milestones
5. **Community** - Newsletter signup and social links
6. **Footer** - Navigation links and legal

## Customization

### Colors

Edit `tailwind.config.ts` to modify the color palette:

```ts
colors: {
  grep: {
    purple: '#8B5CF6',
    pink: '#EC4899',
    blue: '#3B82F6',
    // ...
  }
}
```

### Content

Update content directly in the component files:
- Token stats: `Hero.tsx`
- Features: `Features.tsx`
- Allocations: `Tokenomics.tsx`
- Roadmap phases: `Roadmap.tsx`

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Static Export

The site is configured for static export:

```bash
npm run build
# Output in 'out' directory
```

Deploy the `out` folder to any static hosting (Netlify, GitHub Pages, etc.)

## Performance

- Static site generation (SSG)
- Optimized fonts with next/font
- Minimal JavaScript bundle
- CSS-only animations where possible

## License

MIT
