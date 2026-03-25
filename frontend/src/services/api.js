const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const uploadCV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload-cv`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze CV on the backend');
    }

    return {
      success: true,
      data: {
        recommendations: (data.recommendations || []).map(job => ({
          ...job,
          matchScore: job.match_score,
          postedDate: job.posted_date
        })),
        message: data.message
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const getJobRecommendations = async (cvText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume_text: cvText, top_k: 5 }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch recommendations');
    }

    return {
      success: true,
      data: (data.recommendations || []).map(job => ({
        ...job,
        matchScore: job.match_score,
        postedDate: job.posted_date
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const searchJobs = async (keyword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to search jobs');
    }

    return {
      success: true,
      data: data.jobs
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
