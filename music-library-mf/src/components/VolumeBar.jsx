import React, { useState } from 'react';
import './VolumeBar.css';

const VolumeBar = () => {
  const [volume, setVolume] = useState(50);

  return (
    <div className="volumebar__container">
      <i className="fas fa-volume-up"></i>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
        className="volumebar"
      />
    </div>
  );
};

export default VolumeBar;