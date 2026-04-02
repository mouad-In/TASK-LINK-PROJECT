import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Link2, UserPlus, Users, ArrowRight, Twitter, Linkedin, Instagram, Mail, Users2, Star, Briefcase } from 'lucide-react';
import FreelancersSection from '../components/ui/Freesection';



// ─── Stable random data (generated once, never on re-render) ───────────────
function makeStars(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    w: Math.random() * 3 + 1,
    h: Math.random() * 3 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    dur: Math.random() * 2 + 2,
  }));
}
function makeMoving(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    duration: 30 + Math.random() * 30,
    delay: Math.random() * 5,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    midX1: Math.random() * 100,
    midY1: Math.random() * 100,
    midX2: Math.random() * 100,
    midY2: Math.random() * 100,
  }));
}

const STATIC_STARS = makeStars(35);
const MOVING_STARS = makeMoving(20);
const SHOOT_TOPS   = Array.from({ length: 3 }, () => Math.random() * 50);

export default function TaskLinkLanding() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // rAF ensures browser paints the hidden state first so all transitionDelays fire correctly
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const movingKeyframes = useMemo(() =>
    MOVING_STARS.map(({ id, midX1, midY1, midX2, midY2 }) => `
      @keyframes moveRandom${id} {
        0%   { transform:translate(0,0);                                                           opacity:.6 }
        25%  { transform:translate(${midX1-50}vw,${midY1-50}vh);                                  opacity:1  }
        50%  { transform:translate(${midX2-50}vw,${midY2-50}vh);                                  opacity:.8 }
        75%  { transform:translate(${(midX1+midX2)/2-50}vw,${(midY1+midY2)/2-50}vh);             opacity:1  }
        100% { transform:translate(0,0);                                                           opacity:.6 }
      }`).join(''),
  []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">

      {/* Real <style> tag — style jsx is Next.js-only and silently broken in plain React */}
      <style>{`
        @keyframes shoot {
          0%   { transform:translateX(0) translateY(0); opacity:1 }
          100% { transform:translateX(100vw) translateY(50vh); opacity:0 }
        }
        ${movingKeyframes}
      `}</style>

      {/* Static pulsing stars */}
      <div className="absolute inset-0 pointer-events-none">
        {STATIC_STARS.map(s => (
          <div key={s.id} className="absolute bg-white rounded-full animate-pulse"
            style={{ width:s.w+'px', height:s.h+'px', top:s.top+'%', left:s.left+'%',
                     animationDelay:s.delay+'s', animationDuration:s.dur+'s' }} />
        ))}
      </div>

      {/* Moving glowing stars */}
      <div className="absolute inset-0 pointer-events-none">
        {MOVING_STARS.map(s => (
          <div key={`m-${s.id}`} className="absolute bg-white rounded-full"
            style={{ width:s.size+'px', height:s.size+'px',
                     left:s.startX+'%', top:s.startY+'%',
                     animation:`moveRandom${s.id} ${s.duration}s ease-in-out ${s.delay}s infinite`,
                     boxShadow:'0 0 20px 4px rgba(255,255,255,.8),0 0 30px 6px rgba(255,255,255,.4)' }} />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/40 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-cyan-500/40 rounded-full blur-3xl animate-pulse pointer-events-none"
           style={{ animationDelay:'1s' }} />

      {/* ══════════════════ HERO ══════════════════ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">

        {/* Social proof */}
        <div className={`mb-8 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 -translate-y-10'}`}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 border-2 border-white/40 animate-pulse shadow-lg shadow-purple-500/50" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-white/40 animate-pulse shadow-lg shadow-cyan-500/50" style={{animationDelay:'.2s'}} />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 border-2 border-white/40 animate-pulse shadow-lg shadow-fuchsia-500/50" style={{animationDelay:'.4s'}} />
            </div>
            <span className="text-white/90 font-medium">Joined by 15,000+ professionals</span>
          </div>
        </div>

        {/* Icon */}
        <div className={`mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:rotate-12 transition-all duration-500 ${mounted?'opacity-100 scale-100':'opacity-0 scale-50'}`}
             style={{transitionDelay:'200ms'}}>
          <Link2 className="w-12 h-12 text-white animate-pulse" strokeWidth={2} />
        </div>

        {/* Heading */}
        <h1 className={`text-5xl md:text-7xl font-bold text-center mb-6 max-w-5xl transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
            style={{transitionDelay:'400ms'}}>
          <span className="text-white">Connect your </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-500 animate-pulse">tasks</span>
          <br />
          <span className="text-white">to the </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" style={{animationDelay:'.5s'}}>best talents</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-white/80 text-lg md:text-xl text-center max-w-2xl mb-12 transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
           style={{transitionDelay:'600ms'}}>
          TaskLink revolutionizes how clients find skilled workers. A simple, secure,
          and efficient platform for all your projects.
        </p>

        {/* CTA */}
        <div className={`flex flex-col sm:flex-row gap-4 mb-20 transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
             style={{transitionDelay:'800ms'}}>
          <Link to="/register?role=client"
            className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-white/20 hover:border-fuchsia-400/60 hover:scale-105 hover:shadow-2xl hover:shadow-fuchsia-500/50 flex items-center gap-2">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <UserPlus className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Start as Client</span>
          </Link>
          <Link to="/register?role=worker"
            className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-white/20 hover:border-cyan-400/60 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center gap-2">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Users className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Join as Worker</span>
          </Link>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
          {[
            { value:'15K+', label:'Tasks completed', delay:'1000ms' },
            { value:'8.5K+',label:'Happy clients',   delay:'1100ms' },
            { value:'12K+', label:'Active workers',  delay:'1200ms' },
            { value:'98%',  label:'Satisfaction rate',delay:'1300ms'},
          ].map((stat, i) => (
            <div key={i}
              className={`bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-fuchsia-500/30 hover:-translate-y-2 hover:border-fuchsia-400/40 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
              style={{transitionDelay:stat.delay}}>
              {/* text-white is the fallback; bg-clip-text overrides it where supported */}
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-br from-white via-cyan-200 to-fuchsia-300 bg-clip-text [color:transparent]">
                {stat.value}
              </div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* ══════════ END HERO — white sections follow below, outside the flex container ══════════ */}

      {/* Gradient bridge: dark hero → white section (no hard edge / clipping) */}
      <div className="relative z-10 h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />

      {/* ══════════════════ POPULAR CATEGORIES ══════════════════ */}
      <div className="relative z-10 w-full bg-white pt-8 pb-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
               style={{transitionDelay:'1500ms'}}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-cyan-600">Categories</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the most sought-after skills and find the perfect talent for your project
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon:'💻', name:'Web Development',   count:'2.5K+ tasks', color:'from-blue-500 to-cyan-500'      },
              { icon:'🎨', name:'Graphic Design',    count:'1.8K+ tasks', color:'from-fuchsia-500 to-pink-500'   },
              { icon:'📱', name:'Mobile Apps',       count:'1.2K+ tasks', color:'from-purple-500 to-violet-500'  },
              { icon:'✍️', name:'Content Writing',   count:'2.1K+ tasks', color:'from-amber-500 to-orange-500'   },
              { icon:'📊', name:'Data Analysis',     count:'950+ tasks',  color:'from-emerald-500 to-teal-500'   },
              { icon:'🎥', name:'Video Editing',     count:'1.5K+ tasks', color:'from-red-500 to-rose-500'       },
              { icon:'🔧', name:'Technical Support', count:'800+ tasks',  color:'from-slate-500 to-zinc-500'     },
              { icon:'📈', name:'Digital Marketing', count:'1.9K+ tasks', color:'from-violet-500 to-fuchsia-500' },
            ].map((cat, i) => (
              <div key={i}
                className={`group bg-gray-50 hover:bg-white rounded-2xl p-4 md:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
                style={{transitionDelay:`${1600+i*100}ms`}}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-1 group-hover:text-fuchsia-600 transition-colors">{cat.name}</h3>
                <p className="text-gray-500 text-sm">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <div className="relative z-10 w-full bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
               style={{transitionDelay:'1800ms'}}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-cyan-600">Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Get started in minutes. Our simple process connects you with the right talent</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step:'01', title:'Post Your Task',  icon:'📝', color:'from-blue-500 to-cyan-500',     desc:'Describe your project, set your budget, and specify the skills you need.' },
              { step:'02', title:'Get Matched',     icon:'🤝', color:'from-fuchsia-500 to-pink-500',  desc:'Our algorithm connects you with qualified workers who fit your requirements.' },
              { step:'03', title:'Collaborate',     icon:'💬', color:'from-purple-500 to-violet-500', desc:'Work together seamlessly with our built-in messaging and tools.' },
              { step:'04', title:'Complete & Pay',  icon:'✅', color:'from-emerald-500 to-teal-500',  desc:'Release payment securely once the work is done to your satisfaction.' },
            ].map((item, i) => (
              <div key={i}
                className={`relative group ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
                style={{transitionDelay:`${1900+i*150}ms`,transition:'all 0.5s ease'}}>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className="text-6xl font-bold text-gray-100 absolute top-4 right-6 -z-10 group-hover:text-gray-200 transition-colors select-none">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  {i < 3 && <ArrowRight className="w-6 h-6 text-gray-300 absolute bottom-8 right-8 group-hover:text-fuchsia-500 group-hover:translate-x-2 transition-all duration-300" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <div className="relative z-10 w-full bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
               style={{transitionDelay:'2000ms'}}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-cyan-600">Users Say</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hear from clients and workers who have transformed their experience with TaskLink</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name:'Sarah Johnson',   role:'Client', image:'👩‍💼', rating:5, content:"TaskLink made it incredibly easy to find skilled workers for my project. The platform is intuitive and the quality of talent is outstanding!" },
              { name:'Michael Chen',    role:'Worker', image:'👨‍💻', rating:5, content:"As a freelancer, TaskLink has been a game-changer. I've connected with amazing clients and grown my business significantly." },
              { name:'Emily Rodriguez', role:'Client', image:'👩‍🎨', rating:5, content:"The best platform I've used for hiring help. Secure payments, great communication tools, and professional workers everywhere." },
            ].map((t, i) => (
              <div key={i}
                className={`bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
                style={{transitionDelay:`${2100+i*150}ms`}}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_,j)=><span key={j} className="text-amber-400 text-lg">⭐</span>)}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-xl">{t.image}</div>
                  <div>
                    <h4 className="text-gray-900 font-semibold">{t.name}</h4>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FreelancersSection />
      

      {/* ══════════════════ CTA ══════════════════ */}
      <div className="relative z-10 w-full bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-10'}`}
               style={{transitionDelay:'2600ms'}}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of clients and workers already connected on TaskLink.
              Post your first task or start earning today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=client"
                className="group relative overflow-hidden bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-fuchsia-500/50 flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Start as Client</span>
              </Link>
              <Link to="/register?role=worker"
                className="group relative overflow-hidden bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2">
                <Users className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Join as Worker</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ FOOTER ══════════════════ */}
       <footer className="bg-slate-950 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">TaskLink</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Revolutionizing how clients find skilled workers. Connect with the best talent for your projects.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['About Us', 'How It Works', 'Categories', 'Pricing', 'FAQ'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Users */}
            <div>
              <h4 className="text-lg font-semibold mb-6">For Users</h4>
              <ul className="space-y-3">
                {['Post a Task', 'Browse Workers', 'Dashboard', 'Messages', 'Help Center'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-fuchsia-400 mt-0.5" />
                  <span className="text-gray-400">support@tasklink.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-fuchsia-400 mt-0.5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <span className="text-gray-400">123 Market Street,<br />San Francisco, CA 94102</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} TaskLink. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link, i) => (
                <a key={i} href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      {/* Chat button */}
      <button
        className={`fixed bottom-8 right-8 bg-black hover:bg-gray-900 text-white px-5 py-3 rounded-full font-semibold shadow-2xl shadow-emerald-500/60 transition-all duration-500 hover:scale-110 hover:shadow-emerald-400/80 flex items-center gap-3 z-20 border border-emerald-500/30 ${mounted?'opacity-100 translate-x-0':'opacity-0 translate-x-10'}`}
        style={{transitionDelay:'1400ms'}}>
        <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
        </svg>
        <span>Talk with Us</span>
      </button>

      {/* Shooting stars */}
      {mounted && SHOOT_TOPS.map((top, i) => (
        <div key={`shoot-${i}`} className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
          style={{ top:top+'%', left:'-10px',
                   animation:`shoot ${3+i*0.7}s linear ${i*4}s infinite`,
                   boxShadow:'0 0 10px 2px rgba(255,255,255,.8)' }} />
      ))}
    </div>
  );
}