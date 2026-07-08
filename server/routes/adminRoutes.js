const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const Admin = require('../models/Admin');
const Book = require('../models/Book');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteCloudinaryFolder,
  getPdfPageCount,
} = require('../services/cloudinaryService');

// Use memory storage so we can pipe buffers to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Cover must be an image'));
      }
    }
    if (file.fieldname === 'pdf') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Story file must be a PDF'));
      }
    }
    cb(null, true);
  },
});

// Helper: generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Helper: estimate read time from page count
const estimateReadTime = (totalPages) => {
  // Average reader: ~2 minutes per page
  const minutes = Math.ceil(totalPages * 2);
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m read` : `${hours}h read`;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(admin._id),
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/books  — upload new book
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/books',
  protect,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, author, genre, synopsis, status, featured } = req.body;

      if (!req.files?.cover || !req.files?.pdf) {
        return res.status(400).json({ message: 'Cover image and PDF are required' });
      }

      const genreArray = Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim());

      // Upload cover image to Cloudinary
      const coverResult = await uploadToCloudinary(req.files.cover[0].buffer, {
        folder: 'storynest/covers',
        resource_type: 'image',
        transformation: [{ width: 800, quality: 'auto:good', crop: 'limit' }],
      });

      // Upload PDF to Cloudinary (as raw/image resource for page extraction)
      const bookSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const pdfFolder = `storynest/books/${bookSlug}`;

      const pdfResult = await uploadToCloudinary(req.files.pdf[0].buffer, {
        folder: `storynest/pdfs`,
        resource_type: 'image', // 'image' resource type allows PDF page access
        format: 'pdf',
        type: 'authenticated', // Keep PDF private
      });

      // Get page count from Cloudinary
      const totalPages = await getPdfPageCount(pdfResult.public_id);

      // Create book record
      const book = await Book.create({
        title,
        author: author || 'Akshay',
        genre: genreArray,
        synopsis,
        coverImageUrl: coverResult.secure_url,
        coverImagePublicId: coverResult.public_id,
        pageImageFolder: pdfResult.public_id, // Store the PDF public_id — used to generate page URLs
        totalPages,
        estimatedReadTime: estimateReadTime(totalPages),
        status: status || 'draft',
        featured: featured === 'true' || featured === true,
      });

      res.status(201).json({
        message: 'Book uploaded successfully',
        book,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message || 'Upload failed' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/books/:id  — edit book metadata
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  '/books/:id',
  protect,
  upload.fields([{ name: 'cover', maxCount: 1 }]),
  async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const { title, author, genre, synopsis, status, featured } = req.body;

      if (title) book.title = title;
      if (author) book.author = author;
      if (genre) {
        book.genre = Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim());
      }
      if (synopsis) book.synopsis = synopsis;
      if (status) book.status = status;
      if (featured !== undefined) book.featured = featured === 'true' || featured === true;

      // Handle cover image replacement
      if (req.files?.cover) {
        // Delete old cover from Cloudinary
        if (book.coverImagePublicId) {
          await deleteFromCloudinary(book.coverImagePublicId);
        }
        const coverResult = await uploadToCloudinary(req.files.cover[0].buffer, {
          folder: 'storynest/covers',
          resource_type: 'image',
          transformation: [{ width: 800, quality: 'auto:good', crop: 'limit' }],
        });
        book.coverImageUrl = coverResult.secure_url;
        book.coverImagePublicId = coverResult.public_id;
      }

      await book.save();
      res.json({ message: 'Book updated', book });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: error.message || 'Update failed' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/books/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/books/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Delete cover image
    if (book.coverImagePublicId) {
      await deleteFromCloudinary(book.coverImagePublicId);
    }

    // Delete PDF from Cloudinary
    if (book.pageImageFolder) {
      await deleteFromCloudinary(book.pageImageFolder, 'image');
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message || 'Delete failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/books  — list all books (including drafts) for admin
// ─────────────────────────────────────────────────────────────────────────────
router.get('/books', protect, async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/books/:id/toggle-status
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/books/:id/toggle-status', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.status = book.status === 'published' ? 'draft' : 'published';
    await book.save();
    res.json({ status: book.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/books/:id/toggle-featured
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/books/:id/toggle-featured', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.featured = !book.featured;
    await book.save();
    res.json({ featured: book.featured });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
