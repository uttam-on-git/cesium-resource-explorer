# Cesium Resource Explorer

A React-based 3D geospatial visualization application built with CesiumJS. This project demonstrates dynamic layer management, location-based navigation, and interactive map controls for exploring satellite imagery, terrain data, and 3D tilesets.

## Features

- **Interactive 3D Globe**: Full CesiumJS viewer with pan, zoom, and rotation controls
- **Layer Management System**: Enable/disable data layers without page refresh, with visibility toggles and fly-to navigation
- **Feature Inspector**: Click on GeoJSON features to view their properties in a detailed panel
- **Unified Search**: Search across both geographic locations and data layers with keyboard navigation
- **My Location**: GPS-based positioning with custom marker and graceful error handling
- **Persistent Preferences**: Layer selections are saved to localStorage and restored on return visits
- **Error Boundary**: Graceful error handling with retry functionality
- **Themed UI**: Satellite command-inspired interface with consistent design language

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Cesium Ion account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <https://github.com/uttam-on-git/cesium-resource-explorer.git>
cd cesium-resource-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the project root:
```env
VITE_CESIUM_TOKEN=your_cesium_ion_access_token
```

To obtain a token, register at [Cesium Ion](https://ion.cesium.com) and generate an access token from your account dashboard.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot module replacement |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run test` | Run test suite |

## Project Structure

```
src/
├── components/          # React UI components
│   ├── CesiumViewer.jsx    # 3D globe viewer wrapper
│   ├── ErrorBoundary.jsx   # Error handling with retry UI
│   ├── FeatureInspector.jsx # GeoJSON property display panel
│   ├── LayerManager.jsx    # Data layer control panel
│   ├── LocationSearch.jsx  # Unified search interface
│   └── MyLocation.jsx      # GPS location button
├── services/            # Business logic and API integration
│   └── cesiumService.js    # Cesium layer operations
├── hooks/               # Custom React hooks
│   ├── useFeaturePicker.js # Entity click handling
│   └── useLayerManager.js  # Layer state management with persistence
├── constants/           # Configuration and static data
│   └── assets.js           # Cesium Ion asset definitions
└── App.jsx              # Application root
```

## Architecture Overview

### Layer Management

The application uses a custom hook (`useLayerManager`) to manage layer state independently of the Cesium viewer. This separation enables:

- **Non-destructive toggling**: Layers can be enabled/disabled without full page refresh
- **Visibility control**: Loaded layers can be hidden without unloading from memory
- **Error isolation**: Layer loading failures are contained and reported per-layer

### Data Flow

```
User Action → useLayerManager Hook → cesiumService → Cesium Viewer
                    ↓
              React State Update → UI Re-render
```

### Supported Asset Types

| Type | Description | Operations |
|------|-------------|------------|
| `imagery` | Satellite/aerial imagery layers | Load, unload, visibility |
| `terrain` | Elevation data providers | Load, unload (single active) |
| `3dtiles` | Photorealistic 3D buildings | Load, unload, visibility, fly-to |
| `geojson` | Vector boundary data | Load, unload, visibility, fly-to |

## Technical Decisions

1. **Dynamic Cesium Import**: Cesium is loaded asynchronously to reduce initial bundle size
2. **Module-level Layer Registry**: Centralized tracking prevents duplicate layer loading
3. **Canvas-based Markers**: Custom location markers avoid external image dependencies
4. **Graceful Geolocation**: All permission states handled with user-friendly messages
5. **LocalStorage Persistence**: Layer preferences survive browser refresh for better UX
6. **Error Boundary Pattern**: Runtime errors are caught and displayed with retry option

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close feature inspector panel |

## Known Limitations

- Geolocation requires HTTPS in production (localhost exempt)
- Large GeoJSON files (>50MB) may cause initial loading delay
- Terrain layers are mutually exclusive (Cesium limitation)

## Browser Support

Tested on:
- Chrome 120+
- Firefox 120+
- Edge 120+

Requires WebGL 2.0 support.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **CesiumJS** - 3D geospatial visualization
- **Tailwind CSS v4** - Styling

## License

This project was created as part of a frontend developer evaluation task.
