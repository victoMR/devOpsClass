import { useState, useEffect, type FormEvent } from 'react';
import './App.css';
import type { Photo, PexelsResponse } from './types';

function App() {
  const [query, setQuery] = useState<string>('nature');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputSearch, setInputSearch] = useState<string>('');

  const PEXELS_API_KEY: string = import.meta.env.VITE_PEXELS_API_KEY as string;

  useEffect(() => {
    fetchPhotos(query);
  }, [query]);

  const fetchPhotos = async (searchTerm: string) => {
  setLoading(true);
  setError(null);
  setPhotos([]);
  
  try {
    // First try to get pre-fetched data
    try {
      const localResponse = await fetch(`/api/${searchTerm}.json`);
      if (localResponse.ok) {
        const data: PexelsResponse = await localResponse.json();
        setPhotos(data.photos);
        setLoading(false);
        return;
      }
    } catch (localError) {
      // Silent fail - we'll try the API directly
      console.log("Pre-fetched data not available, trying API...");
    }

    // If pre-fetched data doesn't exist, try the API directly
    // This will likely fail due to CORS when deployed to GitHub Pages
    // but will work in development
    if (!import.meta.env.VITE_PEXELS_API_KEY) {
      setError('Error: Missing API key.');
      setLoading(false);
      return;
    }

    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=15`, {
      headers: {
        Authorization: import.meta.env.VITE_PEXELS_API_KEY as string,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    const data: PexelsResponse = await response.json();
    setPhotos(data.photos);
  } catch (err: any) {
    setError(err.message || 'No se pudieron cargar las imágenes. Intenta con una búsqueda diferente.');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputSearch.trim()) {
      setQuery(inputSearch.trim());
    }
  };

  return (
    <div className="app-container">
      <h1>Buscador de Imágenes Pexels</h1>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          placeholder="Busca imágenes..."
          className="search-input"
        />
        <button type="submit" className="search-button">Buscar</button>
      </form>

      {loading && <p>Cargando imágenes...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      <div className="image-grid">
        {photos.map((photo: Photo) => (
          <div key={photo.id} className="image-item">
            <img src={photo.src.medium} alt={photo.alt || photo.photographer} />
            <p className="photographer-name">Foto por: {photo.photographer}</p>
          </div>
        ))}
        {!loading && !error && photos.length === 0 && query && <p>No se encontraron imágenes para "{query}".</p>}
      </div>
    </div>
  );
}

export default App;
