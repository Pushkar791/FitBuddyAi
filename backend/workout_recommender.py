import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
import logging
import json
import os
import random

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WorkoutRecommender:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.workout_data = None
        self.feature_columns = ['age', 'gender_encoded', 'fitness_level', 'goal_encoded', 
                               'time_available', 'experience_years', 'has_equipment', 
                               'has_health_condition']
        
        # Load or create training data
        self._load_workout_data()
        
        # Train model
        self._train_model()
        
        logger.info("Workout recommender initialized")

    def _load_workout_data(self):
        """Load workout data from JSON file or create if it doesn't exist"""
        try:
            data_file = os.path.join(os.path.dirname(__file__), 'data', 'workout_data.json')
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(data_file), exist_ok=True)
            
            if os.path.exists(data_file):
                # Load existing data
                with open(data_file, 'r') as f:
                    self.workout_data = pd.DataFrame(json.load(f))
                logger.info(f"Loaded workout data with {len(self.workout_data)} entries")
            else:
                # Create synthetic training data
                logger.info("Creating synthetic workout data")
                self.workout_data = self._create_synthetic_data()
                
                # Save data
                with open(data_file, 'w') as f:
                    json.dump(self.workout_data.to_dict('records'), f)
        except Exception as e:
            logger.error(f"Error loading workout data: {e}")
            # Fallback to synthetic data
            self.workout_data = self._create_synthetic_data()

    def _create_synthetic_data(self):
        """Create synthetic training data for model"""
        # Create sample data with ~100 entries
        n_samples = 100
        
        # Define possible values for categorical variables
        goals = ['weight_loss', 'muscle_gain', 'general_fitness', 'endurance', 'flexibility']
        genders = ['male', 'female', 'other']
        
        # Create general workout types for recommendations
        workout_types = [
            'High-Intensity Interval Training (HIIT)',
            'Strength Training',
            'Cardio Endurance',
            'Flexibility and Mobility',
            'Circuit Training',
            'Bodyweight Training',
            'Yoga',
            'CrossFit',
            'Swimming',
            'Running'
        ]
        
        # Generate random data
        data = {
            'age': np.random.randint(18, 70, n_samples),
            'gender': np.random.choice(genders, n_samples),
            'fitness_level': np.random.randint(1, 6, n_samples),  # 1-5 scale
            'goal': np.random.choice(goals, n_samples),
            'time_available': np.random.randint(15, 90, n_samples),  # minutes
            'experience_years': np.random.randint(0, 20, n_samples),
            'has_equipment': np.random.choice([0, 1], n_samples),
            'has_health_condition': np.random.choice([0, 1], n_samples),
            'recommended_workout': np.random.choice(workout_types, n_samples)
        }
        
        # Create logical connections between features and recommendations
        df = pd.DataFrame(data)
        
        # Logic-based adjustments to make recommendations more realistic
        for i, row in df.iterrows():
            # Beginners with low fitness level should get simpler workouts
            if row['fitness_level'] <= 2 and row['experience_years'] < 1:
                if row['goal'] == 'weight_loss':
                    df.at[i, 'recommended_workout'] = 'Bodyweight Training'
                elif row['goal'] == 'flexibility':
                    df.at[i, 'recommended_workout'] = 'Yoga'
                else:
                    df.at[i, 'recommended_workout'] = 'Cardio Endurance'
            
            # For those with health conditions, recommend safer options
            if row['has_health_condition'] == 1:
                safer_options = ['Yoga', 'Swimming', 'Flexibility and Mobility']
                df.at[i, 'recommended_workout'] = random.choice(safer_options)
            
            # For muscle gain with equipment
            if row['goal'] == 'muscle_gain' and row['has_equipment'] == 1:
                df.at[i, 'recommended_workout'] = 'Strength Training'
            
            # Short on time but want intensity
            if row['time_available'] < 30 and row['fitness_level'] >= 3:
                df.at[i, 'recommended_workout'] = 'High-Intensity Interval Training (HIIT)'
            
            # Highly experienced wanting challenge
            if row['experience_years'] > 5 and row['fitness_level'] >= 4:
                df.at[i, 'recommended_workout'] = 'CrossFit'
        
        # Encode categorical variables
        df['gender_encoded'] = df['gender'].map({'male': 0, 'female': 1, 'other': 2})
        df['goal_encoded'] = df['goal'].map({
            'weight_loss': 0, 
            'muscle_gain': 1, 
            'general_fitness': 2, 
            'endurance': 3, 
            'flexibility': 4
        })
        
        return df

    def _train_model(self):
        """Train the KNN model on workout data"""
        try:
            if self.workout_data is not None and len(self.workout_data) > 0:
                # Prepare features and target
                X = self.workout_data[self.feature_columns]
                y = self.workout_data['recommended_workout']
                
                # Scale features
                self.scaler = StandardScaler()
                X_scaled = self.scaler.fit_transform(X)
                
                # Train KNN classifier
                self.model = KNeighborsClassifier(n_neighbors=5)
                self.model.fit(X_scaled, y)
                
                logger.info("Workout recommendation model trained successfully")
            else:
                logger.error("No workout data available for training")
        except Exception as e:
            logger.error(f"Error training workout model: {e}")

    def recommend_workout(self, user_data):
        """Recommend workout based on user data"""
        try:
            if self.model is None:
                return {
                    "error": "Model not available",
                    "recommendation": "High-Intensity Interval Training (HIIT)",  # fallback
                    "confidence": 0
                }
            
            # Process input
            input_features = []
            for col in self.feature_columns:
                if col in user_data:
                    input_features.append(user_data[col])
                else:
                    # Use default values for missing features
                    input_features.append(0)
            
            # Scale input
            input_scaled = self.scaler.transform([input_features])
            
            # Get prediction and probabilities
            prediction = self.model.predict(input_scaled)[0]
            probabilities = self.model.predict_proba(input_scaled)[0]
            confidence = round(max(probabilities) * 100)
            
            workout_details = self._get_workout_details(prediction, user_data)
            
            return {
                "recommendation": prediction,
                "confidence": confidence,
                "details": workout_details
            }
            
        except Exception as e:
            logger.error(f"Error generating workout recommendation: {e}")
            return {
                "error": str(e),
                "recommendation": "General Fitness Routine",  # fallback
                "confidence": 0
            }
    
    def _get_workout_details(self, workout_type, user_data):
        """Generate detailed workout plan based on recommendation"""
        workout_details = {
            "type": workout_type,
            "duration": user_data.get("time_available", 30),
            "exercises": [],
            "intensity": "moderate"
        }
        
        # Adjust intensity based on fitness level
        fitness_level = user_data.get("fitness_level", 3)
        if fitness_level <= 2:
            workout_details["intensity"] = "low"
        elif fitness_level >= 4:
            workout_details["intensity"] = "high"
        
        # Add exercises based on workout type
        if workout_type == "High-Intensity Interval Training (HIIT)":
            workout_details["exercises"] = [
                {"name": "Burpees", "sets": 3, "reps": "45 seconds", "rest": "15 seconds"},
                {"name": "Mountain Climbers", "sets": 3, "reps": "45 seconds", "rest": "15 seconds"},
                {"name": "Jumping Jacks", "sets": 3, "reps": "45 seconds", "rest": "15 seconds"},
                {"name": "High Knees", "sets": 3, "reps": "45 seconds", "rest": "15 seconds"},
                {"name": "Squat Jumps", "sets": 3, "reps": "45 seconds", "rest": "15 seconds"}
            ]
        elif workout_type == "Strength Training":
            workout_details["exercises"] = [
                {"name": "Squats", "sets": 4, "reps": "10-12", "rest": "60 seconds"},
                {"name": "Bench Press", "sets": 4, "reps": "8-10", "rest": "90 seconds"},
                {"name": "Deadlifts", "sets": 4, "reps": "8-10", "rest": "90 seconds"},
                {"name": "Shoulder Press", "sets": 3, "reps": "10-12", "rest": "60 seconds"},
                {"name": "Barbell Rows", "sets": 3, "reps": "10-12", "rest": "60 seconds"}
            ]
        elif workout_type == "Yoga":
            workout_details["exercises"] = [
                {"name": "Sun Salutation", "sets": 1, "reps": "5 flows", "rest": "as needed"},
                {"name": "Warrior Poses", "sets": 1, "reps": "hold 30 seconds each side", "rest": "as needed"},
                {"name": "Downward Dog", "sets": 1, "reps": "hold 1 minute", "rest": "as needed"},
                {"name": "Child's Pose", "sets": 1, "reps": "hold 1 minute", "rest": "as needed"},
                {"name": "Seated Forward Bend", "sets": 1, "reps": "hold 1 minute", "rest": "as needed"}
            ]
        elif workout_type == "Cardio Endurance":
            workout_details["exercises"] = [
                {"name": "Jogging", "sets": 1, "reps": "20 minutes", "rest": "none"},
                {"name": "Jumping Rope", "sets": 3, "reps": "3 minutes", "rest": "1 minute"},
                {"name": "Cycling", "sets": 1, "reps": "15 minutes", "rest": "none"},
                {"name": "Jump Squats", "sets": 3, "reps": "15", "rest": "30 seconds"},
                {"name": "Burpees", "sets": 3, "reps": "10", "rest": "30 seconds"}
            ]
        else:
            # Default exercises
            workout_details["exercises"] = [
                {"name": "Push-ups", "sets": 3, "reps": "10-15", "rest": "45 seconds"},
                {"name": "Bodyweight Squats", "sets": 3, "reps": "15-20", "rest": "45 seconds"},
                {"name": "Plank", "sets": 3, "reps": "30-60 seconds", "rest": "30 seconds"},
                {"name": "Lunges", "sets": 3, "reps": "10 each leg", "rest": "45 seconds"},
                {"name": "Mountain Climbers", "sets": 3, "reps": "30 seconds", "rest": "30 seconds"}
            ]
        
        # Adjust number of exercises based on time available
        time_available = user_data.get("time_available", 30)
        if time_available < 30:
            workout_details["exercises"] = workout_details["exercises"][:3]
        
        return workout_details

    def get_workout_types(self):
        """Return list of available workout types"""
        if self.workout_data is not None:
            return sorted(self.workout_data['recommended_workout'].unique().tolist())
        return [
            'High-Intensity Interval Training (HIIT)',
            'Strength Training',
            'Cardio Endurance',
            'Flexibility and Mobility',
            'Circuit Training',
            'Bodyweight Training',
            'Yoga',
            'CrossFit',
            'Swimming',
            'Running'
        ]

# For testing
if __name__ == "__main__":
    recommender = WorkoutRecommender()
    
    # Test with sample user data
    user_data = {
        'age': 30,
        'gender_encoded': 1,  # female
        'fitness_level': 3,
        'goal_encoded': 0,  # weight loss
        'time_available': 45,
        'experience_years': 2,
        'has_equipment': 0,
        'has_health_condition': 0
    }
    
    recommendation = recommender.recommend_workout(user_data)
    print(f"Recommended workout: {recommendation['recommendation']}")
    print(f"Confidence: {recommendation['confidence']}%")
    print("Workout details:", json.dumps(recommendation['details'], indent=2)) 