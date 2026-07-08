import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const HeroBanner = ({ books = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const featured = books.filter((b) => b.featured);
  const displayBooks = featured.length > 0 ? featured : books.slice(0, 5);

  useEffect(() => {
    if (displayBooks.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % displayBooks.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayBooks.length]);

  const goTo = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + displayBooks.length) % displayBooks.length);
  };

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % displayBooks.length);
  };

  if (!displayBooks.length) {
    return (
      <div
        style={{
          height: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '3rem',
        }}
      >
        <BookOpen size={64} style={{ color: 'var(--accent)', opacity: 0.3 }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          No stories published yet. Check back soon!
        </p>
      </div>
    );
  }

  const book = displayBooks[currentIndex];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '3.5rem',
        minHeight: 480,
      }}
    >
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={book._id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'relative',
            display: 'flex',
            minHeight: 480,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Background image */}
          {book.coverImageUrl && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${book.coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px) brightness(0.3)',
                transform: 'scale(1.1)',
              }}
            />
          )}

          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
            }}
          />

          {/* Content */}
          <div className="hero-banner-content">
            {/* Cover image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="hero-banner-cover"
              style={{
                flexShrink: 0,
                width: 200,
                height: 300,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 30px var(--accent-dim)',
                border: '1px solid var(--border)',
                borderLeft: '4px solid rgba(255,255,255,0.2)', // Spine effect
              }}
            >
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  <BookOpen size={60} style={{ color: 'var(--accent)' }} />
                </div>
              )}
            </motion.div>

            {/* Text */}
            <div style={{ flex: 1, maxWidth: 600 }}>
              {book.featured && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 14px',
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                    color: '#1a1a1a',
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-body)',
                    marginBottom: 16,
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  ★ Featured Story
                </motion.div>
              )}

              {/* Genre tags */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {book.genre?.map((g) => (
                  <span key={g} className="genre-tag">
                    {g}
                  </span>
                ))}
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hero-title"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: 16,
                  lineHeight: 1.15,
                }}
              >
                {book.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.7,
                  marginBottom: 12,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {book.synopsis}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'var(--font-body)',
                  marginBottom: 24,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {book.estimatedReadTime}
                </span>
                {book.readCount > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={13} /> {book.readCount.toLocaleString()} reads
                  </span>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{ display: 'flex', gap: 12 }}
              >
                <Link to={`/read/${book._id}`} className="btn-primary">
                  <BookOpen size={16} />
                  Start Reading
                </Link>
                <Link to={`/book/${book._id}`} className="btn-ghost">
                  View Details
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {displayBooks.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous story"
            className="hero-arrow hero-arrow-left"
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              zIndex: 2,
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(232,180,88,0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={next}
            aria-label="Next story"
            className="hero-arrow hero-arrow-right"
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              zIndex: 2,
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(232,180,88,0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
              zIndex: 2,
            }}
          >
            {displayBooks.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === currentIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    i === currentIndex
                      ? 'var(--accent)'
                      : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 300ms ease',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroBanner;
