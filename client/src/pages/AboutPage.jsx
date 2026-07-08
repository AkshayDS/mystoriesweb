import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, Feather, Heart } from 'lucide-react';

const AboutPage = () => {
  const { setGenre } = useTheme();

  useEffect(() => {
    setGenre('drama');
    document.title = 'About the Author — ಮನದ ಪುಟಗಳು';
  }, [setGenre]);

  return (
    <div style={{ paddingTop: 96 }}>
      <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '3rem',
              padding: '3rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Avatar placeholder */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-dim), var(--bg-secondary))',
                border: '3px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 40px var(--accent-dim)',
              }}
            >
              <Feather size={48} style={{ color: 'var(--accent)' }} />
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Akshay
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--accent)',
                marginBottom: 20,
                fontStyle: 'italic',
              }}
            >
              Author, Storyteller, Dreamer
            </p>

            <div
              style={{
                width: 60,
                height: 2,
                background: 'var(--accent)',
                margin: '0 auto 20px',
                borderRadius: 1,
              }}
            />

            <p
              style={{
                fontFamily: 'var(--font-reading)',
                fontSize: '1.05rem',
                lineHeight: 1.9,
                color: 'var(--text-secondary)',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              Welcome to ಮನದ ಪುಟಗಳು — a personal digital library where I share the stories
              that live in my head. From sweeping love stories to spine-chilling thrillers,
              from rich fantasy worlds to quiet poems, every piece here is written with care
              and published freely for you to enjoy.
            </p>
          </div>

          {/* Story sections */}
          {[
            {
              icon: <BookOpen size={24} style={{ color: 'var(--accent)' }} />,
              title: 'Why I Write',
              text: `Stories have always been my way of understanding the world. I write because there are emotions that are too big for conversations, truths that are too complex for explanations, and experiences that deserve to be preserved in words. Every story I publish here is a piece of myself — raw, honest, and crafted with love.`,
            },
            {
              icon: <Heart size={24} style={{ color: 'var(--accent)' }} />,
              title: 'For the Reader',
              text: `ಮನದ ಪುಟಗಳು is completely free to read. No subscriptions, no paywalls, no ads. Just stories. I believe great literature should be accessible to everyone. All I ask is that you respect the work — don't copy or distribute the content, and if a story moves you, share the link, not the text.`,
            },
          ].map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{
                padding: '2rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                {section.icon}
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                  {section.title}
                </h2>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-reading)',
                  fontSize: '0.97rem',
                  lineHeight: 1.85,
                  color: 'var(--text-secondary)',
                }}
              >
                {section.text}
              </p>
            </motion.div>
          ))}

          {/* Quote */}
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem',
              borderLeft: '4px solid var(--accent)',
              background: 'var(--accent-dim)',
              borderRadius: '0 var(--radius) var(--radius) 0',
              marginTop: '2rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
              }}
            >
              "There is no friend as loyal as a book."
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
              — Ernest Hemingway
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
