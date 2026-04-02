import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../features/auth/authSlice';

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName:  '',
  email:     '',
  phone:     '',
  location:  '',
};

const NAME_FIELDS = [
  { label: 'First Name', name: 'firstName', type: 'text', placeholder: 'John' },
  { label: 'Last Name',  name: 'lastName',  type: 'text', placeholder: 'Doe'  },
];

const CONTACT_FIELDS = [
  { label: 'Email Address', name: 'email',    type: 'email', placeholder: 'john.doe@example.com' },
  { label: 'Phone Number',  name: 'phone',    type: 'tel',   placeholder: '+1 (555) 000-0000'    },
  { label: 'Location',      name: 'location', type: 'text',  placeholder: 'City, Country'        },
];

const validate = (form) => {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim())  errors.lastName  = 'Last name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
};

// ─── Animated Background (Canvas, position: fixed) ───────────────────────────

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let rafId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Soft glowing orbs that drift slowly
    const ORBS = Array.from({ length: 6 }, (_, i) => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     180 + Math.random() * 160,
      dx:    (Math.random() - 0.5) * 0.3,
      dy:    (Math.random() - 0.5) * 0.3,
      hue:   [260, 280, 300, 220, 245, 270][i],
      alpha: 0.07 + Math.random() * 0.06,
    }));

    // Rising sparkle particles
    const SPARKS = Array.from({ length: 45 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     0.8 + Math.random() * 1.8,
      speed: 0.15 + Math.random() * 0.45,
      maxA:  0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    const draw = () => {
      t += 0.008;
      const { width: W, height: H } = canvas;

      // Deep dark base — fixed, does not scroll
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0,   '#f0ecff');
      bg.addColorStop(0.4, '#e8e0fa');
      bg.addColorStop(0.75,'#f3eaf8');
      bg.addColorStop(1,   '#eaf0ff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Drifting orbs
      for (const orb of ORBS) {
        orb.x += orb.dx;
        orb.y += orb.dy;
        if (orb.x < -orb.r)    orb.x = W + orb.r;
        if (orb.x > W + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r)    orb.y = H + orb.r;
        if (orb.y > H + orb.r) orb.y = -orb.r;

        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, `hsla(${orb.hue}, 65%, 72%, ${orb.alpha})`);
        g.addColorStop(1, `hsla(${orb.hue}, 65%, 72%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sparkles
      for (const s of SPARKS) {
        s.y -= s.speed;
        if (s.y < -10) {
          s.y = H + 10;
          s.x = Math.random() * W;
        }
        const alpha = s.maxA * 0.3 * (0.5 + 0.5 * Math.sin(t * 2.5 + s.phase));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = '#8b6ef0';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset:    0,
        width:    '100vw',
        height:   '100vh',
        zIndex:   0,
        display:  'block',
        pointerEvents: 'none',
      }}
    />
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({ firstName, lastName }) => {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="EPro-avatar" aria-label={`Avatar for ${firstName} ${lastName}`}>
      {initials || '?'}
    </div>
  );
};

const FormField = ({ label, name, type = 'text', placeholder, value, onChange, onBlur, error }) => (
  <div className="EPro-field">
    <label htmlFor={`field-${name}`} className="EPro-label">{label}</label>
    <input
      id={`field-${name}`}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete={name === 'email' ? 'email' : 'off'}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : undefined}
      className={`EPro-input${error ? ' EPro-input--error' : ''}`}
    />
    {error && (
      <span id={`${name}-error`} className="EPro-field-error" role="alert">{error}</span>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EditProfile = () => {
  const { user }   = useSelector((state) => state.auth);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const [form,    setForm]    = useState(INITIAL_FORM_STATE);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? '',
        lastName:  user.lastName  ?? '',
        email:     user.email     ?? '',
        phone:     user.phone     ?? '',
        location:  user.location  ?? '',
      });
    }
  }, [user]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleBlur = useCallback((e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched(Object.fromEntries(Object.keys(form).map((k) => [k, true])));
      return;
    }
    setSaving(true);
    try {
      await dispatch(updateUser(form));
      navigate(`/profile/${user._id}`);
    } catch (err) {
      console.error('[EditProfile] Failed to update user:', err);
    } finally {
      setSaving(false);
    }
  };

  const isDirty = Object.keys(INITIAL_FORM_STATE).some(
    (key) => form[key] !== (user?.[key] ?? '')
  );

  return (
    <>
      <style>{STYLES}</style>

      {/* Fixed animated canvas — always fills the viewport */}
      <AnimatedBackground />

      {/* Scrollable page content sits above the canvas */}
      <main className="EPro-root" aria-labelledby="edit-profile-heading">
        <div className="EPro-card">

          <header className="EPro-header">
            <Avatar firstName={form.firstName} lastName={form.lastName} />
            <div>
              <h1 id="edit-profile-heading" className="EPro-title">Edit Profile</h1>
              <p className="EPro-subtitle">Update your personal information</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} noValidate>

            <fieldset className="EPro-fieldset EPro-grid-2">
              <legend className="EPro-legend">Name</legend>
              {NAME_FIELDS.map((field) => (
                <FormField
                  key={field.name} {...field}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched[field.name] ? errors[field.name] : undefined}
                />
              ))}
            </fieldset>

            <fieldset className="EPro-fieldset">
              <legend className="EPro-legend">Contact &amp; Location</legend>
              {CONTACT_FIELDS.map((field) => (
                <FormField
                  key={field.name} {...field}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched[field.name] ? errors[field.name] : undefined}
                />
              ))}
            </fieldset>

            <div className="EPro-actions">
              <button
                type="button"
                className="EPro-btn EPro-btn--secondary"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="EPro-btn EPro-btn--primary"
                disabled={saving || !isDirty}
                aria-busy={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Serif+Display&display=swap');

  /* Page layout — sits above fixed canvas */
  .EPro-root {
    position:        relative;
    z-index:         1;
    min-height:      100vh;
    display:         flex;
    align-items:     center;
    justify-content: center;
    padding:         2.5rem 1rem;
    font-family:     'DM Sans', sans-serif;
  }

  /* Solid white card */
  .EPro-card {
    width:         100%;
    max-width:     500px;
    border-radius: 22px;
    padding:       2.25rem 2rem;
    background:    #ffffff;
    border:        1px solid rgba(180, 160, 255, 0.18);
    box-shadow:
      0 0 0 0.5px rgba(180, 160, 255, 0.12),
      0 10px 50px rgba(0, 0, 0, 0.45);
    animation: EPro-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes EPro-rise {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* Header */
  .EPro-header {
    display:       flex;
    align-items:   center;
    gap:           1rem;
    margin-bottom: 1.75rem;
    padding-bottom:1.5rem;
    border-bottom: 1px solid #ede8ff;
  }

  .EPro-avatar {
    width:           50px;
    height:          50px;
    border-radius:   50%;
    flex-shrink:     0;
    display:         flex;
    align-items:     center;
    justify-content: center;
    font-family:     'DM Serif Display', serif;
    font-size:       1.05rem;
    color:           #fff;
    background:      linear-gradient(135deg, #9b7ef8, #cc7fd4);
    box-shadow:      0 0 0 2px rgba(155, 126, 248, 0.3),
                     0 4px 18px rgba(155, 126, 248, 0.22);
  }

  .EPro-title {
    font-family: 'DM Serif Display', serif;
    font-size:   1.3rem;
    font-weight: 400;
    color:       #1a1530;
    margin:      0 0 0.15rem;
  }

  .EPro-subtitle {
    font-size: 0.79rem;
    color:     #9e96b8;
    margin:    0;
  }

  /* Fieldsets */
  .EPro-fieldset {
    border:  none;
    margin:  0 0 1.35rem;
    padding: 0;
  }

  .EPro-legend {
    display:        block;
    font-size:      0.67rem;
    font-weight:    600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color:          #b8aedd;
    margin-bottom:  0.75rem;
  }

  .EPro-grid-2 {
    display:               grid;
    grid-template-columns: 1fr 1fr;
    column-gap:            0.8rem;
  }

  /* Individual field */
  .EPro-field {
    display:        flex;
    flex-direction: column;
    gap:            0.28rem;
    margin-bottom:  0.85rem;
  }

  .EPro-label {
    font-size:   0.78rem;
    font-weight: 500;
    color:       #4b4070;
  }

  .EPro-input {
    height:        40px;
    padding:       0 0.85rem;
    border:        1px solid #e0d9f5;
    border-radius: 10px;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.855rem;
    color:         #1a1530;
    background:    #faf9ff;
    outline:       none;
    width:         100%;
    box-sizing:    border-box;
    transition:    border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .EPro-input::placeholder { color: #c4bad8; }

  .EPro-input:hover {
    border-color: #c0adf5;
    background:   #fff;
  }

  .EPro-input:focus {
    border-color: #9b7ef8;
    background:   #fff;
    box-shadow:   0 0 0 3px rgba(155, 126, 248, 0.12);
  }

  .EPro-input--error {
    border-color: #e05c5c !important;
    box-shadow:   0 0 0 3px rgba(224, 92, 92, 0.1) !important;
  }

  .EPro-field-error {
    font-size:   0.73rem;
    font-weight: 500;
    color:       #d94f4f;
  }

  /* Action buttons */
  .EPro-actions {
    display:    flex;
    gap:        0.7rem;
    margin-top: 0.4rem;
  }

  .EPro-btn {
    flex:          1;
    height:        42px;
    border-radius: 10px;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.855rem;
    font-weight:   600;
    cursor:        pointer;
    border:        none;
    transition:    opacity 0.18s, transform 0.14s, box-shadow 0.18s, background 0.18s;
  }

  .EPro-btn:active:not(:disabled) { transform: scale(0.97); }
  .EPro-btn:disabled               { opacity: 0.38; cursor: not-allowed; }

  .EPro-btn--secondary {
    background: #f3f0fc;
    color:      #6b5fa0;
    border:     1px solid #e0d9f5;
  }
  .EPro-btn--secondary:hover:not(:disabled) {
    background: #ebe6fa;
  }

  .EPro-btn--primary {
    background: linear-gradient(135deg, #7c5cf5, #ae6ed4);
    color:      #fff;
    box-shadow: 0 2px 16px rgba(124, 92, 245, 0.38);
  }
  .EPro-btn--primary:hover:not(:disabled) {
    opacity:    0.9;
    box-shadow: 0 4px 22px rgba(124, 92, 245, 0.52);
  }

  @media (max-width: 400px) {
    .EPro-grid-2 { grid-template-columns: 1fr; }
    .EPro-card   { padding: 1.75rem 1.25rem; }
  }
`;

export default EditProfile;