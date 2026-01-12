import { useState, memo, useMemo } from 'react';
import { ASSETS } from '../constants/assets';
import {
  Map,
  Mountain,
  Building2,
  MapPin,
  Eye,
  EyeOff,
  Crosshair,
  Loader2,
  PanelRightClose,
  Layers,
} from 'lucide-react';

// icons for each layer type
const TYPE_ICONS = {
  imagery: Map,
  terrain: Mountain,
  '3dtiles': Building2,
  geojson: MapPin,
};

// Group configuration with display names and order
const LAYER_GROUPS = [
  { type: 'imagery', label: 'Imagery', icon: Map },
  { type: 'terrain', label: 'Terrain', icon: Mountain },
  { type: 'geojson', label: 'Vector Data', icon: MapPin },
  { type: '3dtiles', label: '3D Tiles', icon: Building2 },
];

// Memoized layer item to prevent re-renders when other layers change
const LayerItem = memo(function LayerItem({ asset, state, toggleLayer, toggleVisibility, flyTo }) {
  const TypeIcon = TYPE_ICONS[asset.type];

  return (
    <div className={`layer-item ${state.loaded ? 'layer-loaded' : ''}`}>
      <div className="layer-item-header">
        <label className="layer-checkbox-label">
          <input
            type="checkbox"
            checked={state.loaded}
            disabled={state.loading}
            onChange={() => toggleLayer(asset)}
            className="layer-checkbox"
          />
          <TypeIcon size={16} className="layer-icon" />
          <span className="layer-name">{asset.name}</span>
        </label>

        {/* show loading spinner */}
        {state.loading && <Loader2 size={16} className="layer-loading" />}
      </div>

      {/* extra controls when layer is loaded */}
      {state.loaded && (
        <div className="layer-controls">
          {/* visibility toggle - not for terrain since it cannot be hidden */}
          {asset.type !== 'terrain' && (
            <button
              onClick={() => toggleVisibility(asset)}
              className={`layer-btn ${state.visible ? 'layer-btn-visible' : 'layer-btn-hidden'}`}
              title={state.visible ? 'Hide layer' : 'Show layer'}
            >
              {state.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}

          {/* fly to - only for 3dtiles and geojson */}
          {(asset.type === '3dtiles' || asset.type === 'geojson') && (
            <button
              onClick={() => flyTo(asset)}
              className="layer-btn layer-btn-fly"
              title="Navigate to layer"
            >
              <Crosshair size={14} />
            </button>
          )}
        </div>
      )}

      {/* show error if something went wrong */}
      {state.error && (
        <div className="layer-error">
          <span>ERROR:</span> {state.error}
        </div>
      )}

      {/* description with optional size */}
      <p className="layer-description">
        {asset.description}
        {asset.size && <span className="layer-size">{asset.size}</span>}
      </p>
    </div>
  );
});

export default function LayerManager({ layerStates, toggleLayer, toggleVisibility, flyTo }) {
  const [collapsed, setCollapsed] = useState(false);

  // memoize loaded count to avoid recalculating on every render
  const loadedCount = useMemo(
    () => Object.values(layerStates).filter(s => s.loaded).length,
    [layerStates]
  );

  // memoize grouped assets
  const groupedAssets = useMemo(() => {
    const groups = {};
    LAYER_GROUPS.forEach(group => {
      groups[group.type] = ASSETS.filter(asset => asset.type === group.type);
    });
    return groups;
  }, []);

  // collapsed view - just a small button
  if (collapsed) {
    return (
      <div className="layer-manager-collapsed">
        <button
          onClick={() => setCollapsed(false)}
          className="layer-manager-toggle"
          title="Open layer panel"
        >
          <Layers size={20} />
          {loadedCount > 0 && (
            <span className="layer-badge">{loadedCount}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="layer-manager">
      <div className="layer-manager-header">
        <h2 className="layer-manager-title">Data Layers</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="layer-manager-toggle"
          title="Collapse panel"
        >
          <PanelRightClose size={18} />
        </button>
      </div>

      <div className="layer-list">
        {LAYER_GROUPS.map(group => {
          const assets = groupedAssets[group.type];
          if (!assets || assets.length === 0) return null;

          const GroupIcon = group.icon;
          const loadedInGroup = assets.filter(a => layerStates[a.assetId]?.loaded).length;

          return (
            <div key={group.type} className="layer-group">
              <div className={`layer-group-header layer-group-header--${group.type}`}>
                <GroupIcon size={12} className="layer-group-icon" />
                <span className="layer-group-label">{group.label}</span>
                {loadedInGroup > 0 && (
                  <span className="layer-group-count">{loadedInGroup}/{assets.length}</span>
                )}
              </div>
              <div className="layer-group-items">
                {assets.map(asset => (
                  <LayerItem
                    key={asset.id}
                    asset={asset}
                    state={layerStates[asset.assetId]}
                    toggleLayer={toggleLayer}
                    toggleVisibility={toggleVisibility}
                    flyTo={flyTo}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
