import { useState } from 'react';
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
  PanelRightOpen,
  Layers,
} from 'lucide-react';

// icons for each layer type
const TYPE_ICONS = {
  imagery: Map,
  terrain: Mountain,
  '3dtiles': Building2,
  geojson: MapPin,
};

export default function LayerManager({ layerStates, toggleLayer, toggleVisibility, flyTo }) {
  const [collapsed, setCollapsed] = useState(false);

  // count how many layers are loaded for the badge
  const loadedCount = Object.values(layerStates).filter(s => s.loaded).length;

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
        <h2 className="layer-manager-title">Layers</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="layer-manager-toggle"
          title="Collapse panel"
        >
          <PanelRightClose size={18} />
        </button>
      </div>

      <div className="layer-list">
        {ASSETS.map(asset => {
          const state = layerStates[asset.assetId];
          const TypeIcon = TYPE_ICONS[asset.type];

          return (
            <div key={asset.id} className="layer-item">
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
                  {/* visibility toggle - not for terrain cuz it cant be hidden */}
                  {asset.type !== 'terrain' && (
                    <button
                      onClick={() => toggleVisibility(asset)}
                      className="layer-btn"
                      title={state.visible ? 'Hide' : 'Show'}
                    >
                      {state.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  )}

                  {/* fly to - only for 3dtiles and geojson */}
                  {(asset.type === '3dtiles' || asset.type === 'geojson') && (
                    <button
                      onClick={() => flyTo(asset)}
                      className="layer-btn"
                      title="Fly to"
                    >
                      <Crosshair size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* show error if something went wrong */}
              {state.error && (
                <div className="layer-error">Error: {state.error}</div>
              )}

              {/* description */}
              <p className="layer-description">{asset.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
