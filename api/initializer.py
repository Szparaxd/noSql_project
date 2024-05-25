import redis
import uuid
from werkzeug.security import generate_password_hash
import time
import json

def initialize_users(redis_client):
    usernames = ['alice', 'bob', 'charlie']
    for username in usernames:
        user_id = str(uuid.uuid4())
        password_hash = generate_password_hash('password123')
        
        # Dodaj użytkownika do bazy danych Redis
        redis_client.hset(f"user:{username}", mapping={
            'id': user_id,
            'username': username,
            'password': password_hash,
            'email': f'{username}@example.com'
        })

        for i in range(1, 4):
            timestamp = 1650000000000 + i * 1000  # przykładowy timestamp w milisekundach
            pulse = 70 + i 
            heart_rate = 60 + i  
            temperature = 36.5 + i * 0.1 

            redis_client.zadd(f"user:{username}:pulse", {str(timestamp): pulse})
            redis_client.zadd(f"user:{username}:heart_rate", {str(timestamp): heart_rate})
            redis_client.zadd(f"user:{username}:temperature", {str(timestamp): temperature})

def initialize_followings(redis_client):
    followings = [
        ('alice', 'bob', {'critical_pulse': 100, 'critical_heart_rate': 80, 'critical_temperature': 37.5}),
        ('bob', 'charlie', {'critical_pulse': 90, 'critical_heart_rate': 70, 'critical_temperature': 37.8}),
        ('charlie', 'alice', {'critical_pulse': 95, 'critical_heart_rate': 75, 'critical_temperature': 37.0})
    ]

    for username, follow_user, critical_values in followings:
        redis_client.hset(f"user:{username}:follow_users:{follow_user}", mapping=critical_values)


def initialize_data(redis):
    initialize_users(redis)
    initialize_followings(redis)
    
   