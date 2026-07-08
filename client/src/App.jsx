import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GenrePage from './pages/GenrePage';
import BookDetailPage from './pages/BookDetailPage';
import ReaderPage from './pages/ReaderPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

// Admin routes don't get the public Navbar/Footer
const AdminRoute = ({ children }) => <>{children}</>;

// Routes that show Navbar + Footer
const AppRoutes = () => {
  const location = useLocation();
  const isReader = location.pathname.startsWith('/read/');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && !isReader && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <HomePage />
              </PageWrapper>
            }
          />
          <Route
            path="/genre/:genreSlug"
            element={
              <PageWrapper>
                <GenrePage />
              </PageWrapper>
            }
          />
          <Route
            path="/book/:bookId"
            element={
              <PageWrapper>
                <BookDetailPage />
              </PageWrapper>
            }
          />
          <Route path="/read/:bookId" element={<ReaderPage />} />
          <Route
            path="/search"
            element={
              <PageWrapper>
                <SearchPage />
              </PageWrapper>
            }
          />
          <Route
            path="/about"
            element={
              <PageWrapper>
                <AboutPage />
              </PageWrapper>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </AnimatePresence>

      {!isAdmin && !isReader && <Footer />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.87rem',
            },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
