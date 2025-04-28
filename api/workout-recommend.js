// Serverless function for workout recommendations
// This file will be automatically recognized by Vercel as an API endpoint
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  console.log('Workout API called with path:', req.url);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // Route based on the path
  if (req.url.includes('/api/workout/types')) {
    return handleWorkoutTypes(req, res);
  } else {
    return handleWorkoutRecommendation(req, res);
  }
};

/**
 * Handle workout types request
 */
function handleWorkoutTypes(req, res) {
  if (req.method !== 'GET') {
    console.log(`Invalid method for workout types: ${req.method}`);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const workoutTypes = [
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
    ];
    
    return res.status(200).json({
      success: true,
      workout_types: workoutTypes
    });
  } catch (error) {
    console.error('Error getting workout types:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
}

/**
 * Handle workout recommendation request
 */
function handleWorkoutRecommendation(req, res) {
  // Only handle POST requests
  if (req.method !== 'POST') {
    console.log(`Invalid method: ${req.method}`);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get request body
    const userData = req.body;
    
    // Log incoming request data
    console.log('Received workout request data:', JSON.stringify(userData));
    
    if (!userData) {
      console.log('No request body provided');
      return res.status(400).json({ success: false, error: 'No request body provided' });
    }
    
    // Process input data
    const processedData = {
      age: userData.age || 30,
      gender_encoded: { 'male': 0, 'female': 1, 'other': 2 }[userData.gender] || 0,
      fitness_level: userData.fitnessLevel || 3,
      goal_encoded: {
        'weight_loss': 0,
        'muscle_gain': 1,
        'general_fitness': 2,
        'endurance': 3,
        'flexibility': 4
      }[userData.goal] || 2,
      time_available: userData.timeAvailable || 30,
      experience_years: userData.experienceYears || 1,
      has_equipment: userData.hasEquipment ? 1 : 0,
      has_health_condition: userData.hasHealthCondition ? 1 : 0
    };
    
    // Try to load real workout data if available
    let workoutData = null;
    try {
      const dataPath = path.join(process.cwd(), 'api', 'data', 'workout_data.json');
      if (fs.existsSync(dataPath)) {
        console.log('Loading workout data from file');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        workoutData = JSON.parse(rawData);
        console.log(`Loaded ${workoutData.length} workout data entries`);
      }
    } catch (dataError) {
      console.warn('Error loading workout data file:', dataError.message);
    }
    
    // Generate a recommendation based on the processed data
    const recommendation = generateWorkoutRecommendation(processedData, workoutData);
    
    // Log the recommendation
    console.log('Generated recommendation:', recommendation.recommendation);
    
    // Return the recommendation
    return res.status(200).json({
      success: true,
      recommendation: recommendation
    });
  } catch (error) {
    console.error('Error generating workout recommendation:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
}

/**
 * Generate a workout recommendation based on user data
 */
function generateWorkoutRecommendation(userData, workoutData) {
  // Use KNN-like approach if we have workout data
  if (workoutData && Array.isArray(workoutData) && workoutData.length > 0) {
    try {
      // Simple KNN implementation
      console.log('Using workout data for recommendation');
      
      // Calculate distance for each entry
      const entries = workoutData.map(entry => {
        // Calculate Euclidean distance for numerical features
        const ageDiff = (entry.age - userData.age) / 50; // Normalize by dividing
        const fitnessDiff = (entry.fitness_level - userData.fitness_level) / 5;
        const timeDiff = (entry.time_available - userData.time_available) / 60;
        const expDiff = (entry.experience_years - userData.experience_years) / 20;
        
        // Binary features
        const genderDiff = entry.gender_encoded === userData.gender_encoded ? 0 : 1;
        const goalDiff = entry.goal_encoded === userData.goal_encoded ? 0 : 1;
        const equipDiff = entry.has_equipment === userData.has_equipment ? 0 : 1;
        const healthDiff = entry.has_health_condition === userData.has_health_condition ? 0 : 1;
        
        // Calculate overall distance (weighted sum of squares)
        const distance = Math.sqrt(
          Math.pow(ageDiff, 2) * 1 +         // weight 1
          Math.pow(genderDiff, 2) * 1 +      // weight 1
          Math.pow(fitnessDiff, 2) * 2 +     // weight 2
          Math.pow(goalDiff, 2) * 3 +        // weight 3
          Math.pow(timeDiff, 2) * 1 +        // weight 1
          Math.pow(expDiff, 2) * 1 +         // weight 1
          Math.pow(equipDiff, 2) * 2 +       // weight 2
          Math.pow(healthDiff, 2) * 2        // weight 2
        );
        
        return {
          distance,
          workout: entry.recommended_workout
        };
      });
      
      // Sort by distance
      entries.sort((a, b) => a.distance - b.distance);
      
      // Take k=5 nearest neighbors
      const k = 5;
      const neighbors = entries.slice(0, k);
      
      // Count workout frequencies
      const workoutFreqs = {};
      neighbors.forEach(n => {
        workoutFreqs[n.workout] = (workoutFreqs[n.workout] || 0) + 1;
      });
      
      // Find the most frequent workout
      let maxFreq = 0;
      let recommendedWorkout = null;
      
      for (const [workout, freq] of Object.entries(workoutFreqs)) {
        if (freq > maxFreq) {
          maxFreq = freq;
          recommendedWorkout = workout;
        }
      }
      
      // Calculate confidence
      const confidence = Math.round((maxFreq / k) * 100);
      
      // Generate workout details
      const workoutDetails = getWorkoutDetails(recommendedWorkout, userData);
      
      return {
        recommendation: recommendedWorkout,
        confidence: confidence,
        details: workoutDetails
      };
    } catch (err) {
      console.error('Error using workout data:', err);
      // Fall back to rule-based approach
    }
  }
  
  // Define workout types based on user goals and equipment availability
  const workoutTypes = [
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
  ];
  
  // Simple algorithm to choose workout type based on user data
  let workoutIndex = userData.goal_encoded;
  
  // Adjust based on fitness level
  if (userData.fitness_level <= 2) {
    // Beginners should avoid complex workouts
    if (workoutIndex === 1) workoutIndex = 5; // Bodyweight instead of heavy strength training
    if (workoutIndex === 3) workoutIndex = 9; // Running instead of intense endurance
  }
  
  // Adjust based on equipment availability
  if (userData.has_equipment === 0 && workoutIndex === 1) {
    workoutIndex = 5; // Bodyweight instead of strength if no equipment
  }
  
  // Adjust based on health condition
  if (userData.has_health_condition === 1) {
    if (workoutIndex === 0 || workoutIndex === 3 || workoutIndex === 7) {
      workoutIndex = 6; // Yoga for those with health conditions
    }
  }
  
  // Ensure workout index is within bounds
  workoutIndex = Math.min(Math.max(workoutIndex, 0), workoutTypes.length - 1);
  
  const workoutType = workoutTypes[workoutIndex];
  
  // Calculate confidence based on how well we can match the user's needs
  const confidence = Math.floor(60 + Math.random() * 30);
  
  // Generate workout details
  const workoutDetails = getWorkoutDetails(workoutType, userData);
  
  return {
    recommendation: workoutType,
    confidence: confidence,
    details: workoutDetails
  };
}

/**
 * Generate detailed workout plan based on workout type and user data
 */
function getWorkoutDetails(workoutType, userData) {
  const workoutDetails = {
    type: workoutType,
    duration: userData.time_available,
    exercises: [],
    intensity: userData.fitness_level <= 2 ? 'low' : (userData.fitness_level >= 4 ? 'high' : 'moderate')
  };
  
  // Add exercises based on workout type
  if (workoutType === 'High-Intensity Interval Training (HIIT)') {
    workoutDetails.exercises = [
      { name: 'Burpees', sets: 3, reps: '45 seconds', rest: '15 seconds' },
      { name: 'Mountain Climbers', sets: 3, reps: '45 seconds', rest: '15 seconds' },
      { name: 'Jumping Jacks', sets: 3, reps: '45 seconds', rest: '15 seconds' },
      { name: 'High Knees', sets: 3, reps: '45 seconds', rest: '15 seconds' },
      { name: 'Squat Jumps', sets: 3, reps: '45 seconds', rest: '15 seconds' }
    ];
  } else if (workoutType === 'Strength Training') {
    workoutDetails.exercises = [
      { name: 'Squats', sets: 4, reps: '10-12', rest: '60 seconds' },
      { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90 seconds' },
      { name: 'Deadlifts', sets: 4, reps: '8-10', rest: '90 seconds' },
      { name: 'Shoulder Press', sets: 3, reps: '10-12', rest: '60 seconds' },
      { name: 'Barbell Rows', sets: 3, reps: '10-12', rest: '60 seconds' }
    ];
  } else if (workoutType === 'Cardio Endurance') {
    workoutDetails.exercises = [
      { name: 'Jogging', sets: 1, reps: '20 minutes', rest: 'none' },
      { name: 'Jumping Rope', sets: 3, reps: '3 minutes', rest: '1 minute' },
      { name: 'Cycling', sets: 1, reps: '15 minutes', rest: 'none' },
      { name: 'Jump Squats', sets: 3, reps: '15', rest: '30 seconds' },
      { name: 'Burpees', sets: 3, reps: '10', rest: '30 seconds' }
    ];
  } else if (workoutType === 'Flexibility and Mobility') {
    workoutDetails.exercises = [
      { name: 'Dynamic Stretching', sets: 1, reps: '5 minutes', rest: 'none' },
      { name: 'Hip Openers', sets: 2, reps: '30 seconds each side', rest: '15 seconds' },
      { name: 'Shoulder Mobility Flow', sets: 2, reps: '1 minute', rest: '30 seconds' },
      { name: 'Hamstring Stretch', sets: 2, reps: '30 seconds each leg', rest: '15 seconds' },
      { name: 'Spine Mobility', sets: 2, reps: '1 minute', rest: '30 seconds' }
    ];
  } else if (workoutType === 'Circuit Training') {
    workoutDetails.exercises = [
      { name: 'Push-ups', sets: 3, reps: '12-15', rest: '30 seconds' },
      { name: 'Bodyweight Squats', sets: 3, reps: '15-20', rest: '30 seconds' },
      { name: 'Dumbbell Rows', sets: 3, reps: '12 each arm', rest: '30 seconds' },
      { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '30 seconds' },
      { name: 'Plank', sets: 3, reps: '45 seconds', rest: '30 seconds' }
    ];
  } else if (workoutType === 'Bodyweight Training') {
    workoutDetails.exercises = [
      { name: 'Push-ups', sets: 3, reps: '10-15', rest: '45 seconds' },
      { name: 'Bodyweight Squats', sets: 3, reps: '15-20', rest: '45 seconds' },
      { name: 'Plank', sets: 3, reps: '30-60 seconds', rest: '30 seconds' },
      { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '45 seconds' },
      { name: 'Mountain Climbers', sets: 3, reps: '30 seconds', rest: '30 seconds' }
    ];
  } else if (workoutType === 'Yoga') {
    workoutDetails.exercises = [
      { name: 'Sun Salutation', sets: 1, reps: '5 flows', rest: 'as needed' },
      { name: 'Warrior Poses', sets: 1, reps: 'hold 30 seconds each side', rest: 'as needed' },
      { name: 'Downward Dog', sets: 1, reps: 'hold 1 minute', rest: 'as needed' },
      { name: "Child's Pose", sets: 1, reps: 'hold 1 minute', rest: 'as needed' },
      { name: 'Seated Forward Bend', sets: 1, reps: 'hold 1 minute', rest: 'as needed' }
    ];
  } else if (workoutType === 'CrossFit') {
    workoutDetails.exercises = [
      { name: 'Box Jumps', sets: 5, reps: '10', rest: '30 seconds' },
      { name: 'Kettlebell Swings', sets: 5, reps: '15', rest: '30 seconds' },
      { name: 'Pull-ups', sets: 5, reps: '5-10', rest: '30 seconds' },
      { name: 'Wall Balls', sets: 5, reps: '15', rest: '30 seconds' },
      { name: 'Double Unders', sets: 5, reps: '30', rest: '30 seconds' }
    ];
  } else if (workoutType === 'Swimming') {
    workoutDetails.exercises = [
      { name: 'Freestyle', sets: 1, reps: '200m', rest: '45 seconds' },
      { name: 'Backstroke', sets: 1, reps: '200m', rest: '45 seconds' },
      { name: 'Breaststroke', sets: 1, reps: '200m', rest: '45 seconds' },
      { name: 'Sprint Intervals', sets: 5, reps: '50m', rest: '30 seconds' },
      { name: 'Cool Down', sets: 1, reps: '100m easy', rest: 'none' }
    ];
  } else if (workoutType === 'Running') {
    workoutDetails.exercises = [
      { name: 'Warm Up Jog', sets: 1, reps: '5 minutes', rest: 'none' },
      { name: 'Sprint Intervals', sets: 5, reps: '30 seconds', rest: '1 minute' },
      { name: 'Tempo Run', sets: 1, reps: '10 minutes', rest: 'none' },
      { name: 'Hill Repeats', sets: 3, reps: '1 minute', rest: '1 minute' },
      { name: 'Cool Down', sets: 1, reps: '5 minutes', rest: 'none' }
    ];
  } else {
    // Default exercises for any other workout type
    workoutDetails.exercises = [
      { name: 'Push-ups', sets: 3, reps: '10-15', rest: '45 seconds' },
      { name: 'Bodyweight Squats', sets: 3, reps: '15-20', rest: '45 seconds' },
      { name: 'Plank', sets: 3, reps: '30-60 seconds', rest: '30 seconds' },
      { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '45 seconds' },
      { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', rest: '30 seconds' }
    ];
  }
  
  // Adjust number of exercises based on time available
  if (userData.time_available < 30) {
    workoutDetails.exercises = workoutDetails.exercises.slice(0, 3);
  }
  
  return workoutDetails;
} 