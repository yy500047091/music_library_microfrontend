import { useState, useRef, useEffect } from 'react';
import './Player.css';

const Player = ({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  onVolumeChange 
}) => {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // Handle play/pause based on isPlaying prop
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // Update progress bar
  const updateProgress = () => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 1;
    setProgress((currentTime / duration) * 100);
  };

  // Set duration when metadata loads
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle song end
  const handleSongEnd = () => {
    onNext();
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle seeking in the track
  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * duration;
    audioRef.current.currentTime = seekTime;
    setProgress((seekTime / duration) * 100);
  };

  return (
    <div className="player">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnd}
      />
      
      {/* Left section - Album art and song info */}
      <div className="player__left">
        {currentTrack?.album?.images?.[0]?.url && (
          <img 
            className="player__albumLogo" 
            src={currentTrack.album.images[0].url} 
            alt="Album Cover" 
          />
        )}
        <div className="player__songInfo">
          <h4>{currentTrack?.name || 'No song selected'}</h4>
          <p>{currentTrack?.artists?.map(artist => artist.name).join(', ') || 'Unknown artist'}</p>
        </div>
      </div>

      {/* Center section - Controls and progress bar */}
      <div className="player__center">
        <div className="player__controls">
          <button className="player__control-btn" onClick={onPrevious}>
            <i className="fas fa-step-backward"></i>
          </button>
          
          <button className="player__play-btn" onClick={onPlayPause}>
            {isPlaying ? (
              <i className="fas fa-pause"></i>
            ) : (
              <i className="fas fa-play"></i>
            )}
          </button>
          
          <button className="player__control-btn" onClick={onNext}>
            <i className="fas fa-step-forward"></i>
          </button>
        </div>
        
        <div className="player__progress-container">
          <span className="player__time">{formatTime(audioRef.current?.currentTime || 0)}</span>
          <div className="player__progress-bar" onClick={handleSeek}>
            <div 
              className="player__progress" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="player__time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right section - Volume control */}
      <div className="player__right">
        <div className="player__volume-control">
          <i className={`fas fa-volume-${volume > 0 ? 'up' : 'off'}`}></i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="player__volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default Player;