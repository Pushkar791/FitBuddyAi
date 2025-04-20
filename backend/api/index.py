from flask import Flask, jsonify, request

# Create a minimal Flask app for Vercel
app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"status": "API is running"})

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy"})

# Handle 404 errors
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

# Used for local development
if __name__ == '__main__':
    app.run(debug=True) 