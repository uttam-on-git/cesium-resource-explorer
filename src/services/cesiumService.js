import * as Cesium from 'cesium';

// keeping track of which layers are loaded so we don't load them twice
const loadedLayers = new Map();

// main function to add any type of layer
// options: { autoZoom: boolean } - fly to layer after loading
export async function addLayer(viewer, asset, options = {}) {
  if (!viewer || viewer.isDestroyed()) {
    throw new Error('Viewer not available');
  }

  const { autoZoom = false } = options;

  // already loaded? just return it
  if (loadedLayers.has(asset.assetId)) {
    return loadedLayers.get(asset.assetId);
  }

  let layer;
  let canZoom = false; // not all layer types support zoom

  // each asset type needs different cesium api calls
  switch (asset.type) {
    case 'imagery':
      layer = await addImageryLayer(viewer, asset.assetId);
      canZoom = false; // imagery is global, cant zoom to it
      break;
    case 'terrain':
      layer = await setTerrain(viewer, asset.assetId);
      canZoom = false; // terrain is global too
      break;
    case '3dtiles':
      layer = await add3DTileset(viewer, asset.assetId);
      canZoom = true;
      break;
    case 'geojson':
      layer = await addGeoJson(viewer, asset.assetId);
      canZoom = true;
      break;
    default:
      throw new Error(`Unknown asset type: ${asset.type}`);
  }

  // save reference so we can remove it later
  loadedLayers.set(asset.assetId, { layer, type: asset.type });

  // auto-zoom if requested and layer supports it
  if (autoZoom && canZoom) {
    try {
      await viewer.flyTo(layer, {
        duration: 1.5,
        offset: new Cesium.HeadingPitchRange(
          0,
          Cesium.Math.toRadians(-45), // look down at 45 degrees
          0 // auto-calculate range
        )
      });
    } catch (err) {
      // flyTo can fail if layer has no bounds, just log it
      console.warn('Auto-zoom failed:', err.message);
    }
  }

  return layer;
}

// remove layer from viewer and clean up memory
export function removeLayer(viewer, asset) {
  if (!viewer || viewer.isDestroyed()) return;

  const loaded = loadedLayers.get(asset.assetId);
  if (!loaded) return;

  // different removal method for each type
  // using destroy: true where possible to free up memory
  switch (loaded.type) {
    case 'imagery':
      // second param true = destroy the layer
      viewer.imageryLayers.remove(loaded.layer, true);
      break;
    case 'terrain':
      // cant really remove terrain, just reset to default ellipsoid
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      break;
    case '3dtiles':
      // second param true = destroy the tileset
      viewer.scene.primitives.remove(loaded.layer);
      if (!loaded.layer.isDestroyed()) {
        loaded.layer.destroy();
      }
      break;
    case 'geojson':
      // second param true = destroy the datasource
      viewer.dataSources.remove(loaded.layer, true);
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
export async function flyToLayer(viewer, asset, options = {}) {
  if (!viewer || viewer.isDestroyed()) return;

  const loaded = loadedLayers.get(asset.assetId);
  if (!loaded) return;

  const { duration = 1.5, pitch = -45 } = options;

  const flightOptions = {
    duration,
    offset: new Cesium.HeadingPitchRange(
      0,
      Cesium.Math.toRadians(pitch),
      0
    )
  };

  // only works for 3d tiles and geojson since they have bounds
  // imagery and terrain are global so nothing to fly to
  switch (loaded.type) {
    case '3dtiles':
      await viewer.flyTo(loaded.layer, flightOptions);
      break;
    case 'geojson':
      await viewer.flyTo(loaded.layer, flightOptions);
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

  // for large geojson files, use lightweight styling
  // - semi-transparent fill
  // - thin stroke for better performance with many polygons
  // - clampToGround true so it follows terrain
  const dataSource = await Cesium.GeoJsonDataSource.load(resource, {
    stroke: Cesium.Color.YELLOW,
    strokeWidth: 1,
    fill: Cesium.Color.YELLOW.withAlpha(0.2),
    clampToGround: true,
  });

  viewer.dataSources.add(dataSource);
  return dataSource;
}
