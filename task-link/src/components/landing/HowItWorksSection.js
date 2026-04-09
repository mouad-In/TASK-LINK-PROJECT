import { motion } from 'framer-motion';

const steps = [
  {
    icon: '🔍',
    title: 'Post Your Task',
    description: 'Describe what you need done. Set your budget and deadline.',
    color: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
  },
  {
    icon: '👥',
    title: 'Connect with Pros',
    description: 'Review profiles, ratings, and quotes from skilled workers.',
    color: 'linear-gradient(135deg,#8b5cf6,#d946ef)',
  },
  {
    icon: '✅',
    title: 'Get It Done',
    description: 'Chat, schedule, and track progress on your task in real-time.',
    color: 'linear-gradient(135deg,#22c55e,#10b981)',
  },
  {
    icon: '💰',
    title: 'Pay & Review',
    description: 'Secure payment after completion. Rate your experience.',
    color: 'linear-gradient(135deg,#f59e0b,#f97316)',
  },
];

export const HowItWorksSection = () => {

  return (
    <div style={{ position: 'relative', zIndex: 10, padding: '5rem 1rem' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.125rem' }}
          >
            Get any task done in four simple steps
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: '1.5rem' }} className="steps-grid">
          <style>{`
            @media(min-width:768px){.steps-grid{grid-template-columns:repeat(2,1fr)!important;}}
            @media(min-width:1024px){.steps-grid{grid-template-columns:repeat(4,1fr)!important;}}
          `}</style>
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card-hover"
              style={{ padding: '1.5rem', textAlign: 'center', position: 'relative' }}
            >
              {/* Step number */}
              <div style={{
                position: 'absolute', top: -12, left: -12,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.875rem', color: 'white',
                fontFamily: 'Syne, sans-serif',
              }}>
                {i + 1}
              </div>
              <div style={{
                width: 64, height: 64, margin: '0 auto 1rem',
                borderRadius: '16px', background: step.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                {step.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                {step.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
              transition: 'color 0.3s', fontWeight: 500,
            }}
            whileHover={{ color: 'rgba(255,255,255,1)' }}
          >
            <span>Ready to get started?</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
