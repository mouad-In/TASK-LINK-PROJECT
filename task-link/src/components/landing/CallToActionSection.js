import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const CallToActionSection = () => {
  return (
    <div style={{ position: 'relative', zIndex: 10, padding: '5rem 1rem' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="cta-grid">
          <style>{`@media(min-width:768px){.cta-grid{grid-template-columns:repeat(2,1fr)!important;}}`}</style>

          {/* For Clients */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'relative', overflow: 'hidden', borderRadius: '24px',
              background: 'linear-gradient(135deg,#a855f7,#06b6d4)',
              padding: 'clamp(2rem,4vw,3rem)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '16px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', fontSize: '1.75rem',
              }}>💼</div>
              <h3 style={{ fontSize: 'clamp(1.5rem,3vw,1.875rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
                Need Work Done?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', lineHeight: 1.7, maxWidth: '420px' }}>
                Post your task and connect with skilled professionals ready to help. Get things done, fast.
              </p>
              <Link
                to="/register?role=client"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 1.75rem',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white', fontWeight: 700, borderRadius: '12px',
                  textDecoration: 'none', fontSize: '1rem',
                  transition: 'background 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                Post a Task
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          </motion.div>

          {/* For Workers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              position: 'relative', overflow: 'hidden', borderRadius: '24px',
              background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: 'clamp(2rem,4vw,3rem)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '16px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', fontSize: '1.75rem',
              }}>👥</div>
              <h3 style={{ fontSize: 'clamp(1.5rem,3vw,1.875rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
                Want to Earn Money?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', lineHeight: 1.7, maxWidth: '420px' }}>
                Join thousands of workers earning flexible income on their own terms. Set your rates, choose your tasks.
              </p>
              <Link
                to="/register?role=worker"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 1.75rem',
                  background: 'linear-gradient(135deg,#a855f7,#06b6d4)',
                  color: 'white', fontWeight: 700, borderRadius: '12px',
                  textDecoration: 'none', fontSize: '1rem',
                  transition: 'opacity 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Become a Worker
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
