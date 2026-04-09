import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Link2, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Clock, 
  Send,
  Headphones,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Twitter,
  Facebook,
  Linkedin,
  Instagram
} from 'lucide-react';
import { CosmicBackground } from '@/components/landing/CosmicBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  updateFormField,
  resetForm,
  setSubmitted,
  setLoading,
  setError,
  addToHistory,
  setActiveOption,
  setSelectedCategory,
  updateFaqHelpfulness,
} from '@/features/contact/contactSlice';

const TalkWithUs = () => {
  const dispatch = useDispatch();
  const { formData, submitted, loading, error } = useSelector((state) => state.contactForm);
  const { options } = useSelector((state) => state.supportOptions);
  const { faqs, searchQuery, selectedCategory } = useSelector((state) => state.faq);
  const { contactInfo, socialMedia } = useSelector((state) => state.contactInfo);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      dispatch(addToHistory(formData));
      dispatch(setSubmitted(true));
      dispatch(setError(null));
      
      setTimeout(() => {
        dispatch(setSubmitted(false));
        dispatch(resetForm());
        dispatch(setLoading(false));
      }, 3000);
    } catch (err) {
      dispatch(setError('Failed to send message. Please try again.'));
      dispatch(setLoading(false));
    }
  };

  const handleChange = (e) => {
    dispatch(updateFormField({
      field: e.target.name,
      value: e.target.value,
    }));
  };

  const handleFaqHelpful = (faqId, helpful) => {
    dispatch(updateFaqHelpfulness({ id: faqId, helpful }));
  };

  const handleSupportOptionClick = (optionId) => {
    dispatch(setActiveOption(optionId));
    
    // Handle different support options
    switch(optionId) {
      case 'live-chat':
        // Open live chat widget
        window.open('https://tawk.to/chat', '_blank');
        break;
      case 'email-support':
        // Scroll to contact form
        document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'phone-support':
        // Initiate phone call
        window.location.href = 'tel:+15551234567';
        break;
      default:
        break;
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      MessageCircle: MessageCircle,
      Mail: Mail,
      Phone: Phone,
      MapPin: MapPin,
      Clock: Clock,
      Twitter: Twitter,
      Facebook: Facebook,
      Linkedin: Linkedin,
      Instagram: Instagram,
    };
    return icons[iconName] || MessageCircle;
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      <CosmicBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="glass-card p-2 group-hover:rotate-12 transition-transform duration-300">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TaskLink</span>
        </Link>
        <Link 
          to="/" 
          className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <div className={`relative z-10 max-w-6xl mx-auto px-4 py-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 mb-6 animate-pulse">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Talk with Us
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            We're here to help! Reach out to our support team anytime. 
            We typically respond within 24 hours.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {options.map((option, index) => {
            const IconComponent = getIconComponent(option.icon);
            return (
              <div 
                key={option.id}
                className="glass-card border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 group cursor-pointer"
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => handleSupportOptionClick(option.id)}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                <p className="text-sm text-white/60 mb-4">{option.description}</p>
                {option.detail && (
                  <p className="text-sm font-medium text-emerald-400 mb-4">{option.detail}</p>
                )}
                <Button 
                  className={`w-full bg-gradient-to-r ${option.gradient} border-0 text-white hover:opacity-90`}
                  disabled={!option.available}
                >
                  {option.action}
                </Button>
                {option.available && (
                  <p className="text-xs text-emerald-400 mt-3 flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Available now
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div id="contact-form" className="glass-card border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-xl text-white flex items-center gap-2 font-semibold">
                <Send className="w-5 h-5 text-emerald-400" />
                Send us a Message
              </h2>
            </div>
            <div>
              {submitted ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-white/60">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/80">Your Name</Label>
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        disabled={loading}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80">Email Address</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white/80">Subject</Label>
                    <Input 
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white/80">Message</Label>
                    <Textarea 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about what you need help with..."
                      rows={5}
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white border-0"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="glass-card border border-white/10 rounded-2xl p-6">
              <div className="mb-6">
                <h2 className="text-xl text-white flex items-center gap-2 font-semibold">
                  <MapPin className="w-5 h-5 text-fuchsia-400" />
                  Contact Information
                </h2>
              </div>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const IconComponent = getIconComponent(item.icon);
                  return (
                    <div key={item.label} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} shrink-0 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">{item.label}</p>
                        <p className="text-white font-medium">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Social Media Links */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-white/60 mb-3">Follow us on social media</p>
                <div className="flex gap-3">
                  {Object.entries(socialMedia).map(([platform, url]) => {
                    const IconComponent = getIconComponent(platform);
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="glass-card border border-white/10 rounded-2xl p-6">
              <div className="mb-6">
                <h2 className="text-xl text-white flex items-center gap-2 font-semibold">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Frequently Asked Questions
                </h2>
              </div>
              
              {/* FAQ Filters */}
              <div className="mb-4 flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => dispatch(setSelectedCategory(category))}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              
              <Accordion type="single" collapsible className="text-white">
                {filteredFaqs.map((faq) => (
                  <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border-white/10">
                    <AccordionTrigger className="text-white hover:text-white/80">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/60">
                      <p className="mb-3">{faq.answer}</p>
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/10">
                        <span className="text-xs text-white/40">Was this helpful?</span>
                        <button
                          onClick={() => handleFaqHelpful(faq.id, true)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          👍 Yes ({faq.helpful})
                        </button>
                        <button
                          onClick={() => handleFaqHelpful(faq.id, false)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          👎 No ({faq.notHelpful})
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFaqs.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  No FAQs found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" />
      
      {/* Add custom animation keyframes */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TalkWithUs;