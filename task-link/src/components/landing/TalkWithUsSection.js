import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const contactOptions = [
  {
    icon: '💬',
    title: 'Live Chat',
    description: 'Chat with our support team',
    link: '/talk-with-us',
    gradient: 'linear-gradient(135deg,#10b981,#06b6d4)',
  },
  {
    icon: '✉️',
    title: 'Email Us',
    description: 'Get help via email',
    link: '/talk-with-us',
    gradient: 'linear-gradient(135deg,#d946ef,#8b5cf6)',
  },
  {
    icon: '🎧',
    title: 'Phone Support',
    description: 'Call for immediate help',
    link: '/talk-with-us',
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
  },
];

export const TalkWithUsSection = () => {
  return (
    <div style={{ position: 'relative', zIndex: 10, padding: '4rem 1rem' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-card"
          style={{ padding: 'clamp(2rem,5vw,3rem)', textAlign: 'center', borderRadius: '24px' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg,#10b981,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '1.75rem',
          }}>
            🎧
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Need Help?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '640px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Our support team is here to assist you. Reach out anytime and we'll get back to you within 24 hours.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: '1rem', marginBottom: '2rem' }} className="contact-grid">
            <style>{`@media(min-width:768px){.contact-grid{grid-template-columns:repeat(3,1fr)!important;}}`}</style>
            {contactOptions.map((opt, i) => (
              <motion.div
                key={opt.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.03 }}
              >
                <Link
                  to={opt.link}
                  style={{
                    display: 'block',
                    padding: '1rem', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    textDecoration: 'none', transition: 'background 0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '8px',
                    background: opt.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.75rem', fontSize: '1.25rem',
                  }}>
                    {opt.icon}
                  </div>
                  <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '0.25rem' }}>{opt.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{opt.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <Link
            to="/talk-with-us"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg,#10b981,#06b6d4)',
              color: 'white', fontWeight: 600, borderRadius: '12px',
              textDecoration: 'none', transition: 'opacity 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Contact Support
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
