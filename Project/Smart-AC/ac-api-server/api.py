from flask import Flask, request, jsonify
import paho.mqtt.client as mqtt
import base64
import json
import time
from dotenv import load_dotenv
import os

load_dotenv()
BROKER = os.getenv('BROKER')
PORT = int(os.getenv('PORT'))
CLIENT_ID = os.getenv('CLIENT_ID')
TOKEN = os.getenv('TOKEN')
SECRET = os.getenv('SECRET')

app = Flask(__name__)

topic_get_status = 'esp01/hvac/status' 
topic_set = 'esp01/hvac/set'

allowed_user = {
    os.getenv("USER1"): os.getenv("PASS1"),
    os.getenv("USER2"): os.getenv("PASS2")
}

latest_status_status = {}
VALID_FIELDS = {
    "state": ["on", "off"],
    "setpoint": range(16, 31),
    "mode": ["auto", "cool", "heat", "dry", "fan_only", "UNKNOWN"],
    "swing": ["fix", "vswing", "hswing", "hvswing", "fixpos_1", "fixpos_2", "fixpos_3", "fixpos_4", "fixpos_5", "UNKNOWN"],
    "fanMode": ["quiet", "lvl_1", "lvl_2", "lvl_3", "lvl_4", "lvl_5", "auto", "UNKNOWN"],
    "pure": ["on", "off"],
    "powerSelect": ["50%", "75%", "100%"],
    "operation": ["normal", "eco" ,"high_power", "silent_1", "eco", "silent_2"],
    "wifiLed": ["on", "off"]
}

print(f"🚀 Initializing MQTT connection to broker: {BROKER}")

mqtt_client = mqtt.Client(client_id=CLIENT_ID)
mqtt_client.username_pw_set(TOKEN, SECRET)

mqtt_connected = False  

def on_connect(client, userdata, flags, rc):
    global mqtt_connected
    if rc == 0:
        if not mqtt_connected:
            print("Connected to MQTT Broker!")
            mqtt_connected = True
        client.subscribe(topic_get_status)
    else:
        print(f"MQTT connect failed with code {rc}")

def on_message(client, userdata, msg):
    global latest_status_status
    payload = msg.payload.decode()
    print(f"Message from [{msg.topic}]: {payload}")
    now = time.time()

    if msg.topic == topic_get_status:
        try:
            latest_status_status['data'] = json.loads(payload)  # แปลง payload เป็น dict
        except Exception as e:
            print(f"Error parsing JSON payload: {e}")
            latest_status_status['data'] = payload  # fallback เป็น string ถ้าแปลงไม่ได้
    latest_status_status['timestamp'] = now

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

try:
    mqtt_client.connect(BROKER, PORT, 60)
except Exception as e:
    print(f"Connection error: {e}")

def auth_decode():
    non_decode = request.headers.get('Authorization')
    auth_type , credentials = non_decode.split(' ')
    dec_credentials = base64.b64decode(credentials)
    return dec_credentials.decode()
    
def auth():
    user , password = auth_decode().split(':')[0] , auth_decode().split(':')[1]
    if user in allowed_user :
        if password == allowed_user[user]:
            return True
    else :
        return False

    
def mqtt_loop():
    mqtt_client.loop_start()
    
@app.route('/')
def home_page():
    return ' Welcome to HVAC Flask API'


@app.route('/get')
def get_status():
    if not auth():
        return jsonify({"error": "Unauthorized"}), 401
    
    if not latest_status_status:
        return jsonify({"message": "No data"}), 404
    return jsonify(latest_status_status)

@app.route('/set', methods=['POST'])
def send_command():
    if not auth():
        return jsonify({"error": "Unauthorized"}), 401

    if not mqtt_connected:
        return jsonify({'error': 'MQTT not connected'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON payload'}), 400

    for key, val in data.items():
        if key not in VALID_FIELDS:
            return jsonify({'error': f'Invalid field: {key}'}), 400
        valid = VALID_FIELDS[key]
        if key == "setpoint":
            if not isinstance(val, int) or val not in valid:
                return jsonify({'error': f'Invalid value for {key}. Must be int 16-30'}), 400
        else:
            if val not in valid:
                return jsonify({'error': f'Invalid value for {key}. Must be one of {valid}'}), 400

    payload_str = json.dumps(data)
    print(f"Publishing to {topic_set}: {payload_str}")
    
    result = mqtt_client.publish(topic_set, payload_str, qos=1)

    status = result[0]
    if status != 0:
        return jsonify({'error': 'Failed to send after retries'}), 500

    return jsonify({'message': 'Command sent', 'payload': data})


@app.route('/auth', methods = ['POST'])
def auth_1():
    user , password = auth_decode().split(':')[0] , auth_decode().split(':')[1]
    if user in allowed_user :
        if password == allowed_user[user]:
            return 'true'
        else :
            return "incorrect password"
    else :
        return "error"


if __name__ == '__main__':
    print("Starting Flask API server...")
    mqtt_client.loop_start()
    while not mqtt_connected:
        print("⏳ Waiting for MQTT connection...")
        time.sleep(0.5)
    app.run(host="0.0.0.0", port=30012, debug=True)
