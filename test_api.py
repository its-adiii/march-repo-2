import requests
import json

# Test the API with sample resume text
def test_api():
    url = "http://localhost:5000/api/recommendations"
    
    sample_resume = {
        "resume_text": "Experienced React developer with 5 years in frontend development. Proficient in JavaScript, TypeScript, Node.js, HTML, CSS, REST APIs, and state management."
    }
    
    try:
        response = requests.post(url, json=sample_resume)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Test Successful!")
            print(f"Found {len(data['recommendations'])} recommendations")
            
            for i, job in enumerate(data['recommendations'][:3], 1):
                print(f"\n{i}. {job['title']} at {job['company']}")
                print(f"   Match Score: {job['match_score']}%")
                print(f"   Location: {job['location']}")
                print(f"   Skills: {', '.join(job['skills'][:3])}")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_api()
