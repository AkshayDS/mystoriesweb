import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBooks } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { genreThemes, slugToGenre, ALL_GENRES, genreToSlug } from '../themes/genreThemes';
import BookCard from '../components/BookCard';
import { SlidersHorizontal, BookOpen } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Read', value: 'readCount' },
  { label: 'A–Z', value: 'title' },
];

const GenrePage = () => {
  const { genreSlug } = useParams();
  const { setGenre } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  const isAll = genreSlug === 'all';
  const genreName = slugToGenre[genreSlug] || null;
  const theme = isAll ? genreThemes.default : (genreThemes[genreSlug] || genreThemes.default);

  // Apply genre theme
  useEffect(() => {
    setGenre(isAll ? 'default' : genreSlug);
    const displayName = isAll ? 'All Stories' : genreName || genreSlug;
    document.title = `${displayName} — ಮನದ ಪುಟಗಳು`;
  }, [genreSlug, setGenre, isAll, genreName]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = { sort, limit: 100 };
        if (!isAll && genreName) params.genre = genreName;
        const res = await getBooks(params);
        setBooks(res.data.books || []);
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [genreSlug, sort, isAll, genreName]);

  const pageTitle = isAll ? 'All Stories' : genreName || genreSlug;

  return (
    <div style={{ paddingTop: 96 }}>
      {/* Fog/vignette overlay for Mystery/Horror themes */}
      {(theme.fog) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Sparkle effect for Fantasy */}
      {theme.sparkles && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage:
              'radial-gradient(1px 1px at 10% 20%, rgba(155,114,207,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 50% 60%, rgba(155,114,207,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 80% 10%, rgba(155,114,207,0.4) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 1,
            animation: 'pulse-glow 4s ease-in-out infinite',
          }}
        />
      )}

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '2.5rem' }}
        >
          {/* Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Link
              to="/"
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Home
            </Link>
            <span>/</span>
            <span>{pageTitle}</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            {pageTitle}
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
            }}
          >
            {loading ? '...' : `${books.length} ${books.length === 1 ? 'story' : 'stories'}`}
          </p>
        </motion.div>

        {/* Sort + Genre filter bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            padding: '16px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
          }}
        >
          {/* Genre chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Link
              to="/genre/all"
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                textDecoration: 'none',
                transition: 'all 200ms',
                background: isAll ? 'var(--accent)' : 'transparent',
                color: isAll ? '#1a1a1a' : 'var(--text-secondary)',
              }}
            >
              All
            </Link>
            {ALL_GENRES.map((genre) => {
              const slug = genreToSlug[genre];
              const isActive = slug === genreSlug;
              return (
                <Link
                  key={genre}
                  to={`/genre/${slug}`}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 20,
                    border: '1px solid var(--border)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    textDecoration: 'none',
                    transition: 'all 200ms',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#1a1a1a' : 'var(--text-secondary)',
                  }}
                >
                  {genre}
                </Link>
              );
            })}
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: sort === opt.value ? 'var(--accent)' : 'transparent',
                  color: sort === opt.value ? '#1a1a1a' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 200ms',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Books grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 24,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ height: 310 }} className="skeleton" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 24,
            }}
          >
            {books.map((book, i) => (
              <BookCard key={book._id} book={book} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <BookOpen
              size={64}
              style={{ color: 'var(--accent)', opacity: 0.2, marginBottom: 16 }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              No stories in this genre yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Check back soon — new stories are being added regularly.
            </p>
            <Link
              to="/"
              className="btn-ghost"
              style={{ display: 'inline-flex', marginTop: 20 }}
            >
              ← Back to Home
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GenrePage;
