import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    avatar: 'SJ',
    rating: 5,
    text: "TaskLink has been a game-changer for me! I found a fantastic cleaner within hours. The platform is so easy to use, and the workers are professional and reliable.",
    gradient: 'linear-gradient(135deg,#a855f7,#06b6d4)',
  },
  {
    name: 'Michael Chen',
    role: 'Small Business Owner',
    avatar: 'MC',
    rating: 5,
    text: "As a busy entrepreneur, I don't have time for errands. TaskLink connects me with reliable helpers who get things done quickly. Highly recommend!",
    gradient: 'linear-gradient(135deg,#06b6d4,#10b981)',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Freelance Worker',
    avatar: 'ER',
    rating: 5,
    text: "I've been working on TaskLink for 6 months and it's been incredible. Flexible hours, great clients, and I've doubled my income. Best decision I ever made!",
    gradient: 'linear-gradient(135deg,#d946ef,#a855f7)',
  },
];

export const TestimonialsSection = () => {
  return (
    <section style={{ padding: '5rem 1rem', background: 'linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Loved by{' '}
            <span className="text-gradient-primary">Thousands</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)', maxWidth: '640px', margin: '0 auto' }}>
            Don't just take our word for it. Here's what our community has to say.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="testi-grid">
          <style>{`@media(min-width:768px){.testi-grid{grid-template-columns:repeat(3,1fr)!important;}}`}</style>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(168,85,247,0.2)' }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px', padding: '2rem',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s',
              }}
            >
              {/* Quote mark */}
              <div style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                fontSize: '3rem', color: 'rgba(168,85,247,0.15)',
                fontFamily: 'Georgia, serif', lineHeight: 1,
              }}>"</div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                {[...Array(t.rating)].map((_, si) => (
                  <svg key={si} width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>

              <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                "{t.text}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: t.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.875rem',
                  fontFamily: 'Syne, sans-serif',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'white' }}>{t.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
