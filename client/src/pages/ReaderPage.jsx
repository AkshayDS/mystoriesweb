import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getBook, getPageUrl } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { getThemeByGenre } from '../themes/genreThemes';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  AlertTriangle,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// WATERMARK DRAWING UTILITY
// ─────────────────────────────────────────────────────────────────────────────
const drawWatermark = (ctx, canvas, sessionShortId, pageNum) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US');
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const text = `ಮನದ ಪುಟಗಳು • ${sessionShortId} • ${dateStr} ${timeStr}`;

  ctx.save();

  // Random positional offset per page/session to prevent fixed-crop removal
  const offsetX = ((pageNum * 37 + parseInt(sessionShortId.slice(0, 2), 16)) % 60) - 30;
  const offsetY = ((pageNum * 53 + parseInt(sessionShortId.slice(2, 4), 16)) % 40) - 20;

  ctx.globalAlpha = 0.12; // ~12% opacity — visible but not intrusive
  ctx.fillStyle = '#888888';
  ctx.font = `bold ${Math.max(14, canvas.width * 0.016)}px Inter, Arial, sans-serif`;

  const textWidth = ctx.measureText(text).width + 20;
  const tileSpacingX = textWidth + 60;
  const tileSpacingY = 80;

  ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
  ctx.rotate(-Math.PI / 6); // -30 degrees diagonal

  const tilesX = Math.ceil(canvas.width / tileSpacingX) + 4;
  const tilesY = Math.ceil(canvas.height / tileSpacingY) + 6;

  for (let y = -Math.floor(tilesY / 2); y <= Math.floor(tilesY / 2); y++) {
    for (let x = -Math.floor(tilesX / 2); x <= Math.floor(tilesX / 2); x++) {
      ctx.fillText(text, x * tileSpacingX, y * tileSpacingY);
    }
  }

  ctx.restore();
};

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED READER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { setGenre } = useTheme();

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [book, setBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [sessionShortId, setSessionShortId] = useState('XXXXXXXX');
  const [paused, setPaused] = useState(false); // blur when tab loses focus
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  // ─── Session setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem(`storynest-session-${bookId}`);
    const shortId = sessionStorage.getItem(`storynest-shortid-${bookId}`);

    if (!token) {
      // Redirect to book detail to create a session
      navigate(`/book/${bookId}`, { replace: true });
      return;
    }

    setSessionToken(token);
    if (shortId) setSessionShortId(shortId);
  }, [bookId, navigate]);

  // ─── Load book metadata ────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionToken) return;
    const fetchBook = async () => {
      try {
        const res = await getBook(bookId);
        const b = res.data;
        setBook(b);
        setTotalPages(b.totalPages || 0);

        const theme = getThemeByGenre(b.genre?.[0]);
        setGenre(theme.slug);

        document.title = `Reading: ${b.title} — ಮನದ ಪುಟಗಳು`;
      } catch (err) {
        setError('Could not load book. Please go back and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId, sessionToken, setGenre]);

  // ─── Draw page on canvas ───────────────────────────────────────────────────
  const drawPage = useCallback(
    async (pageNum) => {
      if (!sessionToken || !canvasRef.current) return;
      setPageLoading(true);

      try {
        const res = await getPageUrl(bookId, pageNum, sessionToken);
        const { url, sessionShortId: shortId } = res.data;
        if (shortId) setSessionShortId(shortId);

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');

          // Set canvas dimensions to match image
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          // Draw page image
          ctx.drawImage(img, 0, 0);

          // Burn watermark on top (cannot be removed without damaging image pixels)
          drawWatermark(ctx, canvas, shortId || sessionShortId, pageNum);

          setPageLoading(false);
        };

        img.onerror = () => {
          setPageLoading(false);
          setError('Failed to load page. Please try again.');
        };

        img.src = url;
      } catch (err) {
        setPageLoading(false);
        if (err.response?.status === 429) {
          setError('Too many requests. Please slow down.');
        } else {
          setError('Failed to load page.');
        }
      }
    },
    [bookId, sessionToken, sessionShortId]
  );

  useEffect(() => {
    if (book && sessionToken) {
      drawPage(currentPage);
    }
  }, [currentPage, book, sessionToken, drawPage]);

  // ─── Keyboard & copy protections ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      // Block: Ctrl+P (print), Ctrl+S (save), Ctrl+C (copy), Ctrl+A (select all)
      // Ctrl+Shift+I / F12 (devtools), Ctrl+U (view source)
      if (
        (isCtrl && ['p', 's', 'c', 'a', 'u'].includes(e.key.toLowerCase())) ||
        (isCtrl && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  // ─── Tab visibility / focus protection ────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPaused(true);
        // Blur the canvas by clearing it
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        setPaused(false);
        // Re-draw when tab returns to focus
        if (book) drawPage(currentPage);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [book, currentPage, drawPage]);

  // ─── DevTools heuristic detection ─────────────────────────────────────────
  useEffect(() => {
    const checkDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        setDevToolsOpen(true);
      } else {
        setDevToolsOpen(false);
      }
    };

    const interval = setInterval(checkDevTools, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Touch swipe support ───────────────────────────────────────────────────
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && currentPage < totalPages) setCurrentPage((p) => p + 1);
      if (dx > 0 && currentPage > 1) setCurrentPage((p) => p - 1);
    }
    touchStartX.current = null;
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Opening your story...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--bg-primary)',
        }}
      >
        <AlertTriangle size={48} style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
          {error}
        </p>
        <button onClick={() => { setError(null); drawPage(currentPage); }} className="btn-ghost">
          Try Again
        </button>
        <Link to={`/book/${bookId}`} className="btn-ghost">
          ← Back to Book
        </Link>
      </div>
    );
  }

  const overlayActive = paused || devToolsOpen;

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Blur overlay (tab blur / devtools) ── */}
      <AnimatePresence>
        {overlayActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="reader-blur-overlay"
          >
            <EyeOff size={56} style={{ color: 'var(--accent)', opacity: 0.7 }} />
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.6rem',
                color: 'var(--text-primary)',
                marginTop: 8,
              }}
            >
              {devToolsOpen ? 'Developer tools detected' : 'Reading paused'}
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                maxWidth: 360,
                textAlign: 'center',
              }}
            >
              {devToolsOpen
                ? 'Please close developer tools to continue reading.'
                : 'Return to this tab to continue reading your story.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reader Topbar ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link
          to={`/book/${bookId}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            transition: 'color 200ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronLeft size={16} />
          <span className="hide-mobile">{book?.title}</span>
        </Link>

        {/* Page indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <button
            onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
            disabled={currentPage <= 1 || pageLoading}
            aria-label="Previous page"
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: currentPage <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 200ms',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ minWidth: 80, textAlign: 'center' }}>
            {pageLoading ? (
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 'auto' }} />
            ) : (
              `Page ${currentPage} of ${totalPages}`
            )}
          </span>

          <button
            onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages || pageLoading}
            aria-label="Next page"
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: currentPage >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 200ms',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Progress */}
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {Math.round((currentPage / totalPages) * 100)}%
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 2,
          background: 'var(--border-subtle)',
          width: '100%',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: 'var(--accent)',
            width: `${(currentPage / totalPages) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ── Canvas area ── */}
      <div
        className="reader-container"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <div
          className="reader-canvas-wrapper"
          style={{
            maxWidth: 860,
            width: '100%',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
            background: '#fff',
            minHeight: 200,
            position: 'relative',
          }}
        >
          {pageLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                borderRadius: 'var(--radius)',
              }}
            >
              <div className="spinner" />
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              cursor: 'default',
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)',
        }}
      >
        <button
          onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
          disabled={currentPage <= 1 || pageLoading}
          className="btn-ghost"
          style={{
            opacity: currentPage <= 1 ? 0.4 : 1,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {/* Page jump input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 1 && val <= totalPages) setCurrentPage(val);
            }}
            style={{
              width: 60,
              padding: '4px 8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              textAlign: 'center',
              outline: 'none',
            }}
          />
          <span>of {totalPages}</span>
        </div>

        <button
          onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
          disabled={currentPage >= totalPages || pageLoading}
          className="btn-primary"
          style={{
            opacity: currentPage >= totalPages ? 0.4 : 1,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProtectedReader;
