import { useState, useCallback } from 'react';
import { ASSETS } from '../constants/assets';
import * as cesiumService from '../services/cesiumService';

// hook to manage all the layer stuff
export function useLayerManager(viewerRef) {
  // state for each layer - whether its loaded, visible, loading, or has error
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

  // need to track terrain separately cuz cesium only allows one at a time
  const [activeTerrain, setActiveTerrain] = useState(null);

  const getViewer = useCallback(() => {
    return viewerRef?.current;
  }, [viewerRef]);

  // load a layer
  const loadLayer = useCallback(async (asset) => {
    const viewer = getViewer();
    if (!viewer) return;

    // if loading terrain and theres already one, gotta remove the old one first
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

    // set loading state
    setLayerStates(prev => ({
      ...prev,
      [asset.assetId]: { ...prev[asset.assetId], loading: true, error: null }
    }));

    try {
      await cesiumService.addLayer(viewer, asset);

      // success!
      setLayerStates(prev => ({
        ...prev,
        [asset.assetId]: { loaded: true, visible: true, loading: false, error: null }
      }));

      if (asset.type === 'terrain') {
        setActiveTerrain(asset.assetId);
      }
    } catch (err) {
      // something went wrong
      setLayerStates(prev => ({
        ...prev,
        [asset.assetId]: { loaded: false, visible: false, loading: false, error: err.message }
      }));
    }
  }, [getViewer, activeTerrain]);

  // completely remove a layer
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

  // just toggle visibility, dont unload
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

  // toggle layer on/off - this is what the checkbox will use
  const toggleLayer = useCallback(async (asset) => {
    const state = layerStates[asset.assetId];

    if (state.loaded) {
      unloadLayer(asset);
    } else {
      await loadLayer(asset);
    }
  }, [layerStates, loadLayer, unloadLayer]);

  // fly to layer
  const flyTo = useCallback(async (asset) => {
    const viewer = getViewer();
    if (!viewer) return;
    await cesiumService.flyToLayer(viewer, asset);
  }, [getViewer]);

  // get state for one layer
  const getLayerState = useCallback((assetId) => {
    return layerStates[assetId] || { loaded: false, visible: false, loading: false, error: null };
  }, [layerStates]);

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
