import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Heart, ArrowRight } from 'lucide-react';

export function AuthPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const demoEmail = userType === 'partner1' ? 'andro@togethermiles.com' : 'maya@togethermiles.com';
      const demoPass = 'together123';

      try {
        await login({ email: demoEmail, password: demoPass });
      } catch (err) {
        // If demo user does not exist yet, register them
        if (userType === 'partner1') {
          const regRes = await register({
            name: 'Andro',
            email: 'andro@togethermiles.com',
            password: 'together123'
          });
        } else {
          await register({
            name: 'Maya',
            email: 'maya@togethermiles.com',
            password: 'together123'
          });
        }
      }
    } catch (e) {
      setErrorMessage(e.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <span className="auth-dot"></span>
            <h1>TogetherMiles</h1>
          </div>
          <p className="auth-tagline">
            A quiet, private sanctuary for two people living miles apart.
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error-banner">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="tm-form-group">
              <label className="tm-label" htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                className="tm-input"
                placeholder="e.g. Andro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="tm-form-group">
            <label className="tm-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="tm-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="tm-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          <button
            type="submit"
            className="tm-btn tm-btn-primary tm-btn-full"
            disabled={isLoading}
            style={{ marginTop: '8px' }}
          >
            {isLoading ? 'Please wait...' : (
              <>
                <span>{isRegister ? 'Create Space' : 'Enter Private Space'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          <span>{isRegister ? 'Already have an account?' : "New to TogetherMiles?"}</span>
          <button
            type="button"
            className="auth-toggle-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
            }}
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </div>

        <div className="demo-section">
          <div className="demo-divider">
            <span>OR QUICK DEMO</span>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="tm-btn tm-btn-secondary tm-btn-sm"
              onClick={() => handleDemoLogin('partner1')}
              disabled={isLoading}
            >
              Sign in as Andro
            </button>
            <button
              type="button"
              className="tm-btn tm-btn-secondary tm-btn-sm"
              onClick={() => handleDemoLogin('partner2')}
              disabled={isLoading}
            >
              Sign in as Maya
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background-color: var(--bg-canvas);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 36px 32px;
          box-shadow: var(--shadow-md);
        }

        .auth-brand {
          text-align: center;
          margin-bottom: 28px;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .auth-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background-color: var(--accent);
        }

        .auth-logo h1 {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .auth-tagline {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .auth-error-banner {
          background-color: var(--danger-bg);
          border: 1px solid rgba(155, 57, 57, 0.2);
          color: var(--danger);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.86rem;
          margin-bottom: 20px;
          text-align: center;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
        }

        .auth-toggle {
          margin-top: 24px;
          text-align: center;
          font-size: 0.88rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .auth-toggle-btn {
          color: var(--accent);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .auth-toggle-btn:hover {
          color: var(--accent-hover);
        }

        .demo-section {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px dashed var(--border);
        }

        .demo-divider {
          text-align: center;
          margin-bottom: 12px;
        }

        .demo-divider span {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          font-weight: 600;
          color: var(--text-muted);
        }

        .demo-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .demo-buttons button {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
