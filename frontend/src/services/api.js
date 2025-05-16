import axios from 'axios';
import jobsData from '../data/jobs.json';

const BASE_URL = 'http://localhost:8000/api';

// Enhanced skill patterns with variations and categories
const SKILL_PATTERNS = {
  // Programming Languages
  'python': ['python', 'py', 'python3', 'django', 'flask'],
  'java': ['java', 'java8', 'java11', 'j2ee', 'spring', 'spring boot'],
  'javascript': ['javascript', 'js', 'es6', 'ecmascript', 'node.js', 'nodejs'],
  'typescript': ['typescript', 'ts'],
  'c++': ['c++', 'cpp', 'c plus plus'],
  'golang': ['golang', 'go lang', 'go'],
  
  // Frontend
  'react': ['react', 'reactjs', 'react.js', 'react native'],
  'angular': ['angular', 'angularjs', 'angular2+'],
  'vue': ['vue', 'vuejs', 'vue.js'],
  'html': ['html', 'html5'],
  'css': ['css', 'css3', 'scss', 'sass'],
  
  // Backend & Databases
  'node.js': ['node', 'nodejs', 'node.js', 'express.js', 'expressjs'],
  'sql': ['sql', 'mysql', 'postgresql', 'oracle', 'pl/sql'],
  'nosql': ['mongodb', 'dynamodb', 'cassandra', 'redis'],
  'graphql': ['graphql', 'graph ql'],
  
  // Cloud & DevOps
  'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
  'azure': ['azure', 'microsoft azure'],
  'gcp': ['gcp', 'google cloud'],
  'docker': ['docker', 'container', 'containerization'],
  'kubernetes': ['kubernetes', 'k8s'],
  'jenkins': ['jenkins', 'ci/cd', 'continuous integration'],
  
  // AI & Data Science
  'machine learning': ['machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence'],
  'tensorflow': ['tensorflow', 'tf'],
  'pytorch': ['pytorch', 'torch'],
  'data science': ['data science', 'data analysis', 'statistics', 'statistical analysis'],
  'nlp': ['nlp', 'natural language processing'],
  
  // Tools & Practices
  'git': ['git', 'github', 'gitlab', 'version control'],
  'agile': ['agile', 'scrum', 'kanban'],
  'jira': ['jira', 'confluence'],
  'testing': ['unit testing', 'integration testing', 'jest', 'junit'],
};

const SKILL_CATEGORIES = {
  'frontend': ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript'],
  'backend': ['java', 'python', 'node.js', 'sql', 'nosql', 'graphql'],
  'devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins'],
  'ai_ml': ['machine learning', 'tensorflow', 'pytorch', 'data science', 'nlp'],
  'fullstack': ['react', 'angular', 'vue', 'node.js', 'java', 'python', 'sql']
};

const extractKeyPhrases = (text) => {
  const phrases = [];
  
  // Education patterns
  const degrees = ['bachelor', 'master', 'phd', 'b.tech', 'b.e', 'm.tech', 'mba'];
  const degreePattern = new RegExp(`\\b(${degrees.join('|')})\\b`, 'gi');
  const foundDegrees = text.match(degreePattern) || [];
  phrases.push(...foundDegrees);

  // Domain expertise patterns
  const domains = [
    'web development', 'mobile development', 'cloud computing', 'data science',
    'machine learning', 'artificial intelligence', 'devops', 'cybersecurity',
    'blockchain', 'iot', 'frontend', 'backend', 'full stack', 'database',
    'networking', 'ui/ux', 'testing', 'qa', 'product management'
  ];
  const domainPattern = new RegExp(`\\b(${domains.join('|')})\\b`, 'gi');
  const foundDomains = text.match(domainPattern) || [];
  phrases.push(...foundDomains);

  return [...new Set(phrases.map(p => p.toLowerCase()))];
};

const analyzeProjectComplexity = (text) => {
  const complexityIndicators = {
    high: ['architecture', 'designed', 'led', 'managed', 'optimized', 'scaled', 'implemented'],
    medium: ['developed', 'created', 'built', 'maintained', 'enhanced', 'integrated'],
    low: ['assisted', 'helped', 'participated', 'supported', 'worked on']
  };

  let score = 0;
  Object.entries(complexityIndicators).forEach(([level, words]) => {
    const pattern = new RegExp(`\\b(${words.join('|')})\\b`, 'gi');
    const matches = (text.match(pattern) || []).length;
    score += matches * (level === 'high' ? 3 : level === 'medium' ? 2 : 1);
  });

  return Math.min(score / 10, 1); // Normalize to 0-1
};

const extractIndustryExperience = (text) => {
  const industries = {
    'technology': ['software', 'tech', 'it ', 'saas', 'technology'],
    'finance': ['banking', 'finance', 'fintech', 'trading', 'investment'],
    'healthcare': ['health', 'medical', 'healthcare', 'pharma'],
    'retail': ['retail', 'e-commerce', 'commerce', 'shopping'],
    'manufacturing': ['manufacturing', 'production', 'industrial'],
    'consulting': ['consulting', 'consultant', 'advisory'],
    'telecom': ['telecom', 'telecommunications', 'network'],
    'education': ['education', 'learning', 'teaching', 'edtech']
  };

  const experience = {};
  Object.entries(industries).forEach(([industry, keywords]) => {
    const pattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    const matches = (text.match(pattern) || []).length;
    if (matches > 0) {
      experience[industry] = matches;
    }
  });

  return experience;
};

const extractSkillsWithContext = (cvText) => {
  const skillContext = {};
  const cvTextLower = cvText.toLowerCase();

  // Extract skills with their context
  Object.entries(SKILL_PATTERNS).forEach(([skill, variations]) => {
    variations.forEach(variation => {
      const index = cvTextLower.indexOf(variation.toLowerCase());
      if (index !== -1) {
        // Get surrounding context (50 characters before and after)
        const start = Math.max(0, index - 50);
        const end = Math.min(cvTextLower.length, index + variation.length + 50);
        const context = cvTextLower.slice(start, end);

        // Analyze context for usage level
        const expertiseLevel = analyzeExpertiseLevel(context);
        
        if (!skillContext[skill] || expertiseLevel > skillContext[skill].level) {
          skillContext[skill] = {
            level: expertiseLevel,
            context: context
          };
        }
      }
    });
  });

  return skillContext;
};

const analyzeExpertiseLevel = (context) => {
  const expertiseIndicators = {
    expert: ['expert', 'advanced', 'led', 'architected', 'designed', 'mentored'],
    intermediate: ['experienced', 'developed', 'implemented', 'built'],
    beginner: ['familiar', 'basic', 'learning', 'studied']
  };

  let maxLevel = 0;
  Object.entries(expertiseIndicators).forEach(([level, indicators]) => {
    indicators.forEach(indicator => {
      if (context.includes(indicator)) {
        maxLevel = Math.max(maxLevel, 
          level === 'expert' ? 1 : 
          level === 'intermediate' ? 0.7 : 
          0.4
        );
      }
    });
  });

  return maxLevel || 0.5; // Default to middle level if no indicators found
};

const calculateJobRelevance = (job, cvAnalysis) => {
  const {
    skills,
    experience,
    keyPhrases,
    projectComplexity,
    industries,
    skillContext
  } = cvAnalysis;

  // 1. Skill Match Score (35%)
  const skillScore = calculateSkillMatchScore(job.skills, skillContext);

  // 2. Experience Relevance (25%)
  const experienceScore = calculateExperienceScore(job, experience, industries);

  // 3. Role Alignment (20%)
  const roleScore = calculateRoleAlignmentScore(job, keyPhrases, projectComplexity);

  // 4. Industry Fit (15%)
  const industryScore = calculateIndustryFitScore(job.industry, industries);

  // 5. Company Culture Fit (5%)
  const cultureFitScore = calculateCultureFitScore(job, cvAnalysis);

  // Calculate weighted total
  const totalScore = (
    (skillScore * 0.35) +
    (experienceScore * 0.25) +
    (roleScore * 0.20) +
    (industryScore * 0.15) +
    (cultureFitScore * 0.05)
  );

  return {
    totalScore,
    details: {
      skillScore: Math.round(skillScore * 100),
      experienceScore: Math.round(experienceScore * 100),
      roleScore: Math.round(roleScore * 100),
      industryScore: Math.round(industryScore * 100),
      cultureFitScore: Math.round(cultureFitScore * 100)
    }
  };
};

const calculateSkillMatchScore = (jobSkills, skillContext) => {
  let totalScore = 0;
  let matchCount = 0;

  jobSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (skillContext[skillLower]) {
      totalScore += skillContext[skillLower].level;
      matchCount++;
    } else {
      // Check for related skills
      const category = Object.entries(SKILL_CATEGORIES).find(([_, skills]) => 
        skills.includes(skillLower)
      );
      
      if (category) {
        const relatedSkills = SKILL_CATEGORIES[category[0]];
        const bestRelatedScore = Math.max(
          ...relatedSkills.map(s => skillContext[s]?.level || 0)
        );
        if (bestRelatedScore > 0) {
          totalScore += bestRelatedScore * 0.7; // 70% credit for related skills
          matchCount++;
        }
      }
    }
  });

  return matchCount > 0 ? totalScore / jobSkills.length : 0;
};

const calculateExperienceScore = (job, experience, industries) => {
  const requiredYears = job.experience_required;
  if (experience >= requiredYears) {
    return 1.0;
  }
  const diff = requiredYears - experience;
  return Math.max(0, 1 - (diff * 0.2));
};

const calculateRoleAlignmentScore = (job, keyPhrases, projectComplexity) => {
  const titleWords = job.title.toLowerCase().split(' ');
  const matchingPhrases = keyPhrases.filter(phrase => 
    titleWords.some(word => phrase.includes(word))
  );
  
  const phraseScore = matchingPhrases.length / Math.max(titleWords.length, 1);
  return (phraseScore * 0.7) + (projectComplexity * 0.3);
};

const calculateIndustryFitScore = (jobIndustry, candidateIndustries) => {
  const totalMentions = Object.values(candidateIndustries).reduce((a, b) => a + b, 0);
  const industryMentions = candidateIndustries[jobIndustry.toLowerCase()] || 0;
  return totalMentions > 0 ? industryMentions / totalMentions : 0.5;
};

const calculateCultureFitScore = (job, cvAnalysis) => {
  // This could be expanded based on company culture keywords
  return 0.7; // Default reasonable score
};

const extractSkillsFromCV = (cvText) => {
  const foundSkills = new Set();
  const cvTextLower = cvText.toLowerCase();
  
  // Extract skills using patterns
  Object.entries(SKILL_PATTERNS).forEach(([skill, variations]) => {
    variations.forEach(variation => {
      if (cvTextLower.includes(variation.toLowerCase())) {
        foundSkills.add(skill);
      }
    });
  });
  
  return Array.from(foundSkills);
};

const extractExperienceFromCV = (cvText) => {
  const patterns = [
    /(\d+)\+?\s*years?\s*of\s*experience/i,
    /(\d+)\+?\s*years?\s*experience/i,
    /experience\s*:\s*(\d+)\+?\s*years?/i,
    /worked\s*for\s*(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*years?\s*in\s*/i,
    /(\d+)\+?\s*years?\s*of\s*professional/i,
    /career\s*spanning\s*(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*years?\s*in\s*the\s*industry/i
  ];

  let maxYears = 0;
  patterns.forEach(pattern => {
    const match = cvText.match(pattern);
    if (match && match[1]) {
      const years = parseInt(match[1]);
      if (years > maxYears) {
        maxYears = years;
      }
    }
  });

  return maxYears;
};

const calculateSkillMatch = (jobSkills, candidateSkills) => {
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());
  
  // Calculate direct skill matches
  const directMatches = normalizedJobSkills.filter(skill => 
    normalizedCandidateSkills.includes(skill)
  );
  
  // Calculate related skill matches (skills in the same category)
  const relatedMatches = normalizedJobSkills.filter(skill => {
    if (directMatches.includes(skill)) return false;
    
    // Find the category of the job skill
    const skillCategory = Object.entries(SKILL_CATEGORIES).find(([_, skills]) => 
      skills.includes(skill)
    );
    
    if (!skillCategory) return false;
    
    // Check if candidate has any skills in the same category
    return candidateSkills.some(candidateSkill => 
      SKILL_CATEGORIES[skillCategory[0]].includes(candidateSkill)
    );
  });
  
  // Weight direct matches more heavily than related matches
  return (directMatches.length * 1.0 + relatedMatches.length * 0.5) / jobSkills.length;
};

const calculateExperienceMatch = (jobExperience, candidateExperience) => {
  if (candidateExperience >= jobExperience) {
    return 1.0;
  }
  
  const diff = jobExperience - candidateExperience;
  if (diff <= 1) return 0.9;
  if (diff <= 2) return 0.7;
  if (diff <= 3) return 0.5;
  if (diff <= 4) return 0.3;
  return 0.1;
};

const calculateRoleMatch = (jobTitle, cvText) => {
  const cvTextLower = cvText.toLowerCase();
  const jobTitleLower = jobTitle.toLowerCase();
  
  // Define role categories
  const roleCategories = {
    'frontend': ['frontend', 'front-end', 'ui', 'react', 'angular'],
    'backend': ['backend', 'back-end', 'server', 'api'],
    'fullstack': ['fullstack', 'full-stack', 'full stack'],
    'devops': ['devops', 'sre', 'reliability', 'infrastructure'],
    'data': ['data scientist', 'machine learning', 'ai', 'ml'],
    'mobile': ['mobile', 'android', 'ios', 'react native'],
    'cloud': ['cloud', 'aws', 'azure', 'gcp']
  };
  
  // Find the job's category
  let jobCategory = null;
  Object.entries(roleCategories).forEach(([category, keywords]) => {
    if (keywords.some(keyword => jobTitleLower.includes(keyword))) {
      jobCategory = category;
    }
  });
  
  if (!jobCategory) return 0.5; // Neutral score if no category found
  
  // Check if CV mentions similar roles
  const categoryKeywords = roleCategories[jobCategory];
  const matchCount = categoryKeywords.filter(keyword => cvTextLower.includes(keyword)).length;
  
  return matchCount > 0 ? 0.8 + (matchCount * 0.05) : 0.5;
};

export const uploadCV = async (file) => {
  try {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const cvText = event.target.result;
          
          // Comprehensive CV analysis
          const cvAnalysis = {
            skills: extractSkillsWithContext(cvText),
            experience: extractExperienceFromCV(cvText),
            keyPhrases: extractKeyPhrases(cvText),
            projectComplexity: analyzeProjectComplexity(cvText),
            industries: extractIndustryExperience(cvText),
            skillContext: extractSkillsWithContext(cvText)
          };
          
          // Get recommendations
          const recommendations = await getJobRecommendations(cvAnalysis);
          
          resolve({
            success: true,
            data: {
              analysis: cvAnalysis,
              recommendations: recommendations.data
            }
          });
        } catch (error) {
          reject({
            success: false,
            error: 'Failed to process CV'
          });
        }
      };
      
      reader.onerror = () => {
        reject({
          success: false,
          error: 'Failed to read CV file'
        });
      };
      
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Error processing CV:', error);
    throw error;
  }
};

export const getJobRecommendations = async (cvAnalysis) => {
  try {
    // Calculate relevance scores for each job
    const scoredJobs = jobsData.jobs.map(job => {
      const relevance = calculateJobRelevance(job, cvAnalysis);
      
      return {
        ...job,
        matchScore: Math.round(relevance.totalScore * 100),
        matchDetails: relevance.details,
        matchingSkills: Object.keys(cvAnalysis.skillContext).filter(skill => 
          job.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
        )
      };
    });

    // Advanced filtering and ranking
    const recommendations = scoredJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .reduce((acc, job) => {
        // Ensure diversity in recommendations
        const similarJobs = acc.filter(j => 
          j.company === job.company || 
          j.title.toLowerCase().includes(job.title.toLowerCase())
        );
        
        // Limit similar jobs
        if (similarJobs.length < 2 && acc.length < 10) {
          // Add randomization factor for similar scores
          const randomFactor = 1 + (Math.random() * 0.1 - 0.05); // ±5%
          job.matchScore = Math.round(job.matchScore * randomFactor);
          acc.push(job);
        }
        
        return acc;
      }, [])
      .sort((a, b) => b.matchScore - a.matchScore);

    return {
      success: true,
      data: recommendations
    };
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    return {
      success: false,
      error: 'Failed to get job recommendations'
    };
  }
};
