import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export const ChatButton = () => {
  const mounted = useSelector((state) => state.landing.mounted);

  return (
    <motion.button
      initial={{ opacity: 0, x: 40 }}
      animate={mounted ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 1.4 }}
      whileHover={{ scale: 1.1 }}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: '#000',
        border: '1px solid rgba(16,185,129,0.3)',
        color: 'white',
        padding: '0.75rem 1.25rem',
        borderRadius: '9999px',
        fontWeight: 600,
        fontSize: '0.95rem',
        boxShadow: '0 8px 32px rgba(16,185,129,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        zIndex: 20,
        transition: 'box-shadow 0.3s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 48px rgba(52,211,153,0.7)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.5)'}
    >
      <svg
        width="24" height="24"
        viewBox="0 0 24 24" fill="none"
        stroke="#34d399" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
      <Link
        to="/talk-with-us"
        style={{ color: 'white', textDecoration: 'none' }}
      >
        Talk with Us
      </Link>
    </motion.button>
  );
};
