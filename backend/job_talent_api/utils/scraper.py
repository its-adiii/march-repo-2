import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from datetime import datetime
import json
import logging
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JobScraper:
    def __init__(self):
        self.setup_driver()
        
    def setup_driver(self):
        try:
            # Try Edge WebDriver
            edge_options = EdgeOptions()
            edge_options.add_argument("--headless")
            edge_options.add_argument("--no-sandbox")
            edge_options.add_argument("--disable-dev-shm-usage")
            edge_options.add_argument(f"user-agent={UserAgent().random}")
            
            service = EdgeService(EdgeChromiumDriverManager().install())
            self.driver = webdriver.Edge(service=service, options=edge_options)
            logger.info("Successfully initialized Edge WebDriver")
            
        except Exception as edge_error:
            logger.error(f"Failed to initialize Edge driver: {edge_error}")
            try:
                # Fallback to Chrome WebDriver
                chrome_options = Options()
                chrome_options.add_argument("--headless")
                chrome_options.add_argument("--no-sandbox")
                chrome_options.add_argument("--disable-dev-shm-usage")
                chrome_options.add_argument(f"user-agent={UserAgent().random}")
                
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                logger.info("Successfully initialized Chrome WebDriver")
                
            except Exception as chrome_error:
                logger.error(f"Failed to initialize Chrome driver: {chrome_error}")
                raise Exception("Failed to initialize any WebDriver")
        
        self.wait = WebDriverWait(self.driver, 10)

    def scrape_jobs(self, job_title, location="Punjab, India", num_pages=3):
        jobs = []
        # Using Indeed as it's more reliable for scraping
        base_url = f"https://in.indeed.com/jobs?q={job_title.replace(' ', '+')}&l={location.replace(' ', '+')}"
        
        try:
            for page in range(num_pages):
                url = f"{base_url}&start={page*10}" if page > 0 else base_url
                self.driver.get(url)
                time.sleep(random.uniform(2, 4))  # Random delay to avoid detection
                
                # Wait for job listings to load
                self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "job_seen_beacon")))
                
                # Parse the page
                soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                job_cards = soup.find_all("div", class_="job_seen_beacon")
                
                for card in job_cards:
                    try:
                        # Extract job details
                        title_elem = card.find("h2", class_="jobTitle")
                        company_elem = card.find("span", class_="companyName")
                        location_elem = card.find("div", class_="companyLocation")
                        
                        job_data = {
                            'title': title_elem.text.strip() if title_elem else "Not specified",
                            'company': company_elem.text.strip() if company_elem else "Not specified",
                            'location': location_elem.text.strip() if location_elem else location,
                            'job_type': self._extract_job_type(card),
                            'salary_range': self._extract_salary(card),
                            'description': self._extract_description(card),
                            'requirements': self._extract_requirements(card),
                            'source': 'Indeed',
                            'scraped_date': datetime.now().isoformat(),
                            'category': 'Blue Collar' if job_title.lower() in ['cnc operator', 'plumber', 'mechanic', 'carpenter', 'painter'] else 'IT'
                        }
                        jobs.append(job_data)
                        logger.info(f"Scraped job: {job_data['title']} at {job_data['company']}")
                        
                    except Exception as e:
                        logger.error(f"Error parsing job card: {e}")
                        continue
                
                logger.info(f"Scraped page {page + 1} for {job_title}")
                time.sleep(random.uniform(1, 3))  # Random delay between pages
                
        except Exception as e:
            logger.error(f"Error scraping {job_title}: {e}")
        
        return jobs

    def _extract_job_type(self, card):
        try:
            metadata = card.find("div", class_="metadata")
            if metadata:
                job_types = metadata.find_all("div", class_="attribute_snippet")
                for job_type in job_types:
                    if any(term in job_type.text.lower() for term in ['full-time', 'part-time', 'contract', 'permanent']):
                        return job_type.text.strip()
            return "Not specified"
        except:
            return "Not specified"

    def _extract_salary(self, card):
        try:
            salary = card.find("div", class_="salary-snippet")
            if not salary:
                salary = card.find("div", class_="metadata", string=lambda x: '₹' in str(x))
            return salary.text.strip() if salary else "Not disclosed"
        except:
            return "Not disclosed"

    def _extract_description(self, card):
        try:
            description = card.find("div", class_="job-snippet")
            return description.text.strip() if description else "No description available"
        except:
            return "No description available"

    def _extract_requirements(self, card):
        try:
            description = self._extract_description(card)
            # Extract requirements from description (basic approach)
            requirements = []
            lines = description.split('\n')
            for line in lines:
                if any(keyword in line.lower() for keyword in ['require', 'qualification', 'skill', 'experience', 'education']):
                    requirements.append(line.strip())
            return requirements if requirements else ["No specific requirements listed"]
        except:
            return ["No specific requirements listed"]

    def close(self):
        if hasattr(self, 'driver'):
            self.driver.quit()

def scrape_all_jobs():
    scraper = JobScraper()
    all_jobs = []
    
    try:
        # Blue collar jobs in Punjab
        blue_collar_jobs = ['cnc operator', 'plumber', 'mechanic', 'carpenter', 'painter']
        for job in blue_collar_jobs:
            jobs = scraper.scrape_jobs(job, "Punjab, India", num_pages=2)
            all_jobs.extend(jobs)
            time.sleep(random.uniform(2, 4))
        
        # IT jobs in India
        it_jobs = ['software engineer', 'data scientist', 'web developer', 'devops engineer', 'system administrator']
        for job in it_jobs:
            jobs = scraper.scrape_jobs(job, "India", num_pages=2)
            all_jobs.extend(jobs)
            time.sleep(random.uniform(2, 4))
    
    except Exception as e:
        logger.error(f"Error in scrape_all_jobs: {e}")
    
    finally:
        scraper.close()
    
    return all_jobs
