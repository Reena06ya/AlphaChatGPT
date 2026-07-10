import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Terminal, Compass, Search, 
  Mic, Globe, History, ArrowRight, 
  CheckCircle, FileText, Menu, X 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: <Bot className="w-6 h-6 text-primary" />, title: "AI Chat", desc: "Interactive streaming dialogue with contextual long-term memory." },
    { icon: <Terminal className="w-6 h-6 text-primary" />, title: "Code Generation", desc: "Generate, run, and modify code with clean syntax highlighting." },
    { icon: <Compass className="w-6 h-6 text-primary" />, title: "Image Understanding", desc: "Upload and analyze images to extract text or insights." },
    { icon: <FileText className="w-6 h-6 text-primary" />, title: "Document Analysis", desc: "Summarize PDFs, extract key themes, and query text structures." },
    { icon: <Search className="w-6 h-6 text-primary" />, title: "Smart Search", desc: "Synthesize web knowledge with comprehensive context citation." },
    { icon: <Mic className="w-6 h-6 text-primary" />, title: "Voice Support", desc: "Dictate prompts using integrated speech-to-text inputs." },
    { icon: <Globe className="w-6 h-6 text-primary" />, title: "Multi Language", desc: "Translate and draft text in 80+ global languages." },
    { icon: <History className="w-6 h-6 text-primary" />, title: "Chat History", desc: "Store, pin, categorize into folders, and export conversations." },
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for exploring basic capabilities.",
      features: ["Access to AlphaGPT-Lite", "50 messages per day", "Standard response speed", "File attachments (max 2MB)", "Basic chat history"],
      buttonText: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      price: "$20",
      period: "per month",
      desc: "Ideal for power users, developers and writers.",
      features: ["Access to AlphaGPT-4 & Coder", "Unlimited message volume", "Ultra-fast response speeds", "Advanced document/image processing (max 10MB)", "Folder system & Pinned chats", "Dedicated technical support"],
      buttonText: "Upgrade to Pro",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "$100",
      period: "per month",
      desc: "Tailored to high-scale business needs.",
      features: ["Everything in Pro plan", "Access to fine-tuned custom models", "Custom API key integration", "Admin control & analytics panels", "SLA uptime guarantees", "Priority feedback loop"],
      buttonText: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-darkBg text-gray-300 overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-darkBg/80 backdrop-blur-md border-b border-darkBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Alpha<span className="text-primary font-extrabold bg-clip-text">ChatGPT</span>
              </span>
            </div>

            {/* Navigation links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-primary transition-colors text-sm font-medium">Features</a>
              <a href="#pricing" className="hover:text-primary transition-colors text-sm font-medium">Pricing</a>
              <a href="#about" className="hover:text-primary transition-colors text-sm font-medium">About</a>
              <button 
                onClick={() => navigate('/auth?mode=login')}
                className="hover:text-primary transition-colors text-sm font-medium"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-primary/20"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-400 hover:text-white">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-darkCard border-b border-darkBorder py-4 px-6 space-y-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary font-medium">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary font-medium">Pricing</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary font-medium">About</a>
            <hr className="border-darkBorder" />
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/auth?mode=login'); }}
                className="w-full text-center py-2 rounded-xl border border-darkBorder hover:bg-darkBorder font-medium"
              >
                Login
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/auth?mode=signup'); }}
                className="w-full text-center py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Next-Generation AI Platform</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          Meet <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AlphaChatGPT</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-2xl text-gray-400 max-w-3xl mb-10 font-normal leading-relaxed"
        >
          Think Faster. Build Smarter. The smartest AI assistant for coding, writing, learning and productivity.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
        >
          <button 
            onClick={() => navigate('/auth?mode=signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-premium bg-gradient-to-r from-primary to-secondary text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
          >
            <span>Start Chatting Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <a 
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-premium border border-darkBorder hover:bg-darkCard hover:text-white font-semibold transition-all flex items-center justify-center"
          >
            Learn More
          </a>
        </motion.div>

        {/* Mock App Mockup/Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full relative rounded-premium border border-white/10 bg-slate-950/40 p-2 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-premium filter blur-xl opacity-30 -z-10" />
          <div className="bg-darkBg rounded-[14px] aspect-[16/9] overflow-hidden border border-white/5 flex flex-col text-left">
            {/* Header bar of mock UI */}
            <div className="h-8 bg-darkCard border-b border-darkBorder px-4 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            </div>
            <div className="flex-1 flex bg-darkBg">
              <div className="w-1/4 border-r border-darkBorder bg-darkCard/50 p-4 space-y-3 hidden sm:block">
                <div className="h-5 bg-darkBorder rounded w-3/4" />
                <div className="h-4 bg-darkBorder/70 rounded w-5/6" />
                <div className="h-4 bg-darkBorder/70 rounded w-2/3" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">A</div>
                    <div className="bg-darkCard rounded-premium p-3 text-xs max-w-md text-white font-mono">
                      How do I set up a React component with Framer Motion?
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">🤖</div>
                    <div className="bg-darkCard/30 rounded-premium p-4 text-xs max-w-lg border border-darkBorder">
                      <p className="font-semibold text-emerald-400 mb-2">Import components and animate elements:</p>
                      <pre className="text-[10px] text-gray-400 font-mono bg-[#0D1117] p-2 rounded">
                        {`import { motion } from 'framer-motion';

export default function Box() {
  return (
    <motion.div animate={{ scale: 1.2 }} />
  );
}`}
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="h-10 bg-darkCard border border-darkBorder rounded-premium flex items-center px-4 justify-between">
                  <span className="text-[11px] text-gray-500">Ask anything...</span>
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 border-t border-darkBorder bg-darkCard/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              A Complete Suite of Intelligence
            </h2>
            <p className="text-gray-400">
              AlphaChatGPT consolidates critical workflows into a single interface, backing them with advanced learning structures and high performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6 }}
                className="p-6 rounded-premium border border-darkBorder bg-darkCard/50 hover:bg-darkCard transition-all"
              >
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Flexible Plans for Every User
            </h2>
            <p className="text-gray-400">
              Select the pricing tier that aligns with your operations. Upgrade or downgrade seamlessly as your demands change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`relative rounded-premium p-8 flex flex-col justify-between border ${
                  tier.highlight 
                    ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/5' 
                    : 'border-darkBorder bg-darkCard/40'
                }`}
              >
                {tier.highlight && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-sm text-gray-400 mb-6">{tier.desc}</p>
                  <div className="flex items-baseline mb-8">
                    <span className="text-5xl font-extrabold text-white">{tier.price}</span>
                    <span className="text-sm text-gray-500 ml-2">/ {tier.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => navigate(`/auth?mode=signup&plan=${tier.name}`)}
                  className={`w-full py-3 rounded-premium font-bold transition-all ${
                    tier.highlight 
                      ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25' 
                      : 'border border-darkBorder hover:bg-darkBorder text-white'
                  }`}
                >
                  {tier.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / FOOTER */}
      <footer id="about" className="bg-darkBg border-t border-darkBorder py-12 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AlphaChatGPT</span>
          </div>

          <div className="flex space-x-8 mb-6 md:mb-0">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} AlphaChatGPT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
