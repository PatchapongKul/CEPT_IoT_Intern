#include <WiFi.h>
#include <PubSubClient.h>
#include <time.h>

// WiFi Credentials
const char* ssid = "WIFI SSID";
const char* password = "Password";

// MQTT Broker
const char* mqtt_server = "broker.netpie.io";
const int   mqtt_port   = 1883; 
const char* mqtt_client = "REPLACE_WITH_YOUR_CLIENT_ID"; // Replace with your MQTT client ID
const char* mqtt_user   = "REPLACE_WITH_YOUR_USERNAME"; // Replace with your MQTT username
const char* mqtt_pass   = "REPLACE_WITH_YOUR_PASSWORD"; // Replace with your MQTT password
// MQTT Topic
const char* mqtt_topic  = "@msg/sensor"; 

// SenserID
const int sensor_id = 1;
float temperature   = 25; // Initial temperature value
float rel_humidity  = 60; // Initial relative humidity value

// MQTT Client
WiFiClient espClient;
PubSubClient client(espClient);

// Time (NTP) - Bangkok Timezone (UTC+7)
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;
const int daylightOffset_sec = 0;

void setup_wifi() {
  /*
  This function connects the ESP32 to the specified WiFi network.
  It prints the connection status to the Serial Monitor.
  It will block until the connection is established.
  If the connection fails, it will retry every 500 milliseconds.
  The SSID and password are defined at the top of the file.
  */
  delay(10);
  Serial.println();
  Serial.printf("Connecting to %s\n", ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect_mqtt() {
  /*
  This function attempts to connect to the MQTT broker.
  It will block until the connection is established.
  If the connection fails, it will retry every 5 seconds.
  The MQTT server, port, client ID, username, and password are defined at the top of the file.
  */

  // Loop until connected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    
    if (client.connect(mqtt_client, mqtt_user, mqtt_pass)) {
      // Successfully connected to the MQTT broker
      Serial.println("connected");

    } else {
      // Failed to connect to the MQTT broker
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" trying again in 5 seconds");
      delay(5000);
    }
  }
}

void setup_time() {
  /*
  This function sets up the NTP client to synchronize the time.
  It uses the NTP server defined at the top of the file.
  It sets the timezone to UTC+7 (Bangkok time).
  It will block until the time is synchronized.
  The GMT offset and daylight offset are defined at the top of the file.
  */

  Serial.println("Setting up NTP time synchronization...");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.print("Waiting for NTP time sync...");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("\nTime synced.");

  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.printf("Current time (UTC+7): %s", asctime(&timeinfo));
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  reconnect_mqtt();
  setup_time();
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();

  static unsigned long lastPublish = 0;
  
  if (millis() - lastPublish > 1000) {
    // Simulate sending sensor data every second
    // In a real application, you would read from the sensor here

    // Get the current time
    time_t now = time(nullptr);
    struct tm timeinfo;
    localtime_r(&now, &timeinfo);

    // Format the time as a string
    char timeStr[64];
    strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S+07", &timeinfo);

    // Build JSON payload
    char payload[256];
    snprintf(payload, sizeof(payload),
            "{\"time\": \"%s\", \"sensor_id\": %d, \"temperature\": %.2f, \"humidity\": %.2f}",
            timeStr, sensor_id, temperature, rel_humidity);
    
    // Print to Serial Monitor
    Serial.println("Publishing data to MQTT:");
    Serial.println(payload);

    // Publish the payload to the MQTT topic
    client.publish(mqtt_topic, payload);
    
    // Update the temperature and humidity values (for demonstration purposes)
    temperature  += 0.1;  // Increment temperature
    rel_humidity += 0.05; // Increment relative humidity

    lastPublish = millis();
  }
}
