import React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';
import JobCard from './JobCard';

function RecommendList({ 
  recommendations, 
  expandedJobId, 
  setExpandedJobId, 
  onReset,
  getMatchColor,
  handleApplyNow
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  return (
    <motion.div 
      key="results"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-16"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-white/10">
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight mb-2">
            Jobs Picked for You
          </h2>
          <p className="text-charcoal-400 text-base md:text-lg font-light max-w-xl">
            Based on your CV analysis, we found {recommendations.length} perfect matches
          </p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <MagneticButton
            onClick={onReset}
            className="glass-button bg-charcoal-800/80 border-white/10 px-6 py-3 rounded-lg text-sm font-semibold flex items-center space-x-2 text-white hover:bg-charcoal-700"
          >
            <span>📤</span>
            <span>Upload Another CV</span>
          </MagneticButton>
        </motion.div>
      </div>

      <div className="grid gap-6">
        {recommendations.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            isExpanded={expandedJobId === job.id}
            onToggleExpand={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
            getMatchColor={getMatchColor}
            handleApplyNow={handleApplyNow}
            itemVariants={itemVariants}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default RecommendList;
