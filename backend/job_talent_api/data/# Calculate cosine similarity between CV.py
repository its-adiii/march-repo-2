        # Calculate cosine similarity between CV and each job
        cv_vector = tfidf_matrix[0]
        job_vectors = tfidf_matrix[1:]
        similarities = cosine_similarity(cv_vector, job_vectors)
        
        return similarities[0]
        
    def find_similar_jobs_knn(self, cv_features, job_features):
        """Find similar jobs using KNN."""
        # Fit KNN model on job features
        self.knn_model.fit(job_features)
        
        # Find nearest neighbors
        distances, indices = self.knn_model.kneighbors(cv_features.reshape(1, -1))
        
        return distances[0], indices[0]
        
    def extract_features(self, text):
        """Extract numerical features from text for KNN."""
        # Example features:
        # - Skill count
        # - Experience years
        # - Education level
        # - Role seniority
        # Add more sophisticated feature extraction here
        features = []
        return np.array(features)
        
    def calculate_enhanced_score(self, cv_text, job_text, cv_skills, job_skills):
        """Calculate enhanced similarity score using multiple techniques."""
        # 1. TF-IDF + Cosine Similarity (40%)
        tfidf_similarity = self.calculate_skill_similarity(cv_text, [job_text])[0]
        tfidf_score = tfidf_similarity * 40
        
        # 2. Traditional Skill Matching (30%)
        matching_skills = cv_skills.intersection(job_skills)
        skill_score = len(matching_skills) / max(len(job_skills), 1) * 30
        
        # 3. KNN-based Similarity (30%)
        cv_features = self.extract_features(cv_text)
        job_features = self.extract_features(job_text)
        distances, _ = self.find_similar_jobs_knn(cv_features, job_features.reshape(1, -1))
        knn_score = (1 - distances[0]) * 30  # Normalize distance to score
        
        # Combine scores
        total_score = tfidf_score + skill_score + knn_score
        
        return total_score, {
            'tfidf_score': tfidf_score,
            'skill_score': skill_score,
            'knn_score': knn_score
        }

        #return