import React from 'react';
import { motion } from 'framer-motion';

function SkillRadar({ matchScore }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchScore / 100) * circumference;

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
          className="stroke-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-green-400 text-xs font-bold">
        {matchScore}
      </div>
    </div>
  );
}

export default SkillRadar;
