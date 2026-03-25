import React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';

function Header({ scrollY, setShowRegistration, setShowPostJob }) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
      scrollY > 20
        ? 'bg-charcoal-900/80 backdrop-blur-2xl border-b border-white/5 py-4 shadow-sm'
        : 'bg-transparent py-6'
    }`}>
      <div className="w-full flex items-center justify-between px-6 md:px-12">
        <motion.div 
          className="flex items-center space-x-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-12 h-12 border border-gold-500/30 bg-charcoal-800 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-gold-400 font-display font-medium text-2xl">H</span>
          </div>
          <div>
            <h1 className="text-2xl font-display font-medium tracking-wide text-white leading-tight">
              Hire<span className="text-gold-400">Me</span>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal-500 font-semibold mt-0.5">
              The Premier Tech Matchmaker
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex items-center space-x-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <button 
            onClick={() => setShowPostJob(true)}
            className="hidden md:block text-sm font-semibold text-cream-100/70 hover:text-white transition-colors"
          >
            Post a Job
          </button>
          <MagneticButton 
            onClick={() => setShowRegistration(true)}
            className="hidden md:block glass-button px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold text-gold-400/90 hover:text-gold-300"
          >
            Profile
          </MagneticButton>
        </motion.div>
      </div>
    </header>
  );
}

export default Header;
