import * as Cesium from 'cesium';

// keeping track of which layers are loaded so we don't load them twice
const loadedLayers = new Map();

// main function to add any type of layer
export async function addLayer(viewer, asset) {
  if (!viewer || viewer.isDestroyed()) {
    throw new Error('Viewer not available');
  }

  // already loaded? just return it
  if (loadedLayers.has(asset.assetId)) {
    return loadedLayers.get(asset.assetId);
  }

  let layer;

  // each asset type needs different cesium api calls
  switch (asset.type) {
    case 'imagery':
      layer = await addImageryLayer(viewer, asset.assetId);
      break;
    case 'terrain':
      layer = await setTerrain(viewer, asset.assetId);
      break;
    case '3dtiles':
      layer = await add3DTileset(viewer, asset.assetId);
      break;
    case 'geojson':
      layer = await addGeoJson(viewer, asset.assetId);
      break;
    default:
      throw new Error(`Unknown asset type: ${asset.type}`);
  }

  // save reference so we can remove it later
  loadedLayers.set(asset.assetId, { layer, type: asset.type });
  return layer;
}

// remove layer from viewer
export function removeLayer(viewer, asset) {
  if (!viewer || viewer.isDestroyed()) return;

  const loaded = loadedLayers.get(asset.assetId);
  if (!loaded) return;

  // different removal method for each type
  switch (loaded.type) {
    case 'imagery':
      viewer.imageryLayers.remove(loaded.layer);
      break;
    case 'terrain':
      // cant really remove terrain, just reset to default ellipsoid
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      break;
    case '3dtiles':
      viewer.scene.primitives.remove(loaded.layer);
      break;
    case 'geojson':
      viewer.dataSources.remove(loaded.layer);
      break;
  }

  loadedLayers.delete(asset.assetId);
}

// hide/show layer without actually removing it
export function setLayerVisibility(asset, visible) {
  const loaded = loadedLayers.get(asset.assetId);
  if (!loaded) return;

  switch (loaded.type) {
    case 'imagery':
      loaded.layer.show = visible;
      break;
    case '3dtiles':
      loaded.layer.show = visible;
      break;
    case 'geojson':
      loaded.layer.show = visible;
      break;
    case 'terrain':
      // terrain doesnt have a show property unfortunately
      break;
  }
}

// check if layer is loaded
export function isLayerLoaded(assetId) {
  return loadedLayers.has(assetId);
}

// fly camera to where the layer is
export async function flyToLayer(viewer, asset) {
  if (!viewer || viewer.isDestroyed()) return;

  const loaded = loadedLayers.get(asset.assetId);
  if (!loaded) return;

  // only works for 3d tiles and geojson since they have bounds
  // imagery and terrain are global so nothing to fly to
  switch (loaded.type) {
    case '3dtiles':
      await viewer.flyTo(loaded.layer);
      break;
    case 'geojson':
      await viewer.flyTo(loaded.layer);
      break;
  }
}

// --- helper functions below ---

async function addImageryLayer(viewer, assetId) {
  const provider = await Cesium.IonImageryProvider.fromAssetId(assetId);
  return viewer.imageryLayers.addImageryProvider(provider);
}

async function setTerrain(viewer, assetId) {
  const provider = await Cesium.CesiumTerrainProvider.fromIonAssetId(assetId);
  viewer.terrainProvider = provider;
  return provider;
}

async function add3DTileset(viewer, assetId) {
  const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(assetId);
  viewer.scene.primitives.add(tileset);
  return tileset;
}

async function addGeoJson(viewer, assetId) {
  const resource = await Cesium.IonResource.fromAssetId(assetId);
  const dataSource = await Cesium.GeoJsonDataSource.load(resource);
  viewer.dataSources.add(dataSource);
  return dataSource;
}
