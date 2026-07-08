const rateLimit = require('express-rate-limit');

// Rate limit page image requests — 120 per minute per IP (2 per second)
const pageImageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: { message: 'Too many page requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { pageImageLimiter, apiLimiter };
