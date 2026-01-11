import { useState, useEffect } from 'react';
import { flyToUserLocation } from '../services/cesiumService';

function MyLocation({ viewerRef }) {
  const [status, setStatus] = useState('idle'); // idle, loading, error, success
  const [errorMessage, setErrorMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    if (!viewerRef.current || status === 'loading') return;

    setStatus('loading');
    setErrorMessage('');

    try {
      await flyToUserLocation(viewerRef.current);
      setStatus('success');
      // Reset to idle after success animation
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  // Radar sweep angle for loading state
  const [sweepAngle, setSweepAngle] = useState(0);
  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setSweepAngle(prev => (prev + 6) % 360);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div
      className={`loc-beacon ${status === 'loading' ? 'loc-beacon--scanning' : ''} ${status === 'error' ? 'loc-beacon--error' : ''} ${status === 'success' ? 'loc-beacon--locked' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient glow effect */}
      <div className="loc-beacon__ambient" />

      {/* Main button */}
      <button
        className="loc-beacon__btn"
        onClick={handleClick}
        disabled={status === 'loading'}
        title={errorMessage || 'Acquire current position'}
      >
        {/* Hexagonal frame */}
        <svg className="loc-beacon__frame" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon
            className="loc-beacon__hex"
            points="50,2 95,25 95,75 50,98 5,75 5,25"
          />
          {/* Corner accents */}
          <line className="loc-beacon__accent" x1="50" y1="2" x2="70" y2="12" />
          <line className="loc-beacon__accent" x1="50" y1="2" x2="30" y2="12" />
          <line className="loc-beacon__accent" x1="50" y1="98" x2="70" y2="88" />
          <line className="loc-beacon__accent" x1="50" y1="98" x2="30" y2="88" />
        </svg>

        {/* Radar display */}
        <div className="loc-beacon__radar">
          {/* Radar rings */}
          <svg className="loc-beacon__rings" viewBox="0 0 60 60">
            <circle className="loc-beacon__ring loc-beacon__ring--outer" cx="30" cy="30" r="28" />
            <circle className="loc-beacon__ring loc-beacon__ring--mid" cx="30" cy="30" r="20" />
            <circle className="loc-beacon__ring loc-beacon__ring--inner" cx="30" cy="30" r="12" />

            {/* Crosshairs */}
            <line className="loc-beacon__crosshair" x1="30" y1="4" x2="30" y2="14" />
            <line className="loc-beacon__crosshair" x1="30" y1="46" x2="30" y2="56" />
            <line className="loc-beacon__crosshair" x1="4" y1="30" x2="14" y2="30" />
            <line className="loc-beacon__crosshair" x1="46" y1="30" x2="56" y2="30" />

            {/* Radar sweep (only during loading) */}
            {status === 'loading' && (
              <g style={{ transform: `rotate(${sweepAngle}deg)`, transformOrigin: '30px 30px' }}>
                <defs>
                  <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="100%" stopColor="var(--cyan-glow)" />
                  </linearGradient>
                </defs>
                <path
                  className="loc-beacon__sweep"
                  d="M30,30 L30,2 A28,28 0 0,1 54,16 Z"
                  fill="url(#sweepGradient)"
                  opacity="0.6"
                />
                <line className="loc-beacon__sweep-line" x1="30" y1="30" x2="30" y2="2" />
              </g>
            )}

            {/* Center beacon */}
            <circle
              className={`loc-beacon__core ${status === 'success' ? 'loc-beacon__core--locked' : ''}`}
              cx="30"
              cy="30"
              r="4"
            />
            {status === 'success' && (
              <circle className="loc-beacon__pulse" cx="30" cy="30" r="4" />
            )}
          </svg>
        </div>

        {/* Label */}
        <span className="loc-beacon__label">
          <span className="loc-beacon__label-text">
            {status === 'loading' ? 'SCANNING' : status === 'error' ? 'NO SIGNAL' : status === 'success' ? 'LOCKED' : 'LOCATE'}
          </span>
          {status === 'loading' && <span className="loc-beacon__dots" />}
        </span>

        {/* Status indicator */}
        <div className={`loc-beacon__status ${status !== 'idle' ? 'loc-beacon__status--active' : ''}`}>
          <span className="loc-beacon__status-dot" />
        </div>
      </button>

      {/* Expanded info panel on hover */}
      {(isHovered || errorMessage) && (
        <div className="loc-beacon__info">
          <div className="loc-beacon__info-header">
            <span className="loc-beacon__info-icon">◈</span>
            <span>NAV BEACON</span>
          </div>
          {errorMessage ? (
            <div className="loc-beacon__info-error">{errorMessage}</div>
          ) : (
            <div className="loc-beacon__info-text">
              {status === 'loading' ? 'Acquiring GPS coordinates...' :
               status === 'success' ? 'Position acquired' :
               'Fly to current position'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyLocation;
