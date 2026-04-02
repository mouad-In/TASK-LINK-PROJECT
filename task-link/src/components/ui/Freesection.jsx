import React, { useState, useEffect } from 'react';
import FreelancerCard from './FreelancerCard';

const FreelancersSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const workers = [
    { id:'2', name:'Sarah Johnson', title:'Plumber & Electrician', rating:4.8, reviews:127, tasks:127, skills:['Plumbing','Electrical'], color:'from-blue-400 to-cyan-500', initials:'SJ', available:true, topRated:true },
    { id:'3', name:'Mike Williams', title:'Cleaning Specialist', rating:4.6, reviews:89, tasks:89, skills:['Cleaning','Organizing'], color:'from-emerald-400 to-teal-500', initials:'MW', available:true, topRated:false },
    { id:'6', name:'Alex Rivera', title:'Carpenter & Painter', rating:4.9, reviews:245, tasks:245, skills:['Carpentry','Painting'], color:'from-amber-400 to-orange-500', initials:'AR', available:true, topRated:true },
    { id:'7', name:'Lisa Chen', title:'Electrician & Installer', rating:4.7, reviews:156, tasks:156, skills:['Electrical','Installation'], color:'from-purple-400 to-violet-500', initials:'LC', available:false, topRated:false },
  ];

  return (
    <div className="relative z-10 w-full bg-gradient-to-b from-white to-gray-50 py-20 px-4 overflow-hidden">
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeOutDown { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(40px); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .fl-card-visible { animation: fadeInUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .fl-card-hidden { opacity:0; transform:translateY(40px); }
        .fl-card-exit { animation: fadeOutDown 0.4s ease-in forwards; }
        .fl-card-inner { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.3s ease; }
        .fl-card-inner:hover { transform: translateY(-8px) scale(1.02); box-shadow:0 20px 60px -10px rgba(168,85,247,0.2),0 8px 24px -8px rgba(0,0,0,0.08); border-color:#e9d5ff; }
        .fl-overlay { opacity:0; transition: opacity 0.35s ease; }
        .fl-card-inner:hover .fl-overlay { opacity:1; }
        .fl-avatar { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); }
        .fl-card-inner:hover .fl-avatar { transform: scale(1.06); }
        .fl-name { transition: color 0.2s ease; }
        .fl-card-inner:hover .fl-name { color:#a855f7; }
        .fl-tag { transition: background 0.2s, color 0.2s, border-color 0.2s; }
        .fl-card-inner:hover .fl-tag { background:#faf5ff; color:#7e22ce; border-color:#e9d5ff; }
        .fl-shimmer-badge { background: linear-gradient(90deg, #fff7, #fff, #fff7); background-size: 200% auto; animation: shimmer 2.5s linear infinite; }
        .fl-arrow { opacity:0; transform:translateX(-6px); transition: opacity 0.3s ease, transform 0.3s ease; }
        .fl-card-inner:hover .fl-arrow { opacity:1; transform:translateX(0); }
      `}</style>

      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className={`text-center mb-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay:'300ms' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-cyan-600">
              Expert Freelancers
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Top rated professionals ready for your next project. Vetted workers with proven track records.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workers.map((worker, i) => (
            <FreelancerCard key={worker.id} worker={worker} index={i} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default FreelancersSection;