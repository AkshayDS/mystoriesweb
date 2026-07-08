import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAdminBooks,
  uploadBook,
  updateBook,
  deleteBook,
  toggleBookStatus,
  toggleBookFeatured,
} from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { ALL_GENRES } from '../themes/genreThemes';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  LogOut,
  Upload,
  X,
  Check,
  BarChart2,
} from 'lucide-react';

const INPUT_STYLE = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.92rem',
  outline: 'none',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-body)',
  marginBottom: 6,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { setGenre } = useTheme();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const defaultForm = {
    title: '',
    author: 'Akshay',
    genre: [],
    synopsis: '',
    status: 'draft',
    featured: false,
  };
  const [form, setForm] = useState(defaultForm);
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const coverInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    setGenre('default');
    document.title = 'Admin Dashboard — ಮನದ ಪುಟಗಳು';
    fetchBooks();
  }, [setGenre]);

  const fetchBooks = async () => {
    try {
      const res = await getAdminBooks();
      setBooks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('storynest-admin-token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('storynest-admin-token');
    navigate('/admin/login');
  };

  const openUpload = (book = null) => {
    if (book) {
      setEditingBook(book);
      setForm({
        title: book.title,
        author: book.author,
        genre: book.genre,
        synopsis: book.synopsis,
        status: book.status,
        featured: book.featured,
      });
    } else {
      setEditingBook(null);
      setForm(defaultForm);
      setCoverFile(null);
      setPdfFile(null);
    }
    setError('');
    setSuccess('');
    setShowUploadModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('author', form.author);
      form.genre.forEach((g) => fd.append('genre', g));
      fd.append('synopsis', form.synopsis);
      fd.append('status', form.status);
      fd.append('featured', form.featured);
      if (coverFile) fd.append('cover', coverFile);
      if (pdfFile) fd.append('pdf', pdfFile);

      if (editingBook) {
        await updateBook(editingBook._id, fd);
        setSuccess('Book updated successfully!');
      } else {
        if (!coverFile || !pdfFile) {
          setError('Cover image and PDF are required for new uploads.');
          setSubmitting(false);
          return;
        }
        await uploadBook(fd);
        setSuccess('Book uploaded! PDF is being processed by Cloudinary.');
      }

      await fetchBooks();
      setTimeout(() => {
        setShowUploadModal(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await deleteBook(book._id);
      setBooks((prev) => prev.filter((b) => b._id !== book._id));
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleToggleStatus = async (book) => {
    try {
      const res = await toggleBookStatus(book._id);
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, status: res.data.status } : b))
      );
    } catch (err) {
      alert('Toggle failed.');
    }
  };

  const handleToggleFeatured = async (book) => {
    try {
      const res = await toggleBookFeatured(book._id);
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, featured: res.data.featured } : b))
      );
    } catch (err) {
      alert('Toggle failed.');
    }
  };

  const totalReads = books.reduce((sum, b) => sum + (b.readCount || 0), 0);
  const publishedCount = books.filter((b) => b.status === 'published').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--accent)',
              borderRadius: 7,
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
            ಮನದ ಪುಟಗಳು Admin
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => openUpload()}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.87rem' }}
          >
            <Plus size={15} />
            New Story
          </button>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '8px 14px', fontSize: '0.87rem' }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: '2rem',
          }}
        >
          {[
            { label: 'Total Stories', value: books.length, icon: <BookOpen size={20} /> },
            { label: 'Published', value: publishedCount, icon: <Eye size={20} /> },
            { label: 'Drafts', value: books.length - publishedCount, icon: <EyeOff size={20} /> },
            { label: 'Total Reads', value: totalReads.toLocaleString(), icon: <BarChart2 size={20} /> },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1.25rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {stat.label}
                </span>
                <span style={{ color: 'var(--accent)' }}>{stat.icon}</span>
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                }}
              >
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Books table */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              All Stories
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {books.length} total
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 52, borderRadius: 8 }} className="skeleton" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              No stories yet. Upload your first one!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {['Cover', 'Title', 'Genre', 'Pages', 'Reads', 'Status', 'Featured', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 16px',
                            textAlign: 'left',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-body)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {books.map((book, i) => (
                    <motion.tr
                      key={book._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 200ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Cover */}
                      <td style={{ padding: '10px 16px' }}>
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            style={{ width: 36, height: 52, objectFit: 'cover', borderRadius: 4 }}
                          />
                        ) : (
                          <div style={{ width: 36, height: 52, background: 'var(--bg-secondary)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                      </td>

                      {/* Title */}
                      <td style={{ padding: '10px 16px', maxWidth: 200 }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {book.title}
                        </p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {book.estimatedReadTime}
                        </p>
                      </td>

                      {/* Genre */}
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {book.genre?.slice(0, 2).map((g) => (
                            <span key={g} className="genre-tag" style={{ fontSize: '0.65rem' }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Pages */}
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                        {book.totalPages || '—'}
                      </td>

                      {/* Reads */}
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                        {(book.readCount || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px 16px' }}>
                        <button
                          onClick={() => handleToggleStatus(book)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 20,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-body)',
                            background:
                              book.status === 'published'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : 'var(--bg-secondary)',
                            color:
                              book.status === 'published' ? '#22c55e' : 'var(--text-muted)',
                          }}
                        >
                          {book.status === 'published' ? <Eye size={11} /> : <EyeOff size={11} />}
                          {book.status}
                        </button>
                      </td>

                      {/* Featured */}
                      <td style={{ padding: '10px 16px' }}>
                        <button
                          onClick={() => handleToggleFeatured(book)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: book.featured ? '#f59e0b' : 'var(--text-muted)',
                            transition: 'color 200ms',
                          }}
                          title={book.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          {book.featured ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => openUpload(book)}
                            style={{
                              padding: '6px 10px',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 6,
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 200ms',
                            }}
                            title="Edit"
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(book)}
                            style={{
                              padding: '6px 10px',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 6,
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 200ms',
                            }}
                            title="Delete"
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#e05060'; e.currentTarget.style.borderColor = '#e05060'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowUploadModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                width: '100%',
                maxWidth: 600,
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                  {editingBook ? 'Edit Story' : 'Upload New Story'}
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(179,35,47,0.1)', border: '1px solid rgba(179,35,47,0.3)', borderRadius: 'var(--radius-sm)', color: '#e05060', fontSize: '0.87rem', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-sm)', color: '#22c55e', fontSize: '0.87rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)' }}>
                  <Check size={16} /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Title */}
                <div>
                  <label style={LABEL_STYLE}>Title *</label>
                  <input
                    style={INPUT_STYLE}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Story title"
                    required
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                  />
                </div>

                {/* Author */}
                <div>
                  <label style={LABEL_STYLE}>Author</label>
                  <input
                    style={INPUT_STYLE}
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Akshay"
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                  />
                </div>

                {/* Genre */}
                <div>
                  <label style={LABEL_STYLE}>Genre(s) *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ALL_GENRES.map((genre) => {
                      const selected = form.genre.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              genre: selected
                                ? prev.genre.filter((g) => g !== genre)
                                : [...prev.genre, genre],
                            }));
                          }}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 20,
                            border: `1px solid ${selected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                            background: selected ? 'var(--accent)' : 'transparent',
                            color: selected ? '#1a1a1a' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'var(--font-body)',
                            transition: 'all 200ms',
                          }}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <label style={LABEL_STYLE}>Synopsis *</label>
                  <textarea
                    style={{ ...INPUT_STYLE, minHeight: 100, resize: 'vertical' }}
                    value={form.synopsis}
                    onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
                    placeholder="A compelling summary of your story..."
                    required
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                  />
                </div>

                {/* Cover image */}
                <div>
                  <label style={LABEL_STYLE}>
                    Cover Image {editingBook ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setCoverFile(e.target.files[0])}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current.click()}
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Upload size={15} />
                    {coverFile ? coverFile.name : 'Choose Cover Image'}
                  </button>
                </div>

                {/* PDF */}
                <div>
                  <label style={LABEL_STYLE}>
                    PDF File {editingBook ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => setPdfFile(e.target.files[0])}
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current.click()}
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Upload size={15} />
                    {pdfFile ? pdfFile.name : 'Choose PDF'}
                  </button>
                </div>

                {/* Status + Featured row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={LABEL_STYLE}>Status</label>
                    <select
                      style={{ ...INPUT_STYLE }}
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Featured on Hero</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, featured: !form.featured })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        background: form.featured ? 'rgba(245,158,11,0.15)' : 'var(--bg-secondary)',
                        color: form.featured ? '#f59e0b' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.87rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 200ms',
                      }}
                    >
                      {form.featured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                      {form.featured ? 'Featured' : 'Not Featured'}
                    </button>
                  </div>
                </div>

                {/* Upload progress */}
                {submitting && uploadProgress > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 2 }}>
                      <div style={{ height: '100%', background: 'var(--accent)', width: `${uploadProgress}%`, borderRadius: 2, transition: 'width 200ms' }} />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'wait' : 'pointer' }}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                        {editingBook ? 'Saving...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        {editingBook ? <Check size={15} /> : <Upload size={15} />}
                        {editingBook ? 'Save Changes' : 'Upload Story'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
