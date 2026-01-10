export const CESIUM_TOKEN = import.meta.env.VITE_CESIUM_TOKEN;

export const ASSETS = [
  {
    id: 'google-basemap',
    assetId: 3830186,
    name: 'Google Maps 2D Contour',
    type: 'imagery',
    description: 'Base map with terrain contours',
    autoLoad: true
  },
  {
    id: 'srtm-terrain',
    assetId: 4337066,
    name: 'SRTM DEM Terrain',
    type: 'terrain',
    description: 'Elevation data for 3D terrain',
    autoLoad: false
  },
  {
    id: 'india-boundaries',
    assetId: 4337054,
    name: 'India Pincode Boundaries',
    type: 'geojson',
    description: '19,312 administrative boundaries',
    autoLoad: false,
    size: '90 MB'
  },
  {
    id: 'swiss-imagery',
    assetId: 4337053,
    name: 'Swiss Orthophoto',
    type: 'imagery',
    description: 'High-resolution aerial imagery',
    autoLoad: false
  },
  {
    id: 'google-3d',
    assetId: 2275207,
    name: 'Google Photorealistic 3D Tiles',
    type: '3dtiles',
    description: 'Photorealistic 3D city models',
    autoLoad: false
  }
];

export const SEARCH_LOCATIONS = [
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
  { name: 'Bangalore, India', lat: 12.9716, lon: 77.5946 },
  { name: 'Zurich, Switzerland', lat: 47.3769, lon: 8.5417 },
  { name: 'Geneva, Switzerland', lat: 46.2044, lon: 6.1432 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 }
];