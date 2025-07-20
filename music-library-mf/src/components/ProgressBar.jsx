import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, duration }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="progressbar__container">
      <div className="progressbar">
        <div 
          className="progressbar__progress" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="progressbar__time">
        <span>{formatTime(duration * (progress / 100))}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;