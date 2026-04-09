import { Link } from 'react-router-dom';

const footerLinks = {
  platform: [
    { name: 'How it Works', href: '#' },
    { name: 'For Clients', href: '/register?role=client' },
    { name: 'For Workers', href: '/register?role=worker' },
    { name: 'Pricing', href: '#' },
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Press', href: '#' },
  ],
  support: [
    { name: 'Help Center', href: '#' },
    { name: 'Safety', href: '#' },
    { name: 'Contact Us', href: '#' },
    { name: 'FAQs', href: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
  ],
};

const socialLinks = [
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
];

export const FooterSection = () => {
  return (
    <footer style={{
      position: 'relative', zIndex: 10,
      background: '#020617',
      borderTop: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '4rem 1rem' }}>
        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
          marginBottom: '3rem',
        }} className="footer-grid">
          <style>{`
            @media(min-width: 768px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr 1fr !important; } }
          `}</style>

          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }} className="footer-brand">
            <style>{`@media(min-width:768px){.footer-brand{grid-column:span 1 !important;}}`}</style>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', textDecoration: 'none' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '12px',
                background: 'linear-gradient(135deg,#a855f7,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif' }}>
                TaskLink
              </span>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', maxWidth: '280px', lineHeight: 1.7, fontSize: '0.9rem' }}>
              Connect your tasks to the best talents. A simple, secure, and efficient platform for all your projects.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '✉️', text: 'support@tasklink.com' },
                { icon: '📞', text: '+1 (555) 123-4567' },
                { icon: '📍', text: 'San Francisco, CA' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: 'Platform', links: footerLinks.platform },
            { title: 'Company', links: footerLinks.company },
            { title: 'Support', links: footerLinks.support },
            { title: 'Legal', links: footerLinks.legal },
          ].map((col) => (
            <div key={col.title}>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontFamily: 'Syne, sans-serif', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }} className="footer-bottom">
          <style>{`@media(min-width:768px){.footer-bottom{flex-direction:row !important; justify-content:space-between !important;}}`}</style>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} TaskLink. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(168,85,247,0.2)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
