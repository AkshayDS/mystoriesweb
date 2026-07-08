import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBooks } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import BookCard from '../components/BookCard';
import { Search, BookOpen } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { setGenre } = useTheme();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGenre('default');
    document.title = `Search: "${query}" — ಮನದ ಪುಟಗಳು`;
  }, [query, setGenre]);

  useEffect(() => {
    if (!query.trim()) return;
    const search = async () => {
      setLoading(true);
      try {
        const res = await getBooks({ search: query });
        setBooks(res.data.books || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [query]);

  return (
    <div style={{ paddingTop: 96 }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Search size={22} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-primary)' }}>
              Search Results
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {loading ? 'Searching...' : `${books.length} result${books.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 310 }} className="skeleton" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
            {books.map((book, i) => (
              <BookCard key={book._id} book={book} index={i} />
            ))}
          </div>
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
            <BookOpen size={64} style={{ color: 'var(--accent)', opacity: 0.2, marginBottom: 16 }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              No stories found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Try a different search term or browse by genre.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
