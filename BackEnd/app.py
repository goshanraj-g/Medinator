from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
  return 'Welcome to the Flask API!'

# Example route to handle POST request with JSON data


@app.route('/initial', methods=['POST'])
def analyze_data():
  data = request.get_json()
  # Placeholder logic
  result = {"message": "Data received", "input": data}
  return jsonify(result)


if __name__ == '__main__':
  app.run(debug=True)
