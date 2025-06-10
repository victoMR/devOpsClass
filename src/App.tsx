import { useState, useEffect, type FormEvent } from 'react';
import './App.css';
import type { Photo, PexelsResponse } from './types';

function App() {
  const [query, setQuery] = useState<string>('nature');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputSearch, setInputSearch] = useState<string>('nature');

  const PEXELS_API_KEY: string = import.meta.env.VITE_PEXELS_API_KEY as string;

  useEffect(() => {
    fetchPhotos(query);
  }, [query]);

  const fetchPhotos = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    setPhotos([]);

    try {
      // Try to get pre-fetched data
      try {
        const localResponse = await fetch(`/api/${searchTerm}.json`);
        if (localResponse.ok) {
          const data: PexelsResponse = await localResponse.json();
          setPhotos(data.photos);
          setLoading(false);
          return;
        }
      } catch {
        // Silent fail, fallback to API
      }

      if (!PEXELS_API_KEY) {
        setError('Error: Falta la clave de API.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=15`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        let errorMsg = 'No se pudieron cargar las imágenes.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const data: PexelsResponse = await response.json();
      setPhotos(data.photos);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las imágenes. Intenta con una búsqueda diferente.');
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

  // Inline styles for demonstration (move to App.css for production)
  const styles = {
    container: {
      maxWidth: 900,
      margin: '0 auto',
      padding: 24,
      fontFamily: 'system-ui, sans-serif',
      background: '#f8fafc',
      minHeight: '100vh',
    },
    title: {
      textAlign: 'center' as const,
      color: '#2563eb',
      marginBottom: 16,
      letterSpacing: 1,
    },
    form: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 24,
      gap: 8,
    },
    input: {
      padding: '10px 14px',
      borderRadius: 6,
      border: '1px solid #d1d5db',
      fontSize: 16,
      width: 240,
      outline: 'none',
      transition: 'border 0.2s',
    },
    button: {
      padding: '10px 18px',
      borderRadius: 6,
      border: 'none',
      background: '#2563eb',
      color: '#fff',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: 16,
      transition: 'background 0.2s',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 18,
      marginTop: 24,
    },
    imageItem: {
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 2px 8px #0001',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    img: {
      width: '100%',
      height: 180,
      objectFit: 'cover' as const,
      borderBottom: '1px solid #f1f5f9',
      transition: 'transform 0.2s',
    },
    photographer: {
      fontSize: 14,
      color: '#64748b',
      padding: '8px 0',
      textAlign: 'center' as const,
    },
    error: {
      color: '#dc2626',
      textAlign: 'center' as const,
      marginTop: 16,
    },
    loading: {
      color: '#2563eb',
      textAlign: 'center' as const,
      marginTop: 16,
    },
    noResults: {
      color: '#64748b',
      textAlign: 'center' as const,
      marginTop: 32,
      fontSize: 18,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Buscador de Imágenes Pexels</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          placeholder="Busca imágenes..."
          style={styles.input}
          autoFocus
        />
        <button type="submit" style={styles.button}>Buscar</button>
      </form>

      {loading && <p style={styles.loading}>Cargando imágenes...</p>}
      {error && <p style={styles.error}>Error: {error}</p>}

      <div style={styles.grid}>
        {photos.map((photo: Photo) => (
          <div
            key={photo.id}
            style={styles.imageItem}
            tabIndex={0}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <img
              src={photo.src.medium}
              alt={photo.alt || photo.photographer || 'Imagen de Pexels'}
              style={styles.img}
              loading="lazy"
            />
            <p style={styles.photographer}>Foto por: {photo.photographer}</p>
          </div>
        ))}
      </div>
      {!loading && !error && photos.length === 0 && query && (
        <p style={styles.noResults}>No se encontraron imágenes para "{query}".</p>
      )}
    </div>
  );
}

export default App;
