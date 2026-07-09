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
              content: (
                <p style={{ fontFamily: 'var(--font-reading)', fontSize: '0.97rem', lineHeight: 1.85, color: 'var(--text-secondary)' }}>
                  Stories have always been my way of understanding the world. I write because there are emotions that are too big for conversations, truths that are too complex for explanations, and experiences that deserve to be preserved in words. Every story I publish here is a piece of myself — raw, honest, and crafted with love.
                </p>
              ),
            },
            {
              icon: <Heart size={24} style={{ color: 'var(--accent)' }} />,
              title: 'ಓದುಗರಿಗೆ... (For the Reader)',
              content: (
                <div style={{ fontFamily: 'var(--font-reading)', fontSize: '0.97rem', lineHeight: 2, color: 'var(--text-secondary)' }}>
                  <p style={{ marginBottom: '1rem' }}>ಈ ಪುಸ್ತಕದಲ್ಲಿರುವ ಎಲ್ಲಾ ಕಥೆಗಳು ನನ್ನ ಕಲ್ಪನೆಯಿಂದ ಬರೆಯಲ್ಪಟ್ಟಿವೆ.</p>
                  
                  <p style={{ marginBottom: '0.3rem' }}>ಕೆಲವು ಭಾವನೆಗಳು ನಿಜವಾಗಿರಬಹುದು...</p>
                  <p style={{ marginBottom: '0.3rem' }}>ಕೆಲವು ಪಾತ್ರಗಳು ನಿಮ್ಮ ಜೀವನವನ್ನು ನೆನಪಿಸಬಹುದು...</p>
                  <p style={{ marginBottom: '1rem' }}>ಕೆಲವು ಘಟನೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಮುಟ್ಟಬಹುದು...</p>

                  <p style={{ marginBottom: '1rem' }}>ಆದರೆ ಈ ಕಥೆಗಳು ಯಾರ ಜೀವನವನ್ನೂ ಪ್ರತಿಬಿಂಬಿಸುವುದಿಲ್ಲ.</p>
                  <p style={{ marginBottom: '1rem' }}>ಇವು ಕೇವಲ ಭಾವನೆಗಳನ್ನು ಹೃದಯಕ್ಕೆ ತಲುಪಿಸಲು ಬರೆಯಲ್ಪಟ್ಟಿವೆ.</p>

                  <p style={{ marginBottom: '0.5rem' }}>ಪ್ರೀತಿ ಎಂದರೆ ಕೇವಲ ಇಬ್ಬರ ಸಂಗಮವಲ್ಲ...</p>
                  <p style={{ marginBottom: '0.3rem', paddingLeft: '1rem' }}>ಅದು ಕಾಯುವಿಕೆ,</p>
                  <p style={{ marginBottom: '0.3rem', paddingLeft: '1rem' }}>ಗೌರವ,</p>
                  <p style={{ marginBottom: '0.3rem', paddingLeft: '1rem' }}>ತ್ಯಾಗ,</p>
                  <p style={{ marginBottom: '0.3rem', paddingLeft: '1rem' }}>ಮೌನ,</p>
                  <p style={{ marginBottom: '1rem', paddingLeft: '1rem' }}>ಮತ್ತು ಅನೇಕ ಭಾವನೆಗಳ ಹೆಸರು.</p>

                  <p style={{ marginBottom: '1rem' }}>ಈ ಪುಸ್ತಕದಲ್ಲಿ ನೀವು ಓದುವುದು ಕೇವಲ ಕಥೆಗಳಲ್ಲ...</p>
                  
                  <p style={{ marginBottom: '0.3rem', paddingLeft: '1rem' }}>ನಗುವಿನ ಹಿಂದೆ ಇರುವ ನೋವು,</p>
                  <p style={{ marginBottom: '0.3rem', paddingLeft: '1rem' }}>ಹೇಳದ ಪ್ರೀತಿ,</p>
                  <p style={{ marginBottom: '0.3rem', paddingLeft: '1rem' }}>ಮುರಿಯದ ಕನಸು,</p>
                  <p style={{ marginBottom: '1rem', paddingLeft: '1rem' }}>ಮತ್ತು ಜೀವನದ ಸಣ್ಣ ಪಾಠಗಳು.</p>

                  <p style={{ marginBottom: '1rem' }}>ಈ ಪುಟಗಳಲ್ಲಿ ನಿಮ್ಮ ಜೀವನದ ಒಂದು ಕ್ಷಣ ಕಂಡರೆ...<br />ಅದೇ ನನ್ನ ಬರಹದ ಸಂತೋಷ.</p>
                  
                  <p style={{ marginBottom: '0.5rem' }}>ಪ್ರತಿ ಕಥೆಯನ್ನು ಹೃದಯದಿಂದ ಬರೆದಿದ್ದೇನೆ.</p>
                  <p style={{ marginBottom: '1.2rem' }}>ಅದೇ ಹೃದಯದಿಂದ ಓದಿ.</p>
                  
                  <p style={{ color: 'var(--accent)', fontWeight: 600 }}>– ಅಕ್ಷಯ್ ಡಿ. ಎಸ್.</p>
                </div>
              ),
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
              {section.content}
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
