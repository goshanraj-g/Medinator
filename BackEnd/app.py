from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route('/')
def home():
  return 'Welcome to the Flask API!'

# Example route to handle POST request with JSON data


@app.route('/analyze', methods=['POST'])
def analyze_data():
  data = request.get_json()
  # Placeholder logic
  result = {"message": "Data received", "input": data}
  return jsonify(result)


if __name__ == '__main__':
  app.run(debug=True)
