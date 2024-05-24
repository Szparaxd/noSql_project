import redis
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

r = redis.Redis(host='localhost', port=6379, db=0)

def create_example_user():
    username = 'exampleUser'
    password = 'examplePassword'
    email = 'exampleUser@example.com'
    
    if not r.exists(f"user:{username}"):
        hashed_password = generate_password_hash(password)
        user_id = str(uuid.uuid4())
        r.hset(f"user:{username}", mapping={'id': user_id, 'password': hashed_password, 'email': email})
        print(f"Initialized user: {username}")

def initialize_data():
    create_example_user()
   