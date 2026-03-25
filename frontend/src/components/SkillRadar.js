import React from 'react';
import { motion } from 'framer-motion';

function SkillRadar({ matchScore }) {
  const safeScore = Number(matchScore) || 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, safeScore)) / 100) * circumference;

  // Dynamic visual logic based on affinity
  let circleColor = "stroke-green-400";
  let shadowColor = "rgba(74,222,128,0.5)";
  
  if (safeScore < 40) {
    circleColor = "stroke-red-400";
    shadowColor = "rgba(248,113,113,0.5)";
  } else if (safeScore < 70) {
    circleColor = "stroke-yellow-400";
    shadowColor = "rgba(250,204,21,0.5)";
  }

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
        <circle 
          cx="40" 
          cy="40" 
          r={radius} 
          fill="transparent" 
          strokeWidth="6" 
          className="stroke-charcoal-700" 
        />
        <motion.circle 
          cx="40" 
          cy="40" 
          r={radius} 
          fill="transparent" 
          strokeWidth="6" 
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={`${circleColor}`}
          style={{ filter: `drop-shadow(0 0 8px ${shadowColor})` }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

export default SkillRadar;
