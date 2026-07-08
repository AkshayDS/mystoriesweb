// Genre theme config — keyed by route slug
// Each theme maps to CSS variable values and optional JS-driven effects
export const genreThemes = {
  default: {
    slug: 'default',
    label: 'All Stories',
    bg: '#12121a',
    accent: '#e8b458',
    fontHeading: "'Lora', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif",
    particles: false,
    glitch: false,
    sparkles: false,
    fog: false,
  },
  'love-story': {
    slug: 'love-story',
    label: 'Love Story',
    bg: '#2a1418',
    accent: '#e0b0a8',
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Lora', Georgia, serif",
    particles: true,   // floating petals/hearts
    glitch: false,
    sparkles: false,
    fog: false,
  },
  thriller: {
    slug: 'thriller',
    label: 'Thriller',
    bg: '#0d0f12',
    accent: '#b3232f',
    fontHeading: "'Oswald', 'Impact', sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
    particles: false,
    glitch: true,   // subtle glitch on titles
    sparkles: false,
    fog: false,
  },
  horror: {
    slug: 'horror',
    label: 'Horror',
    bg: '#0a0a0a',
    accent: '#8a2424',
    fontHeading: "'Lora', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif",
    particles: false,
    glitch: true,
    sparkles: false,
    fog: true,
  },
};

// Helper: get theme by genre name (handles variations)
export const getThemeByGenre = (genre) => {
  if (!genre) return genreThemes.default;
  
  const normalized = genre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return genreThemes[normalized] || genreThemes.default;
};

// Map display genre names to slugs
export const genreToSlug = {
  'Love Story': 'love-story',
  'Thriller': 'thriller',
  'Horror': 'horror',
};

export const slugToGenre = Object.fromEntries(
  Object.entries(genreToSlug).map(([k, v]) => [v, k])
);

export const ALL_GENRES = Object.keys(genreToSlug);
