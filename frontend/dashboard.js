// Progress Dashboard
// This script handles the dashboard functionality for tracking mental and physical balance

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check for dashboard page
  if (window.location.hash === '#dashboard') {
    loadDashboardPage();
  }
  
  // Listen for hash changes
  window.addEventListener('hashchange', function() {
    if (window.location.hash === '#dashboard') {
      loadDashboardPage();
    }
  });
});

// Load dashboard page
function loadDashboardPage() {
  // Make sure the user is authenticated
  const auth = firebase.auth();
  const user = auth.currentUser;
  
  if (!user) {
    // Redirect to login if not authenticated
    window.location.hash = 'login';
    return;
  }
  
  // Create or show the dashboard container
  let dashboardContainer = document.getElementById('dashboard-container');
  if (!dashboardContainer) {
    dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'dashboard-container';
    dashboardContainer.className = 'dashboard-container';
    document.body.appendChild(dashboardContainer);
  } else {
    dashboardContainer.style.display = 'block';
  }
  
  // Show loading state
  dashboardContainer.innerHTML = `
    <div class="dashboard-loading">
      <div class="loading-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  `;
  
  // Get user profile data
  getUserProfileData(user.uid)
    .then((profileData) => {
      if (!profileData) {
        // Redirect to profile setup if no profile data exists
        window.location.hash = 'profile';
        return;
      }
      
      // Get health metrics data
      getHealthMetricsData(user.uid)
        .then((metricsData) => {
          renderDashboard(user, profileData, metricsData);
        })
        .catch((error) => {
          console.error("Error loading health metrics:", error);
          renderDashboard(user, profileData);
        });
    })
    .catch((error) => {
      console.error("Error loading profile data:", error);
      // Show error state
      dashboardContainer.innerHTML = `
        <div class="dashboard-error">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Dashboard</h3>
          <p>${error.message}</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
        </div>
      `;
    });
  
  // Hide other sections
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });
}

// Get user profile data from Firestore
async function getUserProfileData(userId) {
  // Make sure Firebase and Firestore are available
  if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
    console.error('Firestore not available');
    return null;
  }
  
  try {
    const db = firebase.firestore();
    const doc = await db.collection('user_profiles').doc(userId).get();
    
    if (doc.exists) {
      return doc.data();
    } else {
      console.log('No profile data found for user:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting profile data:', error);
    throw error;
  }
}

// Get health metrics data from Firestore
async function getHealthMetricsData(userId) {
  // Make sure Firebase and Firestore are available
  if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
    console.error('Firestore not available');
    return null;
  }
  
  try {
    const db = firebase.firestore();
    
    // Get the last 30 days of metrics
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const snapshot = await db.collection('health_metrics')
      .where('userId', '==', userId)
      .where('date', '>=', thirtyDaysAgo)
      .orderBy('date', 'asc')
      .limit(30)
      .get();
    
    if (snapshot.empty) {
      console.log('No health metrics found for user:', userId);
      return generateMockHealthData(); // For demo purposes
    }
    
    const metrics = [];
    snapshot.forEach(doc => {
      metrics.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate() // Convert Firestore timestamp to JS Date
      });
    });
    
    return metrics;
  } catch (error) {
    console.error('Error getting health metrics:', error);
    return generateMockHealthData(); // For demo purposes
  }
}

// Generate mock health data for demo purposes
function generateMockHealthData() {
  const metrics = [];
  const today = new Date();
  
  // Generate data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    metrics.push({
      date: date,
      mentalScore: Math.floor(Math.random() * 30) + 70, // 70-100
      physicalScore: Math.floor(Math.random() * 35) + 60, // 60-95
      sleepQuality: Math.floor(Math.random() * 40) + 60, // 60-100
      stressLevel: Math.floor(Math.random() * 50) + 30, // 30-80
      mindfulnessMinutes: Math.floor(Math.random() * 30) + 5, // 5-35
      weeklyWorkouts: Math.floor(Math.random() * 4) + 1, // 1-5
      mood: ['happy', 'neutral', 'stressed', 'tired', 'energetic'][Math.floor(Math.random() * 5)]
    });
  }
  
  return metrics;
}

// Render dashboard
function renderDashboard(user, profileData, metricsData = []) {
  const dashboardContainer = document.getElementById('dashboard-container');
  
  // Calculate summary metrics
  const summaryMetrics = calculateSummaryMetrics(metricsData);
  
  // Calculate wellness score (0-100)
  const wellnessScore = calculateWellnessScore(summaryMetrics);
  
  // Calculate balance between mental and physical scores
  const mentalPercentage = summaryMetrics.mentalScore / (summaryMetrics.mentalScore + summaryMetrics.physicalScore) * 100;
  const physicalPercentage = 100 - mentalPercentage;
  
  dashboardContainer.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-user-welcome">
        <img src="${profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName || 'User')}&size=64&background=random`}" alt="Profile" class="user-avatar">
        <div>
          <h2>Welcome back, ${profileData.displayName || 'User'}</h2>
          <p>Here's your wellness overview</p>
        </div>
      </div>
      <div class="dashboard-actions">
        <button class="btn btn-outline" onclick="window.location.hash = 'profile'">
          <i class="fas fa-user-edit"></i> Edit Profile
        </button>
        <button class="btn btn-primary" id="refresh-dashboard">
          <i class="fas fa-sync-alt"></i> Refresh Data
        </button>
      </div>
    </div>
    
    <div class="dashboard-overview">
      <div class="dashboard-card wellness-score-card">
        <div class="wellness-score-display">
          <div class="circular-progress" data-value="${wellnessScore}">
            <div class="circular-progress-inner">
              <div class="circular-progress-circle" style="--progress: ${wellnessScore}%"></div>
              <div class="circular-progress-value">${wellnessScore}</div>
            </div>
          </div>
          <div class="wellness-score-text">
            <h3>Wellness Score</h3>
            <p>Based on your mental and physical metrics</p>
          </div>
        </div>
        <div class="wellness-balance">
          <h4>Mind-Body Balance</h4>
          <div class="balance-bar">
            <div class="mental-bar" style="width: ${mentalPercentage}%">
              <span>Mental ${Math.round(mentalPercentage)}%</span>
            </div>
            <div class="physical-bar" style="width: ${physicalPercentage}%">
              <span>Physical ${Math.round(physicalPercentage)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-card insight-card">
        <div class="insight-icon ${getWellnessInsightIcon(wellnessScore)}">
          <i class="fas ${getWellnessInsightIcon(wellnessScore)}"></i>
        </div>
        <div class="insight-content">
          <h3>Wellness Insight</h3>
          <p>${generateWellnessInsight(summaryMetrics, wellnessScore)}</p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-metrics-grid">
      <div class="dashboard-card">
        <div class="metric-header">
          <h3>Mental Wellness</h3>
          <div class="metric-score">${summaryMetrics.mentalScore}/100</div>
        </div>
        <div class="metric-chart-container">
          <canvas id="mental-chart"></canvas>
        </div>
      </div>
      
      <div class="dashboard-card">
        <div class="metric-header">
          <h3>Physical Wellness</h3>
          <div class="metric-score">${summaryMetrics.physicalScore}/100</div>
        </div>
        <div class="metric-chart-container">
          <canvas id="physical-chart"></canvas>
        </div>
      </div>
      
      <div class="dashboard-card">
        <div class="metric-header">
          <h3>Sleep Quality</h3>
          <div class="metric-score">${summaryMetrics.sleepQuality}/100</div>
        </div>
        <div class="metric-chart-container">
          <canvas id="sleep-chart"></canvas>
        </div>
      </div>
      
      <div class="dashboard-card">
        <div class="metric-header">
          <h3>Stress Level</h3>
          <div class="metric-score">${summaryMetrics.stressLevel}/100</div>
        </div>
        <div class="metric-chart-container">
          <canvas id="stress-chart"></canvas>
        </div>
      </div>
    </div>
    
    <div class="dashboard-activities">
      <div class="dashboard-card activity-trends">
        <h3>Activity Trends</h3>
        <div class="activity-metrics">
          <div class="activity-metric">
            <div class="activity-icon">
              <i class="fas fa-dumbbell"></i>
            </div>
            <div class="activity-detail">
              <h4>Weekly Workouts</h4>
              <div class="activity-value">${summaryMetrics.weeklyWorkouts}</div>
            </div>
          </div>
          
          <div class="activity-metric">
            <div class="activity-icon">
              <i class="fas fa-brain"></i>
            </div>
            <div class="activity-detail">
              <h4>Mindfulness Minutes</h4>
              <div class="activity-value">${summaryMetrics.mindfulnessMinutes}/day</div>
            </div>
          </div>
          
          <div class="activity-metric">
            <div class="activity-icon">
              <i class="fas fa-heartbeat"></i>
            </div>
            <div class="activity-detail">
              <h4>Mood</h4>
              <div class="activity-value">${summaryMetrics.mostFrequentMood || 'Neutral'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-card recommendations">
        <h3>Recommended For You</h3>
        <div class="recommendation-list">
          ${generateRecommendations(summaryMetrics).map(rec => `
            <div class="recommendation-item">
              <div class="recommendation-icon">
                <i class="fas ${rec.icon}"></i>
              </div>
              <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
              </div>
              <button class="btn btn-sm" onclick="${rec.action}">
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  // Add event listener to refresh button
  const refreshButton = document.getElementById('refresh-dashboard');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      // Show loading state
      refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      refreshButton.disabled = true;
      
      // Reload dashboard
      setTimeout(() => {
        loadDashboardPage();
      }, 1000);
    });
  }
  
  // Initialize charts
  initializeCharts(metricsData);
  
  // Animate elements
  animateDashboardElements();
}

// Calculate summary metrics from detailed data
function calculateSummaryMetrics(metricsData) {
  if (!metricsData || metricsData.length === 0) {
    return {
      mentalScore: 75,
      physicalScore: 70,
      sleepQuality: 80,
      stressLevel: 60,
      mindfulnessMinutes: 15,
      weeklyWorkouts: 3,
      mostFrequentMood: 'Neutral'
    };
  }
  
  // Calculate averages
  const mentalScores = metricsData.map(m => m.mentalScore || 0);
  const physicalScores = metricsData.map(m => m.physicalScore || 0);
  const sleepQualities = metricsData.map(m => m.sleepQuality || 0);
  const stressLevels = metricsData.map(m => m.stressLevel || 0);
  const mindfulnessMinutes = metricsData.map(m => m.mindfulnessMinutes || 0);
  const weeklyWorkouts = metricsData.map(m => m.weeklyWorkouts || 0);
  
  // Get most frequent mood
  const moodCounts = {};
  metricsData.forEach(m => {
    if (m.mood) {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    }
  });
  
  let mostFrequentMood = 'Neutral';
  let maxCount = 0;
  
  Object.keys(moodCounts).forEach(mood => {
    if (moodCounts[mood] > maxCount) {
      maxCount = moodCounts[mood];
      mostFrequentMood = mood.charAt(0).toUpperCase() + mood.slice(1); // Capitalize
    }
  });
  
  return {
    mentalScore: Math.round(mentalScores.reduce((sum, val) => sum + val, 0) / mentalScores.length),
    physicalScore: Math.round(physicalScores.reduce((sum, val) => sum + val, 0) / physicalScores.length),
    sleepQuality: Math.round(sleepQualities.reduce((sum, val) => sum + val, 0) / sleepQualities.length),
    stressLevel: Math.round(stressLevels.reduce((sum, val) => sum + val, 0) / stressLevels.length),
    mindfulnessMinutes: Math.round(mindfulnessMinutes.reduce((sum, val) => sum + val, 0) / mindfulnessMinutes.length),
    weeklyWorkouts: Math.round(weeklyWorkouts.reduce((sum, val) => sum + val, 0) / weeklyWorkouts.length),
    mostFrequentMood: mostFrequentMood
  };
}

// Calculate overall wellness score
function calculateWellnessScore(metrics) {
  // Weighted calculation
  const mentalWeight = 0.35;
  const physicalWeight = 0.35;
  const sleepWeight = 0.2;
  const stressWeight = 0.1; // Inverse relationship (lower stress is better)
  
  let score = (
    metrics.mentalScore * mentalWeight +
    metrics.physicalScore * physicalWeight +
    metrics.sleepQuality * sleepWeight +
    (100 - metrics.stressLevel) * stressWeight // Invert stress score
  );
  
  return Math.round(score);
}

// Get icon for wellness insight
function getWellnessInsightIcon(score) {
  if (score >= 90) return 'fa-medal';
  if (score >= 80) return 'fa-thumbs-up';
  if (score >= 70) return 'fa-smile';
  if (score >= 60) return 'fa-meh';
  return 'fa-heart';
}

// Generate wellness insight based on metrics
function generateWellnessInsight(metrics, wellnessScore) {
  if (wellnessScore >= 90) {
    return "Outstanding balance! You're in an optimal state of mental and physical wellness.";
  } else if (wellnessScore >= 80) {
    return "Great job maintaining your wellness balance. Keep up with your healthy habits!";
  } else if (wellnessScore >= 70) {
    if (metrics.mentalScore < metrics.physicalScore) {
      return "Consider adding more mindfulness activities to improve your mental wellness.";
    } else {
      return "Your mental wellness is strong. Try adding more physical activity to balance things out.";
    }
  } else if (wellnessScore >= 60) {
    if (metrics.sleepQuality < 70) {
      return "Your sleep quality could use improvement. Try establishing a consistent sleep schedule.";
    } else if (metrics.stressLevel > 70) {
      return "Your stress levels are elevated. Consider stress-reduction techniques like meditation.";
    } else {
      return "There's room for improvement in your overall wellness. Check the recommendations below.";
    }
  } else {
    return "Let's work on improving your wellness scores. Small daily changes can make a big difference.";
  }
}

// Generate personalized recommendations
function generateRecommendations(metrics) {
  const recommendations = [];
  
  // Mental wellness recommendations
  if (metrics.mentalScore < 80) {
    recommendations.push({
      title: "Guided Meditation",
      description: "A 10-minute session to reduce stress and improve focus",
      icon: "fa-brain",
      action: "window.location.hash = 'neuroacoustic'"
    });
  }
  
  // Physical wellness recommendations
  if (metrics.physicalScore < 80) {
    recommendations.push({
      title: "Quick Workout",
      description: "A 15-minute routine to boost your energy and fitness",
      icon: "fa-dumbbell",
      action: "window.location.hash = 'workout'"
    });
  }
  
  // Sleep recommendations
  if (metrics.sleepQuality < 75) {
    recommendations.push({
      title: "Sleep Soundscape",
      description: "Calming audio to help you fall asleep faster and deeper",
      icon: "fa-moon",
      action: "window.location.hash = 'neuroacoustic'"
    });
  }
  
  // Stress management
  if (metrics.stressLevel > 70) {
    recommendations.push({
      title: "Stress Relief Game",
      description: "A fun interactive game to reduce stress and anxiety",
      icon: "fa-gamepad",
      action: "window.location.hash = 'stress-games'"
    });
  }
  
  // If not enough recommendations, add a generic one
  if (recommendations.length < 3) {
    recommendations.push({
      title: "Air Piano Therapy",
      description: "Express yourself through music with our gesture-based piano",
      icon: "fa-music",
      action: "window.location.hash = 'air-piano'"
    });
  }
  
  return recommendations.slice(0, 3); // Return maximum 3 recommendations
}

// Initialize dashboard charts
function initializeCharts(metricsData) {
  // Prepare data for charts
  const dates = metricsData.map(m => formatChartDate(m.date));
  const mentalScores = metricsData.map(m => m.mentalScore);
  const physicalScores = metricsData.map(m => m.physicalScore);
  const sleepQualities = metricsData.map(m => m.sleepQuality);
  const stressLevels = metricsData.map(m => m.stressLevel);
  
  // Mental wellness chart
  const mentalCtx = document.getElementById('mental-chart').getContext('2d');
  new Chart(mentalCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Mental Score',
        data: mentalScores,
        borderColor: '#7c83fd',
        backgroundColor: 'rgba(124, 131, 253, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: getChartOptions('Mental Wellness')
  });
  
  // Physical wellness chart
  const physicalCtx = document.getElementById('physical-chart').getContext('2d');
  new Chart(physicalCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Physical Score',
        data: physicalScores,
        borderColor: '#36c7d0',
        backgroundColor: 'rgba(54, 199, 208, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: getChartOptions('Physical Wellness')
  });
  
  // Sleep quality chart
  const sleepCtx = document.getElementById('sleep-chart').getContext('2d');
  new Chart(sleepCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Sleep Quality',
        data: sleepQualities,
        borderColor: '#96baff',
        backgroundColor: 'rgba(150, 186, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: getChartOptions('Sleep Quality')
  });
  
  // Stress level chart
  const stressCtx = document.getElementById('stress-chart').getContext('2d');
  new Chart(stressCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Stress Level',
        data: stressLevels,
        borderColor: '#ff7b7b',
        backgroundColor: 'rgba(255, 123, 123, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: getChartOptions('Stress Level')
  });
}

// Get common chart options
function getChartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        beginAtZero: false,
        min: 40,
        max: 100,
        ticks: {
          stepSize: 20
        },
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(200, 200, 200, 0.15)'
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5
      }
    }
  };
}

// Format date for chart labels
function formatChartDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

// Animate dashboard elements when loaded
function animateDashboardElements() {
  // Animate cards with staggered delay
  const cards = document.querySelectorAll('.dashboard-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate-in');
    }, 100 + (index * 100));
  });
  
  // Animate circular progress
  setTimeout(() => {
    const circularProgress = document.querySelector('.circular-progress-circle');
    if (circularProgress) {
      circularProgress.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
      circularProgress.style.strokeDashoffset = '0';
    }
  }, 500);
  
  // Animate balance bar
  setTimeout(() => {
    const mentalBar = document.querySelector('.mental-bar');
    const physicalBar = document.querySelector('.physical-bar');
    
    if (mentalBar && physicalBar) {
      mentalBar.style.width = getComputedStyle(mentalBar).width;
      physicalBar.style.width = getComputedStyle(physicalBar).width;
    }
  }, 1000);
} 