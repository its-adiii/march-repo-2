import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Senior React Engineer at Vercel",
    quote: "HireMe AI fundamentally changed my job hunt. The matching algorithm perfectly aligned my 5 years of frontend experience with a role I didn't even know existed. I was hired in 14 days.",
    avatar: "👩‍💻"
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Machine Learning Lead at Anthropic",
    quote: "The precision of the vector-based matching is unparalleled. It bypassed the standard noise of traditional job boards and connected me directly with teams looking for exact NLP skillsets.",
    avatar: "👨‍🔬"
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Cloud Architect at AWS",
    quote: "A remarkably elegant platform. Uploading my CV took seconds, and the Boutique interface returned a curated list of elite DevOps roles that perfectly matched my salary expectations.",
    avatar: "👩‍🚀"
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 border-t border-white/5 relative z-10 w-full mt-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent"></div>
      
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight mb-4"
        >
          Success Stories
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-cream-100/60 font-medium text-lg max-w-2xl mx-auto"
        >
          Join thousands of elite engineers who bypassed the traditional job board noise using our intelligent vector-matching.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="glass-card bg-charcoal-800/40 border border-white/5 rounded-2xl p-8 relative hover:border-white/10 transition-colors"
          >
            <div className="text-4xl absolute top-6 right-6 opacity-20">"</div>
            <div className="text-3xl mb-6">{t.avatar}</div>
            <p className="text-cream-100/80 leading-relaxed mb-8 italic">"{t.quote}"</p>
            <div>
              <div className="font-bold text-white tracking-tight">{t.name}</div>
              <div className="text-sm font-medium text-gold-400">{t.role}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
