const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Book = require('../models/Book');
const { getSignedPageUrl } = require('../services/cloudinaryService');
const { pageImageLimiter } = require('../middleware/rateLimiter');

// In-memory session store (use Redis in production)
// Maps sessionToken → { bookId, createdAt, ipAddress }
const readerSessions = new Map();

// Clean up expired sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of readerSessions.entries()) {
    if (now - session.createdAt > 24 * 60 * 60 * 1000) { // 24h expiry
      readerSessions.delete(token);
    }
  }
}, 30 * 60 * 1000);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/books  — list published books
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { genre, sort, search, featured, limit = 50, page = 1 } = req.query;

    const query = { status: 'published' };

    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'readCount') sortOption = { readCount: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [books, total] = await Promise.all([
      Book.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-pageImagePublicIds -pageImageFolder'),
      Book.countDocuments(query),
    ]);

    res.json({
      books,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Book list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/books/:id  — single book detail (metadata only)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      status: 'published',
    }).select('-pageImagePublicIds -pageImageFolder');

    if (!book) return res.status(404).json({ message: 'Book not found' });

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/books/:id/session  — issue a reader session token
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/session', async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, status: 'published' });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const shortId = sessionToken.substring(0, 8).toUpperCase(); // For watermark display

    readerSessions.set(sessionToken, {
      bookId: req.params.id,
      createdAt: Date.now(),
      ipAddress: req.ip,
      shortId,
    });

    res.json({
      sessionToken,
      shortId,       // Short identifier burned into watermark
      totalPages: book.totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/books/:id/page/:pageNum  — serve page image (protected)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/page/:pageNum', pageImageLimiter, async (req, res) => {
  try {
    // Validate reader session
    const sessionToken = req.headers['x-reader-session'];
    if (!sessionToken) {
      return res.status(401).json({ message: 'Reader session required' });
    }

    const session = readerSessions.get(sessionToken);
    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired reader session' });
    }

    if (session.bookId !== req.params.id) {
      return res.status(403).json({ message: 'Session not valid for this book' });
    }

    const pageNum = parseInt(req.params.pageNum);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    // Find the book and get PDF public_id
    const book = await Book.findOne({
      _id: req.params.id,
      status: 'published',
    });

    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (pageNum > book.totalPages) {
      return res.status(400).json({ message: 'Page out of range' });
    }

    // Generate signed URL for this specific page
    const signedUrl = getSignedPageUrl(book.pageImageFolder, pageNum);

    // Return the signed URL — frontend fetches image and draws on canvas
    res.json({
      url: signedUrl,
      page: pageNum,
      totalPages: book.totalPages,
      sessionShortId: session.shortId,
    });
  } catch (error) {
    console.error('Page fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/books/:id/increment-read  — bump read count
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/increment-read', async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, { $inc: { readCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports.readerSessions = readerSessions;
