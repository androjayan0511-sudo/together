import React, { useState, useEffect } from 'react';

export function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!targetDate) return null;
    const diff = new Date(targetDate).getTime() - new Date().getTime();

    if (diff <= 0) {
      return { isPast: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { isPast: false, days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.isPast) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '1.1rem' }}>
          It's time! You are together.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      margin: '16px 0 20px'
    }}>
      <div className="countdown-box">
        <div className="countdown-num">{String(timeLeft.days).padStart(2, '0')}</div>
        <div className="countdown-label">DAYS</div>
      </div>
      <div className="countdown-box">
        <div className="countdown-num">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="countdown-label">HOURS</div>
      </div>
      <div className="countdown-box">
        <div className="countdown-num">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="countdown-label">MINS</div>
      </div>
      <div className="countdown-box">
        <div className="countdown-num">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="countdown-label">SECS</div>
      </div>
      <style>{`
        .countdown-box {
          background-color: var(--bg-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 14px 8px;
          text-align: center;
        }
        .countdown-num {
          font-size: 1.55rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .countdown-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}
