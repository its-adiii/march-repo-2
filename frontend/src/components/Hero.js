import React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';

function Hero({ getRootProps, getInputProps, selectedFiles, loading, error }) {
  return (
    <motion.div 
      key="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="mt-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-block mb-6 px-4 py-1.5 border border-gold-500/20 rounded-full bg-gold-500/5 text-gold-400 text-xs font-semibold tracking-widest uppercase">
              The Matchmaker
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-medium mb-8 text-white tracking-tight leading-[1.1]">
              Stop Searching.<br />
              <span className="premium-gradient-text italic pr-2">Start Matching.</span>
            </h1>
            <p className="text-lg md:text-xl text-charcoal-400 mb-8 max-w-lg leading-relaxed font-light">
              HireMe uses AI-driven affinity scoring to connect your unique skill set with roles that actually fit your career goals.
            </p>
            <div className="flex items-center space-x-4 mb-12">
              <div className="text-sm font-semibold text-gold-400 cursor-pointer hover:text-gold-300 transition-colors">Browse Top Roles →</div>
            </div>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div
              {...getRootProps()}
              className="group relative border border-charcoal-700/50 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 hover:border-gold-500/50 glass-card"
            >
              <input {...getInputProps()} />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-charcoal-600/50 bg-charcoal-800 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 shadow-lg">
                  <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-display font-medium text-white mb-2">
                  {selectedFiles.length > 0 ? (
                    <span className="flex items-center space-x-2 text-gold-300">
                      <span>✓</span>
                      <span>{selectedFiles[0].name}</span>
                    </span>
                  ) : (
                    'Upload Resume / Connect LinkedIn'
                  )}
                </h3>
                <p className="text-sm text-charcoal-500 tracking-wide mb-8">
                  Drag and drop your PDF or DOCX file to begin.
                </p>
                
                <MagneticButton className="glass-button px-8 py-3 rounded-lg text-sm uppercase tracking-widest font-semibold text-white bg-charcoal-800/80">
                  Upload Resume
                </MagneticButton>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-900/10 border border-red-900/30 text-red-300 rounded-xl text-sm"
              >
                <p className="font-medium mb-1 tracking-wide">Upload Error</p>
                <p className="opacity-80 font-light">{error}</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-10 flex flex-col items-center justify-center py-4"
              >
                <div className="w-10 h-10 border-2 border-charcoal-700/50 rounded-full animate-spin border-t-gold-500 mb-4 shadow-[0_0_15px_rgba(234,179,8,0.3)]"></div>
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal-400 font-semibold mb-1">
                  Analyzing profile
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex justify-end items-center relative"
        >
          {/* Fun Interactive Draggable Orbs */}
          <motion.div 
            drag 
            dragConstraints={{ left: -300, right: 100, top: -200, bottom: 300 }} 
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.2, cursor: "grabbing" }}
            className="absolute -left-16 top-16 w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_30px_rgba(79,70,229,0.5)] z-40 cursor-grab"
          >
            React
          </motion.div>
          <motion.div 
            drag 
            dragConstraints={{ left: -200, right: 100, top: -100, bottom: 400 }}
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.2, cursor: "grabbing" }} 
            className="absolute right-4 -top-8 w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_30px_rgba(16,185,129,0.5)] z-40 cursor-grab"
          >
            Python
          </motion.div>
          <motion.div 
            drag 
            dragConstraints={{ left: -100, right: 50, top: -300, bottom: 200 }}
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.2, cursor: "grabbing" }} 
            className="absolute left-8 bottom-12 w-16 h-16 bg-gradient-to-tr from-gold-500 to-yellow-400 rounded-full flex items-center justify-center text-charcoal-900 font-bold shadow-[0_0_30px_rgba(234,179,8,0.5)] z-40 cursor-grab"
          >
            AWS
          </motion.div>

          {/* Decorative background circle behind illustration */}
          <div className="absolute w-[80%] h-[120%] bg-gradient-to-tr from-charcoal-800/40 to-charcoal-700/10 rounded-full blur-[60px] -z-10 right-0"></div>
          <div className="relative group rounded-2xl overflow-hidden glass-card p-2 transform rotate-2 hover:rotate-0 transition-transform duration-700 shadow-2xl before:hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" 
              alt="Premium Talent Matching" 
              className="w-full max-w-md object-cover rounded-xl drop-shadow-2xl grayscale-[20%] sepia-[10%] contrast-[1.1] hover:grayscale-0 hover:sepia-0 duration-700 transition-all h-[500px]"
            />
            <div className="absolute bottom-8 left-8 z-20 transition-all duration-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-1">Confidential</p>
              <p className="font-display text-2xl text-white">Executive Search</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Social Proof Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20"
      >
        <div className="glass-card p-10 rounded-2xl border border-white/5 border-l-4 border-l-gold-500/80 hover:bg-white/[0.03] transition-colors relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-9xl opacity-5">📈</div>
          <h4 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">500+</h4>
          <p className="text-charcoal-400 text-lg font-medium leading-relaxed max-w-sm">Developers found roles via HireMe this month.</p>
        </div>
        <div className="glass-card p-10 rounded-2xl border border-white/5 border-l-4 border-l-green-500/80 hover:bg-white/[0.03] transition-colors relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-9xl opacity-5">🎯</div>
          <h4 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">90%</h4>
          <p className="text-charcoal-400 text-lg font-medium leading-relaxed max-w-sm">Match Accuracy based on holistic skill-gap analysis.</p>
        </div>
      </motion.div>

      {/* How It Works (Logic Loop) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-24 mb-32 relative z-20"
      >
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">The Logic Loop</h3>
          <p className="text-charcoal-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">How our exact matching engine goes from raw resume to your dream job in seconds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-10 rounded-2xl text-center border border-white/5 hover:border-gold-500/30 transition-all duration-500 hover:-translate-y-2 group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-charcoal-800 to-charcoal-900 border border-white/10 flex items-center justify-center mx-auto mb-8 text-3xl group-hover:scale-110 shadow-lg transition-transform duration-500">📥</div>
            <h4 className="text-2xl font-display font-bold text-white mb-4">1. Ingest</h4>
            <p className="text-charcoal-400 text-base leading-relaxed">We parse your experience using the advanced HireMe recommendation engine.</p>
          </div>
          <div className="glass-card p-10 rounded-2xl text-center border border-white/5 hover:border-gold-500/30 transition-all duration-500 hover:-translate-y-2 group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-charcoal-800 to-charcoal-900 border border-white/10 flex items-center justify-center mx-auto mb-8 text-3xl group-hover:scale-110 shadow-lg transition-transform duration-500">⚙️</div>
            <h4 className="text-2xl font-display font-bold text-white mb-4">2. Analyze</h4>
            <p className="text-charcoal-400 text-base leading-relaxed">Our system calculates a Similarity Score against 10,000+ active listings.</p>
          </div>
          <div className="glass-card p-10 rounded-2xl text-center border border-white/5 hover:border-gold-500/30 transition-all duration-500 hover:-translate-y-2 group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-charcoal-800 to-charcoal-900 border border-white/10 flex items-center justify-center mx-auto mb-8 text-3xl group-hover:scale-110 shadow-lg transition-transform duration-500">🎯</div>
            <h4 className="text-2xl font-display font-bold text-white mb-4">3. Recommend</h4>
            <p className="text-charcoal-400 text-base leading-relaxed">You get a curated "Top 5" list instantly—no more endless scrolling.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Hero;
