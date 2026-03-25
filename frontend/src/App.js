import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadCV } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import RecommendList from './components/RecommendList';
import Testimonials from './components/Testimonials';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import PostJobModal from './components/PostJobModal';
import './App.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const [expandedJobId, setExpandedJobId] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);

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
      
      const result = await uploadCV(file);
      
      if (result.success) {
        setRecommendations(result.data.recommendations || []);
      } else {
        setError(result.error || 'Failed to process CV');
      }
    } catch (err) {
      setError(err.message || 'Failed to process CV. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = (job, e) => {
    if (e) e.stopPropagation();
    const searchQuery = `${job.title} ${job.company}`.trim();
    const applicationUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(job.location)}`;
    window.open(applicationUrl, '_blank');
  };

  const getMatchColor = (score) => {
    if (score >= 90) return { text: 'text-gold-400', bg: 'bg-gold-500', label: 'Exceptional Fit' };
    if (score >= 80) return { text: 'text-cream-100', bg: 'bg-cream-200', label: 'Strong Match' };
    if (score >= 60) return { text: 'text-charcoal-400', bg: 'bg-charcoal-400', label: 'Viable' };
    return { text: 'text-charcoal-500', bg: 'bg-charcoal-600', label: 'Consider' };
  };

  const handleReset = () => {
    setRecommendations([]);
    setSelectedFiles([]);
    setExpandedJobId(null);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-charcoal-900 text-cream-50 font-sans relative overflow-x-hidden">
      {/* Noise Texture Overlay */}
      <div className="noise-bg"></div>

      {/* Ambient Boutique Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gold-600/5 blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-charcoal-500/10 blur-[130px]"></div>
      </div>

      <Header scrollY={scrollY} setShowRegistration={setShowRegistration} setShowPostJob={setShowPostJob} />
      
      <main className="relative z-10 editorial-spacing px-6 md:px-12 mx-auto max-w-7xl">
        <AnimatePresence mode="wait">
          {!recommendations.length ? (
            <div className="flex flex-col gap-8">
              <Hero 
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                selectedFiles={selectedFiles}
                loading={loading}
                error={error}
              />
              <Testimonials />
              <ContactUs />
            </div>
          ) : (
            <RecommendList 
              recommendations={recommendations}
              expandedJobId={expandedJobId}
              setExpandedJobId={setExpandedJobId}
              onReset={handleReset}
              getMatchColor={getMatchColor}
              handleApplyNow={handleApplyNow}
            />
          )}

          {/* Registration Modal */}
          <AnimatePresence>
            {showRegistration && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm"
              >
                <div className="absolute inset-0" onClick={() => setShowRegistration(false)}></div>
                <motion.div 
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="bg-charcoal-800 border border-white/10 p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl glass-card"
                >
                  <button onClick={() => setShowRegistration(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
                  <h3 className="text-2xl font-bold text-white mb-2">Candidate Portal</h3>
                  <p className="text-sm text-cream-100/60 mb-6">Create your account to save your CV, track applications, and receive ultra-personalized role alerts.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-cream-100/80 mb-1">Full Name</label>
                      <input type="text" className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-cream-100/80 mb-1">Professional Email</label>
                      <input type="email" className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-cream-100/80 mb-1">Password</label>
                      <input type="password" className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="••••••••" />
                    </div>
                    
                    <button className="w-full mt-4 py-3 bg-white text-charcoal-900 font-bold rounded-lg hover:bg-cream-100 transition-colors">
                      Register & Keep Syncing
                    </button>
                    
                    <p className="text-center text-xs text-cream-100/40 mt-4">
                      By registering, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Post a Job Modal */}
          <PostJobModal show={showPostJob} onClose={() => setShowPostJob(false)} />
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
