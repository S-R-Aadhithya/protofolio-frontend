import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Placeholder Components
const Dashboard = () => <div className="p-4"><h1>Dashboard</h1><p>Manage your portfolios here.</p></div>;

const CouncilView = ({ deliberation, blueprint }) => {
  return (
    <div className="card mt-4 p-4 shadow-sm border-0 bg-white">
      <h4 className="mb-4 d-flex align-items-center gap-2">
        <span className="badge bg-primary rounded-pill">Expert Council</span>
        Deliberation
      </h4>
      <div className="deliberation-text p-3 rounded mb-4 bg-light border" style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '14px', whiteSpace: 'pre-wrap', color: '#555' }}>
        {deliberation}
      </div>
      <div className="blueprint-result p-4 rounded border-start border-4 border-success bg-light shadow-sm">
        <h5 className="text-success fw-bold d-flex align-items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"/></svg>
          Final Portfolio Roadmap
        </h5>
        <hr className="my-3" />
        <div className="row g-3">
          <div className="col-md-7">
             <p className="mb-2"><strong>Tagline:</strong> <span className="text-dark">{blueprint.tagline}</span></p>
             <p className="mb-0"><strong>Tech Stack:</strong> <span className="badge bg-secondary me-1">{Array.isArray(blueprint.tech_stack) ? blueprint.tech_stack.join(', ') : blueprint.tech_stack}</span></p>
          </div>
          <div className="col-md-5">
             <p className="mb-0"><strong>Layout Strategy:</strong> <br/><small className="text-muted">{blueprint.layout_strategy}</small></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SetupWizard = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [repos, setRepos] = useState(null);
  const [jobGoal, setJobGoal] = useState('Full Stack Developer');
  const [deliberationData, setDeliberationData] = useState(null);
  const [error, setError] = useState(null);
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
      navigate('/setup', { replace: true });
    }
  }, [location, navigate]);

  const handleImportGithub = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/ingest/github', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: localStorage.getItem('username') })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import repositories');
      }
      setRepos(data.repos);
    } catch (err) {
      if (err.message.includes('Token has expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/';
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/portfolio/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job_goal: jobGoal })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.msg || 'Council deliberation failed');
      }
      setDeliberationData(data);
    } catch (err) {
      if (err.message.includes('Token has expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/';
        return;
      }
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-light min-vh-100 rounded shadow-sm">
      <div className="max-width-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 className="mb-4 fw-bold">Personal Portfolio Wizard</h1>
        {token ? (
          <div className="card shadow border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
            <div className="card-body p-5">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l2.578 2.576L12.736 3.97z"/></svg>
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">Step 1: Connect GitHub</h5>
                  <p className="text-muted mb-0 small">Import your work history directly from your repositories.</p>
                </div>
              </div>
              
              <div className="mb-5 ms-5 ps-2 border-start">
                <button 
                  onClick={handleImportGithub} 
                  disabled={loading || repos}
                  className={`btn ${repos ? 'btn-outline-secondary' : 'btn-dark'} d-flex align-items-center gap-2 px-4 py-2 rounded-pill`}
                >
                  {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                  {repos ? '✓ Repositories Linked' : 'Import GitHub Repositories'}
                </button>
                
                {repos && (
                  <div className="mt-3 p-3 bg-white border rounded shadow-sm scale-in">
                    <p className="small text-muted mb-2"> Council has indexed <strong>{repos.length}</strong> repositories.</p>
                    <div className="d-flex flex-wrap gap-2">
                       {repos.slice(0, 5).map((r, i) => <span key={i} className="badge bg-light text-dark border">{r.name}</span>)}
                       {repos.length > 5 && <span className="badge bg-light text-muted">+{repos.length - 5} more</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${repos ? 'bg-primary text-white' : 'bg-secondary text-light opacity-50'}`} style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>2</div>
                <div>
                  <h5 className={`mb-0 fw-bold ${!repos && 'text-muted'}`}>Step 2: Define Job Goal</h5>
                  <p className="text-muted mb-0 small">What role are you targeting with this portfolio?</p>
                </div>
              </div>

              <div className={`ms-5 ps-2 border-start ${!repos && 'opacity-50'}`}>
                <div className="input-group mb-4" style={{ maxWidth: '500px' }}>
                  <input 
                    type="text" 
                    className="form-control form-control-lg bg-white" 
                    placeholder="e.g. Senior Frontend Engineer" 
                    value={jobGoal}
                    onChange={(e) => setJobGoal(e.target.value)}
                    disabled={!repos || generating}
                  />
                  <button 
                    className="btn btn-primary px-4 fw-bold" 
                    onClick={handleGeneratePortfolio}
                    disabled={!repos || generating}
                  >
                    {generating ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-magic me-2"></i>}
                    {generating ? 'Council is Meting...' : 'Summon Council'}
                  </button>
                </div>

                {generating && (
                  <div className="alert alert-info border-0 shadow-sm d-flex align-items-center gap-3">
                    <div className="spinner-grow text-primary" role="status"></div>
                    <div>
                      <h6 className="mb-0 fw-bold">Agents are deliberating...</h6>
                      <small>The Tech Lead, Designer, and PM are discussing your profile.</small>
                    </div>
                  </div>
                )}
                
                {deliberationData && (
                  <CouncilView 
                    deliberation={deliberationData.deliberation} 
                    blueprint={deliberationData.blueprint} 
                  />
                )}
              </div>
              
              {error && <div className="alert alert-danger mt-4 border-0 shadow-sm">{error}</div>}
            </div>
          </div>
        ) : (
          <div className="card text-center p-5 shadow-sm border-0 bg-white" style={{ borderRadius: '15px' }}>
            <div className="mb-4">
               <i className="bi bi-shield-lock-fill text-muted" style={{ fontSize: '3rem' }}></i>
            </div>
            <h4 className="fw-bold">Authentication Required</h4>
            <p className="text-muted mb-4 text-center mx-auto" style={{ maxWidth: '400px' }}>Please log in via GitHub or Google to access the Personal Portfolio Wizard and summon the LLM Council.</p>
            <div className="d-flex justify-content-center gap-3">
               <a className="btn btn-dark btn-lg px-4" href="http://localhost:5001/api/auth/github/login">Login with GitHub</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DeveloperSandbox = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSavedCode = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:5001/api/auth/sandbox', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.code) {
          setCode(data.code);
        } else {
          // Default code if none saved
          setCode(`// Welcome to your Portfolio Sandbox!
// You can edit your portfolio code here.

function Portfolio() {
  return (
    <div className="portfolio-preview">
      <h1>My Awesome Portfolio</h1>
      <p>Built with Protofolio</p>
    </div>
  );
}

export default Portfolio;`);
        }
      } catch (err) {
        console.error("Failed to fetch sandbox code:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedCode();
  }, [token]);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleSave = async () => {
    if (!token) {
      alert("Please log in to save your changes.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/auth/sandbox', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Code saved successfully!");
      } else {
        alert("Failed to save: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error saving code: " + err.message);
    }
  };

  if (loading) return (
    <div className="p-4 text-center">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2 text-muted">Loading your sandbox...</p>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded shadow-sm min-vh-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-0">Developer Sandbox</h1>
          <p className="text-muted mb-0">Tweak your portfolio code directly.</p>
        </div>
        <button className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2" onClick={handleSave}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M11 2H9v3h2V2Z"/><path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0ZM1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5Zm3 4.5V1h7v4.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5ZM12.5 15V10.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5V15h9Z"/></svg>
          Save Changes
        </button>
      </div>
      
      <div className="border rounded overflow-hidden shadow-sm flex-grow-1" style={{ height: '600px', backgroundColor: '#1e1e1e' }}>
        <Editor
          height="600px"
          defaultLanguage="javascript"
          defaultValue={code}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontWeight: 'normal',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};
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
