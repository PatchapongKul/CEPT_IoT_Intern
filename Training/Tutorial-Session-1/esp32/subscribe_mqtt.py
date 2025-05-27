import json
import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, rc, properties=None):
    # This function is called when the client connects to the broker
    if rc == 0:
        print("✅ Connected to NETPIE broker!")
    else:
        print(f"❌ Failed to connect. Code: {rc}")

def on_message(client, userdata, msg):
    # This function is called when a message is received on a subscribed topic
    try:
        print(f"Message received on topic {msg.topic}: {msg.payload.decode()}")
        payload = msg.payload.decode('utf-8') 
        data = json.loads(payload) # Parse the JSON payload

        # Expected keys: time, sensor_id, temperature, humidity
        # Prepare for insertion into a database or processing
        record = (
            data['time'],            # e.g., "2025-05-25 08:55:00+07"
            data['sensor_id'],       # e.g., 1
            data['temperature'],     # e.g., 30
            data['humidity']         # e.g., 60
        )

        print(f"Inserted row: {record}")
    
    except Exception as e:
        print(f"Failed to insert data: {e}")

# Replace these with your credentials
CLIENT_ID   = "REPLACE_WITH_YOUR_CLIENT_ID";    # Replace with your MQTT client ID
TOKEN       = "REPLACE_WITH_YOUR_USERNAME";     # Replace with your MQTT username
SECRET      = "REPLACE_WITH_YOUR_PASSWORD";     #Replace with your MQTT password

# NETPIE MQTT broker settings
BROKER = "broker.netpie.io"
PORT = 1883

# Create an MQTT client instance
client = mqtt.Client(client_id=CLIENT_ID)
client.username_pw_set(TOKEN, SECRET)
client.on_connect = on_connect

# Connect to the NETPIE MQTT broker
client.connect(BROKER, PORT)

# Subscribe to the topic
client.subscribe("@msg/sensor")   
client.on_message = on_message

# Start the MQTT client loop to process network traffic and dispatch callbacks
client.loop_forever()