import { useState, useEffect, type FormEvent } from 'react';
import type { Photo, PexelsResponse } from './types';

function App() {
  const [query, setQuery] = useState<string>('nature');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputSearch, setInputSearch] = useState<string>('nature');
  const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);

  const PEXELS_API_KEY: string = import.meta.env.VITE_PEXELS_API_KEY as string;

  useEffect(() => {
    fetchPhotos(query);
  }, [query]);

  const fetchPhotos = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    setPhotos([]);

    try {
      try {
        const localResponse = await fetch(`/api/${searchTerm}.json`);
        if (localResponse.ok) {
          const data: PexelsResponse = await localResponse.json();
          setPhotos(data.photos);
          setLoading(false);
          return;
        }
      } catch {}

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

  // Modal close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalPhoto(null);
    };
    if (modalPhoto) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalPhoto]);

  // Animations (keyframes) for modal
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0 }
      to { opacity: 1 }
    }
    @keyframes popIn {
      0% { transform: scale(0.85); opacity: 0 }
      100% { transform: scale(1); opacity: 1 }
    }
    @keyframes glassBlur {
      from { backdrop-filter: blur(0px); }
      to { backdrop-filter: blur(8px); }
    }
  `;

  const styles = {
    container: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: 24,
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)',
      position: 'relative' as const,
      zIndex: 1,
    },
    title: {
      textAlign: 'center' as const,
      color: '#1e293b',
      marginBottom: 18,
      letterSpacing: 1,
      fontWeight: 800,
      fontSize: 36,
      textShadow: '0 2px 8px #0001',
      background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    form: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 28,
      gap: 10,
    },
    input: {
      padding: '12px 16px',
      borderRadius: 12,
      border: '1.5px solid #a5b4fc',
      fontSize: 18,
      width: 280,
      outline: 'none',
      transition: 'border 0.2s, box-shadow 0.2s',
      background: 'rgba(255,255,255,0.85)',
      boxShadow: '0 2px 8px #6366f11a',
      fontWeight: 500,
    },
    button: {
      padding: '12px 22px',
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
      color: '#fff',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: 18,
      boxShadow: '0 2px 8px #6366f13a',
      transition: 'background 0.2s, transform 0.1s',
      letterSpacing: 0.5,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 28,
      marginTop: 28,
    },
    imageItem: {
      background: 'rgba(255,255,255,0.85)',
      borderRadius: 18,
      boxShadow: '0 4px 24px #6366f13a',
      overflow: 'hidden',
      transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      cursor: 'pointer',
      border: '1.5px solid #e0e7ff',
      position: 'relative' as const,
      willChange: 'transform',
    },
    img: {
      width: '100%',
      height: 200,
      objectFit: 'cover' as const,
      borderBottom: '1px solid #f1f5f9',
      transition: 'transform 0.25s cubic-bezier(.4,2,.6,1)',
      background: '#e0e7ff',
      willChange: 'transform',
    },
    photographer: {
      fontSize: 15,
      color: '#6366f1',
      padding: '10px 0 8px 0',
      textAlign: 'center' as const,
      fontWeight: 600,
      letterSpacing: 0.5,
      textShadow: '0 1px 4px #fff8',
    },
    error: {
      color: '#dc2626',
      textAlign: 'center' as const,
      marginTop: 18,
      fontWeight: 600,
    },
    loading: {
      color: '#6366f1',
      textAlign: 'center' as const,
      marginTop: 18,
      fontWeight: 600,
    },
    noResults: {
      color: '#64748b',
      textAlign: 'center' as const,
      marginTop: 36,
      fontSize: 20,
      fontWeight: 500,
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(30,41,59,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.25s',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    },
    modalContent: {
      background: 'rgba(255,255,255,0.98)',
      borderRadius: 22,
      boxShadow: '0 8px 32px #0005',
      padding: 0,
      maxWidth: 700,
      width: '90vw',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      position: 'relative' as const,
      overflow: 'hidden',
      animation: 'popIn 0.25s',
    },
    modalImg: {
      width: '100%',
      maxHeight: 480,
      objectFit: 'contain' as const,
      background: '#e0e7ff',
      borderRadius: '22px 22px 0 0',
      boxShadow: '0 2px 12px #6366f13a',
      transition: 'box-shadow 0.2s',
    },
    modalClose: {
      position: 'absolute' as const,
      top: 12,
      right: 18,
      fontSize: 32,
      color: '#6366f1',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 900,
      zIndex: 2,
      transition: 'color 0.2s, transform 0.1s',
      lineHeight: 1,
      padding: 0,
    },
    modalPhotographer: {
      fontSize: 16,
      color: '#334155',
      padding: '12px 0 18px 0',
      textAlign: 'center' as const,
      fontWeight: 600,
      background: '#f1f5f9',
      width: '100%',
      borderRadius: '0 0 22px 22px',
      boxShadow: '0 -2px 12px #6366f11a',
    },
  };

  return (
    <div style={styles.container}>
      {/* Keyframes for animation */}
      <style>{keyframes}</style>
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
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => setModalPhoto(photo)}
            aria-label="Ver imagen en grande"
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

      {/* Modal */}
      {modalPhoto && (
        <div style={styles.modalOverlay} onClick={() => setModalPhoto(null)}>
          <div
            style={styles.modalContent}
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
          >
            <button
              style={styles.modalClose}
              onClick={() => setModalPhoto(null)}
              aria-label="Cerrar"
              title="Cerrar"
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              &times;
            </button>
            <img
              src={modalPhoto.src.large2x || modalPhoto.src.large || modalPhoto.src.medium}
              alt={modalPhoto.alt || modalPhoto.photographer || 'Imagen de Pexels'}
              style={styles.modalImg}
            />
            <div style={styles.modalPhotographer}>
              Foto por: {modalPhoto.photographer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
