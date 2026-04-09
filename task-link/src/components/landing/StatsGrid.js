import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const stats = [
  { value: '15K+', label: 'Tasks completed' },
  { value: '8.5K+', label: 'Happy clients' },
  { value: '12K+', label: 'Active workers' },
  { value: '98%', label: 'Satisfaction rate' },
];

export const StatsGrid = () => {
  const mounted = useSelector((state) => state.landing.mounted);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      width: '100%',
      maxWidth: '900px',
    }}
    className="stats-grid"
    >
      <style>{`
        @media (min-width: 768px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 + i * 0.1 }}
          className="glass-card-hover"
          style={{ padding: '1.5rem' }}
        >
          <div style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #fff, #a5f3fc, #e879f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Syne, sans-serif',
          }}>
            {stat.value}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
