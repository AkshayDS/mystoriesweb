const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      default: 'Akshay',
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      enum: [
        'Love Story',
        'Thriller',
        'Mystery',
        'Horror',
        'Drama',
        'Fantasy',
        'Poetry & Short Reads',
      ],
    },
    synopsis: {
      type: String,
      required: [true, 'Synopsis is required'],
      maxlength: [2000, 'Synopsis cannot exceed 2000 characters'],
    },
    coverImageUrl: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    coverImagePublicId: {
      type: String, // Cloudinary public_id for deletion
    },
    pageImageFolder: {
      type: String, // Cloudinary folder path storing page images
    },
    pageImagePublicIds: {
      type: [String], // Array of Cloudinary public_ids for all pages
      default: [],
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    estimatedReadTime: {
      type: String, // e.g., "12 min read"
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    readCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
bookSchema.index({ title: 'text', synopsis: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);
