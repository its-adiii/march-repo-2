import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadCV } from '../services/api';

const JobRecommendation = ({ darkMode }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

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
        await handleCVUpload(acceptedFiles[0]);
      }
    },
  });

  const handleCVUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      const result = await uploadCV(file);
      
      if (result.success) {
        setRecommendations(result.data.recommendations || []);
        setCvAnalysis(result.data.analysis || null);
        setActiveTab('recommendations');
      } else {
        setError(result.error || 'Failed to process CV');
      }
    } catch (err) {
      setError('Failed to process CV and get recommendations. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="pt-20 px-4 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Dream Job</span>
          </h1>
          <p className={`text-xl ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          } max-w-3xl mx-auto`}>
            Upload your CV and let our AI-powered system analyze your skills to find the perfect job opportunities tailored just for you.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex rounded-lg p-1 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upload CV
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={!recommendations.length}
            >
              Recommendations ({recommendations.length})
            </button>
          </div>
        </div>

        {/* Upload Section */}
        {activeTab === 'upload' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:scale-105 ${
                  darkMode
                    ? 'border-gray-600 hover:border-blue-500 bg-gray-800'
                    : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    darkMode ? 'bg-gray-700' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedFiles.length > 0 ? selectedFiles[0].name : 'Drop your CV here'}
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Supports PDF, DOC, DOCX (Max 200MB)
                  </p>
                  <button className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                    Browse Files
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className={`text-2xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Why Choose HireMe AI?
              </h3>
              {[
                {
                  icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                  title: 'Smart Analysis',
                  description: 'AI-powered skill extraction and matching'
                },
                {
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  title: 'Instant Results',
                  description: 'Get recommendations in seconds, not hours'
                },
                {
                  icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                  title: 'Real Jobs',
                  description: 'Curated opportunities from top companies'
                },
                {
                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                  title: 'Detailed Insights',
                  description: 'Comprehensive analysis of your profile'
                }
              ].map((feature, index) => (
                <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    darkMode ? 'bg-blue-900' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {activeTab === 'recommendations' && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Analyzing your CV...
                </p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl ${
                  darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Your CV Analysis
                  </h3>
                  {cvAnalysis && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills Found</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {Object.keys(cvAnalysis.skillContext || {}).length}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Industries</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {Object.keys(cvAnalysis.industries || {}).length}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Complexity</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cvAnalysis.projectComplexity || 'Intermediate'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Recommended Jobs ({recommendations.length})
                </h3>
                
                <div className="grid gap-6">
                  {recommendations.map((job, index) => (
                    <div key={index} className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-600' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className={`text-xl font-bold mb-2 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {job.title}
                          </h4>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                            {job.company}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {job.location}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {job.type}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {job.experience}
                            </span>
                          </div>
                        </div>
                        <div className={`text-right ml-4`}>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                            Match Score
                          </div>
                          <div className={`text-3xl font-bold ${getMatchColor(job.matchScore)}`}>
                            {job.matchScore}%
                          </div>
                        </div>
                      </div>
                      
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills && job.skills.slice(0, 5).map((skill, skillIndex) => (
                          <span key={skillIndex} className={`px-2 py-1 rounded text-xs ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {skill}
                          </span>
                        ))}
                        {job.skills && job.skills.length > 5 && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                          }`}>
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Posted {job.postedDate || 'Recently'}
                        </div>
                        <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}>
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`text-center py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <p>No recommendations yet. Upload your CV to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendation;
