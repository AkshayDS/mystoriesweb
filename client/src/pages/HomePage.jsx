import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import GenreRow from '../components/GenreRow';
import { getBooks } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { ALL_GENRES, genreToSlug } from '../themes/genreThemes';
import {
  BookOpen,
  Heart,
  Flame,
  Eye,
  Mail,
  Globe,
  Link as LinkIcon,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const GENRE_COLORS = {
  'Love Story': '#e0b0a8',
  Thriller: '#b3232f',
  Horror: '#8a2424',
};

const CATEGORY_ITEMS = [
  { name: 'Love Story', slug: 'love-story', icon: Heart, color: '#e0b0a8', description: 'Tales of connection and romance' },
  { name: 'Thriller', slug: 'thriller', icon: Flame, color: '#b3232f', description: 'Suspenseful, high-stakes rides' },
  { name: 'Horror', slug: 'horror', icon: Eye, color: '#8a2424', description: 'Chilling tales of the unseen' },
];


const QUOTES = [
  { text: "ಪ್ರೀತಿ ಮಾನವ ಜೀವನದ ಶ್ರೇಷ್ಠ ಮೌಲ್ಯ.", author: "Kuvempu" },
  { text: "ಕುತೂಹಲ ಕಳೆದುಕೊಂಡ ದಿನವೇ ಮನುಷ್ಯನ ಬೆಳವಣಿಗೆ ನಿಲ್ಲುತ್ತದೆ.", author: "Poornachandra Tejaswi" },
];

// SVG illustration of a cozy writing space for empty hero state
const CozyWritingIllustration = () => (
  <svg viewBox="0 0 200 200" style={{ width: '100%', maxHeight: 280, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
    {/* Floor base line */}
    <line x1="20" y1="170" x2="180" y2="170" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />

    {/* Desk */}
    <rect x="40" y="145" width="120" height="25" fill="#1a1b23" rx="2" stroke="var(--border)" strokeWidth="2" />
    <line x1="55" y1="170" x2="55" y2="185" stroke="var(--border)" strokeWidth="2" />
    <line x1="145" y1="170" x2="145" y2="185" stroke="var(--border)" strokeWidth="2" />

    {/* Reading Lamp post */}
    <path d="M55 145 L55 90 Q55 75 75 75 L100 75" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    {/* Lamp shade */}
    <path d="M88 75 L112 75 L120 90 L80 90 Z" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="2" />
    {/* Lamp light glow polygon */}
    <polygon points="100 90, 45 170, 155 170" fill="url(#lamp-light-gradient)" opacity="0.18" />

    {/* Stack of books */}
    <rect x="110" y="125" width="40" height="10" rx="1" fill="#1a1b23" stroke="#7fa8a3" strokeWidth="1.5" />
    <rect x="105" y="135" width="48" height="10" rx="1" fill="#1a1b23" stroke="var(--border)" strokeWidth="1.5" />

    {/* Typewriter/Laptop base */}
    <rect x="70" y="130" width="30" height="15" rx="2" fill="#1a1b23" stroke="var(--accent)" strokeWidth="1.5" />
    {/* Paper sheet */}
    <rect x="78" y="115" width="14" height="18" rx="1" fill="#ece8e1" opacity="0.9" />
    <line x1="81" y1="120" x2="89" y2="120" stroke="#1a1b23" strokeWidth="1" />
    <line x1="81" y1="125" x2="89" y2="125" stroke="#1a1b23" strokeWidth="1" />

    <defs>
      <linearGradient id="lamp-light-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="var(--accent)" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
  </svg>
);

// SVG illustration of an author frame
const AuthorAvatarIllustration = () => (
  <svg viewBox="0 0 160 160" style={{ width: '100%', maxHeight: 180, borderRadius: '50%', background: '#1a1b23', border: '2px solid var(--accent)', boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 20px var(--accent-dim)' }}>
    {/* Background warm circles */}
    <circle cx="80" cy="80" r="60" fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4,4" />
    <circle cx="80" cy="80" r="50" fill="var(--bg-primary)" opacity="0.5" />

    {/* Fountain Pen Drawing */}
    <path d="M50 110 L75 85 L90 100 L65 125 Z" fill="#1a1b23" stroke="var(--text-secondary)" strokeWidth="2" />
    <path d="M75 85 L105 55 L115 65 L90 100 Z" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
    {/* Nib */}
    <path d="M105 55 L115 40 L120 45 L115 65 Z" fill="var(--accent)" />
    {/* Sparkles */}
    <circle cx="125" cy="35" r="2" fill="var(--accent-secondary)" />
    <path d="M125 35 L128 35 M125 35 L122 35 M125 35 L125 38 M125 35 L125 32" stroke="var(--accent-secondary)" strokeWidth="1" />
  </svg>
);

const HomePage = () => {
  const { setGenre } = useTheme();
  const [booksByGenre, setBooksByGenre] = useState({});
  const [allBooks, setAllBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Set default theme on homepage
  useEffect(() => {
    setGenre('default');
    document.title = 'ಮನದ ಪುಟಗಳು — Curated Novels & Short Stories';
  }, [setGenre]);

  // Handle quote rotation
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 7000);
    return () => clearInterval(quoteInterval);
  }, []);

  // Fetch stories data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [allRes, newRes] = await Promise.all([
          getBooks({ limit: 100 }),
          getBooks({ sort: 'newest', limit: 10 }),
        ]);

        const books = allRes.data.books || [];
        setAllBooks(books);
        setNewReleases(newRes.data.books?.slice(0, 10) || []);

        // Group by genre
        const grouped = {};
        ALL_GENRES.forEach((genre) => {
          grouped[genre] = books
            .filter((b) => b.genre?.includes(genre))
            .slice(0, 12);
        });
        setBooksByGenre(grouped);
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getGenreCount = (genreName) => {
    return allBooks.filter((book) => book.genre?.includes(genreName)).length;
  };

  const handleScrollToAbout = () => {
    document.getElementById('about-author')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ paddingTop: 90, backgroundColor: 'var(--bg-primary)', minHeight: '100vh', transition: 'var(--transition-theme)' }}>
      <div className="container" style={{ maxWidth: 1200, paddingLeft: 24, paddingRight: 24 }}>

        {/* 1. HERO SECTION */}
        <section style={{ marginBottom: '80px' }}>
          {loading ? (
            <div style={{ height: 480, borderRadius: 'var(--radius-lg)' }} className="skeleton" />
          ) : allBooks.length > 0 ? (
            <HeroBanner books={allBooks} />
          ) : (
            // Zero Stories Fallback Hero
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '3.5rem 3rem',
                boxShadow: 'var(--shadow-card)',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '2.5rem',
                alignItems: 'center',
              }}
              className="book-detail-grid"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, order: window.innerWidth < 640 ? 2 : 1 }}>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 12px', background: 'rgba(127, 168, 163, 0.1)', color: 'var(--accent-secondary)', border: '1px solid rgba(127, 168, 163, 0.2)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>
                  Welcome to ಮನದ ಪುಟಗಳು
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.25,
                  }}
                >
                  "ಕೆಲವು ಕಥೆಗಳು ಓದಲು ಅಲ್ಲ, ಅನುಭವಿಸಲು ಹುಟ್ಟಿರುತ್ತವೆ."❤️
                </h1>
                <div
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.91rem',
                    lineHeight: 2,
                    maxWidth: 520,
                  }}
                >
                  <p style={{ marginBottom: '0.7rem', color: 'var(--accent)', fontWeight: 700, fontSize: '1rem' }}>ಓದುಗರಿಗೆ...</p>

                  <p style={{ marginBottom: '1rem' }}>ಈ ಪುಸ್ತಕದಲ್ಲಿರುವ ಎಲ್ಲಾ ಕಥೆಗಳು ನನ್ನ ಕಲ್ಪನೆಯಿಂದ ಬರೆಯಲ್ಪಟ್ಟಿವೆ.</p>

                  <p style={{ marginBottom: '0.3rem' }}>ಕೆಲವು ಭಾವನೆಗಳು ನಿಜವಾಗಿರಬಹುದು...</p>
                  <p style={{ marginBottom: '0.3rem' }}>ಕೆಲವು ಪಾತ್ರಗಳು ನಿಮ್ಮ ಜೀವನವನ್ನು ನೆನಪಿಸಬಹುದು...</p>
                  <p style={{ marginBottom: '1rem' }}>ಕೆಲವು ಘಟನೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಮುಟ್ಟಬಹುದು...</p>

                  <p style={{ marginBottom: '1rem' }}>ಆದರೆ ಈ ಕಥೆಗಳು ಯಾರ ಜೀವನವನ್ನೂ ಪ್ರತಿಬಿಂಬಿಸುವುದಿಲ್ಲ.</p>
                  <p style={{ marginBottom: '1rem' }}>ಇವು ಕೇವಲ ಭಾವನೆಗಳನ್ನು ಹೃದಯಕ್ಕೆ ತಲುಪಿಸಲು ಬರೆಯಲ್ಪಟ್ಟಿವೆ.</p>



                  <p style={{ marginBottom: '1rem' }}>ಈ ಪುಸ್ತಕದಲ್ಲಿ ನೀವು ಓದುವುದು ಕೇವಲ ಕಥೆಗಳಲ್ಲ...</p>

                  <p style={{ marginBottom: '0.3rem' }}>ನಗುವಿನ ಹಿಂದೆ ಇರುವ ನೋವು,ಹೇಳದ ಪ್ರೀತಿ, ಮುರಿಯದ ಕನಸು, ಮತ್ತು ಜೀವನದ ಸಣ್ಣ ಪಾಠಗಳು.</p>


                  <p style={{ marginBottom: '1rem' }}>ಈ ಪುಟಗಳಲ್ಲಿ ನಿಮ್ಮ ಜೀವನದ ಒಂದು ಕ್ಷಣ ಕಂಡರೆ...<br />ಅದೇ ನನ್ನ ಬರಹದ ಸಂತೋಷ.</p>

                  <p style={{ marginBottom: '0.5rem' }}>ಪ್ರತಿ ಕಥೆಯನ್ನು ಹೃದಯದಿಂದ ಬರೆದಿದ್ದೇನೆ.</p>
                  <p style={{ marginBottom: '1.2rem' }}>ಅದೇ ಹೃದಯದಿಂದ ಓದಿ.</p>

                  <p style={{ color: 'var(--accent)', fontWeight: 800 }}>– ಅಕ್ಷಯ್ ಡಿ. ಎಸ್.</p>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={handleScrollToAbout} className="btn-primary" style={{ padding: '12px 28px' }}>
                    Read About the Author
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', order: window.innerWidth < 640 ? 1 : 2 }}>
                <CozyWritingIllustration />
              </div>
            </div>
          )}
        </section>

        {/* 2. QUOTES STRIP SECTION */}
        <section
          style={{
            marginBottom: '80px',
            padding: '3.5rem 2rem',
            background: 'linear-gradient(to right, transparent, var(--bg-secondary), transparent)',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 180,
          }}
        >
          {/* Quote watermark background */}
          <div
            style={{
              position: 'absolute',
              fontSize: '12rem',
              fontFamily: 'var(--font-heading)',
              color: 'var(--border)',
              opacity: 0.12,
              fontWeight: 900,
              userSelect: 'none',
              pointerEvents: 'none',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
            }}
          >
            “
          </div>

          <div style={{ maxWidth: 800, textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
                    fontStyle: 'italic',
                    color: 'var(--text-primary)',
                    lineHeight: 1.7,
                    marginBottom: 12,
                  }}
                >
                  "{QUOTES[quoteIndex % QUOTES.length]?.text}"
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                  }}
                >
                  — {QUOTES[quoteIndex % QUOTES.length]?.author}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* 3. CATEGORIES SECTION (Full Redesign) */}
        <section style={{ marginBottom: '100px' }}>
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 10,
              }}
            >
              Browse Genres
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                maxWidth: 480,
                margin: '0 auto',
              }}
            >
              Select a genre below. Each room carries a distinct visual theme and custom music mood tailored to its tales.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 20,
            }}
          >
            {CATEGORY_ITEMS.map((item, idx) => {
              const IconComp = item.icon;
              const count = getGenreCount(item.name);
              return (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.35 }}
                  whileHover={{
                    y: -5,
                    boxShadow: `0 12px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${item.color}25`,
                    borderColor: item.color,
                  }}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '24px',
                    transition: 'border-color 300ms ease, box-shadow 300ms ease',
                  }}
                >
                  <Link
                    to={`/genre/${item.slug}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      textDecoration: 'none',
                    }}
                  >
                    {/* Icon container */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `${item.color}12`,
                        border: `1px solid ${item.color}25`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                        marginBottom: 16,
                      }}
                    >
                      <IconComp size={20} />
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.15rem',
                        fontWeight: 650,
                        color: 'var(--text-primary)',
                        marginBottom: 6,
                      }}
                    >
                      {item.name}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                        lineHeight: 1.5,
                        flexGrow: 1,
                        marginBottom: 16,
                      }}
                    >
                      {item.description}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: 12,
                      }}
                    >
                      <span style={{ color: 'var(--accent-secondary)' }}>
                        {count} {count === 1 ? 'story' : 'stories'}
                      </span>
                      <span
                        className="arrow-hover"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: 'var(--accent)',
                        }}
                      >
                        Enter Room <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>



        {/* 6. ABOUT THE AUTHOR SECTION */}
        <section
          id="about-author"
          style={{
            scrollMarginTop: 120,
            marginBottom: '60px',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(26,27,35,0.4) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 3rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
            className="book-detail-grid"
          >
            {/* Column 1: Graphic representation */}
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <AuthorAvatarIllustration />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Akshay
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Author & Curator
                </p>
              </div>
            </div>

            {/* Column 2: Bio details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                About the Author
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.96rem',
                  lineHeight: 1.75,
                  color: 'var(--text-secondary)',
                }}
              >
                I write because stories are the closest things we have to magic. Here on ಮನದ ಪುಟಗಳು, I catalog novels and brief prose across various moods, allowing readers to step into worlds shaped specifically by their colors and tones.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.96rem',
                  lineHeight: 1.75,
                  color: 'var(--text-secondary)',
                }}
              >
                Every piece published is freely readable. Our browser reader is built to deter automated scraping and copying, ensuring the creative process remains secure and protected. Thank you for visiting my library.
              </p>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.96rem',
                  lineHeight: 1.85,
                  color: 'var(--text-secondary)',
                  borderLeft: '3px solid var(--accent)',
                  paddingLeft: '1rem',
                  marginTop: '8px',
                }}
              >
                Poornachandra Tejaswi ಅವರ ಕೃತಿಗಳನ್ನು ಓದಲು ಆರಂಭಿಸಿದ ನಂತರ, ಕಥೆಯನ್ನು ನೋಡುವ ನನ್ನ ದೃಷ್ಟಿಕೋನವೂ ಬದಲಾಗಿತು. ಅವರ ಸರಳವಾದ ನಿರೂಪಣೆ, ಪಾತ್ರಗಳ ಸಹಜತೆ ಮತ್ತು ಜೀವನವನ್ನು ನೋಡುವ ವಿಭಿನ್ನ ರೀತಿಯು ನನ್ನ ಬರವಣಿಗೆಯ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರಿತು.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.96rem',
                  lineHeight: 1.85,
                  color: 'var(--text-secondary)',
                }}
              >
                ನನ್ನ ಕಥೆಗಳು ಅವರ ಬರಹಗಳ ಪ್ರತಿಬಿಂಬವಲ್ಲ. ಆದರೇ, ಓದುಗರರ ಮನಸ್ಸನ್ನು ಮುಟ್ಟುವಂತೆ ಸರಳವಾಗಿ ಮತ್ತು ನೈಜವಾಗಿ ಕಥೆ ಹೇಳುವ ಪ್ರೇರಣೆಯನ್ನು ಅವರ ಸಾಹಿತ್ಯದಿಂದ ಪಡೆದಿದ್ದೇನೆ.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.96rem',
                  lineHeight: 1.85,
                  color: 'var(--text-secondary)',
                }}
              >
                ನನ್ನ ಪ್ರತಿಯೋಂದು ಕಥೆಯಲ್ಲೂ ಪ್ರೀತಿ, ಭಾವನೆ, ಜೀವನ ಮತ್ತು ಮನುಷ್ಯರ ಮನಸ್ಸಿನ ಮೌನವನ್ನು ಹಿಡಿದಿಡುವ ಒಂದು ಸಣ್ಣ ಪ್ರಯತ್ನವಿದೆ.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.96rem',
                  lineHeight: 1.85,
                  color: 'var(--accent)',
                  fontWeight: 600,
                }}
              >
                ನನ್ನ ಬರಹಗಳನ್ನು ಓದುವ ಪ್ರತಿಯೋಬ್ಬ ಓದುಗರರಿಗೂ ಹೃತ್ಪೂರ್ವಕ ಧನ್ಯವಾದಗಳು.
              </p>

              <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                <Link
                  to="/about"
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '10px 24px',
                    fontSize: '0.87rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  About the Author
                  <ChevronRight size={15} />
                </Link>
              </div>

              {/* Social and Contact Links */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '20px',
                }}
              >
                <a
                  href="mailto:author@example.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.85rem',
                    color: 'var(--accent-secondary)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-secondary)')}
                >
                  <Mail size={16} /> Mail Author
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.85rem',
                    color: 'var(--accent-secondary)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-secondary)')}
                >
                  <Globe size={16} /> Instagram
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.85rem',
                    color: 'var(--accent-secondary)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-secondary)')}
                >
                  <LinkIcon size={16} /> Twitter
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
