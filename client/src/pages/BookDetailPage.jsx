import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBook, incrementRead, createReaderSession } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { getThemeByGenre } from '../themes/genreThemes';
import { BookOpen, Clock, Eye, Calendar, ArrowLeft, Star } from 'lucide-react';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { setGenre } = useTheme();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await getBook(bookId);
        const b = res.data;
        setBook(b);

        // Apply genre theme
        const primaryGenre = b.genre?.[0];
        const theme = getThemeByGenre(primaryGenre);
        setGenre(theme.slug);

        document.title = `${b.title} — ಮನದ ಪುಟಗಳು`;
      } catch (err) {
        setError('Story not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId, setGenre]);

  const handleStartReading = async () => {
    setStarting(true);
    try {
      // Create reader session
      const res = await createReaderSession(bookId);
      const { sessionToken, shortId } = res.data;

      // Store session token for the reader
      sessionStorage.setItem(`storynest-session-${bookId}`, sessionToken);
      sessionStorage.setItem(`storynest-shortid-${bookId}`, shortId);

      // Bump read counter
      incrementRead(bookId).catch(() => {}); // Fire and forget

      navigate(`/read/${bookId}`);
    } catch (err) {
      console.error('Failed to start reading:', err);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 96 }} className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start' }}>
          <div style={{ height: 420, borderRadius: 'var(--radius)' }} className="skeleton" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[200, 400, 300, 100, 80].map((w, i) => (
              <div key={i} style={{ height: i === 0 ? 36 : 20, width: w, borderRadius: 6 }} className="skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{ paddingTop: 96 }} className="container">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 12 }}>
            Story Not Found
          </h2>
          <Link to="/" className="btn-ghost">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 88 }}>
      {/* Background blurred cover */}
      {book.coverImageUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: `url(${book.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px) brightness(0.15)',
            zIndex: 0,
          }}
        />
      )}

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.87rem',
              fontFamily: 'var(--font-body)',
              padding: 0,
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </motion.div>

        {/* Main content */}
        <div className="book-detail-grid">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                aspectRatio: '2/3',
              }}
            >
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={64} style={{ color: 'var(--accent)', opacity: 0.4 }} />
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* Genre tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {book.genre?.map((g) => (
                <span key={g} className="genre-tag">
                  {g}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 8,
                lineHeight: 1.15,
              }}
            >
              {book.title}
            </h1>

            {/* Author */}
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--accent)',
                marginBottom: 20,
              }}
            >
              by {book.author}
            </p>

            {/* Meta row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                marginBottom: 24,
                padding: '14px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {book.estimatedReadTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {book.estimatedReadTime}
                  </span>
                </div>
              )}
              {book.totalPages > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={15} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {book.totalPages} pages
                  </span>
                </div>
              )}
              {book.readCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={15} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {book.readCount.toLocaleString()} reads
                  </span>
                </div>
              )}
              {book.createdAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {new Date(book.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 12,
                }}
              >
                Synopsis
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {book.synopsis}
              </p>
            </div>

            {/* CTA */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <button
                onClick={handleStartReading}
                disabled={starting}
                className="btn-primary"
                style={{
                  fontSize: '1.05rem',
                  padding: '14px 36px',
                  opacity: starting ? 0.7 : 1,
                  cursor: starting ? 'wait' : 'pointer',
                }}
              >
                {starting ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Opening...
                  </>
                ) : (
                  <>
                    <BookOpen size={18} />
                    Start Reading
                  </>
                )}
              </button>
            </motion.div>

            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                marginTop: 12,
              }}
            >
              🔒 Protected reading — no downloads available
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
