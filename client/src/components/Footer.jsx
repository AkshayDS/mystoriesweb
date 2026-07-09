import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { ALL_GENRES, genreToSlug } from '../themes/genreThemes';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '3rem 0 2rem',
        marginTop: '4rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: 'var(--accent)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={17} style={{ color: '#1a1a1a' }} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                ಮನದ ಪುಟಗಳು
              </span>
            </div>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                maxWidth: 240,
                fontFamily: 'var(--font-body)',
              }}
            >
              A cozy digital library where stories come alive. Read freely, read beautifully.
            </p>
          </div>

          {/* Genres */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 14,
              }}
            >
              Genres
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALL_GENRES.map((genre) => (
                <Link
                  key={genre}
                  to={`/genre/${genreToSlug[genre]}`}
                  style={{
                    fontSize: '0.87rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-body)',
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 14,
              }}
            >
              Navigate
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Home', to: '/' },
                { label: 'All Stories', to: '/genre/all' },
                { label: 'About the Author', to: '/about' },
                { label: 'Admin Portal', to: '/admin/login' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontSize: '0.87rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-body)',
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            © {new Date().getFullYear()} ಮನದ ಪುಟಗಳು by Akshay. All rights reserved.
          </p>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Content protected. Unauthorized reproduction prohibited.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
