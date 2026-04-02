import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FreelancerCard = ({ worker, index }) => {
  const ref = useRef(null);
  const [state, setState] = useState('hidden'); // hidden | visible | exit

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('visible');
        } else {
          setState(prev => (prev === 'visible' ? 'exit' : 'hidden'));
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animationDelay = `${index * 120}ms`;

  return (
    <div
      ref={ref}
      className={`fl-card-${state}`}
      style={{ animationDelay: state === 'visible' ? animationDelay : '0ms' }}
    >
      <Link to={`/profile/${worker.id}`}>
        <div className="fl-card-inner bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
          {/* Avatar */}
          <div className={`relative w-full h-44 bg-gradient-to-br ${worker.color} overflow-hidden`}>
            <div className="fl-avatar w-full h-full flex items-center justify-center">
              <span className="text-white font-bold text-5xl select-none opacity-90">
                {worker.initials}
              </span>
            </div>
            <div className="fl-overlay absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {worker.topRated && (
              <span className="fl-shimmer-badge absolute top-3 right-3 text-purple-700 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-purple-100">
                ★ Top Rated
              </span>
            )}
            <div className="fl-arrow absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs font-medium">
              View profile
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4">
            <div className="mb-3">
              <h3 className="fl-name text-base font-semibold text-gray-900 leading-tight">{worker.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{worker.title}</p>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(star => (
                <svg key={star} viewBox="0 0 12 12" className={`w-3 h-3 transition-transform duration-200 ${star <= Math.floor(worker.rating) ? 'fill-amber-400' : 'fill-gray-200'}`}>
                  <polygon points="6,1 7.5,4.5 11,4.5 8.5,7 9.5,11 6,9 2.5,11 3.5,7 1,4.5 4.5,4.5"/>
                </svg>
              ))}
              <span className="text-xs text-gray-500 ml-1">{worker.rating} ({worker.reviews})</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {worker.skills.map((skill, k) => (
                <span key={k} className="fl-tag text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{skill}</span>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                <span className="font-semibold text-gray-800">{worker.tasks}</span> tasks done
              </span>
              <span className={`text-xs font-medium flex items-center gap-1 ${worker.available ? 'text-emerald-600' : 'text-gray-400'}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${worker.available ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                {worker.available ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FreelancerCard;