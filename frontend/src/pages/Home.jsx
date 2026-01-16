import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-icon">📄</div>
        <h1>Welcome to askPDF</h1>
        <p>
          Upload your PDF documents and interact with them using AI.
          Get instant answers, summaries, and insights from your files.
        </p>
        {user ? (
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        )}

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <div className="feature-title">Fast Upload</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <div className="feature-title">Secure Storage</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <div className="feature-title">AI Powered</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
