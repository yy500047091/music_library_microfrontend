import { useState, useEffect } from 'react';
import Player from './components/Player';

const MusicLibrary = ({ userRole, onAddSong, onDeleteSong }) => {
  // State declarations
  const [allSongs, setAllSongs] = useState([]); // Store all loaded songs
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [newSong, setNewSong] = useState({ title: '', artist: '', album: '', year: '' });
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [groupBy, setGroupBy] = useState('none');
  const [groupedSongs, setGroupedSongs] = useState({});
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Function to load initial songs from API
  const loadInitialSongs = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Load popular songs from different categories
      const searchQueries = ['bollywood hits', 'punjabi songs', 'english songs', 'tamil hits', 'hindi songs'];
      let allLoadedSongs = [];
      
      for (const query of searchQueries) {
        try {
          const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=10`);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.data && data.data.results) {
              const transformedSongs = data.data.results.map(song => ({
                id: song.id,
                title: song.name,
                artist: song.artists.primary.map(artist => artist.name).join(', ') || 'Unknown Artist',
                album: song.album.name || 'Unknown Album',
                year: song.year || 'Unknown',
                audioUrl: song.downloadUrl.find(url => url.quality === '160kbps')?.url || 
                         song.downloadUrl.find(url => url.quality === '96kbps')?.url ||
                         song.downloadUrl[0]?.url,
                albumArt: song.image.find(img => img.quality === '500x500')?.url ||
                         song.image.find(img => img.quality === '150x150')?.url ||
                         song.image[0]?.url,
                duration: song.duration,
                playCount: song.playCount,
                language: song.language,
                hasLyrics: song.hasLyrics,
                url: song.url,
                createdAt: new Date().toISOString()
              }));
              
              allLoadedSongs = [...allLoadedSongs, ...transformedSongs];
            }
          }
        } catch (err) {
          console.error(`Error fetching ${query}:`, err);
        }
      }
      
      // Remove duplicates based on song ID
      const uniqueSongs = allLoadedSongs.filter((song, index, self) => 
        index === self.findIndex(s => s.id === song.id)
      );
      
      setAllSongs(uniqueSongs);
      setSongs(uniqueSongs);
      setInitialLoaded(true);
      
    } catch (err) {
      console.error('Error loading initial songs:', err);
      setError('Failed to load songs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to search within loaded songs
  const searchInLoadedSongs = (query) => {
    if (!query.trim()) {
      setSongs(allSongs);
      return;
    }

    const filtered = allSongs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase()) ||
      song.album.toLowerCase().includes(query.toLowerCase())
    );
    
    setSongs(filtered);
  };

  // Load initial songs on component mount
  useEffect(() => {
    if (!initialLoaded) {
      loadInitialSongs();
    }
  }, [initialLoaded]);

  // Handle search
  const handleSearch = () => {
    searchInLoadedSongs(searchQuery);
  };

  // Handle song selection
  const handleSongSelect = (song) => {
    setCurrentTrack({
      id: song.id,
      name: song.title,
      artists: [{ name: song.artist }],
      album: {
        images: [{ url: song.albumArt || '/api/placeholder/300/300' }]
      },
      audioUrl: song.audioUrl,
      duration: song.duration
    });
    setIsPlaying(true);
  };

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle next song
  const handleNext = () => {
    const currentIndex = filteredSongs.findIndex(song => song.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % filteredSongs.length;
    if (filteredSongs[nextIndex]) {
      handleSongSelect(filteredSongs[nextIndex]);
    }
  };

  // Handle previous song
  const handlePrevious = () => {
    const currentIndex = filteredSongs.findIndex(song => song.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length;
    if (filteredSongs[prevIndex]) {
      handleSongSelect(filteredSongs[prevIndex]);
    }
  };

  // Handle adding a new song (for admin)
  const handleAddSong = async () => {
    if (!newSong.title || !newSong.artist) {
      setError('Title and Artist are required fields');
      return;
    }

    // Search for the song to get audio URL and other details
    if (!newSong.title || !newSong.artist) {
      setError('Title and Artist are required fields');
      return;
    }
    
    const songToAdd = {
      ...newSong,
      id: `custom-${Date.now()}`,
      year: parseInt(newSong.year) || new Date().getFullYear(),
      createdAt: new Date().toISOString(),
      audioUrl: '/api/placeholder/audio.mp3', // Placeholder for custom songs
      albumArt: '/api/placeholder/300/300'
    };

    const updatedAllSongs = [...allSongs, songToAdd];
    setAllSongs(updatedAllSongs);
    setSongs([...songs, songToAdd]);
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
      const aVal = a[sortBy]?.toString().toLowerCase() || '';
      const bVal = b[sortBy]?.toString().toLowerCase() || '';
      return aVal.localeCompare(bVal);
    });
    
    setFilteredSongs(result);
    
    if (groupBy !== 'none') {
      const grouped = result.reduce((acc, song) => {
        const key = song[groupBy] || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(song);
        return acc;
      }, {});
      setGroupedSongs(grouped);
    } else {
      setGroupedSongs({});
    }
  }, [songs, filter, sortBy, groupBy]);

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {userRole === 'admin' && (
        <div style={{
          position: 'fixed',
          left: showAdminSidebar ? '0' : '-300px',
          top: '0',
          height: '100vh',
          width: '300px',
          background: '#f5f5f5',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          transition: 'left 0.3s ease',
          zIndex: 1000,
          padding: '20px'
        }}>
          <button 
            onClick={() => setShowAdminSidebar(!showAdminSidebar)}
            style={{
              position: 'absolute',
              right: '-40px',
              top: '20px',
              padding: '10px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '0 5px 5px 0',
              cursor: 'pointer'
            }}
          >
            {showAdminSidebar ? '◄' : '►'}
          </button>
          
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Admin Panel</h3>
            <div>
              <h4 style={{ marginBottom: '15px', color: '#555' }}>Add New Song</h4>
              <input
                type="text"
                placeholder="Title *"
                value={newSong.title}
                onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
              <input
                type="text"
                placeholder="Artist *"
                value={newSong.artist}
                onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
              <input
                type="text"
                placeholder="Album"
                value={newSong.album}
                onChange={(e) => setNewSong({...newSong, album: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <input
                type="number"
                placeholder="Year"
                value={newSong.year}
                onChange={(e) => setNewSong({...newSong, year: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <button 
                onClick={handleAddSong}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add Song
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '30px', color: '#333' }}>Music Library</h2>
      
      {/* Search Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            style={{
              padding: '12px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '10px',
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {/* Controls */}
      {songs.length > 0 && (
        <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Filter songs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          />
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="title">Sort by Title</option>
            <option value="artist">Sort by Artist</option>
            <option value="album">Sort by Album</option>
            <option value="year">Sort by Year</option>
          </select>
          
          <select 
            value={groupBy} 
            onChange={(e) => setGroupBy(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="none">No Grouping</option>
            <option value="artist">Group by Artist</option>
            <option value="album">Group by Album</option>
            <option value="year">Group by Year</option>
          </select>
        </div>
      )}
      
      {/* Song list */}
      <div style={{ marginBottom: '100px' }}>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Searching for songs...</div>
          </div>
        )}

        {!isLoading && songs.length === 0 && searchQuery && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>No songs found. Try a different search term.</div>
          </div>
        )}

        {!isLoading && songs.length === 0 && !searchQuery && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Search for songs to get started!</div>
          </div>
        )}

        {groupBy === 'none' ? (
          <div>
            {filteredSongs.map(song => (
              <div 
                key={song.id} 
                onClick={() => handleSongSelect(song)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  margin: '10px 0',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: currentTrack?.id === song.id ? '#e3f2fd' : 'white',
                  transition: 'all 0.2s ease',
                  ':hover': { background: '#f5f5f5' }
                }}
                onMouseEnter={(e) => {
                  if (currentTrack?.id !== song.id) {
                    e.target.style.background = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTrack?.id !== song.id) {
                    e.target.style.background = 'white';
                  }
                }}
              >
                <img 
                  src={song.albumArt} 
                  alt={song.album}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '4px',
                    marginRight: '15px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#333' }}>{song.title}</h3>
                  <p style={{ margin: '2px 0', fontSize: '14px', color: '#666' }}>Artist: {song.artist}</p>
                  <p style={{ margin: '2px 0', fontSize: '14px', color: '#666' }}>Album: {song.album}</p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#888' }}>
                    <span>Year: {song.year}</span>
                    <span>Duration: {formatDuration(song.duration)}</span>
                    {song.playCount && <span>Plays: {song.playCount.toLocaleString()}</span>}
                  </div>
                </div>
                {userRole === 'admin' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSong(song.id);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          Object.entries(groupedSongs).map(([group, songsInGroup]) => (
            <div key={group} style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                margin: '20px 0 15px 0', 
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '4px',
                color: '#495057'
              }}>
                {group}
              </h3>
              <div>
                {songsInGroup.map(song => (
                  <div 
                    key={song.id} 
                    onClick={() => handleSongSelect(song)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '15px',
                      margin: '10px 0',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: currentTrack?.id === song.id ? '#e3f2fd' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img 
                      src={song.albumArt} 
                      alt={song.album}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '4px',
                        marginRight: '15px',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#333' }}>{song.title}</h4>
                      {groupBy !== 'artist' && <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>Artist: {song.artist}</p>}
                      {groupBy !== 'album' && <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>Album: {song.album}</p>}
                      {groupBy !== 'year' && <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>Year: {song.year}</p>}
                      <span style={{ fontSize: '12px', color: '#888' }}>Duration: {formatDuration(song.duration)}</span>
                    </div>
                    {userRole === 'admin' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSong(song.id);
                        }}
                        style={{
                          padding: '6px 10px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Music Player */}
      {currentTrack && (
        <Player 
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
};

export default MusicLibrary;