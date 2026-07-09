import React, { useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import LandingPage from './components/LandingPage';
import { SignInPage, RegisterPage, VerifyPage } from './components/AuthPages';
import RideDashboard from './components/RideDashboard';
import { LogOut } from 'lucide-react';

const AppContent = () => {
  const { user, logout } = useContext(AppContext);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Dynamic Starfield Background */}
      <div className="starfield"></div>
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Global Header */}
      <header className="glass-card" style={{
        margin: '12px 16px',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50,
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem', textDecoration: 'none' }}>🦄</span>
          <Link to="/" style={{ 
            fontSize: '1.4rem', 
            fontWeight: '800', 
            background: 'linear-gradient(to right, #00f2fe, #4facfe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
            letterSpacing: '0.05em'
          }}>
            WILD RIDE
          </Link>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', transition: 'var(--transition)' }} className="nav-link">Home</Link>
          {user?.isAuthenticated ? (
            <>
              <Link to="/ride" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }} className="nav-link">Request Ride</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  {user.email.split('@')[0]}
                </span>
                <button onClick={logout} style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }} className="nav-link">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/signin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }} className="nav-link">Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem' }}>Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Pages */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={user?.isAuthenticated ? <Navigate to="/ride" /> : <SignInPage />} />
          <Route path="/register" element={user?.isAuthenticated ? <Navigate to="/ride" /> : <RegisterPage />} />
          <Route path="/verify" element={user?.isAuthenticated ? <Navigate to="/ride" /> : <VerifyPage />} />
          <Route path="/ride" element={user?.isAuthenticated ? <RideDashboard /> : <Navigate to="/signin" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
