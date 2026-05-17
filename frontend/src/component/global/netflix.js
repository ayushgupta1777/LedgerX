// CZoneLogo.jsx
import React, { useState, useEffect } from 'react';
import './CZoneLogo.css';

const CZoneLogo = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return (
      <div className="czone-welcome-screen">
        <div className="czone-welcome-text">Welcome to your app!</div>
      </div>
    );
  }

  return (
    <div className="czone-splash-container">
      {/* Animated background particles */}
      <div className="czone-particles-wrapper">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="czone-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main logo container */}
      <div className="czone-logo-wrapper">
        {/* Letter animations */}
        <div className="czone-letters-container">
          {['C', 'Z', 'O', 'N', 'E'].map((letter, index) => (
            <div
              key={index}
              className="czone-letter"
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Tagline with fade-in */}
        <div className="czone-tagline">
          YOUR DIGITAL ZONE
        </div>

        {/* Circular loading animation */}
        <div className="czone-loader-wrapper">
          <div className="czone-loader-container">
            <div className="czone-loader-outer-ring"></div>
            <div className="czone-loader-ring-1"></div>
            <div className="czone-loader-ring-2"></div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="czone-dots-container">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="czone-progress-dot"
              style={{
                animationDelay: `${dot * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CZoneLogo;