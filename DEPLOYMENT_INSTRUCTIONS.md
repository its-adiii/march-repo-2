# Full Deployment Instructions for HireMe AI

To push your fully integrated, Kaggle-trained HireMe app to production, follow these steps.

## Backend Deployment (Render or Heroku)
The Python Flask backend is responsible for hosting the 21,550-row ML recommendation logic and serving CV analyses.
1. Make sure your latest code (including the brand new `jobs.db` and `job_recommendation_model.pkl`) is committed to a GitHub repository.
2. Go to **Render** (or Railway/Heroku).
3. Create a new **Web Service** hooked to your `backend` repository directory.
4. Set the build command to: `pip install -r requirements.txt` *(Note: ensure `gunicorn` and `flask_cors` are in there!)*
5. Set the Start command to: `gunicorn app:app`
6. Once deployed, Render will grant you an API URL (e.g. `https://hireme-api.onrender.com`). Save this!

## Frontend Deployment (Netlify)
The highly styled React frontend now statically talks to whatever API URL you provide it via Environment Variables.
1. Open the `.env` file within the `frontend` folder. Replace `http://localhost:5000` with the actual backend URL given to you by Render.
    ```
    REACT_APP_API_URL=https://hireme-api.onrender.com
    ```
2. Open a terminal navigated to `frontend` and run: `npm run build`
3. This creates a `build` envelope folder. 
4. Drag and drop the single `build` folder into Netlify's manual upload interface.
5. Your Boutique Job Platform is now live, fully connected to the active AI endpoint!
