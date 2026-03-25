import React from 'react';

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 mt-auto relative z-10 bg-charcoal-900/50">
      <div className="container mx-auto px-8 md:px-12 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-6 md:mb-0">
          <div className="w-8 h-8 border border-gold-500/30 bg-charcoal-800 rounded-md flex items-center justify-center">
            <span className="text-gold-400 font-display font-bold text-sm">H</span>
          </div>
          <div className="text-white font-display font-medium text-lg tracking-wide">Hire<span className="text-gold-400">Me</span></div>
        </div>
        <div className="flex flex-wrap justify-center space-x-6 md:space-x-10 text-xs font-semibold uppercase tracking-widest text-charcoal-500">
          <a href="#" className="hover:text-gold-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gold-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-gold-400 transition-colors">Support</a>
          <a href="#" className="hover:text-gold-400 transition-colors">LinkedIn</a>
        </div>
        <div className="text-xs text-charcoal-600 mt-6 md:mt-0 font-medium">© 2026 HireMe Inc.</div>
      </div>
    </footer>
  );
}

export default Footer;
