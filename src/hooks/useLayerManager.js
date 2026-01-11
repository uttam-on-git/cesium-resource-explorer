import { useState, useCallback, useEffect } from 'react';
import { ASSETS } from '../constants/assets';
import * as cesiumService from '../services/cesiumService';

const STORAGE_KEY = 'cesium-explorer-layers';

// Load saved layer preferences from localStorage
function loadSavedPreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load layer preferences:', e);
  }
  return null;
}

// Save layer preferences to localStorage
function savePreferences(layerStates) {
  try {
    // Only save which layers should be loaded (not transient state like loading/error)
    const toSave = {};
    Object.entries(layerStates).forEach(([assetId, state]) => {
      if (state.loaded) {
        toSave[assetId] = { shouldLoad: true, visible: state.visible };
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save layer preferences:', e);
  }
}

// Custom hook for managing layer state and operations
export function useLayerManager(viewerRef) {
  // Track loading, visibility, and error state for each layer
  const [layerStates, setLayerStates] = useState(() => {
    const initial = {};
    ASSETS.forEach(asset => {
      initial[asset.assetId] = {
        loaded: false,
        visible: false,
        loading: false,
        error: null,
      };
    });
    return initial;
  });

  // Terrain requires special handling - only one can be active at a time
  const [activeTerrain, setActiveTerrain] = useState(null);

  // Track if initial restore has been done
  const [restored, setRestored] = useState(false);

  const getViewer = useCallback(() => {
    return viewerRef?.current;
  }, [viewerRef]);

  // Load a layer with optional auto-zoom
  const loadLayer = useCallback(async (asset, options = {}) => {
    const viewer = getViewer();
    if (!viewer) return;

    const { autoZoom = true } = options;

    // If loading terrain and another is active, remove the existing one first
    if (asset.type === 'terrain' && activeTerrain && activeTerrain !== asset.assetId) {
      const currentTerrainAsset = ASSETS.find(a => a.assetId === activeTerrain);
      if (currentTerrainAsset) {
        cesiumService.removeLayer(viewer, currentTerrainAsset);
        setLayerStates(prev => ({
          ...prev,
          [activeTerrain]: { loaded: false, visible: false, loading: false, error: null }
        }));
      }
    }

    // Set loading state
    setLayerStates(prev => ({
      ...prev,
      [asset.assetId]: { ...prev[asset.assetId], loading: true, error: null }
    }));

    try {
      await cesiumService.addLayer(viewer, asset, { autoZoom });

      // Update state on success
      setLayerStates(prev => ({
        ...prev,
        [asset.assetId]: { loaded: true, visible: true, loading: false, error: null }
      }));

      if (asset.type === 'terrain') {
        setActiveTerrain(asset.assetId);
      }
    } catch (err) {
      // Capture error state for UI display
      setLayerStates(prev => ({
        ...prev,
        [asset.assetId]: { loaded: false, visible: false, loading: false, error: err.message }
      }));
    }
  }, [getViewer, activeTerrain]);

  // Completely remove a layer from the viewer
  const unloadLayer = useCallback((asset) => {
    const viewer = getViewer();
    if (!viewer) return;

    cesiumService.removeLayer(viewer, asset);

    setLayerStates(prev => ({
      ...prev,
      [asset.assetId]: { loaded: false, visible: false, loading: false, error: null }
    }));

    if (asset.type === 'terrain') {
      setActiveTerrain(null);
    }
  }, [getViewer]);

  // Toggle visibility without unloading (preserves memory)
  const toggleVisibility = useCallback((asset) => {
    const state = layerStates[asset.assetId];
    if (!state.loaded) return;

    const newVisible = !state.visible;
    cesiumService.setLayerVisibility(asset, newVisible);

    setLayerStates(prev => ({
      ...prev,
      [asset.assetId]: { ...prev[asset.assetId], visible: newVisible }
    }));
  }, [layerStates]);

  // Toggle layer on/off - main checkbox handler
  const toggleLayer = useCallback(async (asset) => {
    const state = layerStates[asset.assetId];

    if (state.loaded) {
      unloadLayer(asset);
    } else {
      await loadLayer(asset);
    }
  }, [layerStates, loadLayer, unloadLayer]);

  // Fly camera to layer bounds
  const flyTo = useCallback(async (asset) => {
    const viewer = getViewer();
    if (!viewer) return;
    await cesiumService.flyToLayer(viewer, asset);
  }, [getViewer]);

  // Get state for a specific layer
  const getLayerState = useCallback((assetId) => {
    return layerStates[assetId] || { loaded: false, visible: false, loading: false, error: null };
  }, [layerStates]);

  // Restore saved layer preferences on viewer ready
  useEffect(() => {
    const viewer = getViewer();
    if (!viewer || restored) return;

    const savedPrefs = loadSavedPreferences();
    if (!savedPrefs) {
      setRestored(true);
      return;
    }

    // Restore each saved layer (without auto-zoom to avoid jarring UX)
    const restoreLayers = async () => {
      for (const [assetId, prefs] of Object.entries(savedPrefs)) {
        if (prefs.shouldLoad) {
          const asset = ASSETS.find(a => String(a.assetId) === assetId);
          if (asset) {
            try {
              await cesiumService.addLayer(viewer, asset, { autoZoom: false });

              // Set visibility if it was hidden
              if (!prefs.visible) {
                cesiumService.setLayerVisibility(asset, false);
              }

              setLayerStates(prev => ({
                ...prev,
                [asset.assetId]: { loaded: true, visible: prefs.visible, loading: false, error: null }
              }));

              if (asset.type === 'terrain') {
                setActiveTerrain(asset.assetId);
              }
            } catch (err) {
              console.warn(`Failed to restore layer ${asset.name}:`, err);
            }
          }
        }
      }
      setRestored(true);
    };

    restoreLayers();
  }, [getViewer, restored]);

  // Save preferences whenever layer states change (after initial restore)
  useEffect(() => {
    if (restored) {
      savePreferences(layerStates);
    }
  }, [layerStates, restored]);

  return {
    layerStates,
    activeTerrain,
    loadLayer,
    unloadLayer,
    toggleLayer,
    toggleVisibility,
    flyTo,
    getLayerState,
  };
}
