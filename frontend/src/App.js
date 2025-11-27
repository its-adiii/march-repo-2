import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 200 * 1024 * 1024, // 200MB
    onDrop: async (acceptedFiles) => {
      setSelectedFiles(acceptedFiles);
      if (acceptedFiles.length > 0) {
        await handleFileUpload(acceptedFiles[0]);
      }
    },
  });

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        // Use Netlify function in production
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/.netlify/functions/upload-cv', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to process CV');
        }
        
        // Map API response to expected format
        const mappedRecommendations = data.recommendations.map((job, index) => ({
          ...job,
          id: job.id || index + 1,
          matchScore: job.match_score || 85,
          companyLogo: job.companyLogo || '🏢',
          experience: job.experience || '2-5 years',
          type: job.type || 'Full-time',
          postedDate: job.posted_date || job.postedDate || '1 week ago',
          featured: job.match_score >= 90,
          skills: job.skills || ['JavaScript', 'React', 'Node.js']
        }));
        
        setRecommendations(mappedRecommendations);
      } else {
        // Use local backend in development
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:5000/api/upload-cv', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to process CV');
        }
        
        // Map API response to expected format and add missing fields
        const mappedRecommendations = data.recommendations.map((job, index) => ({
          ...job,
          id: index + 1,
          matchScore: job.match_score || 85, // Map match_score to matchScore
          companyLogo: job.companyLogo || '🏢', // Default company logo
          experience: job.experience || '2-5 years', // Default experience
          type: job.type || 'Full-time', // Ensure type exists
          postedDate: job.posted_date || job.postedDate || '1 week ago', // Map posted_date
          featured: job.match_score >= 90, // Mark high matches as featured
          skills: job.skills || ['JavaScript', 'React', 'Node.js'] // Default skills
        }));
        
        setRecommendations(mappedRecommendations);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to process CV. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = (job) => {
    // Create a more professional application experience
    const confirmApplication = window.confirm(
      `🎯 Apply for ${job.title} at ${job.company}?\n\n` +
      `📍 Location: ${job.location}\n` +
      `💼 Type: ${job.type}\n` +
      `💰 Salary: ${job.salary}\n` +
      `📊 Match Score: ${job.matchScore}%\n\n` +
      `Click OK to search for similar positions on LinkedIn`
    );
    
    if (confirmApplication) {
      // Create detailed search URL
      const searchQuery = `${job.title} ${job.company}`.trim();
      const applicationUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(job.location)}`;
      
      // Open LinkedIn job search in new tab
      window.open(applicationUrl, '_blank');
      
      // Show success notification
      setTimeout(() => {
        alert(`✅ Application process started!\n\nYou're now searching for "${searchQuery}" positions on LinkedIn.\n\nIn a production version, this would:\n• Track your application\n• Save to your profile\n• Provide follow-up reminders\n• Show application status`);
      }, 1000);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 90) return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' };
    if (score >= 80) return { text: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' };
    if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' };
    return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' };
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${darkMode ? 'bg-purple-700' : 'bg-purple-300'}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${darkMode ? 'bg-yellow-700' : 'bg-yellow-300'}`}></div>
        <div className={`absolute top-40 left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${darkMode ? 'bg-pink-700' : 'bg-pink-300'}`}></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 20
          ? darkMode 
            ? 'bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-700'
            : 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200'
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className={`text-xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  HireMe<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">AI</span>
                </h1>
                <p className={`text-xs transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Smart Job Matching
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`group relative p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                  darkMode 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="relative">
                  <span className="text-xl transition-transform duration-300 group-hover:rotate-12 inline-block">
                    {darkMode ? '🌙' : '☀️'}
                  </span>
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                    darkMode ? 'bg-yellow-400' : 'bg-blue-400'
                  } blur-md`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          {!recommendations.length && (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="mb-8">
                <h1 className={`text-6xl font-bold mb-6 transition-colors ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Find Your{' '}
                  <span className="relative">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                      Dream Job
                    </span>
                    <div className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 blur-lg animate-gradient"></div>
                  </span>
                </h1>
                <p className={`text-xl transition-colors ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                } mb-8 max-w-4xl mx-auto leading-relaxed`}>
                  Upload your CV and let our advanced AI analyze your skills, experience, and potential 
                  to match you with perfect opportunities from top companies worldwide.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                {[
                  { number: '10K+', label: 'Jobs Available', icon: '💼' },
                  { number: '500+', label: 'Companies', icon: '🏢' },
                  { number: '95%', label: 'Success Rate', icon: '🎯' }
                ].map((stat, index) => (
                  <div key={index} className={`group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    darkMode ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-white/60 hover:bg-white/80'
                  } backdrop-blur-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-4xl mb-2 transform transition-transform duration-300 group-hover:scale-110">
                      {stat.icon}
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.number}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Section */}
          {!recommendations.length && (
            <div className="max-w-3xl mx-auto">
              <div
                {...getRootProps()}
                className={`group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 transform hover:scale-[1.02] ${
                  darkMode
                    ? 'border-gray-600 hover:border-blue-500 bg-gray-800/50 hover:bg-gray-800/70'
                    : 'border-gray-300 hover:border-blue-500 bg-white/60 hover:bg-white/80'
                } backdrop-blur-sm`}
              >
                <input {...getInputProps()} />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`relative group mb-6`}>
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6 ${
                      darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-100 to-purple-100'
                    }`}>
                      <svg className={`w-10 h-10 transition-colors duration-500 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
                  </div>
                  
                  <h3 className={`text-xl font-semibold mb-3 transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedFiles.length > 0 ? (
                      <span className="flex items-center space-x-2">
                        <span>✅</span>
                        <span>{selectedFiles[0].name}</span>
                      </span>
                    ) : (
                      'Drop your CV here or click to browse'
                    )}
                  </h3>
                  <p className={`text-sm transition-colors ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } mb-6`}>
                    Supports PDF, DOC, DOCX • Max 200MB • Secure & Private
                  </p>
                  <button className={`group relative px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                    darkMode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  }`}>
                    <span className="relative z-10">Choose File</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl animate-shake">
                  <p className="font-medium">⚠️ Upload Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {loading && (
                <div className="mt-8 flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-b-purple-600 animation-delay-150"></div>
                  </div>
                  <p className={`mt-6 font-medium transition-colors ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    🤖 AI is analyzing your CV...
                  </p>
                  <p className={`text-sm transition-colors ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    This usually takes 2-3 seconds
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className={`text-4xl font-bold mb-2 transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Your Job Recommendations
                  </h2>
                  <p className={`transition-colors ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Based on your CV analysis, we found {recommendations.length} perfect matches
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRecommendations([]);
                    setSelectedFiles([]);
                  }}
                  className={`group px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    darkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>📤</span>
                    <span>Upload Another CV</span>
                  </span>
                </button>
              </div>

              <div className="grid gap-6">
                {recommendations.map((job, index) => {
                  const colors = getMatchColor(job.matchScore);
                  return (
                    <div key={job.id} className={`group relative p-8 rounded-2xl border transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl ${
                      darkMode 
                        ? 'bg-gray-800/80 border-gray-700 hover:border-blue-600' 
                        : 'bg-white/80 border-gray-200 hover:border-blue-300'
                    } backdrop-blur-sm ${job.featured ? 'ring-2 ring-blue-500/20' : ''}`}>
                      
                      {job.featured && (
                        <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full">
                          ⭐ FEATURED
                        </div>
                      )}

                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transform transition-transform duration-300 group-hover:scale-110 ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              {job.companyLogo}
                            </div>
                            <div className="flex-1">
                              <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {job.title}
                              </h3>
                              <p className={`text-lg font-medium mb-2 transition-colors ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {job.company}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  📍 {job.location}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  💼 {job.type}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  📊 {job.experience}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium text-green-600 ${
                                  darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100'
                                }`}>
                                  💰 {job.salary}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className={`leading-relaxed mb-6 transition-colors ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {job.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-6">
                            {job.skills.map((skill, skillIndex) => (
                              <span key={skillIndex} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 ${
                                darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center lg:items-end space-y-4">
                          <div className={`text-center lg:text-right`}>
                            <div className={`text-sm font-medium mb-2 transition-colors ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              AI Match Score
                            </div>
                            <div className={`relative inline-block group`}>
                              <div className={`text-5xl font-bold ${colors.text} transition-all duration-300 group-hover:scale-110`}>
                                {job.matchScore}%
                              </div>
                              <div className={`absolute inset-0 text-5xl font-bold ${colors.text} blur-xl opacity-40 group-hover:blur-2xl transition-all duration-300`}>
                                {job.matchScore}%
                              </div>
                              {job.matchScore >= 90 && (
                                <div className="absolute -top-2 -right-8 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                  <span className="text-white text-xs">⭐</span>
                                </div>
                              )}
                            </div>
                            <div className={`w-full h-3 rounded-full mt-3 ${colors.bg} overflow-hidden`}>
                              <div 
                                className={`h-3 rounded-full bg-gradient-to-r ${job.matchScore >= 90 ? 'from-green-500 to-emerald-600' : job.matchScore >= 80 ? 'from-blue-500 to-purple-600' : 'from-yellow-500 to-orange-600'} transition-all duration-1000 ease-out animate-pulse`}
                                style={{ width: `${job.matchScore}%` }}
                              ></div>
                            </div>
                            <div className={`text-xs font-medium mt-2 ${colors.text}`}>
                              {job.matchScore >= 90 ? 'Excellent Match!' : job.matchScore >= 80 ? 'Strong Match' : job.matchScore >= 60 ? 'Good Match' : 'Consider Applying'}
                            </div>
                          </div>
                          
                          <div className={`text-sm transition-colors ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            📅 Posted {job.postedDate}
                          </div>
                          
                          <button 
                            onClick={() => handleApplyNow(job)}
                            className={`group relative px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${
                              darkMode
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                            }`}
                          >
                            <span className="relative z-10 flex items-center space-x-2">
                              <span>Apply Now</span>
                              <span>→</span>
                            </span>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
