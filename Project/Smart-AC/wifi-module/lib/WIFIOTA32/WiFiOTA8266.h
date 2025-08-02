#ifndef WIFI_OTA_H
#define WIFI_OTA_H

#include <ESP8266WiFi.h>
// #include <WiFiUDP.h>
#include <PubSubClient.h>
#include <ArduinoOTA.h>

class WiFiOTA
{
public:
    WiFiOTA(const char *ssid, const char *password,
            IPAddress logTarget = IPAddress(192, 168, 1, 100),
            uint16_t logPort = 4210, const char *hostname = "esp01");

    void begin();
    void handle();
    // void udpLog(const String& msg);
    void setupMQTT(const char *mqtt_server, const int mqtt_port);
    void handleMQTT();
    void publishMQTT(const char *topic, const String &payload);
    void set_callback(void (*callback)(char *, byte *, unsigned int));

    private : const char *_ssid;
    const char *_password;
    const char *_hostname;
    IPAddress _logTarget;
    uint16_t _logPort;
    // WiFiUDP _udp;

    void setupWiFi();
    void setupOTA();
};

#endif // WIFI_OTA_H
