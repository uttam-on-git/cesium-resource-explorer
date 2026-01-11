import { X, MapPin, Hash, Type, Layers } from 'lucide-react';

/**
 * Feature Inspector Panel
 * Displays properties of clicked GeoJSON features
 */
export default function FeatureInspector({ feature, onClose }) {
  if (!feature) return null;

  const { name, properties, position } = feature;

  // Filter out internal/null properties
  const displayProps = Object.entries(properties || {}).filter(
    ([key, value]) => value !== null && value !== undefined && !key.startsWith('_')
  );

  return (
    <div className="feature-inspector">
      <div className="feature-inspector-header">
        <div className="feature-inspector-title">
          <MapPin size={14} />
          <span>{name || 'Feature Details'}</span>
        </div>
        <button
          className="feature-inspector-close"
          onClick={onClose}
          title="Close (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      <div className="feature-inspector-content">
        {/* Position if available */}
        {position && (
          <div className="feature-inspector-section">
            <div className="feature-inspector-section-header">
              <Layers size={12} />
              <span>Location</span>
            </div>
            <div className="feature-inspector-coords">
              <span>Lat: {position.lat?.toFixed(6) || 'N/A'}</span>
              <span>Lon: {position.lon?.toFixed(6) || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Properties */}
        {displayProps.length > 0 ? (
          <div className="feature-inspector-section">
            <div className="feature-inspector-section-header">
              <Hash size={12} />
              <span>Properties ({displayProps.length})</span>
            </div>
            <div className="feature-inspector-props">
              {displayProps.map(([key, value]) => (
                <div key={key} className="feature-inspector-prop">
                  <span className="feature-inspector-prop-key">{key}</span>
                  <span className="feature-inspector-prop-value">
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="feature-inspector-empty">
            <Type size={16} />
            <span>No properties available</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Format property values for display
function formatValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : value.toFixed(4);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
