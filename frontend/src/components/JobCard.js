import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from './MagneticButton';
import SkillRadar from './SkillRadar';

function JobCard({ job, isExpanded, onToggleExpand, getMatchColor, handleApplyNow, itemVariants }) {
  const colors = getMatchColor(job.matchScore);

  return (
    <motion.div 
      variants={itemVariants}
      onClick={onToggleExpand}
      className={`glass-card bg-charcoal-800/60 p-6 md:p-8 cursor-pointer transition-colors duration-500 rounded-2xl border border-white/5 hover:border-white/20 relative`}
    >
      {job.featured && (
        <div className="absolute top-0 right-6 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-bl-lg rounded-br-lg text-white text-[10px] font-bold tracking-widest uppercase flex items-center space-x-1 shadow-lg">
          <span>⭐</span>
          <span>FEATURED</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        {/* Left Side: Avatar & Details */}
        <div className="flex-1 w-full flex space-x-6">
          {/* Company icon placeholder */}
          <div className="w-16 h-16 rounded-2xl bg-charcoal-700/50 flex items-center justify-center border border-white/5 shrink-0 shadow-inner">
            <span className="text-2xl">🏢</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
              {job.title}
            </h3>
            <p className="text-lg text-cream-100/80 font-medium mb-4">
              {job.company}
            </p>
            
            {/* Pills */}
            <div className="flex flex-wrap gap-2.5 mb-5">
              <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-charcoal-700/60 border border-white/5 text-xs text-cream-100/90 font-medium">
                <span>📍</span>
                <span>{job.location}</span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-charcoal-700/60 border border-white/5 text-xs text-cream-100/90 font-medium">
                <span>💼</span>
                <span>{job.type}</span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/20 text-xs text-blue-300 font-medium">
                <span>📅</span>
                <span>{job.experience || 'Entry-Senior'}</span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-green-900/20 border border-green-500/20 text-xs text-green-400 font-medium">
                <span>💰</span>
                <span>{job.salary}</span>
              </span>
            </div>
            
            <p className={`text-sm leading-relaxed text-cream-100/60 font-medium max-w-3xl ${!isExpanded && 'line-clamp-2'}`}>
              {job.description}
            </p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="text-[11px] font-semibold text-charcoal-400 bg-charcoal-900/50 px-3 py-1.5 rounded-full box-border border border-white/5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Right Side: Score & Action */}
        <div className="w-full lg:w-48 flex flex-col items-end lg:items-end pt-4 lg:pt-0 shrink-0 relative z-10 space-y-4">
          <div className="flex flex-col items-end text-right">
            <div className="text-xs text-cream-100/60 font-semibold mb-1">
              AI Match Score
            </div>
            <div className="flex items-center justify-end space-x-3 mb-2">
              <SkillRadar matchScore={job.matchScore} />
              <div className={`text-4xl font-display font-bold ${colors.text} tracking-tighter`}>
                {job.matchScore}%
              </div>
            </div>
            <div className={`text-[10px] ${colors.text} uppercase font-bold`}>
              {colors.label}!
            </div>
          </div>
          
          <div className="text-[11px] text-cream-100/40 font-medium flex items-center space-x-1.5 mt-auto pb-2">
            <span>📅</span>
            <span>Posted {job.postedDate}</span>
          </div>
          
          <MagneticButton 
            onClick={(e) => handleApplyNow(job, e)}
            className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] transition-all group border-none"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>Apply Now</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}

export default JobCard;
