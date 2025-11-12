#include <Arduino.h>
#include <WiFiOTA8266.h>
#include <ToshibaCarrierHvac.h>
#include "secrets.h"
#include <ArduinoJson.h>

#define HVAC_RX D6
#define HVAC_TX D5

WiFiOTA wifi_ota(ssid, password, logTarget, logPort, hostname);

// ToshibaCarrierHvac hvac(&Serial);
ToshibaCarrierHvac hvac(HVAC_RX, HVAC_TX);

void mqtt_callback(char *topic, byte *payload, unsigned int length)
{
  payload[length] = '\0';
  String msg = String((char *)payload);
  // Serial.printf("MQTT Message [%s]: %s\n", topic, msg.c_str());

  if (String(topic) == "esp01/hvac/set")
  {
    ArduinoJson::JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (err)
    {
     // Serial.println("❌ JSON parse failed");
      return;
    }

    if (doc["state"].is<const char *>())
    {
      hvac.setState(doc["state"].as<const char *>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setstate");
    }
    if (doc["setpoint"].is<int>())
    {
      hvac.setSetpoint(doc["setpoint"].as<int>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setsetpoint");
    }
    if (doc["mode"].is<const char *>())
    {
      hvac.setMode(doc["mode"].as<const char *>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setmode");
    }
    if (doc["swing"].is<const char *>())
    {
      hvac.setSwing(doc["swing"].as<const char *>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setswing");
    }
    if (doc["fanMode"].is<const char *>())
    {
      hvac.setFanMode(doc["fanMode"].as<const char *>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setfanmode");
    }
    if (doc["pure"].is<const char *>())
    {
      hvac.setPure(doc["pure"].as<const char *>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setpure");
    }
    if (doc["powerSelect"].is<const char *>())
    {
      hvac.setPowerSelect(doc["powerSelect"].as<const char *>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setpowerselect");
    }
    if (doc["operation"].is<const char *>())
    {
      hvac.setOperation(doc["operation"].as<const char *>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setoperation");
    }
    if (doc["wifiLed"].is<const char *>())
    {
      hvac.setWifiLed(doc["wifiLed"].as<const char *>());
      wifi_ota.publishMQTT("esp01/hvac/log", "setwifiled");
    }
  }
}

void setup()
{
  Serial.begin(9600, SERIAL_8N1);
  Serial.println("==Start==");
  wifi_ota.begin();
  wifi_ota.setupMQTT(mqtt_server, mqtt_port);
  wifi_ota.set_callback(mqtt_callback);
}

void loop()
{
  wifi_ota.handle();
  wifi_ota.handleMQTT();
  hvac.handleHvac();

  static unsigned long lastLog = 0;
  if (millis() - lastLog > 4000)
  {
    String payload1 = "{";
    payload1 += "\"connected\": ";
    payload1 += hvac.isConnected() ? "true" : "false";
    payload1 += ", \"state\": \"";
    payload1 += hvac.getState();
    payload1 += "\", \"handshaked\": ";
    payload1 += hvac.isHandshaked() ? "true" : "false";
    payload1 += "}";

    wifi_ota.publishMQTT("esp01/hvac/check", payload1);

    String payload2 = "{";
    payload2 += "\"state\": \"" + String(hvac.getState()) + "\",";
    payload2 += "\"setpoint\": " + String(hvac.getSetpoint()) + ",";
    payload2 += "\"mode\": \"" + String(hvac.getMode()) + "\",";
    payload2 += "\"swing\": \"" + String(hvac.getSwing()) + "\",";
    payload2 += "\"fanMode\": \"" + String(hvac.getFanMode()) + "\",";
    payload2 += "\"pure\": \"" + String(hvac.getPure()) + "\",";
    payload2 += "\"powerSelect\": \"" + String(hvac.getPowerSelect()) + "\",";
    payload2 += "\"operation\": \"" + String(hvac.getOperation()) + "\",";
    payload2 += "\"wifiLed\": \"" + String(hvac.getWifiLed()) + "\",";
    payload2 += "\"roomTemp\": " + String(hvac.getRoomTemperature()) + ",";
    payload2 += "\"outsideTemp\": " + String(hvac.getOutsideTemperature()) + ",";
    payload2 += "\"cdu\": \"" + String(hvac.isCduRunning()) + "\"";
    payload2 += "}";

    wifi_ota.publishMQTT("esp01/hvac/status", payload2);

    String payload3 = "{";
    payload3 += "\"setpoint\": " + String(hvac.getSetpoint()) ;
    payload3 += ", \"state\": \"" + String(hvac.getState()) + "\"";
    payload3 += ", \"fanMode\": \"" + String(hvac.getFanMode()) + "\"";
    payload3 += ", \"mode\": \"" + String(hvac.getMode()) + "\"";
    payload3 += ", \"powerSelect\": \"" + String(hvac.getPowerSelect()) + "\"" ;
    payload3 += "}";
    wifi_ota.publishMQTT("esp01/hvac/tocontrol", payload3);
    lastLog = millis();
  }
  delay(10);
}