import redis
import uuid
import json
import time

from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from initializer import *

app = Flask(__name__)
r = redis.Redis(host='localhost', port=6379, db=0)

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    print(data)
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400
    
    if r.exists(f"user:{username}"):
        return jsonify({'message': 'User already exists'}), 400
    
    hashed_password = generate_password_hash(password)
    user_id = str(uuid.uuid4())
    
    r.hset(f"user:{username}", mapping={'id': user_id, 'password': hashed_password})
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400
    
    if not r.exists(f"user:{username}"):
        return jsonify({'message': 'User does not exist'}), 400
    
    user_data = r.hgetall(f"user:{username}")
    stored_password = user_data[b'password'].decode('utf-8')
    
    if check_password_hash(stored_password, password):
        return jsonify({'message': 'Login successful', 'user_id': user_data[b'id'].decode('utf-8')}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 400

@app.route('/register_vitals', methods=['POST'])
def register_vitals():
    data = request.get_json()
    username = data.get('username')
    pulse = data.get('pulse')
    heart_rate = data.get('heart_rate')
    temperature = data.get('temperature')

    if not username:
        return jsonify({'message': 'Username is required'}), 400

    if not r.exists(f"user:{username}"):
        return jsonify({'message': 'User does not exist'}), 400

    timestamp = int(time.time() * 1000)  # Use milliseconds to reduce the risk of collisions
    registered_any_vital = False

    if pulse is not None:
        r.zadd(f"user:{username}:pulse", {str(timestamp): pulse})
        registered_any_vital = True

    if heart_rate is not None:
        r.zadd(f"user:{username}:heart_rate", {str(timestamp): heart_rate})
        registered_any_vital = True

    if temperature is not None:
        r.zadd(f"user:{username}:temperature", {str(timestamp): temperature})
        registered_any_vital = True

    if not registered_any_vital:
        return jsonify({'message': 'At least one vital parameter (pulse, heart_rate, temperature) is required'}), 400

    return jsonify({'message': 'Vitals registered successfully'}), 201


if __name__ == '__main__':
    initialize_data()
    app.run(debug=True)
