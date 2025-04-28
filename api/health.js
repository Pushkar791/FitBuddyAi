// Health check endpoint for the API
// This file will be automatically recognized by Vercel as an API endpoint

module.exports = (req, res) => {
  console.log('Health check API called');

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // Only respond to GET requests
  if (req.method !== 'GET') {
    console.log(`Invalid method: ${req.method}`);
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  // Return a healthy status
  const timestamp = new Date().toISOString();
  console.log(`Returning healthy status at ${timestamp}`);
  
  res.status(200).json({
    status: 'ok',
    timestamp: timestamp,
    environment: process.env.VERCEL_ENV || 'development'
  });
}; 