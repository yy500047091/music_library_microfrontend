import { useState, useEffect } from 'react';
import './MusicLibrary.css';
import Player from './components/Player';


const MusicLibrary = ({ userRole, onAddSong, onDeleteSong }) => {
  // Sample song data with audio URLs
  const initialSongs = [
    { 
      id: 1, 
      title: 'Bohemian Rhapsody', 
      artist: 'Queen', 
      album: 'A Night at the Opera', 
      year: 1975,
      audioUrl: 'https://example.com/audio1.mp3',
      albumArt: 'https://i.scdn.co/image/ab67616d00001e02e319baafd16e84f0408af2a0'
    },
    { 
      id: 2, 
      title: 'Stairway to Heaven', 
      artist: 'Led Zeppelin', 
      album: 'Led Zeppelin IV', 
      year: 1971,
      audioUrl: 'https://example.com/audio2.mp3',
      albumArt: 'https://i.scdn.co/image/ab67616d00001e026b072f6a6b2a982d887e4b21'
    },
    { 
      id: 3, 
      title: 'Hotel California', 
      artist: 'Eagles', 
      album: 'Hotel California', 
      year: 1976,
      audioUrl: 'https://example.com/audio3.mp3',
      albumArt: 'https://i.scdn.co/image/ab67616d00001e02a4d5d5e9d9a5d5e5d5e5d5e5'
    },
    { 
      id: 4, 
      title: 'Imagine', 
      artist: 'John Lennon', 
      album: 'Imagine', 
      year: 1971,
      audioUrl: 'https://example.com/audio4.mp3',
      albumArt: 'https://i.scdn.co/image/ab67616d00001e02a4d5d5e9d9a5d5e5d5e5d5e5'
    },
    { 
      id: 5, 
      title: 'Smells Like Teen Spirit', 
      artist: 'Nirvana', 
      album: 'Nevermind', 
      year: 1991,
      audioUrl: 'https://example.com/audio5.mp3',
      albumArt: 'https://i.scdn.co/image/ab67616d00001e02a4d5d5e9d9a5d5e5d5e5d5e5'
    },
  ];

  // State declarations
  const [songs, setSongs] = useState(initialSongs);
  const [filteredSongs, setFilteredSongs] = useState(initialSongs);
  const [newSong, setNewSong] = useState({ title: '', artist: '', album: '', year: '' });
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [groupBy, setGroupBy] = useState('none');
  const [groupedSongs, setGroupedSongs] = useState({});
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [showAdminSidebar, setShowAdminSidebar] = useState(false);

  // Handle song selection
  const handleSongSelect = (song) => {
    setCurrentTrack({
      name: song.title,
      artists: [{ name: song.artist }],
      album: {
        images: [{ url: song.albumArt || 'default-album-art.png' }]
      },
      audioUrl: song.audioUrl
    });
    setIsPlaying(true);
  };

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle next song
  const handleNext = () => {
    const currentIndex = songs.findIndex(song => song.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handleSongSelect(songs[nextIndex]);
  };

  // Handle previous song
  const handlePrevious = () => {
    const currentIndex = songs.findIndex(song => song.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handleSongSelect(songs[prevIndex]);
  };

  // Debug logging
  useEffect(() => {
    console.log('Current track:', currentTrack);
    console.log('Is playing:', isPlaying);
  }, [currentTrack, isPlaying]);

  // Handle adding a new song
  const handleAddSong = () => {
    if (!newSong.title || !newSong.artist) {
      console.warn('Title and Artist are required fields');
      return;
    }

    const songToAdd = {
      ...newSong,
      id: songs.length > 0 ? Math.max(...songs.map(song => song.id)) + 1 : 1,
      year: parseInt(newSong.year) || 0,
      createdAt: new Date().toISOString(),
      audioUrl: 'https://example.com/default-audio.mp3',
      albumArt: 'default-album-art.png'
    };

    setSongs(prevSongs => [...prevSongs, songToAdd]);
    setNewSong({ title: '', artist: '', album: '', year: '' });
    
    if (onAddSong) {
      onAddSong(songToAdd);
    }
  };

  // Handle deleting a song
  const handleDeleteSong = (id) => {
    const updatedSongs = songs.filter(song => song.id !== id);
    setSongs(updatedSongs);
    
    if (onDeleteSong) {
      onDeleteSong(id);
    }
    
    // If deleted song was currently playing, stop playback
    if (currentTrack?.id === id) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  // Apply filtering, sorting, and grouping
  useEffect(() => {
    let result = [...songs];
    
    if (filter) {
      result = result.filter(song => 
        song.title.toLowerCase().includes(filter.toLowerCase()) ||
        song.artist.toLowerCase().includes(filter.toLowerCase()) ||
        song.album.toLowerCase().includes(filter.toLowerCase())
      );
    }
    
    result.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });
    
    setFilteredSongs(result);
    
    if (groupBy !== 'none') {
      const grouped = result.reduce((acc, song) => {
        const key = song[groupBy];
        if (!acc[key]) acc[key] = [];
        acc[key].push(song);
        return acc;
      }, {});
      setGroupedSongs(grouped);
    } else {
      setGroupedSongs({});
    }
  }, [songs, filter, sortBy, groupBy]);

  return (
    <div className="music-library">
       {userRole === 'admin' && (
        <div className={`admin-sidebar ${showAdminSidebar ? 'open' : ''}`}>
          <button 
            className="admin-toggle"
            onClick={() => setShowAdminSidebar(!showAdminSidebar)}
          >
            {showAdminSidebar ? '◄' : '►'}
          </button>
          
          <div className="admin-content">
            <h3>Admin Panel</h3>
            <div className="add-song-form">
              <h4>Add New Song</h4>
              <input
                type="text"
                placeholder="Title *"
                value={newSong.title}
                onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Artist *"
                value={newSong.artist}
                onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Album"
                value={newSong.album}
                onChange={(e) => setNewSong({...newSong, album: e.target.value})}
              />
              <input
                type="number"
                placeholder="Year"
                value={newSong.year}
                onChange={(e) => setNewSong({...newSong, year: e.target.value})}
              />
              <button onClick={handleAddSong}>Add Song</button>
            </div>
          </div>
        </div>
      )}

      <h2>Music Library</h2>
      
      {/* Controls */}
      <div className="controls">
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Filter songs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="title">Sort by Title</option>
            <option value="artist">Sort by Artist</option>
            <option value="album">Sort by Album</option>
            <option value="year">Sort by Year</option>
          </select>
          
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="none">No Grouping</option>
            <option value="artist">Group by Artist</option>
            <option value="album">Group by Album</option>
            <option value="year">Group by Year</option>
          </select>
        </div>
        
        {/* Add song form (admin only) */}
        {userRole === 'admin' && (
          <div className="add-song-form">
            <h3>Add New Song</h3>
            <input
              type="text"
              placeholder="Title *"
              value={newSong.title}
              onChange={(e) => setNewSong({...newSong, title: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Artist *"
              value={newSong.artist}
              onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Album"
              value={newSong.album}
              onChange={(e) => setNewSong({...newSong, album: e.target.value})}
            />
            <input
              type="number"
              placeholder="Year"
              value={newSong.year}
              onChange={(e) => setNewSong({...newSong, year: e.target.value})}
            />
            <button onClick={handleAddSong}>Add Song</button>
          </div>
        )}
      </div>
      
      {/* Song list */}
      <div className="song-list">
        {groupBy === 'none' ? (
          <ul>
            {filteredSongs.map(song => (
              <li 
                key={song.id} 
                className={`song-item ${currentTrack?.name === song.title ? 'active' : ''}`}
                onClick={() => handleSongSelect(song)}
              >
                <div className="song-info">
                  <h3>{song.title}</h3>
                  <p>Artist: {song.artist}</p>
                  <p>Album: {song.album}</p>
                  <p>Year: {song.year}</p>
                </div>
                {userRole === 'admin' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSong(song.id);
                    }}
                    aria-label={`Delete ${song.title}`}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          Object.entries(groupedSongs).map(([group, songsInGroup]) => (
            <div key={group} className="song-group">
              <h3>{group}</h3>
              <ul>
                {songsInGroup.map(song => (
                  <li 
                    key={song.id} 
                    className={`song-item ${currentTrack?.name === song.title ? 'active' : ''}`}
                    onClick={() => handleSongSelect(song)}
                  >
                    <div className="song-info">
                      <h4>{song.title}</h4>
                      {groupBy !== 'artist' && <p>Artist: {song.artist}</p>}
                      {groupBy !== 'album' && <p>Album: {song.album}</p>}
                      {groupBy !== 'year' && <p>Year: {song.year}</p>}
                    </div>
                    {userRole === 'admin' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSong(song.id);
                        }}
                        aria-label={`Delete ${song.title}`}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Music Player */}
      <Player 
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};

export default MusicLibrary;