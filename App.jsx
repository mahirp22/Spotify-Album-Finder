// Import React hooks and styles
import { useState } from "react";
import "./App.css";

// Base URL for the Deezer API through a CORS proxy
const DEEZER_BASE = "https://corsproxy.io/?https://api.deezer.com";

// Formats track duration from seconds to mm:ss
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function App() {
  // Search query entered by the user
  const [query, setQuery] = useState("");

  // List of albums returned by the search request
  const [albums, setAlbums] = useState([]);

  // Stores details for the currently selected album
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Loading and error state for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handles album search requests to the Deezer API
  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError("");
    setAlbums([]);
    setSelectedAlbum(null);

    try {
      const res = await fetch(
        `${DEEZER_BASE}/search/album?q=${encodeURIComponent(q)}&limit=30`
      );
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setAlbums(data.data || []);
    } catch (err) {
      setError("Could not load albums. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loads full album information including its track list
  const loadAlbumDetails = async (album) => {
    setSelectedAlbum({ loading: true, data: null, error: "" });

    try {
      const res = await fetch(`${DEEZER_BASE}/album/${album.id}`);
      if (!res.ok) throw new Error("Album request failed");
      const data = await res.json();
      setSelectedAlbum({ loading: false, data, error: "" });
    } catch (err) {
      setSelectedAlbum({
        loading: false,
        data: null,
        error: "Could not load album details.",
      });
    }
  };

  const albumDetail = selectedAlbum?.data;

  return (
    <div className="app">
      {/* Header area with title and search */}
      <header className="app-header">
        <h1>Album Finder</h1>
        <p>Search for an artist or album, then click an album to see its tracks.</p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Try 'Taylor Swift', 'Drake', 'The Weeknd'…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* Displays request error feedback */}
        {error && <p className="error">{error}</p>}
      </header>

      {/* Main layout with albums on the left and details on the right */}
      <main className="layout">
        
        {/* Album grid section */}
        <section className="albums-section">
          <h2>Albums</h2>
          {albums.length === 0 && !loading && (
            <p className="muted">No results yet. Start by searching above.</p>
          )}

          <div className="album-grid">
            {albums.map((album) => (
              <button
                key={album.id}
                className="album-card"
                onClick={() => loadAlbumDetails(album)}
              >
                <img
                  src={album.cover_medium}
                  alt={album.title}
                  className="album-cover"
                />
                <div className="album-meta">
                  <h3>{album.title}</h3>
                  <p>{album.artist?.name}</p>
                  <p className="album-year">
                    {album.release_date?.slice(0, 4) || "—"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Album detail and track list */}
        <section className="detail-section">
          <h2>Album Details</h2>

          {!selectedAlbum && (
            <p className="muted">
              Select an album from the left to view its track list.
            </p>
          )}

          {selectedAlbum?.loading && <p>Loading album…</p>}

          {selectedAlbum?.error && (
            <p className="error">{selectedAlbum.error}</p>
          )}

          {albumDetail && (
            <>
              <div className="detail-header">
                <img
                  src={albumDetail.cover_big}
                  alt={albumDetail.title}
                  className="detail-cover"
                />
                <div>
                  <h3>{albumDetail.title}</h3>
                  <p className="detail-artist">{albumDetail.artist?.name}</p>
                  <p className="detail-meta">
                    {albumDetail.nb_tracks} tracks •{" "}
                    {albumDetail.release_date?.slice(0, 4)}
                  </p>
                  <a
                    href={albumDetail.link}
                    target="_blank"
                    rel="noreferrer"
                    className="deezer-link"
                  >
                    Open in Deezer
                  </a>
                </div>
              </div>

              <ol className="track-list">
                {albumDetail.tracks?.data?.map((track) => (
                  <li key={track.id} className="track-row">
                    <span className="track-title">
                      {track.track_position}. {track.title}
                    </span>
                    <span className="track-duration">
                      {formatDuration(track.duration)}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
