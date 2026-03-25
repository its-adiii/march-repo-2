# Use official Python 3.10 slim image for minimal footprint
FROM python:3.10-slim

# Set the working directory to /app
WORKDIR /app

# Copy requirement file first to leverage Docker cache
COPY backend/requirements.txt .

# Install dependencies (ignoring warnings for clean build)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend and model payload
COPY backend/ .

# Give container permissions for runtime
RUN chmod -R 777 /app

# Hugging Face Spaces strictly requires applications to run on Port 7860
EXPOSE 7860

# Start Gunicorn server binding to Hugging Face's port specifications
CMD ["gunicorn", "-b", "0.0.0.0:7860", "--timeout", "120", "--workers", "2", "--threads", "4", "app:app"]
