import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  User, Mail, Phone, MapPin, Star,
  Briefcase, Calendar, Edit, MessageSquare
} from 'lucide-react';
import { fetchUserById } from '../features/users/usersSlice';
import { fetchReviewsByUser } from '../features/reviews/reviewsSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (u) =>
  `${u?.firstName?.[0] ?? ''}${u?.lastName?.[0] ?? ''}`.toUpperCase() || '?';

const StarRow = ({ rating }) =>
  Array.from({ length: 5 }, (_, i) => (
    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none">
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={i < Math.floor(rating) ? '#f59e0b' : '#e5e7eb'}
        stroke={i < Math.floor(rating) ? '#f59e0b' : '#e5e7eb'}
        strokeWidth="1"
      />
    </svg>
  ));

// ─── Main Component ───────────────────────────────────────────────────────────

const Profile = () => {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const { reviews } = useSelector((state) => state.reviews);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      dispatch(fetchReviewsByUser(id));
    }
  }, [dispatch, id]);

  const isOwnProfile  = loggedInUser?.id === currentUser?.id;
  const userReviews   = reviews.filter((r) => r.revieweeId === id);

  if (!currentUser) {
    return (
      <div className="Pro-spinner-wrap">
        <div className="Pro-spinner" />
      </div>
    );
  }

  return (
    <>
      <style>{STYLES}</style>

      <div className="Pro-page">

        {/* ── Header Card ── */}
        <div className="Pro-card Pro-header-card">

          {/* Avatar */}
          <div className="Pro-avatar">
            {initials(currentUser)}
          </div>

          {/* Main info */}
          <div className="Pro-header-info">
            <div className="Pro-name-row">
              <h1 className="Pro-name">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <span className={`Pro-badge Pro-badge--${currentUser.role}`}>
                {currentUser.role}
              </span>
            </div>

            <div className="Pro-meta-row">
              <span className="Pro-meta-item">
                <Mail size={13} /> {currentUser.email}
              </span>
              {currentUser.phone && (
                <span className="Pro-meta-item">
                  <Phone size={13} /> {currentUser.phone}
                </span>
              )}
              {currentUser.location && (
                <span className="Pro-meta-item">
                  <MapPin size={13} /> {currentUser.location}
                </span>
              )}
            </div>

            <div className="Pro-stats-row">
              <div className="Pro-stat">
                <StarRow rating={currentUser.rating || 0} />
                <span className="Pro-stat-val">{currentUser.rating || 'N/A'}</span>
                <span className="Pro-stat-sub">({userReviews.length} reviews)</span>
              </div>
              {currentUser.role === 'worker' && (
                <div className="Pro-stat">
                  <Briefcase size={14} className="Pro-stat-icon" />
                  <span className="Pro-stat-val">{currentUser.completedTasks || 0}</span>
                  <span className="Pro-stat-sub">tasks completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="Pro-actions">
            {isOwnProfile ? (
              <button
                className="Pro-btn Pro-btn--primary"
                onClick={() => navigate(`/edit-profile/${id}`)}
              >
                <Edit size={15} /> Edit Profile
              </button>
            ) : (
              <button className="Pro-btn Pro-btn--primary">
                <MessageSquare size={15} /> Message
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="Pro-tabs">
          {['about', 'reviews'].map((tab) => (
            <button
              key={tab}
              className={`Pro-tab${activeTab === tab ? ' Pro-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'about' ? 'About' : `Reviews (${userReviews.length})`}
            </button>
          ))}
        </div>

        {/* ── About Tab ── */}
        {activeTab === 'about' && (
          <div className="Pro-grid-2">

            <div className="Pro-card">
              <h2 className="Pro-card-title">Personal Information</h2>
              <div className="Pro-info-list">
                {[
                  { icon: <User size={15} />,     val: `${currentUser.firstName} ${currentUser.lastName}` },
                  { icon: <Mail size={15} />,     val: currentUser.email },
                  currentUser.phone    && { icon: <Phone size={15} />,    val: currentUser.phone },
                  currentUser.location && { icon: <MapPin size={15} />,   val: currentUser.location },
                  currentUser.createdAt && {
                    icon: <Calendar size={15} />,
                    val: `Joined ${new Date(currentUser.createdAt).toLocaleDateString()}`,
                  },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="Pro-info-row">
                    <span className="Pro-info-icon">{item.icon}</span>
                    <span className="Pro-info-val">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {currentUser.role === 'worker' && (
              <div className="Pro-card">
                <h2 className="Pro-card-title">Skills</h2>
                {currentUser.skills?.length > 0 ? (
                  <div className="Pro-skills">
                    {currentUser.skills.map((skill, i) => (
                      <span key={i} className="Pro-skill-tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="Pro-empty-text">No skills added yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {activeTab === 'reviews' && (
          <div className="Pro-reviews-list">
            {userReviews.length === 0 ? (
              <div className="Pro-card Pro-empty-state">
                <Star size={40} className="Pro-empty-icon" />
                <h3 className="Pro-empty-title">No reviews yet</h3>
                <p className="Pro-empty-text">This user hasn't received any reviews yet.</p>
              </div>
            ) : (
              userReviews.map((review) => (
                <div key={review.id} className="Pro-card Pro-review-card">
                  <div className="Pro-review-avatar">R</div>
                  <div className="Pro-review-body">
                    <div className="Pro-review-header">
                      <div>
                        <p className="Pro-review-author">Reviewer #{review.reviewerId}</p>
                        <div className="Pro-review-stars">
                          <StarRow rating={review.rating} />
                          <span className="Pro-stat-sub">{review.rating}/5</span>
                        </div>
                      </div>
                      <span className="Pro-review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="Pro-review-comment">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Serif+Display&display=swap');

  /* ── Page ── */
  .Pro-page {
    font-family: 'DM Sans', sans-serif;
    max-width:   860px;
    margin:      0 auto;
    padding:     2rem 1rem 3rem;
    display:     flex;
    flex-direction: column;
    gap:         1.25rem;
    animation:   Pro-fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes Pro-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  /* ── Card ── */
  .Pro-card {
    background:    #fff;
    border:        1px solid #ede8ff;
    border-radius: 18px;
    padding:       1.75rem;
    box-shadow:    0 2px 16px rgba(124, 92, 245, 0.07);
  }

  .Pro-card-title {
    font-family:   'DM Serif Display', serif;
    font-size:     1rem;
    font-weight:   400;
    color:         #1a1530;
    margin:        0 0 1.25rem;
    padding-bottom:.85rem;
    border-bottom: 1px solid #f0ecff;
  }

  /* ── Header Card ── */
  .Pro-header-card {
    display:     flex;
    align-items: flex-start;
    gap:         1.5rem;
    flex-wrap:   wrap;
  }

  .Pro-avatar {
    width:           80px;
    height:          80px;
    border-radius:   50%;
    flex-shrink:     0;
    display:         flex;
    align-items:     center;
    justify-content: center;
    font-family:     'DM Serif Display', serif;
    font-size:       1.6rem;
    color:           #fff;
    background:      linear-gradient(135deg, #9b7ef8, #cc7fd4);
    box-shadow:      0 0 0 3px rgba(155, 126, 248, 0.22),
                     0 4px 20px rgba(155, 126, 248, 0.2);
  }

  .Pro-header-info  { flex: 1; min-width: 200px; }

  .Pro-name-row {
    display:     flex;
    align-items: center;
    gap:         0.65rem;
    flex-wrap:   wrap;
    margin-bottom: 0.55rem;
  }

  .Pro-name {
    font-family: 'DM Serif Display', serif;
    font-size:   1.55rem;
    font-weight: 400;
    color:       #1a1530;
    margin:      0;
  }

  /* Role badges */
  .Pro-badge {
    display:       inline-flex;
    align-items:   center;
    height:        22px;
    padding:       0 0.65rem;
    border-radius: 99px;
    font-size:     0.7rem;
    font-weight:   600;
    letter-spacing:.04em;
    text-transform: uppercase;
  }
  .Pro-badge--client  { background: #ede8ff; color: #6b48e8; }
  .Pro-badge--worker  { background: #fce7f3; color: #be185d; }
  .Pro-badge--default { background: #f3f4f6; color: #6b7280; }

  /* Meta row */
  .Pro-meta-row {
    display:   flex;
    flex-wrap: wrap;
    gap:       0.5rem 1.25rem;
    margin-bottom: 0.85rem;
  }

  .Pro-meta-item {
    display:     inline-flex;
    align-items: center;
    gap:         5px;
    font-size:   0.82rem;
    color:       #7c6fa0;
  }

  /* Stats */
  .Pro-stats-row {
    display:   flex;
    flex-wrap: wrap;
    gap:       1rem;
  }

  .Pro-stat {
    display:     flex;
    align-items: center;
    gap:         5px;
  }

  .Pro-stat-icon { color: #9b7ef8; }
  .Pro-stat-val  { font-size: 0.88rem; font-weight: 600; color: #1a1530; }
  .Pro-stat-sub  { font-size: 0.8rem; color: #9e96b8; }

  /* Actions */
  .Pro-actions { margin-left: auto; padding-top: 4px; }

  /* ── Buttons ── */
  .Pro-btn {
    display:       inline-flex;
    align-items:   center;
    gap:           7px;
    height:        40px;
    padding:       0 1.15rem;
    border:        none;
    border-radius: 10px;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.855rem;
    font-weight:   600;
    cursor:        pointer;
    white-space:   nowrap;
    transition:    opacity 0.18s, transform 0.14s, box-shadow 0.18s;
  }

  .Pro-btn--primary {
    background: linear-gradient(135deg, #7c5cf5, #ae6ed4);
    color:      #fff;
    box-shadow: 0 2px 14px rgba(124, 92, 245, 0.32);
  }
  .Pro-btn--primary:hover  { opacity: 0.9; box-shadow: 0 4px 20px rgba(124,92,245,0.48); }
  .Pro-btn--primary:active { transform: scale(0.97); }

  /* ── Tabs ── */
  .Pro-tabs {
    display:       flex;
    gap:           0;
    border-bottom: 1.5px solid #ede8ff;
  }

  .Pro-tab {
    padding:       0.6rem 1.4rem;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.875rem;
    font-weight:   500;
    color:         #9e96b8;
    background:    transparent;
    border:        none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1.5px;
    cursor:        pointer;
    transition:    color 0.18s, border-color 0.18s;
  }
  .Pro-tab:hover        { color: #7c5cf5; }
  .Pro-tab--active      { color: #7c5cf5; border-bottom-color: #7c5cf5; font-weight: 600; }

  /* ── About grid ── */
  .Pro-grid-2 {
    display:               grid;
    grid-template-columns: 1fr 1fr;
    gap:                   1.25rem;
  }

  @media (max-width: 600px) {
    .Pro-grid-2 { grid-template-columns: 1fr; }
  }

  /* ── Info list ── */
  .Pro-info-list { display: flex; flex-direction: column; gap: 0.75rem; }

  .Pro-info-row {
    display:     flex;
    align-items: center;
    gap:         0.65rem;
  }

  .Pro-info-icon { color: #9b7ef8; flex-shrink: 0; }
  .Pro-info-val  { font-size: 0.875rem; color: #3d3460; }

  /* ── Skills ── */
  .Pro-skills { display: flex; flex-wrap: wrap; gap: 0.5rem; }

  .Pro-skill-tag {
    display:       inline-flex;
    align-items:   center;
    height:        28px;
    padding:       0 0.75rem;
    border-radius: 99px;
    font-size:     0.78rem;
    font-weight:   500;
    background:    #ede8ff;
    color:         #6b48e8;
    border:        1px solid #ddd5ff;
  }

  /* ── Reviews ── */
  .Pro-reviews-list { display: flex; flex-direction: column; gap: 1rem; }

  .Pro-empty-state {
    display:        flex;
    flex-direction: column;
    align-items:    center;
    padding:        3rem 1.5rem;
    text-align:     center;
  }

  .Pro-empty-icon  { color: #d4cff0; margin-bottom: 1rem; }
  .Pro-empty-title { font-family: 'DM Serif Display', serif; font-weight: 400; font-size: 1.1rem; color: #1a1530; margin: 0 0 0.35rem; }
  .Pro-empty-text  { font-size: 0.85rem; color: #9e96b8; margin: 0; }

  .Pro-review-card { display: flex; gap: 1rem; align-items: flex-start; }

  .Pro-review-avatar {
    width:           42px;
    height:          42px;
    border-radius:   50%;
    flex-shrink:     0;
    display:         flex;
    align-items:     center;
    justify-content: center;
    font-family:     'DM Serif Display', serif;
    font-size:       1rem;
    color:           #6b48e8;
    background:      #ede8ff;
    border:          1px solid #ddd5ff;
  }

  .Pro-review-body    { flex: 1; }

  .Pro-review-header {
    display:         flex;
    justify-content: space-between;
    align-items:     flex-start;
    margin-bottom:   0.5rem;
  }

  .Pro-review-author  { font-size: 0.875rem; font-weight: 600; color: #1a1530; margin: 0 0 0.25rem; }
  .Pro-review-stars   { display: flex; align-items: center; gap: 4px; }
  .Pro-review-date    { font-size: 0.78rem; color: #b8aedd; }
  .Pro-review-comment { font-size: 0.855rem; color: #4b4070; line-height: 1.6; margin: 0; }

  /* ── Spinner ── */
  .Pro-spinner-wrap {
    display:         flex;
    align-items:     center;
    justify-content: center;
    height:          16rem;
  }

  .Pro-spinner {
    width:        44px;
    height:       44px;
    border:       3px solid #ede8ff;
    border-top:   3px solid #7c5cf5;
    border-radius:50%;
    animation:    Pro-spin 0.75s linear infinite;
  }

  @keyframes Pro-spin {
    to { transform: rotate(360deg); }
  }
`;

export default Profile;