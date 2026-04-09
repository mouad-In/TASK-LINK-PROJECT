import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { setActiveCategory } from '../../features/landing/landingSlice';

const categories = [
  { name: 'Cleaning', color: 'linear-gradient(135deg,#ec4899,#f43f5e)', icon: '✨' },
  { name: 'Repairs', color: 'linear-gradient(135deg,#f97316,#f59e0b)', icon: '🔧' },
  { name: 'Moving', color: 'linear-gradient(135deg,#3b82f6,#06b6d4)', icon: '🚚' },
  { name: 'IT Help', color: 'linear-gradient(135deg,#8b5cf6,#a855f7)', icon: '💻' },
  { name: 'Painting', color: 'linear-gradient(135deg,#22c55e,#10b981)', icon: '🎨' },
  { name: 'Home Care', color: 'linear-gradient(135deg,#f59e0b,#eab308)', icon: '🏠' },
  { name: 'Gardening', color: 'linear-gradient(135deg,#10b981,#14b8a6)', icon: '🌿' },
  { name: 'Photography', color: 'linear-gradient(135deg,#d946ef,#ec4899)', icon: '📷' },
];

export const CategorySection = () => {
  const mounted = useSelector((state) => state.landing.mounted);
  const activeCategory = useSelector((state) => state.landing.activeCategory);
  const dispatch = useDispatch();

  return (
    <div style={{ position: 'relative', zIndex: 10, paddingBottom: '5rem', padding: '0 1rem 5rem' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.5 }}
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800, textAlign: 'center',
            color: 'white', marginBottom: '0.75rem',
          }}
        >
          Popular Categories
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.6 }}
          style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: '3rem' }}
        >
          Find skilled professionals for any task
        </motion.p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
        }} className="cat-grid">
          <style>{`@media(min-width:768px){.cat-grid{grid-template-columns:repeat(4,1fr)!important;}}`}</style>
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.7 + i * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => dispatch(setActiveCategory(cat.name === activeCategory ? null : cat.name))}
              className="glass-card-hover"
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                border: activeCategory === cat.name
                  ? '1px solid rgba(168,85,247,0.6)'
                  : '1px solid rgba(255,255,255,0.12)',
                background: activeCategory === cat.name
                  ? 'rgba(168,85,247,0.1)'
                  : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <div style={{
                width: 56, height: 56, margin: '0 auto 1rem',
                borderRadius: '12px', background: cat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s',
              }}>
                {cat.icon}
              </div>
              <span style={{ color: 'white', fontWeight: 500 }}>{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
