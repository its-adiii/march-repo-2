# Job Talent Recommendation System

A comprehensive web application for matching job seekers with employment opportunities across various industries in India, with a special focus on Blue Collar and IT jobs.

## Features

- **Job Scraping**: Automated scraping from Indeed for both Blue Collar and IT jobs
- **User Management**: Separate interfaces for job seekers and employers
- **Smart Job Matching**: Advanced algorithm for matching jobs based on skills and preferences
- **Real-time Updates**: Regular job updates through automated scraping
- **Secure Authentication**: JWT-based authentication system

## Technology Stack

### Backend
- Django 4.2.7
- Django REST Framework 3.14.0
- JWT Authentication
- SQLite Database

### Frontend (Planned)
- React.js
- Material-UI
- Redux for state management

## Setup Instructions

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd job-talent-system
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Apply database migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/token/`: Obtain JWT token pair
  - Request body: `{"username": "string", "password": "string"}`
  - Response: `{"access": "string", "refresh": "string"}`

- `POST /api/auth/token/refresh/`: Refresh access token
  - Request body: `{"refresh": "string"}`
  - Response: `{"access": "string"}`

### User Management

- `GET /api/users/`: List users (admin only)
- `POST /api/users/`: Create new user
- `GET /api/profiles/`: Get user profile
- `PUT /api/profiles/{id}/`: Update user profile

### Jobs

- `GET /api/jobs/`: List all jobs
  - Query parameters:
    - `category`: Filter by job category (Blue Collar/IT)
    - `location`: Filter by location
    - `job_type`: Filter by job type
    - `search`: Search in title, company, description
    - `ordering`: Order by created_at, updated_at, title

- `POST /api/jobs/`: Create new job (employers only)
- `GET /api/jobs/{id}/`: Get job details
- `PUT /api/jobs/{id}/`: Update job (owner only)
- `DELETE /api/jobs/{id}/`: Delete job (owner only)
- `GET /api/jobs/recommended/`: Get personalized job recommendations

### Applications

- `GET /api/applications/`: List applications
  - For employers: Shows applications for their jobs
  - For job seekers: Shows their applications
- `POST /api/applications/`: Apply for a job
- `GET /api/applications/{id}/`: Get application details
- `PUT /api/applications/{id}/`: Update application status (employer only)

### Skills

- `GET /api/skills/`: List all skills
- `GET /api/skills/by_category/`: Get skills by category
- `POST /api/skills/`: Add new skill (admin only)

## Job Categories

### Blue Collar Jobs
- CNC Operator
- Plumber
- Mechanic
- Carpenter
- Painter

### IT Jobs
- Software Engineer
- Data Scientist
- Web Developer
- DevOps Engineer
- System Administrator

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
