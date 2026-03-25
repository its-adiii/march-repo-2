import React, { useState } from 'react';
import { motion } from 'framer-motion';

function PostJobModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    experience: 'Entry-Senior',
    description: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.message || 'Job posted successfully!');
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
          setFormData({
            title: '',
            company: '',
            location: '',
            type: 'Full-time',
            salary: '',
            experience: 'Entry-Senior',
            description: '',
            requirements: ''
          });
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Failed to post job');
      }
    } catch (err) {
      setErrorMsg('Network error occurred while posting the job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm shadow-2xl overflow-y-auto"
    >
      <div className="absolute inset-0 min-h-full" onClick={onClose}></div>
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-charcoal-800 border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-2xl relative z-10 glass-card my-8"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white font-bold text-lg">✕</button>
        <h3 className="text-2xl font-bold text-white mb-2 font-display">Post a Job</h3>
        <p className="text-sm text-cream-100/60 mb-6">Create a new opportunity for top talent.</p>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 text-green-400 rounded-lg text-sm text-center font-medium">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cream-100/80 mb-1">Job Title *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="e.g. Senior Product Designer" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cream-100/80 mb-1">Company Name *</label>
              <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cream-100/80 mb-1">Location *</label>
              <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="e.g. Remote, NYC" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cream-100/80 mb-1">Job Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-cream-100/80 mb-1">Salary Range</label>
              <input type="text" name="salary" value={formData.salary} onChange={handleChange} className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="e.g. $120k - $150k" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cream-100/80 mb-1">Experience Level</label>
              <input type="text" name="experience" value={formData.experience} onChange={handleChange} className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="e.g. 3-5 Years" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-cream-100/80 mb-1">Job Description *</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Describe the role and responsibilities..."></textarea>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-cream-100/80 mb-1">Requirements</label>
            <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="3" className="w-full bg-charcoal-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="List the skills and qualifications..."></textarea>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full mt-6 py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal-900 font-bold rounded-lg shadow-lg hover:from-gold-400 hover:to-gold-300 transition-colors disabled:opacity-70 flex justify-center">
            {isSubmitting ? <span className="w-5 h-5 border-2 border-charcoal-900/30 border-t-charcoal-900 rounded-full animate-spin"></span> : 'Publish Job Listing'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default PostJobModal;
