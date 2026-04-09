import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  const mounted = useSelector((state) => state.landing.mounted);

  return (
    <div style={{
      position: 'relative', zIndex: 10,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '3rem 1rem',
    }}>
      {/* Social proof badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="glass-card"
        style={{ marginBottom: '2rem', padding: '0.75rem 1.5rem', borderRadius: '9999px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex' }}>
            {[
              'linear-gradient(135deg,#d946ef,#9333ea)',
              'linear-gradient(135deg,#06b6d4,#3b82f6)',
              'linear-gradient(135deg,#8b5cf6,#d946ef)',
            ].map((bg, i) => (
              <div key={i} className="animate-pulse" style={{
                width: 32, height: 32, borderRadius: '50%',
                background: bg, border: '2px solid rgba(255,255,255,0.4)',
                marginLeft: i > 0 ? -8 : 0,
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
            Joined by 15,000+ professionals
          </span>
        </div>
      </motion.div>

      {/* Logo icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={mounted ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card"
        style={{ marginBottom: '2rem', padding: '1.5rem', cursor: 'pointer' }}
        whileHover={{ rotate: 12 }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '1.5rem',
          maxWidth: '900px',
          lineHeight: 1.1,
        }}
      >
        <span style={{ color: 'white' }}>Connect your </span>
        <span className="text-gradient-accent animate-pulse">tasks</span>
        <br />
        <span style={{ color: 'white' }}>to the </span>
        <span className="text-gradient-cyan animate-pulse" style={{ animationDelay: '0.5s' }}>best talents</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.125rem',
          textAlign: 'center',
          maxWidth: '640px',
          marginBottom: '3rem',
          lineHeight: 1.7,
        }}
      >
        TaskLink revolutionizes how clients find skilled workers. A simple, secure,
        and efficient platform for all your projects.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5rem' }}
      >
        <Link
          to="/auth?role=client"
          className="glass-card"
          style={{
            padding: '1rem 2rem',
            fontWeight: 600,
            color: 'white',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.3s',
            fontSize: '1rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(232,121,249,0.6)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(232,121,249,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Start as Client
        </Link>
        <Link
          to="/auth?role=worker"
          className="glass-card"
          style={{
            padding: '1rem 2rem',
            fontWeight: 600,
            color: 'white',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.3s',
            fontSize: '1rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(34,211,238,0.6)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(34,211,238,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Join as Worker
        </Link>
      </motion.div>
    </div>
  );
};
