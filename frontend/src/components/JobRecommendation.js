import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadCV } from '../services/api';

const JobRecommendation = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Job Recommendation</h1>
      
      {/* File Upload Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload your CV
        </label>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600">
              {selectedFiles.length > 0 
                ? `Selected: ${selectedFiles[0].name}`
                : 'Drag and drop your CV here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PDF files only • Max 10MB
            </p>
            <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Browse files
            </button>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Processing your CV...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {/* CV Analysis Section */}
      {cvAnalysis && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">CV Analysis</h2>
          
          {/* Skills Section */}
          {Object.keys(cvAnalysis.skillContext || {}).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Detected Skills</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(cvAnalysis.skillContext).map(([skill, data], index) => (
                  <div
                    key={index}
                    className="group relative"
                  >
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        data.level > 0.7 ? 'bg-green-100 text-green-800' :
                        data.level > 0.4 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {skill}
                    </span>
                    <div className="hidden group-hover:block absolute z-10 bg-white p-2 rounded shadow-lg text-xs w-64 mt-1">
                      <p className="font-medium mb-1">Context:</p>
                      <p className="text-gray-600">{data.context}</p>
                      <p className="mt-1 text-gray-500">
                        Expertise: {
                          data.level > 0.7 ? 'Expert' :
                          data.level > 0.4 ? 'Intermediate' :
                          'Beginner'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Industry Experience */}
          {Object.keys(cvAnalysis.industries || {}).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Industry Experience</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(cvAnalysis.industries).map(([industry, count], index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {industry} ({count} mentions)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Complexity */}
          {cvAnalysis.projectComplexity !== undefined && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Project Complexity Score</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${cvAnalysis.projectComplexity * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Based on project descriptions and responsibilities
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recommended Jobs</h2>
          <div className="space-y-4">
            {recommendations.map((job, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {job.matchScore}% Match
                    </div>
                    <div className="text-sm text-gray-500">
                      {job.salary_range}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700 text-sm">{job.description}</p>
                </div>

                {/* Match Details */}
                {job.matchDetails && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Match Details:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 w-24">Skills</span>
                          <div className="flex-grow">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${job.matchDetails.skillScore}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{job.matchDetails.skillScore}%</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 w-24">Experience</span>
                          <div className="flex-grow">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-green-600 h-1.5 rounded-full"
                                style={{ width: `${job.matchDetails.experienceScore}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{job.matchDetails.experienceScore}%</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 w-24">Role Fit</span>
                          <div className="flex-grow">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-purple-600 h-1.5 rounded-full"
                                style={{ width: `${job.matchDetails.roleScore}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{job.matchDetails.roleScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {job.matchingSkills && job.matchingSkills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Matching Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.matchingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience: {job.experience_required} years</span>
                    <span className="text-gray-500">{job.job_type} • {job.industry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRecommendation;
