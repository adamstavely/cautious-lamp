# Palette Builder 🎨

The only tool that instantly diagnoses your color palette's flaws and provides one-click fixes in just 60 seconds.

## Features

- **Step 1: Build Your Color Palette** - Drop in brand colors with smart suggestions for neutrals and harmony colors
- **Step 2: Harmony Check** - Identify problematic colors (too dark, too bright, too vibrant) with one-click fixes
- **Step 3: Contrast Testing** - WCAG AA/AAA compliance testing for all color pairs
- **Step 4: Assign Color Roles** - Organize colors as Hero, Accent, or Neutral

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Data Store**: Elasticsearch

## Getting Started

### Prerequisites

- Node.js 18+
- Elasticsearch 8+ (running on http://localhost:9200)

### Installation

1. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Start Elasticsearch (if not already running):
```bash
# Using Docker
docker run -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

3. Start the backend:
```bash
cd backend
npm run start:dev
```

4. Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

5. Open http://localhost:5173 in your browser

## Project Structure

```
├── backend/          # NestJS API
│   ├── src/
│   │   ├── color-palette/    # Color palette module
│   │   │   ├── color-theory.service.ts    # Color theory calculations
│   │   │   ├── color-palette.service.ts   # Business logic
│   │   │   └── color-palette.controller.ts # API endpoints
│   │   └── main.ts
│   └── package.json
├── frontend/        # Vue.js app
│   ├── src/
│   │   ├── components/       # Wizard step components
│   │   ├── views/            # Main views
│   │   └── main.js
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/palettes` - Create a new palette
- `GET /api/palettes` - Get all palettes
- `GET /api/palettes/:id` - Get a specific palette
- `POST /api/palettes/analyze` - Analyze palette for harmony and contrast
- `POST /api/palettes/suggestions` - Get smart color suggestions

## Color Theory

All color analysis is based on:
- **HSL Color Space** for harmony calculations
- **WCAG Luminance Formula** for contrast calculations
- **Complementary, Analogous, and Triadic** color schemes
- **Relative Luminance** for accessibility compliance

## License

MIT

