import React from 'react';

const textureStyleMap = {
  wood: {
    backgroundImage: 'linear-gradient(90deg, #a57b4d 20%, #d4b38f 22%, #a57b4d 24%, #b78d65 26%, #a57b4d 30%)',
    backgroundSize: '120px 120px'
  },
  marble: {
    backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 0%, transparent 14%), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.7) 0%, transparent 15%), linear-gradient(135deg, #f6f1ea 0%, #d8d4c8 100%)'
  },
  concrete: {
    backgroundImage: 'linear-gradient(135deg, #9fa2a6 0%, #c9c9c4 100%)',
    backgroundSize: '60px 60px'
  },
  matte: {
    backgroundColor: '#d1d1d1'
  },
  wallpaper: {
    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.15) 2px, transparent 2px), linear-gradient(rgba(255,255,255,0.15) 2px, transparent 2px)',
    backgroundSize: '20px 20px',
    backgroundColor: '#c7d5df'
  }
};

export default function OptionsPanel({ colors, textures, activeColor, activeTexture, onSelectColor, onSelectTexture }) {
  return (
    <div className="options-panel">
      <div className="option-group">
        <h3>Wall Colors</h3>
        <div className="swatches">
          {colors.map((color) => (
            <button
              key={color.id}
              type="button"
              className={`swatch ${activeColor.id === color.id ? 'active' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => onSelectColor(color)}
            >
              <span>{color.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <h3>Textures</h3>
        <div className="textures">
          {textures.map((texture) => (
            <button
              key={texture.id}
              type="button"
              className={`texture-card ${activeTexture.id === texture.id ? 'active' : ''}`}
              onClick={() => onSelectTexture(texture)}
              style={textureStyleMap[texture.id] || { backgroundColor: texture.thumbnail }}
            >
              <span>{texture.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
