import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Placeholder Components
const Dashboard = () => <div className="p-4"><h1>Dashboard</h1><p>Manage your portfolios here.</p></div>;

const SetupWizard = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('user');

    if (urlToken) {
      localStorage.setItem('token', urlToken);
      if (urlUser) localStorage.setItem('username', urlUser);
      setToken(urlToken);
      // Clean up the URL
      navigate('/setup', { replace: true });
    }
  }, [location, navigate]);

  // Sync token state with localStorage on changes (like logout)
  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="p-4">
      <h1>Setup Wizard</h1>
      {token ? (
        <div className="alert alert-success">You are authenticated! Token saved securely.</div>
      ) : (
        <p>Generate your first portfolio.</p>
      )}
    </div>
  );
};

const DeveloperSandbox = () => <div className="p-4"><h1>Developer Sandbox</h1><p>Edit your portfolio code.</p></div>;
const CouncilChat = () => <div className="p-4"><h1>Council Chat</h1><p>Talk to the agents.</p></div>;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  // Listen for storage changes in case of cross-tab login/logout
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      setUsername(localStorage.getItem('username'));
    };
    window.addEventListener('storage', checkAuth);
    // Poll just in case the same tab changed it without an event
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    // Use window.location to force a hard redirect to home, resetting all states
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="container mt-5">
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 p-3 rounded shadow-sm">
          <a className="navbar-brand fw-bold" href="/">Protofolio</a>
          <div className="navbar-nav ms-auto d-flex align-items-center">
            <a className="nav-link" href="/">Dashboard</a>
            <a className="nav-link" href="/setup">Setup</a>
            <a className="nav-link" href="/sandbox">Sandbox</a>
            <a className="nav-link" href="/chat">Chat</a>
            {isLoggedIn ? (
              <div className="d-flex align-items-center ms-3">
                <span className="me-3 fw-bold text-success">Hi, {username || 'User'}</span>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Logout</button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-3">
                <a className="btn btn-dark d-flex align-items-center gap-2" href="http://localhost:5001/api/auth/github/login">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                  </svg>
                  Login with GitHub
                </a>
                <a className="btn btn-outline-dark d-flex align-items-center gap-2 bg-white" href="http://localhost:5001/api/auth/google/login">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                  </svg>
                  Login with Google
                </a>
              </div>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/setup" element={<SetupWizard />} />
          <Route path="/sandbox" element={<DeveloperSandbox />} />
          <Route path="/chat" element={<CouncilChat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
