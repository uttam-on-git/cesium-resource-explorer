# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server with HMR
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

This is a React + Vite application that integrates CesiumJS for 3D geospatial visualization.

**Asset Configuration**: Available Cesium Ion assets (imagery, terrain, 3D tiles, GeoJSON) are defined in `src/constants/assets.js`. Each asset has an `assetId` for Cesium Ion, a `type`, and an `autoLoad` flag.

**Environment**: The Cesium Ion access token is stored in `.env` as `VITE_CESIUM_TOKEN` and accessed via `import.meta.env.VITE_CESIUM_TOKEN`.

## Key Directories

- `src/components/` - React components (currently empty, for future UI)
- `src/services/` - Service modules (currently empty, for API/data services)
- `src/constants/` - Configuration constants including Cesium assets
