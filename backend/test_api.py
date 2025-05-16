import requests
import json
from pprint import pprint

BASE_URL = 'http://localhost:8000/api'

def test_api():
    # Helper function to make requests with token
    def make_request(method, endpoint, data=None, token=None):
        headers = {
            'Content-Type': 'application/json'
        }
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        url = f'{BASE_URL}/{endpoint}'
        
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        
        return response

    # Test authentication
    print("\n1. Testing Authentication")
    print("-" * 50)
    
    auth_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    response = make_request('POST', 'auth/token/', auth_data)
    print(f"Authentication Status: {response.status_code}")
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data['access']
        print("Successfully obtained access token")
    else:
        print("Authentication failed")
        print(response.json())
        return

    # Test getting skills
    print("\n2. Testing Skills Endpoint")
    print("-" * 50)
    
    response = make_request('GET', 'skills/', token=access_token)
    print(f"Skills Status: {response.status_code}")
    if response.status_code == 200:
        skills = response.json()
        print(f"Total skills: {len(skills['results'])}")
        print("Sample skills:")
        for skill in skills['results'][:3]:
            print(f"- {skill['name']} ({skill['category']})")

    # Test getting jobs
    print("\n3. Testing Jobs Endpoint")
    print("-" * 50)
    
    # Test different job filters
    filters = [
        '',
        '?category=IT',
        '?category=Blue+Collar',
        '?search=Python',
        '?ordering=-created_at'
    ]
    
    for filter_param in filters:
        response = make_request('GET', f'jobs/{filter_param}', token=access_token)
        print(f"\nJobs Status (filter: {filter_param}): {response.status_code}")
        if response.status_code == 200:
            jobs = response.json()
            print(f"Total jobs: {len(jobs['results'])}")
            if jobs['results']:
                print("First job:")
                job = jobs['results'][0]
                print(f"- Title: {job['title']}")
                print(f"- Company: {job['company']}")
                print(f"- Location: {job['location']}")

    # Test job recommendations
    print("\n4. Testing Job Recommendations")
    print("-" * 50)
    
    response = make_request('GET', 'jobs/recommended/', token=access_token)
    print(f"Recommendations Status: {response.status_code}")
    if response.status_code == 200:
        recommendations = response.json()
        print(f"Total recommendations: {len(recommendations)}")
        if recommendations:
            print("Sample recommendation:")
            job = recommendations[0]
            print(f"- Title: {job['title']}")
            print(f"- Company: {job['company']}")
            if 'match_score' in job:
                print(f"- Match Score: {job['match_score']}")

    print("\nAPI Testing Complete!")

if __name__ == '__main__':
    test_api()
