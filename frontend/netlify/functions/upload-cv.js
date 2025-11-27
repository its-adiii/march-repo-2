const fs = require('fs');
const path = require('path');

// Mock job data for recommendations
const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "3-5 years",
    salary: "$120k - $160k",
    description: "We are looking for an experienced frontend developer with expertise in React, TypeScript, and modern CSS frameworks.",
    skills: ["React", "TypeScript", "CSS", "JavaScript", "HTML"],
    match_score: 95
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "Remote",
    type: "Full-time",
    experience: "2-4 years",
    salary: "$90k - $130k",
    description: "Join our team to build innovative web applications using Node.js, React, and cloud technologies.",
    skills: ["Node.js", "React", "MongoDB", "AWS", "JavaScript"],
    match_score: 88
  },
  {
    id: 3,
    title: "React Developer",
    company: "DigitalAgency",
    location: "New York, NY",
    type: "Full-time",
    experience: "2-3 years",
    salary: "$80k - $110k",
    description: "Looking for a React developer to create amazing user interfaces for our clients.",
    skills: ["React", "JavaScript", "CSS", "HTML", "Redux"],
    match_score: 82
  }
];

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the multipart form data
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' })
      };
    }

    // For Netlify functions, we'll simulate the CV processing
    // In a real scenario, you'd parse the file and extract text
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock recommendations
    const recommendations = mockJobs.map((job, index) => ({
      ...job,
      match_score: Math.max(70, 95 - (index * 7)), // Decreasing match scores
      posted_date: '1 week ago',
      companyLogo: '🏢',
      featured: job.match_score >= 90
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        message: 'CV processed successfully',
        recommendations: recommendations,
        extracted_text_length: 1250
      })
    };

  } catch (error) {
    console.error('Error processing CV:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Error processing file: ' + error.message
      })
    };
  }
};
