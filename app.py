from flask import Flask, render_template, request, jsonify
from password_strength_checker import PasswordChecker

app = Flask(__name__)
checker = PasswordChecker()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check', methods=['POST'])
def check_password():
    password = request.json.get('password')
    result = checker.check_strength(password)
    return jsonify(result)

@app.route('/generate', methods=['POST'])
def generate_password():
    length = request.json.get('length', 12)
    password = checker.generate_password(length)
    return jsonify({'password': password})

if __name__ == '__main__':
    app.run(debug=True)
