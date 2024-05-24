import redis
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

def create_example_user(r):
    username = 'exampleUser'
    password = 'examplePassword'
    email = 'exampleUser@example.com'
    
    if not r.exists(f"user:{username}"):
        hashed_password = generate_password_hash(password)
        user_id = str(uuid.uuid4())
        r.hset(f"user:{username}", mapping={'id': user_id, 'password': hashed_password, 'email': email})
        print(f"Initialized user: {username}")

def initialize_data(redis):
    create_example_user(redis)
   