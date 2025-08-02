#include "WiFiOTA8266.h"

WiFiClient espClient;
PubSubClient MQTTclient(espClient);

WiFiOTA::WiFiOTA(const char *ssid, const char *password,
                 IPAddress logTarget, uint16_t logPort, const char *hostname)
    : _ssid(ssid), _password(password), _hostname(hostname),
      _logTarget(logTarget), _logPort(logPort) {}

void WiFiOTA::begin()
{
    //   _udp.begin(4211); // Optional: you can use this port to receive debug
    setupWiFi();
    setupOTA();
}

void WiFiOTA::handle()
{
    ArduinoOTA.handle();
}

void WiFiOTA::setupWiFi()
{
    WiFi.mode(WIFI_STA);
    WiFi.begin(_ssid, _password);

    // udpLog("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        // udpLog(".");
    }

    // udpLog("\nConnected to WiFi.");
    // udpLog("IP Address: " + WiFi.localIP().toString());
}

void WiFiOTA::setupOTA()
{
    ArduinoOTA.setHostname(_hostname);
    ArduinoOTA.onStart([this]()
                       {
                           // udpLog("Start OTA Update...");
                       });

    ArduinoOTA.onEnd([this]()
                     {
                         // udpLog("End OTA Update");
                     });

    ArduinoOTA.onProgress([this](unsigned int progress, unsigned int total)
                          {
                              char buf[64];
                              snprintf(buf, sizeof(buf), "Progress: %u%%", (progress * 100) / total);
                              // udpLog(String(buf));
                          });

    ArduinoOTA.onError([this](ota_error_t error)
                       {
                           // switch (error) {
                           //   // case OTA_AUTH_ERROR:    udpLog("OTA Error: Auth Failed"); break;
                           //   // case OTA_BEGIN_ERROR:   udpLog("OTA Error: Begin Failed"); break;
                           //   // case OTA_CONNECT_ERROR: udpLog("OTA Error: Connect Failed"); break;
                           //   // case OTA_RECEIVE_ERROR: udpLog("OTA Error: Receive Failed"); break;
                           //   // case OTA_END_ERROR:     udpLog("OTA Error: End Failed"); break;
                           //   // default:                udpLog("OTA Error: Unknown Error"); break;
                           // }
                       });

    ArduinoOTA.begin();
    // udpLog("OTA Ready");
}

// void WiFiOTA::udpLog(const String& msg) {
//   _udp.beginPacket(_logTarget, _logPort);
//   _udp.write(msg.c_str());
//   _udp.endPacket();
// }

void WiFiOTA::setupMQTT(const char *mqtt_server, const int mqtt_port)
{
    MQTTclient.setServer(mqtt_server, mqtt_port);
    // MQTTclient.setCallback([](char* topic, byte* payload, unsigned int length) {
    //   // Handle incoming messages here
    //   String message;
    //   for (unsigned int i = 0; i < length; i++) {
    //     message += (char)payload[i];
    //   }
    //   Serial.printf("Message arrived [%s]: %s\n", topic, message.c_str());
    // });

    handleMQTT();
}

void WiFiOTA::handleMQTT()
{
    while (!MQTTclient.connected())
    {
        // Serial.print("Connecting to MQTT...");
        if (MQTTclient.connect("AC","ac","cept_chula"))
        { // No username/password
            // Serial.println(" connected");
            // Optional: subscribe to a topic
            MQTTclient.subscribe("esp01/hvac/set");
        }
        else
        {
            // Serial.print(" failed, rc=");
            // Serial.print(MQTTclient.state());
            // Serial.println(" try again in 5 seconds");
            delay(5000);
        }
        
    }
    MQTTclient.loop();
}

void WiFiOTA::publishMQTT(const char *topic, const String &payload)
{
    if (MQTTclient.connected())
    {
        MQTTclient.publish(topic, payload.c_str());
    }
    else
    {
        // udpLog("MQTT not connected, cannot publish.");
    }
}

void WiFiOTA::set_callback(void (*callback)(char *, byte *, unsigned int))
{
    MQTTclient.setCallback(callback);
}
