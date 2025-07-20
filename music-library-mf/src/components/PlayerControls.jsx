import React from 'react';
import './PlayerControls.css';

const PlayerControls = ({ isPlaying, onPlayPause, onNext, onPrevious }) => {
  return (
    <div className="player__controls">
      <i className="player__shuffle fas fa-random"></i>
      <i 
        className="player__previous fas fa-step-backward" 
        onClick={onPrevious}
      ></i>
      <i 
        className={`player__play fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} 
        onClick={onPlayPause}
      ></i>
      <i 
        className="player__next fas fa-step-forward" 
        onClick={onNext}
      ></i>
      <i className="player__repeat fas fa-redo"></i>
    </div>
  );
};

export default PlayerControls;