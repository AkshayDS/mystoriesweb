import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Eye } from 'lucide-react';
import { genreToSlug } from '../themes/genreThemes';

const BookCard = ({ book, index = 0 }) => {
  const primaryGenre = book.genre?.[0] || 'Drama';
  const genreSlug = genreToSlug[primaryGenre] || 'drama';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      style={{ flexShrink: 0 }}
    >
      <Link
        to={`/book/${book._id}`}
        className="book-card"
        style={{
          display: 'block',
          width: 180,
          textDecoration: 'none',
        }}
      >
        {/* Cover */}
        <div
          style={{
            position: 'relative',
            width: 180,
            height: 270,
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            marginBottom: 12,
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid rgba(255,255,255,0.18)', // Simulate book spine
          }}
        >
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 400ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={48} style={{ color: 'var(--accent)', opacity: 0.5 }} />
            </div>
          )}

          {/* Genre badge overlay */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              padding: '3px 10px',
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              borderRadius: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontFamily: 'var(--font-body)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {primaryGenre}
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 12,
            }}
          >
            <span
              style={{
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Eye size={13} /> Read Now
            </span>
          </motion.div>
        </div>

        {/* Meta */}
        <div style={{ paddingLeft: 2 }}>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 4,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {book.title}
          </h3>

          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              marginBottom: 6,
            }}
          >
            {book.author}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {book.estimatedReadTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={11} />
                {book.estimatedReadTime}
              </span>
            )}
            {book.readCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Eye size={11} />
                {book.readCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
