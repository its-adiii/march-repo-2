import React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';

export default function ContactUs() {
  return (
    <section className="py-24 relative z-10 w-full border-t border-white/5 mt-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Touch.</span>
          </h2>
          <p className="text-lg text-cream-100/60 font-medium mb-8 max-w-lg leading-relaxed">
            Whether you are an enterprise looking to source top 1% ML matching capabilities or a candidate needing support, our executive team is on standby.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-full bg-charcoal-800 flex items-center justify-center border border-white/5 text-xl">📧</div>
              <div>
                <div className="text-xs font-bold text-cream-100/40 uppercase tracking-wider mb-1">Email us</div>
                <div className="text-white font-medium">executive@hireme-ai.com</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-full bg-charcoal-800 flex items-center justify-center border border-white/5 text-xl">📍</div>
              <div>
                <div className="text-xs font-bold text-cream-100/40 uppercase tracking-wider mb-1">Global HQ</div>
                <div className="text-white font-medium">San Francisco, California</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card bg-charcoal-800/40 border border-white/5 p-8 md:p-10 rounded-3xl"
        >
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-cream-100/50 uppercase tracking-wider pl-1">Name</label>
                <input type="text" className="w-full bg-charcoal-900/60 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-cream-100/50 uppercase tracking-wider pl-1">Company</label>
                <input type="text" className="w-full bg-charcoal-900/60 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Acme Corp" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-cream-100/50 uppercase tracking-wider pl-1">Email Address</label>
              <input type="email" className="w-full bg-charcoal-900/60 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="john@example.com" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-cream-100/50 uppercase tracking-wider pl-1">Message</label>
              <textarea rows="4" className="w-full bg-charcoal-900/60 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none" placeholder="How can we help you scale?"></textarea>
            </div>

            <MagneticButton className="w-full py-4 bg-white text-charcoal-900 rounded-xl font-bold hover:bg-cream-200 transition-colors mt-2">
              Send Message
            </MagneticButton>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
