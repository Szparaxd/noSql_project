import redis

# Połączenie z Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Subskrypcja na kanał temperature_alerts
pubsub = r.pubsub()
pubsub.subscribe('temperature_alerts')

print('Waiting for temperature alerts...')

for message in pubsub.listen():
    if message['type'] == 'message':
        print(f'Received alert: {message["data"].decode("utf-8")}')
