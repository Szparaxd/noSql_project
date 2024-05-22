import redis
import uuid
import json
import time
import threading

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.security import generate_password_hash, check_password_hash

from initializer import *
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)
r = redis.Redis(host='localhost', port=6379, db=0)
socketio = SocketIO(app, cors_allowed_origins="*")

class MyHub:
    def __init__(self, app, namespace):
        self.app = app
        self.namespace = namespace
        self.user_sessions = {} 
        socketio.on_event('connect', self.on_connect, namespace=self.namespace)
        socketio.on_event('disconnect', self.on_disconnect, namespace=self.namespace)

    def on_connect(self):
        username = request.args.get('username')
        if not username:
            emit('error', {'error': 'Username is required'}, namespace=self.namespace)
            return False  # Disconnect if no username is provided
        print(f'Client {username} connected')
        self.user_sessions[request.sid] = username
        self.start_listening(username)

    def on_disconnect(self):
        print('Client disconnected')

    def start_listening(self, username):
        """Starts a new thread to listen for Redis alerts for the specific user."""
        thread = threading.Thread(target=self.listen_to_redis, args=(username,))
        thread.daemon = True
        thread.start()

    def listen_to_redis(self, username):
        from redis import Redis
        r = Redis()
        pubsub = r.pubsub()
        pubsub.subscribe(f'alerts:{username}')
        for message in pubsub.listen():
            if message['type'] == 'message':
                alert_data = json.loads(message['data'])
                print(f'Received Redis message for {username}: {alert_data}')
                self.emit_alert(username, alert_data)

    def emit_alert(self, username, data):
        """Emit alert only to the specific connected user identified by username."""
        session_ids = [sid for sid, user in self.user_sessions.items() if user == username]
        for sid in session_ids:
            socketio.emit('alert', data, room=sid, namespace=self.namespace)  # Wyślij alert tylko do sesji danego użytkownika


@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
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

    pattern = f'user:*:follow_users:{username}'
    matching_keys = r.scan_iter(pattern)
    

    for key in matching_keys:
        alerts = []
        
        follower_user = key.decode('utf-8').split(":")[1]

        follower_data = r.hgetall(key)
        critical_pulse = int(follower_data.get(b'critical_pulse', 0))
        critical_heart_rate = int(follower_data.get(b'critical_heart_rate', 0))
        critical_temperature = int(follower_data.get(b'critical_temperature', 0))

        # Check if current vitals exceed critical thresholds
        if critical_pulse > 0 and pulse is not None and pulse > critical_pulse:
            alerts.append(f"Critical pulse threshold exceeded for {key}.")
        if critical_heart_rate > 0 and heart_rate is not None and heart_rate > critical_heart_rate:
            alerts.append(f"Critical heart rate threshold exceeded for {key}.")
        if critical_temperature > 0 and temperature is not None and temperature > critical_temperature:
            alerts.append(f"Critical temperature threshold exceeded for {key}.")

        if alerts:
            r.publish(f"alerts:{follower_user}", json.dumps({'username': username, 'alerts': alerts}))

    if not registered_any_vital:
        return jsonify({'message': 'At least one vital parameter (pulse, heart_rate, temperature) is required'}), 400

    return jsonify({'message': 'Vitals registered successfully'}), 201

@app.route('/users', methods=['GET'])
def get_users():
    user_keys = r.keys("user:*")
    usernames = {key.decode('utf-8').split(":")[1] for key in user_keys if key.count(b':') == 1}
    return jsonify({'usernames': list(usernames)}), 200

@app.route('/users/search', methods=['GET'])
def search_users():
    query = request.args.get('query', '')

    if len(query) < 3:
        return jsonify({'message': 'Query must be at least 3 characters long'}), 400

    user_keys = r.keys("user:*")
    usernames = {key.decode('utf-8').split(":")[1] for key in user_keys if key.count(b':') == 1}
    matching_users = sorted([username for username in usernames if query.lower() in username.lower()])

    return jsonify({'usernames': matching_users[:10]}), 200

@app.route('/users/follow', methods=['GET'])
def get_follow_user():
    username = request.args.get('username', '')

    user_keys = r.keys(f'user:{username}:follow_users:*')
    follow_users = []
    for key in user_keys:
        if key.count(b':') == 3:
            follow_user = key.decode('utf-8').split(":")[3]
            critical_values = r.hgetall(key)
            critical_values = {k.decode('utf-8'): float(v.decode('utf-8')) for k, v in critical_values.items()}
            critical_values['username'] = follow_user
            follow_users.append(critical_values)
            
    return jsonify({'follow_users': follow_users}), 200

@app.route('/users/follow', methods=['POST'])
def add_follow_user():
    data = request.get_json()
    username = data.get('username')
    follow_user = data.get('follow_user')
    
    pulse = data.get('critical_pulse')
    heart_rate = data.get('critical_heart_rate')
    temperature = data.get('critical_temperature')
    
    critical_values = {}
    if pulse is not None:
        critical_values['critical_pulse'] = pulse
    if heart_rate is not None:
        critical_values['critical_heart_rate'] = heart_rate
    if temperature is not None:
        critical_values['critical_temperature'] = temperature

    r.hset(f"user:{username}:follow_users:{follow_user}", mapping=critical_values)
    return jsonify({'message': 'User added and critical values set'}), 201

@app.route('/users/follow', methods=['DELETE'])
def remove_follow_user():
    data = request.get_json()
    username = data.get('username')
    follow_user = data.get('follow_user')
    
    if not username or not follow_user:
        return jsonify({'message': 'Both username and follow_user are required'}), 400

    follow_key = f"user:{username}:follow_users:{follow_user}"
    if r.exists(follow_key):
        r.delete(follow_key)
        return jsonify({'message': 'Follow user removed successfully'}), 200
    else:
        return jsonify({'message': 'Follow user does not exist'}), 404

@app.route('/users/follow', methods=['PUT'])
def update_follow_user():
    data = request.get_json()
    username = data.get('username')
    follow_user = data.get('follow_user')
    
    # Extract critical values from the request data, ignoring username and follow_user keys
    critical_values = {k: v for k, v in data.items() if k not in ['username', 'follow_user']}
    
    if not username or not follow_user:
        return jsonify({'message': 'Both username and follow_user are required'}), 400

    # Update the critical values in Redis
    follow_key = f"user:{username}:follow_users:{follow_user}"
    if r.exists(follow_key):
        r.hset(follow_key, mapping=critical_values)
        return jsonify({'message': 'Follow user updated successfully'}), 200
    else:
        return jsonify({'message': 'Follow user does not exist'}), 404

@app.route('/vitals/details', methods=['GET'])
def get_vitals_details():
    username = request.args.get('username', '')

    if not username:
        return jsonify({'message': 'Username is required'}), 400

    if not r.exists(f"user:{username}"):
        return jsonify({'message': 'User does not exist'}), 404

    pulse = r.zrange(f"user:{username}:pulse", 0, -1, withscores=True)
    heart_rate = r.zrange(f"user:{username}:heart_rate", 0, -1, withscores=True)
    temperature = r.zrange(f"user:{username}:temperature", 0, -1, withscores=True)

    pulse.sort(key=lambda x: x[0], reverse=True)
    heart_rate.sort(key=lambda x: x[0], reverse=True)
    temperature.sort(key=lambda x: x[0], reverse=True)

    vitals = {
        'pulse': pulse[0] if pulse else None,
        'heart_rate': heart_rate[0] if heart_rate else None,
        'temperature': temperature[0] if temperature else None
    }

    for key, value in vitals.items():
        if value:
            t, v = value
            timestamp = int(t.decode('utf-8'))
            value_decoded = float(v) if v else None
            utc_datetime = datetime.fromtimestamp(timestamp / 1000.0, timezone.utc)

            vitals[key] = {
                'datetime': utc_datetime.strftime('%Y-%m-%dT%H:%M:%SZ'),  # Format datetime in ISO 8601
                'value': value_decoded
            }

    return jsonify({'username': username, 'vitals': vitals}), 200

my_hub = MyHub(app, '/myhub')

if __name__ == '__main__':
    initialize_data()
    socketio.run(app)
    app.run(debug=True)
